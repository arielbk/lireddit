import { MyContext } from "src/types";
import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType } from "type-graphql";
// apparently this is more secure than bcrypt
import argon2 from 'argon2';
import { User } from "../entities/User";

// ! Object types are returned from mutations, input types are for arguments

// this is to illustrate another way to define this as a kind of arg object 👇
@InputType()
class UsernamePasswordInput { 
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  // set the type because it can be nullable
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em}: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 3) {
      return {
        errors: [{
          field: 'username',
          message: 'length must be greater than 3',
        }]
      }
    }
    if (options.password.length <= 4) {
      return {
        errors: [{
          field: 'password',
          message: 'length must be greater than 4',
        }]
      }
    }

    const hashedPassword = await argon2.hash(options.password);
    // store the username and the _hashed_ password
    const user = em.create(User, {username: options.username, password: hashedPassword});
    try {
      await em.persistAndFlush(user);
    } catch(err) {
      console.log(err.message);
      // checking if the error tells us this is a duplicate username
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'that username already exists',
            }
          ]
        }
      }
    }
    return { user };
  }
  
  @Mutation(() => UserResponse)
  async login(
    // now we can nicely reuse this 👇
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: `that username doesn't exist`
        }]
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password'
          }
        ]
      }
    }
    return {
      user,
    };
  }
}