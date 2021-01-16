import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

// many to many relationship
// user <-> posts
// user -> join table <- posts
// user -> upvote <- posts

// 👇 these are stacked ts decorators from typeorm and type-graphql
@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @Field()
  @Column({ type: 'int' })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.upvotes)
  user: User;

  @Field(() => String)
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.upvotes)
  post: Post;
}
