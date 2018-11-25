import { GraphQLServer } from "graphql-yoga";

import db from './db';
import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import User from './resolvers/User';
import Post from './resolvers/Post';
import Comment from './resolvers/Comment';

//>>>>>>>>        Type definitions (schema) >>>>>>>>>>>>>>>>>>>>>>

//>>>>>>>>    Resolvers    >>>>>>>>>>>>>>>>>>
const resolvers = {
  Query,
  Mutation,
  //>>>>>>>>>>>>>>>>  Relation   >>>>>>>>>>>>>>>
  Post ,
  User ,
  Comment 
};

//because schema.graphql typeDefs:'path from ROOT
//pass db using context
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers: resolvers,
  context:{
    db:db
  }
});

const options = {
  port: 4000
};

server.start(options, ({ port }) => {
  console.log(`The server is up on port ${port}`);
});
