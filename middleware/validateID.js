import mongoose from "mongoose";
import Person from "../models/Person.js";
import sendResourceNotFoundException from "../exceptions/ResourceNotFound.js";
import log from "../startup/logger.js";
import errorHandler from "./errorHandler.js";

export default async function (req, res, next) {
  const personId = req.params.id;
  // if the giftId parameters were provided use them if not set the giftId to null
  const giftId = req.params.giftId ? req.params.giftId : null;
  let personInDB;
  let giftInDB;
  try {
    const validPersonId = mongoose.Types.ObjectId.isValid(personId);
    if (validPersonId) {
      personInDB = await Person.findById(personId);
    }
    //if personId is not valid or person is not in DB, throw an error else move on to check for gift ID
    if (!validPersonId || !personInDB) {
      throw new sendResourceNotFoundException(
        `Could not find a person with id: ${personId}`
      );
    } else {
      if (giftId) {
        const validGiftId = mongoose.Types.ObjectId.isValid(giftId);
        if (validGiftId) {
          giftInDB = await personInDB.gifts.id(giftId);
        }
        //if is giftID is valid and gift is in DB, move on else throw an error
        if (validGiftId && giftInDB) {
          next();
        } else {
          throw new sendResourceNotFoundException(
            `Could not find a gift with id: ${giftId} in gift list of person with id: ${personId}`
          );
        }
      } else {
        next();
      }
    }
  } catch (err) {
    log.error(err);
    errorHandler(err, req, res);
  }
}
