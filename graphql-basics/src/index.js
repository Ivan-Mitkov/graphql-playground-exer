import { GraphQLServer } from "graphql-yoga";
import uuid4 from "uuid/v4";

import db from './db';

//>>>>>>>>        Type definitions (schema) >>>>>>>>>>>>>>>>>>>>>>

//>>>>>>>>    Resolvers    >>>>>>>>>>>>>>>>>>
const resolvers = {
  Query: {
    users(parents, args, ctx, info) {
      //from Schema args for filtering are provided
      if (!args.query) {
        return ctx.db.users;
      }
      return ctx.db.users.filter(user => {
        const name = user.name.toLocaleLowerCase();
        return name.indexOf(args.query.toLocaleLowerCase()) != -1;
      });
    },
    posts(parents, args, ctx, info) {
      if (!args.query) {
        return ctx.db.posts;
      }
      return ctx.db.posts.filter(post => {
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
        return ctx.db.comments;
      }
      return ctx.db.comments.filter(comment => {
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
      const emailTaken = ctx.db.users.some(user => {
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
      ctx.db.users.push(user);
      //return user
      return user;
    },

    //TOVA E MALKO PO SLOGNO
    deleteUser(parent, args, ctx, info) {
      //find index of what we want to delete
      const userIndex = ctx.db.users.findIndex(user => user.id === args.id);
      if (userIndex === -1) {
        throw new Error("Not such user");
      }
      const deletedUser = ctx.db.users.splice(userIndex, 1);

      //tarsim v negovite postove
      ctx.db.posts = ctx.db.posts.filter(currPost => {
        //tarsim dali ima post chiito avtor e s args.id
        const match = currPost.author === args.id;
        //ako ima takav post
        if (match) {
          //filtrirame comentarite kato iztrivame vsicki komentari v tozi post
          // vse edno dali negovi ili chugdi
          ctx.db.comments = ctx.db.comments.filter(comment => comment.post !== currPost.id);
        }
        //vrashtame samo chugdite postove
        return !match;
      });
      //iztrivame negovi komentai ot chugdi postove no bez da pipame postovete
      ctx.db.comments = ctx.db.comments.filter(comment => comment.author !== args.id);

      return deletedUser[0];
    },
    createPost(parent, args, ctx, info) {
      const authorIdIsValid = ctx.db.users.some(user => {
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
      ctx.db.posts.push(post);
      //return
      return post;
    },

    deletePost(parent, args, ctx, info) {
      const postIndex = ctx.db.posts.findIndex(post => {
        return post.id === args.id;
      });
      if (postIndex === -1) {
        throw new Error("Post not found");
      }
      const deletedPost = ctx.db.posts.splice(postIndex, 1);
      //tarsim v negovite comentari
      ctx.db.comments = ctx.db.comments.filter(comment => comment.post !== args.id);
      return deletedPost[0];
    },

    createComment(parent, args, ctx, info) {
      const postIsValid = ctx.db.posts.some(
        post => post.id === args.data.post && post.published
      );
      if (!postIsValid) {
        throw new Error("Invalid post");
      }

      const authorIdIsValid = ctx.db.users.some(user => user.id === args.data.author);
      if (!authorIdIsValid) {
        throw new Error("Author is not valid");
      }

      const comment = {
        id: uuid4(),
        ...args.data
      };
      ctx.db.comments.push(comment);
      return comment;
    },

    deleteComment(parent, args, ctx, info) {
      const commentIndex = ctx.db.comments.findIndex(
        comment => comment.id === args.id
      );
      if (commentIndex === -1) {
        throw new Error("Comment not found");
      }
      const deletedComment = ctx.db.comments.splice(commentIndex, 1);
    
      return deletedComment[0];
    }
  },

  //>>>>>>>>>>>>>>>>  Relation   >>>>>>>>>>>>>>>
  Post: {
    author(parent, args, ctx, info) {
      return ctx.db.users.find(user => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return ctx.db.comments.filter(comment => {
        return comment.post === parent.id;
      });
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return ctx.db.posts.filter(post => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return ctx.db.comments.filter(comment => {
        return comment.author === parent.id;
      });
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return ctx.db.users.find(user => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return ctx.db.posts.find(post => {
        return post.id === parent.post;
      });
    }
  }

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
