import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

@Resolver()
export class PostResolver {
  // typescript type is set here 👇
  @Query(() => [Post])
  // graphql type is set here 👇
  posts(): Promise<Post[]> {
    return Post.find();
  }

  // this is how we allow null 👇 values in type-graphql
  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // graphql mutations for changing data on the server
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      Post.update({id}, {title});
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
