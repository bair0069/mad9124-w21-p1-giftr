//DEPENDENCIES
import express from "express";
import log from "../startup/logger.js";
//MODELS
import Gift from "../models/Gift.js";
import Person from "../models/Person.js";
//Middleware
import checkHeader from "../middleware/checkHeader.js";
import sanitize from "../middleware/sanitize.js";
import auth from "../middleware/auth.js";
import validateId from "../middleware/validateID.js";
import validateAccess from "../middleware/validateAccess.js";
import allowDelete from "../middleware/allowDelete.js";

//HELPER FUNCTIONS
import formatResponseData from "../helperFunctions/formatResponseData.js";

//ROUTES
const router = express.Router();

router.post(
  "/people/:id/gifts",
  checkHeader,
  auth,
  validateId,
  validateAccess,
  sanitize,
  async (req, res, next) => {
    const newGift = new Gift(req.sanitizedBody);
    const personId = req.params.id;
    try {
      const person = await Person.findById(personId);
      await person.gifts.push(newGift);
      await person.save();
      res.status(201).json(formatResponseData(newGift, "gifts"));
    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);

router.patch(
  "/people/:id/gifts/:giftId",
  checkHeader,
  auth,
  sanitize,
  validateId,
  validateAccess,
  async (req, res, next) => {
    const giftId = req.params.giftId;
    try {
      const person = await Person.findOne({
        "gifts._id": giftId,
      });
      const gift = await person.gifts.id(giftId);
      gift.set(req.sanitizedBody);
      await person.save();
      res.json(formatResponseData(gift, "gifts"));
    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);

router.delete(
  "/people/:id/gifts/:giftId",
  checkHeader,
  auth,
  validateId,
  allowDelete,
  async (req, res, next) => {
    const person = await Person.findById(req.params.id);
    const giftId = req.params.giftId;
    try {
      const gift = await person.gifts.id(giftId);
      await person.gifts.id(giftId).remove();
      await person.save();
      res.json(formatResponseData(gift, "gifts"));
    } catch (err) {
      log.error(err);
      next(err);
    }
  }
);
export default router;
