import express from "express";
import Gift from "../models/Gift.js";
import Person from "../models/Person.js";
import sanitize from "../middleware/sanitize.js";
import log from "../startup/logger.js";
import auth from "../middleware/auth.js";
import mongoose from "mongoose";
import ResourceNotFoundException from "../exceptions/ResourceNotFound.js";

const router = express.Router();
// ***users can only interact with their own gifts***

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

router.patch(
  "/people/:id/gifts/:giftId",
  auth,
  sanitize,
  async (req, res, next) => {
    const personId = req.params.id;
    const giftId = req.params.giftId;
    const userId = req.user._id;
    try {
      if (await validateID(personId, giftId)) {
        //check if ID is valid, if the check fails throw error
        if (await isOwner(personId, userId)) {
          const person = await Person.findOne({
            "gifts._id": giftId,
          });
          const gift = await person.gifts.id(giftId);
          gift.set(req.sanitizedBody); //solution found on StackOverflow thread response by Arian Acosta-->https://stackoverflow.com/questions/26156687/mongoose-find-update-subdocument
          await person.save();
          res.json(formatResponseData(gift));
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

router.delete("/people/:id/gifts/:giftId", auth, async (req, res, next) => {
  const personId = req.params.id;
  const giftId = req.params.giftId;
  const userId = req.user._id;
  try {
    if (await validateID(personId, giftId)) {
      //check if ID is valid, if the check fails throw error
      if (await isOwner(personId, userId)) {
        const person = await Person.findOne({
          "gifts._id": giftId,
        });
        const gift = await person.gifts.id(giftId); //saving to show the deleted gift in response
        await person.gifts.id(giftId).remove();
        await person.save();
        res.json(formatResponseData(gift));
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

async function validateID(personId, giftId) {
  if (!giftId) {
    if (mongoose.Types.ObjectId.isValid(personId)) {
      if (await Person.findById(personId)) {
        return true;
      }
    } else {
      return false;
    }
  } else {
    if (mongoose.Types.ObjectId.isValid(personId)) {
      if (mongoose.Types.ObjectId.isValid(giftId)) {
        if (
          await Person.findOne({
            "gifts._id": giftId,
          })
        )
          return true;
      }
    } else {
      return false;
    }
  }
}

async function isOwner(personId, userId) {
  const person = await Person.findById(personId);
  const owner = person.owner;

  if (userId === owner.toString()) {
    return true;
  } else {
    return false;
  }
}
export default router;
