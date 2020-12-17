import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

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
  async createPost(@Arg("title") title: string): Promise<Post> {
    // 2 sql queries
    return Post.create({title}).save();
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
