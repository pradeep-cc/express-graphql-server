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
	user: {
		id: String,
		name: String,
	},
	description: String,
	images: Array,
	occurrences: Array,
	outcomes: Array,
	imageUrl: String,
	venue: {
		name: String,
		address: String,
		city: String,
		cityId: String,
		state: String,
		country: String,
		pincode: String
	},
	isOnline: Boolean,
	slug: String,
	isLive: Boolean,
})

const Event = mongoose.model("Event", schema);

export default Event;
