import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import uniqueValidator from "mongoose-unique-validator";
import config from "config";
import jwt from "jsonwebtoken";
const saltRounds = config.get("jwt.saltRounds");
const jwtSecretKey = config.get("jwt.secretKey");

const schema = new mongoose.Schema({
  firstName: { type: String, trim: true, maxlength: 64, required: true },
  lastName: { type: String, trim: true, maxlength: 64, required: true },
  email: {
    type: String,
    trim: true,
    maxLength: 512,
    required: true,
    unique: true,
    set: (value) => value.toLowerCase(),
    validate: {
      validator: (value) => validator.isEmail(value),
      message: (props) => `${props.value} is not a valid email address.`,
    },
  },
  password: { type: String, trim: true, maxLength: 70, required: true },
});

schema.methods.generateAuthToken = function () {
  const payload = { user: { _id: this._id } };
  //Setting token expiry time to 1 hour and defining the algorithm here and at jwt.verify
  const options = {
    expiresIn: "1h",
    algorithm: "HS256",
  };
  return jwt.sign(payload, jwtSecretKey, options);
};

schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

schema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({ email: email });
  const badHash = `$2b$${saltRounds}$invalidusernameaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`;
  const hashedPassword = user ? user.password : badHash;
  const passwordDidMatch = await bcrypt.compare(password, hashedPassword);
  return passwordDidMatch ? user : null;
};

schema.pre("save", async function (next) {
  // Only encrypt if the password property is being changed.
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

schema.plugin(uniqueValidator, {
  message: (props) => {
    props.path === "email"
      ? `The email address '${props.value}' is already registered.`
      : `The ${props.path} must be unique. '${props.value}' is already in use.`;
  },
});

const Model = mongoose.model("user", schema);
export default Model;
