import mongoose from "mongoose";
import Person from "../models/Person.js";
import sendResourceNotFoundException from "../exceptions/ResourceNotFound.js";
import log from "../startup/logger.js";
import errorHandler from "./errorHandler.js";



//check if the personId is valid, if the check fails throw error
// if there is no person with the given id, throw error
//if there is no gift with the given id, throw error
//check if the giftId is valid, if the check fails throw error


export default async function (req, res, next) {
  const personId = req.params.id;
  // if the giftId parameters were provided use them if not set the giftId to null
  const giftId = req.params.giftId ? req.params.giftId : null;

  try {
    // if the person id is valid
    if (mongoose.Types.ObjectId.isValid(personId)) {
      //check if gift id has a value
      if (giftId) {
        // if gift id is provided check if the gift id is valid, if the check fails throw error
        if (mongoose.Types.ObjectId.isValid(giftId)) {
          // get the person who has the giftId
          let hasGift = await Person.findOne({ "gifts._id": giftId });
          // get the person who has the personId
          let person = await Person.findById(personId);
          // if the person exists
          if (person) {
            // if the person has the giftId
            if (hasGift) {
              // everything is ok the id is valid
              next();
            } 
            // if the person does not have the giftId throw error
            else {
              throw new sendResourceNotFoundException(
                `Could not find a gift with id: ${giftId} in gift list of person with id: ${personId}`
              );
            }
          }
          // if the person does not exist 
          else {
            throw new sendResourceNotFoundException(
              `Could not find a person with id: ${personId}`
            );
          }
        }
        // if the gift id is not valid throw error 
        else {
          throw new sendResourceNotFoundException(
            `Could not find a gift with id: ${giftId}`
          );
        }
      }
      // if a gift id is not provided
      else {
        // check if the person exists
        if (await Person.findById(personId)) {
        // everything is ok the id is valid
          next();
        }
        // if the person does not exist
        else {
          throw new sendResourceNotFoundException(
            `Could not find a person with id: ${personId}`
          );
        }
      }
    } 
    // if the personId is not valid throw error
    else {
      throw new sendResourceNotFoundException(
        `Could not find a person with id: ${personId}`
      );
    }
  } 
  // handle errors using errorHandler middleware
  catch (err) {
    log.error(err);
    errorHandler(err, req, res);
  }
}