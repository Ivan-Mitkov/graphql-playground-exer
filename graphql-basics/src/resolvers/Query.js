const Query = {
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
  }
  export {Query as default};