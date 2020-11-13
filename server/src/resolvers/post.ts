import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
  // typescript type is set here 👇
  @Query(() => [Post])
  // graphql type is set here 👇
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  // this is how we allow null 👇 values in type-graphql
  @Query(() => Post, { nullable: true })
  post(
    // this 👇 is what it's called in the arg
    @Arg("id", () => Int) id: number,
    // this is what we call it here ☝️
    @Ctx() { em }: MyContext
    // regular typescript nullable 👇
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  // graphql mutations for changing data on the server
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Post, { id });
    } catch {
      return false;
    }
    return true;
  }
}
