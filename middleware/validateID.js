import mongoose from "mongoose";
import ResourceNotFoundError from "../exceptions/ResourceNotFound.js";
import Person from "../models/Person.js";
import Gift from "../models/Gift.js";

export default async function (req, res, next) {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    if (req.body.type === "person") {
      if (await Person.findById(req.params.id)) {
        next();
      }
    } else if (req.body.type === "gift") {
      if (await Gift.findById(req.params.id)) {
        next();
      }
    }
  }
  throw new ResourceNotFoundError(`Could not find a ${type} with id: ${id}`);
}
