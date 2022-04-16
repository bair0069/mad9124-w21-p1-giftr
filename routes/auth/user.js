//DEPENDENCIES
import express from "express";
import User from "../../models/User.js";
import log from "../../startup/logger.js";
import bcrypt from "bcrypt";
import config from "config";
// MIDDLEWARE
import checkHeader from "../../middleware/checkHeader.js";
import sanitize from "../../middleware/sanitize.js";
import auth from "../../middleware/auth.js";
//HELPER FUNCTIONS
import formatResponseData from "../../helperFunctions/formatResponseData.js";

const saltRounds = config.get("jwt.saltRounds");

/**ROUTES
 * * //USERS
 * post("/users") - create a new user
 * get("/users/me") - get logged in user
 * patch("/users/me") - update logged in user
 *
 * * //TOKENS
 * post("/tokens") - create a new token
 */
const router = express.Router();

//USERS

router.post("/users", checkHeader, sanitize, async (req, res) => {
  /** ex.payload ---->
{
  "firstName": "Yo-Yo",
  "lastName": "Ma",
  "email": "me@me.com",
  "password": "myPassword"
}*/
  try {
    const newUser = new User(req.sanitizedBody);
    const itExists = Boolean(
      await User.countDocuments({ email: newUser.email })
    );
    if (itExists) {
      return res.status(400).json({
        errors: [
          {
            status: "400",
            title: "Validation Error",
            detail: `Email address '${newUser.email}' is already registered.`,
            source: { pointer: "/data/attributes/email" },
          },
        ],
      });
    }
    await newUser.save();
    res.status(201).json(formatResponseData(newUser));
  } catch (err) {
    log.error(err);
    res.status(500).send({
      errors: [
        {
          status: "500",
          title: "Server error",
          description: err.message,
        },
      ],
    });
  }
});

router.get("/users/me", checkHeader, auth, async (req, res) => {
  //load the user
  const user = await User.findById(req.user._id);
  //redacting sensitive info send the data back to the client
  res.json(formatResponseData(user));
});

router.patch("/users/me", checkHeader, auth, sanitize, async (req, res) => {
  //ex.payload ----> { "password": "newPassword" }
  const updatedPassword = await passwordHash(req.sanitizedBody.password);
  const object = await User.findByIdAndUpdate(
    req.user._id,
    { password: updatedPassword },
    { new: true, runValidators: true }
  );
  if (!object) {
    throw new Error("Unable to update password");
  } else {
    res.json(formatResponseData(object, "users"));
  }
});

//TOKENS

router.post("/tokens", checkHeader, sanitize, async (req, res) => {
  /** ex.payload ---->
{
  "email": "me@me.com", 
  "password": "myPassword"
}
*/

  const { email, password } = req.sanitizedBody;
  const user = await User.authenticate(email, password);

  if (!user) {
    return res.status(401).json({
      errors: [
        {
          status: "401",
          title: "Incorrect username or password",
        },
      ],
    });
  }

  // if all is good, return a token
  res
    .status(201)
    .json(
      formatResponseData({ accessToken: user.generateAuthToken() }, "tokens")
    );
  // if any condition failed, return an error message
});

//HELPER FUNCTIONS
async function passwordHash(password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export default router;
