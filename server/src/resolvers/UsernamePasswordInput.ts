import { InputType, Field } from "type-graphql";

// ! Object types are returned from mutations, input types are for arguments
// this is to illustrate another way to define this as a kind of arg object 👇

@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}
