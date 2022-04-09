import express from "express";
import Person from "../models/Person.js";
import sanitize from "../middleware/sanitize.js";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import log from "../startup/logger.js";
import ResourceNotFoundException from "../exceptions/ResourceNotFound.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  //show only persons that were created by the user
  const people = await Person.find({ owner: req.user._id });
  res.status(201).send(people.map((person) => formatResponseData(person)));
});

router.get("/:id", auth, async (req, res, next) => {
  const personId = req.params.id;
  const userId = req.user._id;
  try {
    if (await validateID(personId)) {
      //will return false if not a valid ID
      if (await isOwner(personId, userId)) {
        const person = await Person.findById(personId).populate("gifts");
        res.json(formatResponseData(person));
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
    } else {
      throw new ResourceNotFoundException(
        `We could not find a person with id: ${personId}`
      );
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.post("/", auth, sanitize, async (req, res, next) => {
  const newPerson = new Person(req.sanitizedBody);
  newPerson.owner = req.user._id;
  try {
    await newPerson.save();
    res.status(201).json(formatResponseData(newPerson));
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.patch("/:id", auth, sanitize, async (req, res, next) => {
  const personId = req.params.id;
  const userId = req.user._id;
  try {
    if (await validateID(personId)) {
      //check if ID is valid, if the check fails throw error
      if (await isOwner(personId, userId)) {
        const object = await Person.findByIdAndUpdate(
          personId,
          req.sanitizedBody,
          { new: true, overwrite: false, runValidators: true }
        );
        res.json(formatResponseData(object));
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
    } else {
      throw new ResourceNotFoundException(
        `Could not find a Person with id: ${personId}`
      );
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.put("/:id", auth, sanitize, async (req, res, next) => {
  const personId = req.params.id;
  const userId = req.user._id;
  try {
    if (await validateID(personId)) {
      //check if ID is valid, if the check fails throw error
      if (await isOwner(personId, userId)) {
        const object = await Person.findByIdAndUpdate(
          personId,
          { owner: userId, ...req.sanitizedBody },
          { new: true, overwrite: true, runValidators: true }
        );
        res.json(formatResponseData(object));
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
    } else {
      throw new ResourceNotFoundException(
        `Could not find a Person with id: ${personId}`
      );
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  const personId = req.params.id;
  const userId = req.user._id;
  try {
    if (await validateID(personId)) {
      //check if ID is valid, if the check fails throw error
      if (await isOwner(personId, userId)) {
        const person = await Person.findByIdAndRemove(personId);
        res.json(formatResponseData(person));
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
    } else {
      throw new ResourceNotFoundException(
        `Could not find a Person with id: ${personId}`
      );
    }
  } catch (err) {
    log.error(err);
    next(err);
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

//check if the ID is valid and exists
async function validateID(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    if (await Person.findById(id)) {
      return true;
    }
  }
  return false;
}

//checks if the user is the owner of the Person
async function isOwner(id, userId) {
  const person = await Person.findById(id);
  const owner = person.owner;

  if (userId === owner.toString()) {
    return true;
  } else {
    return false;
  }
}

export default router;
