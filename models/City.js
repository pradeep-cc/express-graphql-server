import mongoose from "mongoose"

const schema = new mongoose.Schema({
	id: String,
	name: String,
	lat: Number,
	lng: Number,
	googlePlaceId: String,
	country: String,
})

const City = mongoose.model("City", schema)

export default City
