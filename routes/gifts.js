import express from "express";
import log from "../startup/logger.js";

//MODELS
import Gift from "../models/Gift.js";
import Person from "../models/Person.js";
//MIDDLEWARE
import sanitize from "../middleware/sanitize.js";
import auth from "../middleware/auth.js";

//validateId checks if the personId, or gift id is valid.
import validateId from "../middleware/validateID.js";

//validate access checks if the user is the owner of the resource or if the person is shared with the user
import validateAccess from "../middleware/validateAccess.js";

/** How the gift router works:
 * Owners, and Users who are in the shared list can create,update, and delete a gift for a person.
 * router.post() - create a new gift
 * router.patch() - update a gift
 * router.delete() - delete a gift
 * @
 */

const router = express.Router();


router.post(
  "/people/:id/gifts",auth,validateId,validateAccess,sanitize,async (req, res, next) => {
    const newGift = new Gift(req.sanitizedBody);
    const personId = req.params.id;
    try {

      const person = await Person.findById(personId);
      await person.gifts.push(newGift);
      await person.save();
      res.status(201).json(formatResponseData(newGift));

    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);


router.patch("/people/:id/gifts/:giftId",auth,sanitize,validateId,validateAccess,async (req, res, next) => {
    const giftId = req.params.giftId;
    try {
          const person = await Person.findOne({
            "gifts._id": giftId,
          });
          const gift = await person.gifts.id(giftId);
          gift.set(req.sanitizedBody);
          await person.save();
          res.json(formatResponseData(gift));
    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);

router.delete("/people/:id/gifts/:giftId", auth,validateId,validateAccess, async (req, res, next) => {
  const giftId = req.params.giftId;
  try {
        const gift = await person.gifts.id(giftId);
        await person.gifts.id(giftId).remove();
        await person.save();
        res.json(formatResponseData(gift));
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


export default router;
