import express from "express";
import Gift from "../models/Gift.js";
import Person from "../models/Person.js";
import sanitize from "../middleware/sanitize.js";
import log from "../startup/logger.js";
import auth from "../middleware/auth.js";

//TODO:import authentication middleware , use it in the methods below
import mongoose from "mongoose";
import ResourceNotFoundException from "../exceptions/ResourceNotFound.js";

const router = express.Router();
// ***users can only interact with their own gifts***

// - Add a POST route to create a new gift

router.post("/people/:id/gifts", auth, sanitize, async (req, res, next) => {
  const newGift = new Gift(req.sanitizedBody);
  const personId = req.params.id;
  const userId = req.user._id;
  try {
    if (await validateID(personId)) {
      if (await isOwner(personId, userId)) {
        const person = await Person.findById(personId);
        await person.gifts.push(newGift);
        await person.save();
        res.status(201).json(formatResponseData(newGift));
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
//TODO
router.patch(
  "/people/:id/gifts/:giftId",
  sanitize,
  auth,
  async (req, res, next) => {
    const personId = req.params.id;
    const giftId = req.params.giftId;
    const userId = req.user._id;
    try {
      if (await validateID(giftId)) {
        //check if ID is valid, if the check fails throw error
        if (await isOwner(personId, userId)) {
          const object = await Gift.findByIdAndUpdate(
            giftId,
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
          `Could not find a Gift with id: ${giftId}`
        );
      }
    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);

// - Add a route to DELETE a gift

router.delete("/:id", auth, async (req, res) => {
  try {
    const gift = await Gift.findByIdAndRemove(req.params.id);
    if (!gift) throw new Error("Gift not found");
    res.send({ data: formatResponseData(gift) });
  } catch (err) {
    log.error(err);
    next(err);
  }
});

/**
 * Format the response data object according to JSON:API v1.0
 * @param {string} type The resource collection name, e.g. 'cars'
 * @param {Object | Object[]} payload An array or instance object from that collection
 * @returns
 */

function formatResponseData(payload, type = "gift") {
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

async function validateID(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    if (await Person.findById(id)) {
      return true;
    }
  }
  return false;
}
//TODO
async function isOwner(id, userId) {
  const person = await Person.find();
  const owner = person.owner;

  if (userId === owner.toString()) {
    return true;
  } else {
    return false;
  }
}
export default router;
