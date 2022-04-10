import mongoose from "mongoose";
import User from "../models/User.js";
import Gift from "../models/Gift.js";

/**TODO:
 * remove the default value for imageUrl
 * */

// has to include name, birthDate,owner, sharedWith, gifts, imageUrl, and {timestamps: true}
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 254 },
    birthDate: { type: Date, required: true },
    // The owner property takes a single User ID.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The sharedWith property takes an array of zero or more User IDs.

    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // shared with what users?
    // The gifts property takes an array of zero or more Gift sub-documents
    gifts: [Gift.schema],
    imageUrl: { type: String, required: true, maxlength: 1024, default: " " },
  },
  // The createdAt and updatedAt properties should be set automatically by the database

  {
    strict: true,
    timestamps: true, //to set the type of createdAt and updatedAt
    versionKey: false,
  }
);

export default mongoose.model("Person", schema);
