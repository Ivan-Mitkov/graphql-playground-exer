import uuid4 from "uuid/v4";

const Mutation = {
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
        ctx.db.comments = ctx.db.comments.filter(
          comment => comment.post !== currPost.id
        );
      }
      //vrashtame samo chugdite postove
      return !match;
    });
    //iztrivame negovi komentai ot chugdi postove no bez da pipame postovete
    ctx.db.comments = ctx.db.comments.filter(
      comment => comment.author !== args.id
    );

    return deletedUser[0];
  },
  updateUser(parent, args, ctx, info) {
    const { id, data } = args;
    const user = ctx.db.users.find(user => user.id === args.id);
    if (!user) {
      throw new Error("No such user");
    }
    //check if email is UNIQUE
    if (typeof data.email === "string") {
      const emailTaken = ctx.db.users.some(user => user.email === data.email);

      if (emailTaken) {
        throw new Error("Email already in use");
      }
      user.email = data.email;
    }
    if (typeof data.name === "string") {
      user.name = data.name;
    }
    if (typeof data.age !== "undefined") {
      user.age = data.age;
    }

    return user;
  },
  createPost(parent, args, ctx, info) {
    const { pubsub } = ctx;
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
    //publish for subscription with to arguments chanel name and actual data
    //use args for the new post
    //change object to PostSubscriptionPayload
    if (args.data.published) {
      pubsub.publish(`post`, {
        post: {
          data: post,
          mutation: "CREATED"
        }
      });
    }

    //return
    return post;
  },

  deletePost(parent, args, ctx, info) {
    const { pubsub } = ctx;
    const postIndex = ctx.db.posts.findIndex(post => {
      return post.id === args.id;
    });
    if (postIndex === -1) {
      throw new Error("Post not found");
    }
    const deletedPost = ctx.db.posts.splice(postIndex, 1);
    //tarsim v negovite comentari
    ctx.db.comments = ctx.db.comments.filter(
      comment => comment.post !== args.id
    );
    //publish
    if (deletedPost[0].published) {
      pubsub.publish(`post`, {
        post: {
          mutation: "DELETED",
          data: deletedPost[0]
        }
      });
    }
    return deletedPost[0];
  },
  updatePost(parent, args, ctx, info) {
    const { id, data } = args;
    const { db, pubsub } = ctx;

    const post = db.posts.find(post => post.id === id);
    const originalPost = { ...post };

    if (!post) {
      throw new Error("No such post");
    }
    if (typeof data.title === "string") {
      post.title = data.title;
    }
    if (typeof data.body === "string") {
      post.body = data.body;
    }
    if (typeof data.published === "boolean") {
      post.published = data.published;

      if (originalPost.published && !post.published) {
        //deleted event
        pubsub.publish("post", {
          post: {
            data: originalPost,
            mutation: "DELETED"
          }
        });
      } else if (!originalPost.published && post.published) {
        //created event
        pubsub.publish("post", {
          post: {
            data: post,
            mutation: "CREATED"
          }
        });
      }
    } else if (post.published) {
      //subscription update
      pubsub.publish("post", {
        post: {
          data: post,
          mutation: "EDITED"
        }
      });
    }
    return post;
  },

  createComment(parent, args, ctx, info) {
    const { pubsub } = ctx;
    const postIsValid = ctx.db.posts.some(
      post => post.id === args.data.post && post.published
    );
    if (!postIsValid) {
      throw new Error("Invalid post");
    }

    const authorIdIsValid = ctx.db.users.some(
      user => user.id === args.data.author
    );
    if (!authorIdIsValid) {
      throw new Error("Author is not valid");
    }

    const comment = {
      id: uuid4(),
      ...args.data
    };
    ctx.db.comments.push(comment);
    //publish for subscription with to arguments chanel name and actual data
    pubsub.publish(`comment ${args.data.post}`, { comment: {
      data:comment,
      mutation:"CREATED"
    } });
    return comment;
  },

  deleteComment(parent, args, ctx, info) {
    const { pubsub } = ctx;

    const commentIndex = ctx.db.comments.findIndex(
      comment => comment.id === args.id
    );

    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }

    const deletedComment = ctx.db.comments.splice(commentIndex, 1);

  //publish for subscription with arguments chanel name and actual data
    pubsub.publish(`comment ${deletedComment[0].post}`, { comment: {
      data:deletedComment[0],
      mutation:"DELETED"
    } });

    return deletedComment[0];
  },
  updateComment(parent, args, ctx, info) {
    const { id, data } = args;
    const { db,pubsub } = ctx;

    const comment = db.comments.find(comment => comment.id === id);
    if (!comment) {
      throw new Error("No such comment");
    }
    if (typeof data.text === "string") {
      comment.text = data.text;
    }

    //publish for subscription with arguments chanel name and actual data
    pubsub.publish(`comment ${comment.post}`, { comment: {
      data:comment,
      mutation:"UPDATED"
    } });

    return comment;
  }
};

export default Mutation;
