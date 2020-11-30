import mongoose from "mongoose";

const schema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  preferences: Array
});

const User = mongoose.model("User", schema);

export default User;
