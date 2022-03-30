//TODO:

import express from "express";
import Person from "../models/Person.js";
import sanitize from "../middleware/sanitize.js";
import isOwner from "../middleware/isOwner.js";
import auth from "../middleware/auth.js";
import log from "./logger.js";

const router = express.Router();

//The client application must send a valid JWT in the Authorization header property for all /api routes.
// users should only be able to interact with their own people

// Add a GET route to get all people

router.get("/", auth, async (req, res) => {
  const people = await Person.find();
  res.send({ data: formatResponseData(people) });
});

// Add a GET/:ID route to get a single person by ID and populate the gifts array

router.get("/:id", auth, async (req, res) => {
  const person = await Person.findById(req.params.id);
  if (person) {
    res.send({ data: formatResponseData(person).populate("gifts") });
  } else {
    sendResourceNotFound(req, res);
  }
});

// Add a POST route to create a new person

router.post("/", sanitize, auth, async (req, res) => {
  const person = new Person(req.sanitizedBody);
  try {
    await person.save();
    res.status(201).send(formatResponseData(person));
  } catch (err) {
    log.error(err);
    res.send({
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

// Add a PATCH route to update a person
router.patch("/:id", sanitize, auth, update())

// Add a PUT route to replace a person

router.put("/:id", sanitize, auth, update(true));

// Add a route to DELETE a person (only the owner can do this)

router.delete("/:id", auth,isOwner, async (req, res) => {
  try{
    const person = await Person.findByIdAndRemove(req.params.id);
    if(!person) throw new Error("Person not found");
    res.send({data: formatResponseData(person)});
  } catch(err){
    log.error(err);
    sendResourceNotFound(req, res);
  }
});
//HELPER FUNCTIONS

//UPDATE
const update = async (overwrite = false) => {
  async (req, res) => {
    const person = await Person.findById(req.params.id);
    if (person) {
      if (overwrite) {
        person.name = req.sanitizedBody.name;
        person.birthDate = req.sanitizedBody.birthDate;
        person.imageUrl = req.sanitizedBody.imageUrl;
      } else {
        person.set(req.sanitizedBody);
      }
      try {
        await person.save();
        res.send(formatResponseData(person));
      } catch (err) {
        log.error(err);
        res.send({
          errors: [
            {
              status: 500,
              title: "Internal Server Error",
              detail: "An error occurred while updating the person.",
            },
          ],
        });
      }
    } else {
      sendResourceNotFound(req, res);
    }
  }
}


// validateID asynchronously validates that the ID is a valid ObjectId

async function validateID(id) {
  if (Mongoose.Types.ObjectId.isValid(id)) {
    if (await Person.findById(id)) {
      return true;
    }
  }
  throw new sendResourceNotFound("Could not find a person with id: " + id);
}

function formatResponseData(payload, type = "people") {
  if (payload instanceof Array) {
    return payload.map((resource) => {
      format(resource);
    });
  } else {
    return format(payload);
  }

  function format(resource) {
    const { id, ...attributes } = resource.toObject();
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

export default router
