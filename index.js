import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import { typeDefs, resolvers } from './schema';


const start = async () => {
    const app = express();

    const server = new ApolloServer({ typeDefs, resolvers });

    server.applyMiddleware({ app });

    await mongoose.connect("mongodb+srv://newuser123:newuser123@cluster0.ovxgm.mongodb.net/test?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 20000
    });

    app.listen(8080, (error) => {
        if(error) console.log("ERRROR")
        console.log(`listening: http://localhost:8080${server.graphqlPath}`);
    });

}

start()