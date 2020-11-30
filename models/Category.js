import mongoose from "mongoose";

const schema = new mongoose.Schema({
  id: String,
  name: String,
  heading: String,
  subs: Array
});

const Category = mongoose.model("category", schema);

export default Category;
