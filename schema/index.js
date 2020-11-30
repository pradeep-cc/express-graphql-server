import { gql, UserInputError } from "apollo-server-express";
import Event from "../models/Event";
import Category from "../models/Category";
import User from "../models/User";

let drops = [];

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
  }

  type User {
    id: ID!
    phone: String
    name: String
    preferences: [UserPreference]
  }

  type UserPreference {
    id: ID!
    name: String!
    subs: [Sub]
  }

  input loginUser {
    phone: String!
  }

  type LoginUserPayload {
    user: User
  }

  type UpdateUserPayload {
    user: User
  }

  input UpdateUserInput {
    id: ID!
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
    isOnline: Boolean
    occurrences: [OccurrenceInput]
    outcomes: [OutcomeInput]
  }

  type CreateEventPayload {
    event: Event
  }

  type DeleteEventPayload{
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
    outcomes: [OutcomeInput]
  }

  type UpdateEventPayload {
    event: Event
  }

  type Event {
    id: ID
    title: String
    type: String
    isPaid: Boolean
    venue: Venue
    description: String
    startDate: String
    startTime: String
    endTime: String
    userId: String
    occurrences: [Occurrence]
    outcomes: [Outcome]
    isOnline: Boolean
    slug: String
    isLive: Boolean
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
`;

export const resolvers = {
  Query: {
    message: () => "Hello world!",

    events: async (parent, args) => {
      try {
        let payload = { ...args.data };
        let query;
        if (payload.hasOwnProperty("isOnline")) {
          query = { isOnline: payload.isOnline, isLive: true };
        }

        if (payload.hasOwnProperty("userId")) {
          query = { userId: payload.userId };
        }

        let data = await Event.find(query);
        console.log(data);
        return data;
      } catch (err) {
        console.log(err);
        return null;
      }
    },

    event: async (parent, args) => {
      try {
        let id = args.id;
        const event = await Event.find({ id });
        let res = event[0];
        console.log(res);
        if (res) {
          return res;
        } else {
          return null;
        }
      } catch (err) {
        console.log(err);
        return null;
      }
    },

    categories: async (parent, args) => {
      try {
        const where = args.filter
          ? {
              id: { $in: args.filter },
            }
          : {};

        let data = await Category.find(where);
        // console.log(data);
        return data;
      } catch (err) {
        console.log(err);
        return null;
      }
    },

    //User related queries
    loginUser: async (parent, args) => {
      try {
        let payload = { ...args.data };

        const user = await User.find({ phone: payload.phone });
        let res = user[0];

        if (user.length > 0) {
          let data = {
            user: {
              id: res.id,
              name: res.name,
              phone: res.phone,
            },
          };

          return data;
        } else {
          return null;
        }
      } catch (err) {
        return null;
      }
    },

    user: async (parent, args) => {
      try {
        let userId = args.id;

        const user = await User.find({ id: userId });
        console.log(user);
        return user[0];
      } catch (err) {
        console.log(err);
      }
    },
  },

  Mutation: {
    createEvent: async (parent, args) => {
      try {
        let payload = { ...args.data };
        console.log(payload);
        const number = await Event.countDocuments();

        payload.id = Math.floor(Math.random() * 1000000);;
        payload.slug =
          payload.title.toLowerCase().split(" ").join("-") + `-${payload.id}`;
        payload.isLive = false; //defaulting event status to not live
        const event = await new Event(payload);
        const res = await event.save();

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
              userId: res.userId,
              isLive: res.isLive,
            },
          };
          return data;
        }
      } catch (err) {
        console.log(err);
        return null;
      }
    },

    updateEvent: async (parent, args) => {
      try {
        let payload = { ...args.data };
        const query = { id: args.data.id };

        if (payload.hasOwnProperty("title")) {
          payload.slug =
            payload.title.toLowerCase().split(" ").join("-") + `-${payload.id}`;
        }
        delete payload["id"];
        let event = await Event.findOneAndUpdate(
          query,
          { ...payload },
          { new: true }
        );
        console.log(event);
        if (event) {
          let data = {
            event,
          };
          return data;
        }
      } catch (err) {
        return null;
      }
    },

    deleteEvent: async (parent, args) => {
      try {
        let eventId = args.id;

        const event = await Event.findOneAndDelete({ id: eventId });

        if(event){
          return {
            success: true
          }
        }
        

      }
      catch(error){
        console.log(error);
      }
    },

    //Create category
    createCategory: async (parent, args) => {
      try {
        let payload = { ...args.data };
        const number = await Category.countDocuments();
        payload.id = number + 1;
        const category = new Category(payload);
        const res = await category.save();
        if (res) {
          return {
            id: res.id,
            name: res.name,
          };
        }
      } catch (err) {
        console.log(err);
      }
    },

    updateCategory: async (parent, args) => {
      try {
        let payload = { ...args.data };
        delete payload["id"];

        const query = { id: args.data.id };

        let category = await Category.findOneAndUpdate(
          query,
          { ...payload },
          { new: true }
        );
        console.log(category);
        if (category) {
          let data = {
            category: {
              id: category.id,
              name: category.name,
              heading: category.heading,
              subs: category.subs,
            },
          };
          return data;
        }
      } catch (err) {
        console.log(err);
      }
    },

    //User related mutations
    createUser: async (parent, args) => {
      try {
        let payload = { ...args.data };
        const number = await User.countDocuments();
        payload.id = number + 1;
        const user = new User(payload);
        const res = await user.save();
        if (res) {
          let data = {
            user: {
              id: res.id,
              name: res.name,
              phone: res.phone,
            },
          };

          return data;
        }
      } catch (err) {
        console.log(err);
        return null;
      }
    },

    updateUser: async (parent, args) => {
      try {
        let payload = { ...args.data };
        const query = { id: payload.id };
        let user = await User.findOneAndUpdate(
          query,
          { ...payload },
          { new: true }
        );
        console.log(user);
        if (user) {
          delete user["_id"];
          let data = {
            user,
          };
          return data;
        }

        return null;
      } catch (err) {
        return null;
      }
    },
  },
};
