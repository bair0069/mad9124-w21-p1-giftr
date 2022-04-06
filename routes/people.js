/**TODO:
 * restore commented out gifts once we have gifts... in get:ID method
 */

import express from "express";
import Person from "../models/Person.js";
import sanitize from "../middleware/sanitize.js";
import mongoose from "mongoose";
// import isOwner from "../middleware/isOwner.js";
import auth from "../middleware/auth.js";
import log from "../startup/logger.js";
import ResourceNotFoundError from "../exceptions/ResourceNotFound.js";
// import validateID from "../middleware/validateID.js";
const router = express.Router();

//The client application must send a valid JWT in the Authorization header property for all /api routes.
// users should only be able to interact with their own people

// Add a GET route to get all people

router.get("/", auth, async (req, res) => {
  //show only persons that were created by the user
  const people = await Person.find({ owner: req.user._id });
  // const people = await Person.find();
  res.status(201).send(people.map((person) => formatResponseData(person)));
});

// Add a GET/:ID route to get a single person by ID and populate the gifts array

router.get("/:id", auth, isOwner, async (req, res, next) => {
  if (validateID(req.params.id)) {
    try {
      const person = await Person.findById(req.params.id).populate("gifts");
      if (!person) {
        throw new ResourceNotFoundError(
          `We could not find a person with id: ${req.params.id}`
        );
      }
      res.json(formatResponseData(person));
    } catch (error) {
      next(error);
    }
  }
});

// Add a POST route to create a new person

router.post("/", auth, sanitize, async (req, res) => {
  const newPerson = new Person(req.sanitizedBody);
  newPerson.owner = req.user._id;
  try {
    await newPerson.save();
    res.status(201).json({ data: formatResponseData(newPerson) });
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
});

//UPDATE
const update =
  (overwrite = false) =>
  async (req, res) => {
    if (validateID(req.params.id)) {
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
    }
  };

// Add a PATCH route to update a person
router.patch("/:id", auth, sanitize, update(false));

// Add a PUT route to replace a person

router.put("/:id", auth, sanitize, update(true));

// Add a route to DELETE a person (only the owner can do this)

router.delete("/:id", auth, async (req, res, next) => {
  const personId = req.params.id;
  const userId = req.user._id;
  if (validateID(personId)) {
    if (isOwner(personId, userId)) {
      try {
        const person = await Person.findByIdAndRemove(personId);
        if (!person) throw new ResourceNotFoundError("Person not found");
        res.json(formatResponseData(person));
      } catch (err) {
        log.error(err);
        next(err);
      }
    }
  }
});

//Helper functions
/**
 * Format the response data object according to JSON:API v1.0
 * @param {string} type The resource collection name, e.g. 'cars'
 * @param {Object | Object[]} payload An array or instance object from that collection
 * @returns
 */

function formatResponseData(payload, type = "people") {
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

function sendResourceNotFound(req, res) {
  res.status(404).send({
    error: [
      {
        status: 404,
        title: "Resource Not Found",
        detail: `The person with ${req.params.id} was not found.`,
      },
    ],
  });
}

async function validateID(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    if (await Person.findById(id)) {
      return true;
    }
  }
  throw new ResourceNotFoundError(`Could not find a Person with id: ${id}`);
}

async function isOwner(id, userId) {
  const person = await Person.findById(id);
  const owner = person.owner;

  if (userId === owner.toString()) {
    return true;
  } else {
    res.status(403).send({
      errors: [
        {
          status: 403,
          title: "Forbidden",
          detail: "You are not authorized to perform this action.",
        },
      ],
    });
  }
}

export default router;
