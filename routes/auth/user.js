import express from "express";
import User from "../../models/User.js";
import sanitize from "../../middleware/sanitize.js";
import authenticate from "../../middleware/auth.js";
import log from "../../startup/logger.js";
import mongoose from "mongoose";

const router = express.Router();

//USERS

// - Add a POST route to register a user

router.post("/users", sanitize, async (req, res) => {
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
    debug(err);
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

// - Add a GET route to get the logged in user

router.get("/users/me", authenticate, async (req, res) => {
  //load the user
  const user = await User.findById(req.user._id);
  //redacting sensitive info send the data back to the client
  res.json(formatResponseData(user));
});

// - Add a PATCH route to update a password

router.patch("/users/me", sanitize, authenticate, async (req, res) => {
  //ex.payload ----> { "password": "newPassword" }
  const newUser = req.sanitizedBody.user;
  try {
    const { password } = req.sanitizedBody;
    
    newUser.password = password;
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
  await newUser.save();
  res.json({ data: formatResponseData(user) });
});

//TOKENS

router.post("/tokens", sanitize, async (req, res) => {
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

//  Add a POST route to logout a user ????
//HELPER FUNCTIONS

function formatResponseData(payload, type = "users") {
  if (payload instanceof Array) {
    return { data: payload.map((resource) => format(resource)) };
  } else {
    return { data: format(payload) };
  }

  function format(resource) {
    const { _id, ...attributes } = resource.toJSON
      ? resource.toJSON()
      : resource;
    return { type, id: _id, attributes };
  }
}

export default router;
