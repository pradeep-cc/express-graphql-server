import mongoose from "mongoose";


const schema = new mongoose.Schema({
  id: String,
  title: String,
  type: String,
  isPaid: Boolean,
  startDate: String,
  startTime: String,
  endTime: String,
  userId: String,
  description: String,
  occurrences: Array,
  outcomes: Array,
  venue: Object,
  isOnline: Boolean,
  slug: String,
  isLive: Boolean
});

const Event = mongoose.model("Event", schema);

export default Event;
