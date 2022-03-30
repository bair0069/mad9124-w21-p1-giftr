import mongoose from "mongoose";

// The createdAt and updatedAt properties should be set automatically by the database
// Any client supplied data for these two properties should be discarded.
// The gifts property takes an array of zero or more Gift sub-documents
// The sharedWith property takes an array of zero or more User IDs.
// The owner property takes a single User ID.

// has to include name, birthDate,owner, sharedWith, gifts, imageUrl, and {timestamps: true}

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
    gifts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gift" }],
    imageUrl: { type: String, required: true, maxlength: 1024 },
  },
  { timestamps: true }
);

export default mongoose.model("Person", schema);
