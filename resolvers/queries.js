import Event from "../models/Event";
import Category from "../models/Category";
import User from "../models/User";
import City from "../models/City"
const jsonwebtoken = require("jsonwebtoken");
require("dotenv").config();





const city = async(parent, args) => {
	try{
		let query; 
		if(args.name){
			query = {name: args.name}
		}

		if(args.googlePlaceId){
			query = { googlePlaceId: args.googlePlaceId }
		}

		const city = await City.find(query);
		let result = city[0];

		if(result){
			return {
				id: result.id,
				name: result.name,
				lat: result.lat,
				lng: result.lng,
				googlePlaceId: result.googlePlaceId,
				country: result.country,
			}
		}

		return null;

	}
	catch(error){
		console.log(error);
		return null;
		
	}
}



const Query = {
		message: () => "Hello world!",

		events: async (parent, args, { user }) => {
			try {
				let payload = { ...args.data }
				let query;
				if (payload.hasOwnProperty("isOnline")) {
					if(payload.isOnline){
						query = { isOnline: payload.isOnline, isLive: true }
					}
					else{
						if(payload.cityId){
							query = { "venue.cityId": payload.cityId, isLive: true }
						}
						else{
							return (data = [])
						}
					}
					
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
				console.log(query);
				let data = await Event.find(query)
				console.log(data);
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
				let type = payload.type;

				let addObj = type === "phone" ? { "phone": args.data.value } : { "emails.value": args.data.value }

				const user = await User.find({ ...addObj })
				let res = user[0]
				console.log("result");
				console.log(res);

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
								emails: res.emails,
								profileImage: 'profileImage' in res ? res.profileImage : null,
								socialLogins: res.socialLogins,
								preferences: res.preferences
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



		city: city
    }
    
export default Query;