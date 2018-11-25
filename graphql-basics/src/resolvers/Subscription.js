const Subscription = {
  count:{
      subscribe(parent,args,ctx,info){
        const {pubsub}=ctx;
        let count =0;

        setInterval(()=>{
            count++;
            pubsub.publish('count',{
                //take name from schema
                count:count
            })
        },1000)

        //asyncIterator take one argument chanel
        return pubsub.asyncIterator('count');
      }
  },
  comment:{
    subscribe(parent,args,ctx,info){
        const {pubsub,db}=ctx;
        const {postId}=args;
        //namirame posta ako go ima
        const post =db.posts.find((post)=>post.id===postId&&post.published);
        if(!post){
            throw new Error("No such post")
        }

        //if exists subscribe
        return pubsub.asyncIterator(`comment ${postId}`)
        //call pubsub.publish where comment is created in Mutation createComment
    }
  },
  post:{
    subscribe(parent,args,ctx,info){
        const {pubsub,db}=ctx;
       
        return pubsub.asyncIterator(`post`)

    }
  }
};

export default Subscription;
