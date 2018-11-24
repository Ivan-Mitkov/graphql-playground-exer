import { GraphQLServer } from "graphql-yoga";
import uuid4 from "uuid/v4";

//Demo User data
let users = [
  { id: "12fgh", name: "Sylvia", email: "s@s.com", age: 23 },
  { id: "12h", name: "Saint", email: "s@si.com", age: 27 },
  { id: "12dfh", name: "Merulin", email: "ds@si.com" }
];
let posts = [
  {
    id: "12fgh",
    title: "Sylvia",
    body: "is good looking woman",
    published: true,
    author: "12fgh"
  },
  {
    id: "12h",
    title: "Rog",
    body: "WTF is this",
    published: false,
    author: "12h"
  },
  {
    id: "fgh",
    title: "Mondo",
    body: "L'ombeliko del mondo ",
    published: true,
    author: "12dfh"
  },
  {
    id: "ds",
    title: "Strah",
    body: "Mechka strah men ne strah ",
    published: true,
    author: "12h"
  }
];
let comments = [
  { id: "jkk", text: "Boko", author: "12fgh", post: "12fgh" },
  { id: "jhjhkh", text: "Return to the basics", author: "12h", post: "ds" },
  {
    id: "fgfghf",
    text: "Kilimandjaro e v Tanzania",
    author: "12h",
    post: "12fgh"
  },
  { id: "tgjs", text: "Golemi gluposti", author: "12h", post: "fgh" }
];

//>>>>>>>>        Type definitions (schema) >>>>>>>>>>>>>>>>>>>>>>
const typeDefs = `
type Query {
    users(query:String):[User]!
    posts(query:String):[Post]!
    comments(query:String):[Comment]!
    greetings(name:String, position:String):String!
    add(a:Float!,b:Float!):Float
    addArr(numbers:[Float!]!):Float
    grades:[Int]!
    post:Post!
}

type Mutation{
  createUser(data:CreateUserInput!):User!
  deleteUser(id:ID!):User!
  createPost(data:CreatePostInput!):Post!
  createComment(data:CreateCommentInput!):Comment!
}

input CreateUserInput{
  name:String!
  email:String!
  age:Int
}
input CreatePostInput{
  title:String!
  body:String!
  published:Boolean!
  author:ID!
}

input CreateCommentInput{
  text:String!
  author:ID!
  post:ID!
}

type User{
  id:ID!
  name:String!
  email:String!
  age:Int
  posts:[Post!]!
  comments:[Comment]!
}

type Post {
    id:ID!
    title:String!
    body:String!
    published:Boolean!
    author:User!
    comments:[Comment]!
}

type Comment{
  id:ID!
  text:String!
  author:User!
  post:Post!
}
`;

//>>>>>>>>    Resolvers    >>>>>>>>>>>>>>>>>>
const resolvers = {
  Query: {
    users(parents, args, ctx, info) {
      //from Schema args for filtering are provided
      if (!args.query) {
        return users;
      }
      return users.filter(user => {
        const name = user.name.toLocaleLowerCase();
        return name.indexOf(args.query.toLocaleLowerCase()) != -1;
      });
    },
    posts(parents, args, ctx, info) {
      if (!args.query) {
        return posts;
      }
      return posts.filter(post => {
        return (
          post.body
            .toLocaleLowerCase()
            .includes(args.query.toLocaleLowerCase()) ||
          post.title
            .toLocaleLowerCase()
            .includes(args.query.toLocaleLowerCase())
        );
      });
    },
    comments(parent, args, ctx, info) {
      if (!args.query) {
        return comments;
      }
      return comments.filter(comment => {
        return comment.author.includes(args.query);
      });
    },
    greetings(parent, args, context, info) {
      console.log(args);
      return `Hello ${args.name}! You are my favorite ${args.position}`;
    },
    add(parent, args) {
      return args.a + args.b;
    },
    addArr(parent, args, ctx, info) {
      return args.numbers.reduce((x, y) => x + y);
    },
    grades(parent, args, context, info) {
      return [1, 2];
    }
  },
  ///>>>>>>>>   Mutations >>>>>>>>>>>>>>>>>>>>>>
  Mutation: {
    //because we use Input Type instead of args.email args.data.email
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => {
        return user.email === args.data.email;
      });
      if (emailTaken) {
        throw new Error("Email already taken");
      }
      //create new user
      const user = {
        id: uuid4(),
        ...args.data
      };
      //save new user
      users.push(user);
      //return user
      return user;
    },

    //TOVA E MALKO PO SLOGNO
    deleteUser(parent, args, ctx, info) {
      //find index of what we want to delete
      const userIndex = users.findIndex(user => user.id === args.id);
      if (userIndex === -1) {
        throw new Error("Not such user");
      }
      const deletedUser = users.splice(userIndex, 1);

      //tarsim v negovite postove
      posts = posts.filter(currPost => {
        //tarsim dali ima post chiito avtor e s args.id
        const match = currPost.author === args.id;
        //ako ima takav post
        if (match) {
          //filtrirame comentarite kato iztrivame vsicki komentari v tozi post
          // vse edno dali negovi ili chugdi
          comments = comments.filter(comment => comment.post !== currPost.id);
        }
        //vrashtame samo chugdite postove
        return !match;
      });
      //iztrivame negovi komentai ot chugdi postove no bez da pipame postovete
      comments=comments.filter((comment)=>comment.author!==args.id);

      return deletedUser[0];
    },
    createPost(parent, args, ctx, info) {
      const authorIdIsValid = users.some(user => {
        return user.id === args.data.author;
      });
      if (!authorIdIsValid) {
        throw new Error("Author id is not valid");
      }
      //create
      const post = {
        id: uuid4(),
        ...args.data
      };
      //save
      posts.push(post);
      //return
      return post;
    },

    createComment(parent, args, ctx, info) {
      const postIsValid = posts.some(
        post => post.id === args.data.post && post.published
      );
      if (!postIsValid) {
        throw new Error("Invalid post");
      }

      const authorIdIsValid = users.some(user => user.id === args.data.author);
      if (!authorIdIsValid) {
        throw new Error("Author is not valid");
      }

      const comment = {
        id: uuid4(),
        ...args.data
      };
      comments.push(comment);
      return comment;
    }
  },

  //>>>>>>>>>>>>>>>>  Relation   >>>>>>>>>>>>>>>
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.post === parent.id;
      });
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.author === parent.id;
      });
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find(post => {
        return post.id === parent.post;
      });
    }
  }

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
};

const server = new GraphQLServer({
  typeDefs: typeDefs,
  resolvers: resolvers
});

const options = {
  port: 4000
};

server.start(options, ({ port }) => {
  console.log(`The server is up on port ${port}`);
});
