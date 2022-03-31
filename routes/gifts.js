
import express from 'express';
import Gift from "../models/Gift.js";
import sanitize from "../middleware/sanitize.js";
//TODO:import authentication middleware , use it in the methods below
import mongoose from 'mongoose'

const router = express.Router();
// ***users can only interact with their own gifts***

// - Add a POST route to create a new gift

router.post("/", sanitize, async (req, res) => {
  const newGift = new Gift(req.sanitizedBody);
  try {
    await newGift.save();
    res.status(201).json({ data: formatResponseData(newGift) });
  } catch (err) {
    log.error(err);
    res.status(500).send({
      errors: [
        {
          status: 500,
          title: "Internal Server Error",
          detail: "An error occurred while creating the gift.",
        },
      ],
    });
  }
});

//UPDATE
const update = (overwrite = false) => 
  async (req, res) => {
    try {
      const object = await Gift.findByIdAndUpdate(
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

// - Add a PATCH route to update a gift

router.patch("/:id", sanitize, update(false));


// - Add a route to DELETE a gift

router.delete(
  "/:id",
  /*auth*/ async (req, res) => {
    try {
      const gift = await Gift.findByIdAndRemove(req.params.id);
      if (!gift) throw new Error("Gift not found");
      res.send({ data: formatResponseData(gift) });
    } catch (err) {
      log.error(err);
      sendResourceNotFound(req, res);
    }
  }
);
async function validateID(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    if (await Gift.findById(id)) {
      return true;
    }
  }
  throw new sendResourceNotFound("Could not find a gift with id: " + id);
}

function formatResponseData(payload, type = "gifts") {
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
        detail: "The gift with {req.params.id} was not found.",
      },
    ],
  });
}


export default router;