import mongoose from "mongoose";
import Person from "../models/Person.js";
import sendResourceNotFoundException from "../exceptions/ResourceNotFound.js";
import log from "../startup/logger.js";

export default async function (req, res, next) {
  const personId = req.params.id;
  const giftId = req.params.giftId ? req.params.giftId : null;

  try {
    if (mongoose.Types.ObjectId.isValid(personId)) {
      if (giftId) {
        if (mongoose.Types.ObjectId.isValid(giftId)) {  
          let gift = await Person.findOne({"gifts._id": giftId});
          if (gift){
            console.log("validateID: true");
            next();
          }
          else {
            console.log("validateID: false");
            throw new sendResourceNotFoundException(`Could not find a gift with id: ${giftId}`);
          }
        }
        else{
        throw new sendResourceNotFoundException(
          `Could not find a gift with id: ${giftId}`
        )
      };
      } else{
        if (await Person.findById(personId)) {
        next();
        }
        console.log("trying to find person");
      }
    }
    else{
    throw new sendResourceNotFoundException(
      `Could not find a person with id: ${personId}`
    );
  }
  } catch (err) {
    log.error(err);
    next(err);
  }
}
