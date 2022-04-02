

import express from 'express';
import User from "../../models/User.js";
import sanitize from '../../middleware/sanitize.js';
import authorize from '../../middleware/auth.js';


const router = express.Router();

//USERS

// - Add a POST route to register a user

router.post('/users', sanitize, async (req, res) => {
  /** ex.payload ---->
{
  "firstName": "Yo-Yo",
  "lastName": "Ma",
  "email": "me@me.com",
  "password": "myPassword"
}*/
  const newUser = new User(req.sanitizedBody);
  try {
    await newUser.save();
    res.status(201).json({ data: formatResponseData(newUser) });
  } catch (err) {
    log.error(err);
    res.status(500).send({
      errors: [
        {
          status: 500,
          title: "Internal Server Error",
          detail: "An error occurred while creating the user.",
        },
      ],
    });
  }
})


// - Add a GET route to get the logged in user

router.get('/users/me', authorize, async (req, res) => {

})


//UPDATE
const update =
  (overwrite = false) =>
  async (req, res) => {
    if (validateID(req.params.id)) {
      try {
        const object = await User.findByIdAndUpdate(
          req.params.id,
          req.sanitizedBody,
          { new: true, overwrite, runValidators: true }
        );
        if (!object)
          throw new Error("Could not find a user with id: " + req.params.id);
        res.send({ data: formatResponseData(object) });
      } catch (err) {
        log.error(err);
        sendResourceNotFound(req, res);
      }
    }
  };


// - Add a PATCH route to update a password 

router.patch("/users/me", sanitize, authorize, update(false));
//ex.payload ----> { "password": "newPassword" }

//TOKENS

// - Add a POST route to login a user 
/* ex.payload ---->
{
  "email": "me@me.com", 
  "password": "myPassword"
}
*/

//  Add a POST route to logout a user ????
//HELPER FUNCTIONS

// validateID asynchronously validates that the ID is a valid ObjectId

async function validateID(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    if (await Person.findById(id)) {
      return true;
    }
  }
  throw new sendResourceNotFound("Could not find a person with id: " + id);
}

function formatResponseData(payload, type = "people") {
  if (payload instanceof Array) {
    return payload.map((resource) => format(resource));
  } else {
    return format(payload);
  }

  function format(resource) {
    const { _id, ...attributes } = resource.toObject();
    return { type, id: _id, attributes };
  }
}

function sendResourceNotFound(req, res) {
  res.status(404).send({
    error: [
      {
        status: 404,
        title: "Resource Not Found",
        detail: `The user with ${req.params.id} was not found.`,
      },
    ],
  });
}

export default router;