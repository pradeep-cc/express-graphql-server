import mongoose from "mongoose"

const schema = new mongoose.Schema({
	id: String,
	name: String,
	phone: String,
	email: String,
	preferences: Array,
	otp: String,
	profileImage: String,
	facebookToken: String,
	twitterToken: String,
	linkedInToken: String,
	googleToken: String
})

const User = mongoose.model("User", schema)

export default User
