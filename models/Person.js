import mongoose from "mongoose";
import User from "../models/User.js";
import Gift from "../models/Gift.js";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 254 },
    birthDate: { type: Date, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    gifts: [Gift.schema],
    imageUrl: { type: String, maxlength: 1024 },
  },

  {
    strict: true,
    timestamps: true, //to set the type of createdAt and updatedAt
    versionKey: false,
  }
);

export default mongoose.model("Person", schema);
