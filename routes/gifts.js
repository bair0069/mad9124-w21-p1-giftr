import express from "express";
import log from "../startup/logger.js";
//formatResponseData formats the response data to be returned
import formatResponseData from "../helperFunctions/formatResponseData.js";
//MODELS
import Gift from "../models/Gift.js";
import Person from "../models/Person.js";
//MIDDLEWARE

//sanitize removes script tags from the request body
import sanitize from "../middleware/sanitize.js";
//auth checks the users token
import auth from "../middleware/auth.js";

//validateId checks if the personId, or gift id is valid.
import validateId from "../middleware/validateID.js";

//validateAccess checks if the user is the owner of the resource
// or if the person is shared with the user

import validateAccess from "../middleware/validateAccess.js";

/** How the gift router works:
 * Owners, and Users who are in the shared list can create,update, and delete a gift for a person.
 * router.post() - create a new gift
 * router.patch() - update a gift
 * router.delete() - delete a gift
 * @
 */

const router = express.Router();

router.post("/people/:id/gifts",auth,validateId,validateAccess,sanitize,async (req, res, next) => {
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
export default router;
