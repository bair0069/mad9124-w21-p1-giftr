import mongoose from "mongoose";

/**TODO:
 *  change required to TRUE once we have a way to add an owner to a person
 * remove the default value for imageUrl
 * // Any client supplied data for createdAt and UpdatedAt properties should be discarded.
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
      required: false, // <--- this should be true  - - - the owner is required
    },
    // The sharedWith property takes an array of zero or more User IDs.

    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // shared with what users?
    // The gifts property takes an array of zero or more Gift sub-documents
    gifts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gift" }],
    imageUrl: { type: String, required: true, maxlength: 1024, default: " " },
  },
  // The createdAt and updatedAt properties should be set automatically by the database

  {
    strict: true,
    timestamps: true, //to set the type of createdAt and updatedAt
    versionKey: false,
  }
);

// schema.pre('save',async function(next){
//   next();
// })

export default mongoose.model("Person", schema);
