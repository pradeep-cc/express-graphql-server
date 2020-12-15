import mongoose from "mongoose"

const schema = new mongoose.Schema({
	id: String,
	name: String,
	phone: String,
	emails: Array,
	preferences: Array,
	otp: String,
	profileImage: String,
	socialLogins: Array
})

const User = mongoose.model("User", schema)

export default User
