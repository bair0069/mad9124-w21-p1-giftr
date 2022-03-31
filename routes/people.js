/**TODO:
* restore commented out gifts once we have gifts, in get:ID
*/

import express from "express";
import Person from "../models/Person.js";
import sanitize from "../middleware/sanitize.js";
import mongoose from "mongoose";
// import isOwner from "../middleware/isOwner.js";
// import auth from "../middleware/auth.js";
import log from "../startup/logger.js";
const router = express.Router();

//The client application must send a valid JWT in the Authorization header property for all /api routes.
// users should only be able to interact with their own people

// Add a GET route to get all people

router.get('/', async (req, res) => {
    const people = await Person.find();
    res.status(201).send({ data: formatResponseData(people) });
  }
);

// Add a GET/:ID route to get a single person by ID and populate the gifts array

router.get(
  "/:id",
  /*auth,*/ async (req, res) => {
    const person = await Person.findById(req.params.id)//.populate("gifts") ;
    if (person) {
      res.send({ data: formatResponseData(person)});
    } else {
      sendResourceNotFound(req, res);
    }
  }
);

// Add a POST route to create a new person

router.post("/", sanitize, async (req, res) => {
    const newPerson = new Person(req.sanitizedBody);
    try {
      await newPerson.save();
      res.status(201).json({data:formatResponseData(newPerson)});
    } catch (err) {
      log.error(err);
      res.status(500).send({
        errors: [
          {
            status: 500,
            title: "Internal Server Error",
            detail: "An error occurred while creating the person.",
          },
        ],
      });
    }
  }
);

//UPDATE
const update = (overwrite = false) => 
  async (req, res) => {
    try {
      const object = await Person.findByIdAndUpdate(
        req.params.id,
        req.sanitizedBody,
        { new: true, overwrite, runValidators: true }
      );
      if (!object)
        throw new Error("Could not find a person with id: " + req.params.id);
      res.send({ data: formatResponseData(object) });
    } catch (err) {
      log.error(err);
      sendResourceNotFound(req, res);
    }
  };

// Add a PATCH route to update a person
router.patch("/:id", sanitize, /*auth,*/ update(false));

// Add a PUT route to replace a person

router.put("/:id", sanitize, /*auth,*/ update(true));

// Add a route to DELETE a person (only the owner can do this)

router.delete(
  "/:id",
  /*auth,isOwner,*/ async (req, res) => {
    try {
      const person = await Person.findByIdAndRemove(req.params.id);
      if (!person) throw new Error("Person not found");
      res.send({ data: formatResponseData(person) });
    } catch (err) {
      log.error(err);
      sendResourceNotFound(req, res);
    }
  }
);
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
        detail: "The person with {req.params.id} was not found.",
      },
    ],
  });
}

export default router;
