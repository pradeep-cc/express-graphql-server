import { gql } from 'apollo-server-express';



let drops = []

export const typeDefs = gql`
    type Query {
        message: String!
        drops: [Drop]
    }

    type Mutation{
        addDrop(text: String!): AddDropPayload
    }

    type AddDropPayload{
        drop: Drop!
        success: Boolean!
    }

    type Drop {
        text: String!
    }
`;



export const resolvers = {
    Query: {
        message: () => 'Hello world!',
        drops: () => {
            return drops
        }
    },

    Mutation: {
        addDrop: (parent, args) => {
            let drop = {
              text: args.text,
            };
            drops.push(drop);
            return {
                drop,
                success: true
            };
        }
    }
};