import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import { typeDefs, resolvers } from './schema';
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const getUser = (token) => {
  try {
    if (token) {
      return jwt.verify(token, JWT_SECRET);
    }
    return null;
  } catch (error) {
    return null;
  }
};


const start = async () => {  
    const app = express();

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => {
        const token = req.get("Authorization") || "";
        return { user: getUser(token.replace("Bearer", "")) };
      },
      playground: true,
    });

    server.applyMiddleware({
		app,
		bodyParserConfig: {
			limit: "100mb",
		},
	})

    await mongoose.connect("mongodb+srv://newuser123:newuser123@cluster0.ovxgm.mongodb.net/test?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 20000
    });

    app.listen(process.env.PORT || 3000, (error) => {
      if (error) console.log("ERRROR");
      console.log(`listening: http://localhost:3000${server.graphqlPath}`);
    });
        
}

start()