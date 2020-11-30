import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";

// 👇 these are stacked ts decorators from mikro-orm and type-graphql
@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  // usernames should be unique! 👇
  @Property({ type: "text", unique: true })
  username!: string;
  
  @Field()
  @Property({ type: "text", unique: true })
  email!: string;
  
  // NOT a graphql field!
  @Property({ type: "text" })
  password!: string;
}
