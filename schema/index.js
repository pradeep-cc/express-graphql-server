import { gql, UserInputError } from "apollo-server-express"
import Event from "../models/Event"
import Category from "../models/Category"
import User from "../models/User"

const AWS = require("aws-sdk")
const jsonwebtoken = require("jsonwebtoken")
require("dotenv").config()

AWS.config.loadFromPath("./s3config.json")

let s3Bucket = new AWS.S3({ params: { Bucket: "events-now-images" } })

const saveImgInAWS = async (image, id) => {
	let buf = Buffer.from(image.encodedData.replace(/^data:image\/\w+;base64,/, ""), "base64")

	let data = {
		Key: id,
		Body: buf,
		ContentEncoding: "base64",
		ContentType: image.type,
	}

	const result = await s3Bucket.upload(data).promise()
	console.log(result);
	if (result.Location) {
		console.log("IMAGE SAVED AND RETURNING")
		return result.Location
	}

	return null
}

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN

const client = require("twilio")(twilioAccountSid, twilioAuthToken)


const getRandomNumer = () => {
	const number = Math.floor(Math.random() * 1000000);
	return number;
}


export const typeDefs = gql`
	type Query {
		message: String!
		events(data: eventsQueryInput): [Event]
		event(id: ID!): Event
		categories(filter: [ID!]): [Category]
		loginUser(data: loginUser!): LoginUserPayload
		user(id: ID!): User
	}

	type Mutation {
		createEvent(data: CreateEventInput!): CreateEventPayload
		updateEvent(data: UpdateEventInput!): UpdateEventPayload
		deleteEvent(id: ID!): DeleteEventPayload

		createCategory(data: CreateCategoryInput): CreateCategoryPayload
		updateCategory(data: updateCategoryInput): UpdateCategoryPayload

		createUser(data: CreateUserInput): CreateUserPayload
		updateUser(data: UpdateUserInput): UpdateUserPayload
		sendOtp(data: SendOtpInput): SendOtpPayload
	}

	input SendOtpInput {
		phone: String!
	}

	type SendOtpPayload {
		success: Boolean
		status: Int
	}

	type User {
		id: ID!
		phone: String
		name: String
		saved: [UserSavedEvent]
		otp: String!
		preferences: [UserPreference]
	}

	type UserSavedEvent {
		id: String
		name: String
		imageUrl: String
	}

	input UserSavedEventInput {
		id: String
		name: String
		imageUrl: String
	}

	type UserPreference {
		id: ID!
		name: String!
		subs: [Sub]
	}

	input loginUser {
		phone: String!
		otp: String!
	}

	type LoginUserPayload {
		token: String!
		user: User
	}

	type UpdateUserPayload {
		user: User
	}

	input UpdateUserInput {
		id: ID!
		phone: String
		name: String
		saved: [UserSavedEventInput]
		preferences: [UserPreferenceInput]
	}

	input UserPreferenceInput {
		id: ID!
		name: String!
		subs: [SubInputType]
	}

	input CreateUserInput {
		name: String!
		phone: String!
	}

	type CreateUserPayload {
		user: User
	}

	input CreateEventInput {
		title: String!
		type: String!
		isPaid: Boolean!
		venue: VenueInput
		startDate: String
		startTime: String
		endTime: String
		userId: String
		user: CreateEventUserInput
		isOnline: Boolean
		occurrences: [OccurrenceInput]
		outcomes: [OutcomeInput]
	}

	input CreateEventUserInput {
		id: String
		name: String
	}

	type CreateEventPayload {
		event: Event
	}

	type DeleteEventPayload {
		success: Boolean
	}

	input UpdateEventInput {
		id: ID!
		isLive: Boolean
		title: String
		venue: VenueInput
		description: String
		isOnline: Boolean
		isPaid: Boolean
		images: [ImageInput]
		outcomes: [OutcomeInput]
		occurrences: [OccurrenceInput]
	}

	type UpdateEventPayload {
		event: Event
	}

	type Event {
		id: ID!
		title: String!
		type: String
		isPaid: Boolean
		venue: Venue
		description: String
		images: [Image]
		imageUrl: String
		startDate: String
		startTime: String
		endTime: String
		userId: String
		user: EventUser
		occurrences: [Occurrence]
		outcomes: [Outcome]
		isOnline: Boolean!
		slug: String!
		isLive: Boolean!
	}

	type Image {
		url: String!
	}

	input ImageInput {
		type: String!
		encodedData: String!
	}

	type EventUser {
		id: String
		name: String
	}

	type Outcome {
		category: String
		categoryId: String
		heading: String
		subCategories: [Sub]
	}

	input OutcomeInput {
		category: String
		categoryId: String
		heading: String
		subCategories: [SubInputType]
	}

	type Occurrence {
		startDate: String
		startTime: String
		endTime: String
	}

	input OccurrenceInput {
		startDate: String
		startTime: String
		endTime: String
	}

	type Venue {
		name: String!
		address: String!
		city: String
		state: String!
		country: String!
		pincode: String!
	}

	input VenueInput {
		name: String!
		address: String!
		city: String
		state: String!
		country: String!
		pincode: String!
	}

	type Category {
		id: ID!
		name: String!
		heading: String
		subs: [Sub]
	}

	input CreateCategoryInput {
		name: String!
	}

	type CreateCategoryPayload {
		id: ID!
		name: String!
	}

	input updateCategoryInput {
		id: ID!
		name: String
		heading: String
		subs: [SubInputType]
	}

	type UpdateCategoryPayload {
		category: Category
	}

	input SubInputType {
		id: ID
		name: String!
	}

	type Sub {
		id: ID!
		name: String!
	}

	input eventsQueryInput {
		isOnline: Boolean
		userId: String
		isLive: Boolean
	}
`

export const resolvers = {
	Query: {
		message: () => "Hello world!",

		events: async (parent, args, { user }) => {
			try {
				let payload = { ...args.data }
				let query
				console.log(user)
				console.log(payload)
				if (payload.hasOwnProperty("isOnline")) {
					query = { isOnline: payload.isOnline, isLive: true }
				} else {
					if (user) {
						//Returning null if jwt token signed userId is not equal to payload userId
						if (user.id != payload.userId) {
							return null
						}
						query = { userId: payload.userId }
					} else {
						return null
					}
				}

				let data = await Event.find(query)
				return data
			} catch (err) {
				console.log(err)
				return null
			}
		},

		event: async (parent, args) => {
			try {
				let id = args.id
				const event = await Event.find({ id })
				let res = event[0]
				console.log(res)
				if (res) {
					return res
				} else {
					return null
				}
			} catch (err) {
				console.log(err)
				return null
			}
		},

		categories: async (parent, args) => {
			try {
				const where = args.filter
					? {
							id: { $in: args.filter },
					  }
					: {}

				let data = await Category.find(where)
				// console.log(data);
				return data
			} catch (err) {
				console.log(err)
				return null
			}
		},

		//User related queries
		loginUser: async (parent, args) => {
			try {
				let payload = { ...args.data }

				const user = await User.find({ phone: payload.phone })
				let res = user[0]

				//validate otp

				if (res) {
					if (res.otp == payload.otp) {
						// Validate saved otp timestamp in the doc [Refer sendOtp]
						const token = jsonwebtoken.sign(
							{ id: res.id },
							process.env.JWT_SECRET,
							{ expiresIn: "1y" }
						)
						let data = {
							token,
							user: {
								id: res.id,
								name: res.name,
								phone: res.phone,
							},
						}

						return data
					} else {
						return null
					}
				}
			} catch (err) {
				console.log(err)
				return null
			}
		},

		user: async (parent, args, { user }) => {
			try {
				console.log(user)

				//User from context

				if (!user) return null
				let userId = args.id
				if (user.id != userId) return null
				const result = await User.find({ id: userId })

				return result[0]
			} catch (err) {
				console.log(err)
			}
		},
	},

	Mutation: {
		createEvent: async (parent, args) => {
			try {
				let payload = { ...args.data }
				console.log(payload)
				const number = await Event.countDocuments()

				payload.id = getRandomNumer();
				payload.slug =
					payload.title.toLowerCase().split(" ").join("-") + `-${payload.id}`
				payload.isLive = false //defaulting event status to not live
				payload.images = [
					{
						url:
							"https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4AjF5",
					},
				]
				payload.imageUrl = "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4AjF5"
				const event = await new Event(payload)
				const res = await event.save()

				if (res) {
					let data = {
						event: {
							id: res.id,
							title: res.title,
							type: res.type,
							isPaid: res.isPaid,
							slug: res.slug,
							startDate: res.startDate,
							startTime: res.endDate,
							endTime: res.endTime,
							occurrences: res.dates,
							outcomes: res.outcomes,
							user: res.user,
							isLive: res.isLive,
							imageUrl: res.imageUrl,
						},
					}
					return data
				}
			} catch (err) {
				console.log(err)
				return null
			}
		},

		updateEvent: async (parent, args) => {
			try {
				let payload = { ...args.data }
				const query = { id: args.data.id }

				if (payload.hasOwnProperty("title")) {
					payload.slug =
						payload.title.toLowerCase().split(" ").join("-") +
						`-${payload.id}`
				}


				if(payload.hasOwnProperty('images')){
					let images = []

					for(let i=0; i< payload.images.length; i++){
						let imageUrl = await saveImgInAWS(payload.images[i], getRandomNumer().toString())
						images.push({url: imageUrl});
					}

					payload.images = images;
				}

				delete payload["id"]
				let event = await Event.findOneAndUpdate(
					query,
					{ ...payload },
					{ new: true }
				)
				console.log(event)
				if (event) {
					let data = {
						event,
					}
					return data
				}
			} catch (err) {
				console.log(err);
				return null
			}
		},

		deleteEvent: async (parent, args) => {
			try {
				let eventId = args.id

				const event = await Event.findOneAndDelete({ id: eventId })

				if (event) {
					return {
						success: true,
					}
				}
			} catch (error) {
				console.log(error)
			}
		},

		//Create category
		createCategory: async (parent, args) => {
			try {
				let payload = { ...args.data }
				const number = await Category.countDocuments()
				payload.id = number + 1
				const category = new Category(payload)
				const res = await category.save()
				if (res) {
					return {
						id: res.id,
						name: res.name,
					}
				}
			} catch (err) {
				console.log(err)
			}
		},

		updateCategory: async (parent, args) => {
			try {
				let payload = { ...args.data }
				delete payload["id"]

				const query = { id: args.data.id }

				let category = await Category.findOneAndUpdate(
					query,
					{ ...payload },
					{ new: true }
				)
				console.log(category)
				if (category) {
					let data = {
						category: {
							id: category.id,
							name: category.name,
							heading: category.heading,
							subs: category.subs,
						},
					}
					return data
				}
			} catch (err) {
				console.log(err)
			}
		},

		//User related mutations
		createUser: async (parent, args) => {
			try {
				let payload = { ...args.data }
				const number = await User.countDocuments()
				payload.id = number + 1
				const user = new User(payload)
				const res = await user.save()
				if (res) {
					let data = {
						user: {
							id: res.id,
							name: res.name,
							phone: res.phone,
						},
					}

					return data
				}
			} catch (err) {
				console.log(err)
				return null
			}
		},

		updateUser: async (parent, args) => {
			try {
				let payload = { ...args.data }
				const query = { id: payload.id }
				let user = await User.findOneAndUpdate(
					query,
					{ ...payload },
					{ new: true }
				)
				console.log(user)
				if (user) {
					delete user["_id"]
					let data = {
						user,
					}
					return data
				}

				return null
			} catch (err) {
				return null
			}
		},

		sendOtp: async (parent, args) => {
			try {
				let phone = args.data.phone
				//Validate phone number here;
				let countryCode = "+91"

				if(phone == '5854170338'){
					countryCode = '+1';
				}

				let phoneWithCountryCode = countryCode + phone
				let otp = Math.floor(100000 + Math.random() * 900000)

				const user = await User.find({ phone })

				console.log(user)

				if (user.length == 0) {
					//User not found. Creating a doc with user phone
					//new user creating a record
					let userId = Math.floor(1000 + Math.random() * 9000).toString() //Need to find a better way to store ids of all data models
					const newUser = new User({ id: userId, phone })
					const result = await newUser.save()

					if (!result) {
						return {
							status: 500,
							success: false,
						}
					}
				}

				//Updating otp value in user doc. Store timestamp to validate otp in loginUser resolver
				let query = { phone }
				let updateData = {
					otp: otp.toString(),
					// otpTimestamp:
				}

				client.messages.create({
					body: `Hey! use this OTP to login ${otp}`,
					from: process.env.TWILIO_NUMBER,
					to: phoneWithCountryCode,
				})

				const newUser = await User.findOneAndUpdate(query, updateData, {
					new: true,
				})
				if (newUser) {
					return {
						success: true,
						status: 200,
					}
				} else {
					return {
						success: false,
						status: 500,
					}
				}

				// if (result && result.sid) {
				// 	const user = await User.findOneAndUpdate(query, updateData, {
				// 		new: true,
				// 	})
				// 	if (user) {
				// 		return {
				// 			success: true,
				// 			status: 200,
				// 		}
				// 	}
				// } else {
				// 	return {
				// 		success: false,
				// 		status: 500,
				// 	}
				// }
			} catch (error) {
				console.log(error)
				return {
					success: false,
					status: 500,
				}
			}
		},
	},
}
