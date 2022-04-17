import mongoose from "mongoose";

// has to include name, price, imageUrl, store, store.name, store.productUrl
const schema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 64, minlength: 4 },
  price: { type: Number, min: 100, default: 1000 },
  imageUrl: { type: String, maxlength: 1024 },
  store: {
    name: { type: String, maxlength: 254 },
    productURL: { type: String, maxlength: 1024 },
  },
});

export default mongoose.model("Gift", schema);
