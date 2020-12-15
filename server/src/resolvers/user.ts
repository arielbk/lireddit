import { MyContext } from "src/types";
import { Resolver, Mutation, Field, Arg, Ctx, ObjectType, Query } from "type-graphql";
// apparently this is more secure than bcrypt
import argon2 from 'argon2';
import { v4 } from 'uuid';
import { User } from "../entities/User";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";

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
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() {redis, em, req}:MyContext
  ): Promise<UserResponse> {
    // validate password length
    if (newPassword.length <= 4)
    return { errors: [{
            field: 'newPassword',
            message: 'length must be greater than 4',
        }]
      };

    // check redis for token
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [{
          field: 'token',
          message: 'token is invalid'
        }]
      }
    }

    const user = await em.findOne(User, { id: parseInt(userId) });
    
    // check user exists (edge case)
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists',
          }
        ]
      };
    }

    // save new hashed password
    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    redis.del(key);

    // log user in with new credentials
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() {em, redis}: MyContext
  ) {
    const user = await em.findOne(User, { email });
    if (!user) {
      // email not in db, do nothing
      return true;
    }
    const token = v4(); // uuid token
    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3) // 3 days

    sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`)
    return true;
  }

  @Query(() => User, {nullable: true})
  async me(@Ctx() { req, em }: MyContext) {
    // not logged in
    if (!req.session.userId) return null
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) return { errors };

    const hashedPassword = await argon2.hash(options.password);
    // store the username and the _hashed_ password
    const user = em.create(User, {username: options.username, email: options.email, password: hashedPassword});
    try {
      await em.persistAndFlush(user);
    } catch(err) {
      console.log(err.message);
      // checking if the error tells us this is a duplicate username
      if (err.detail.includes('already exists')) {
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
    // store user session (aka log user in)
    req.session.userId = user.id;
    return { user };
  }
  
  @Mutation(() => UserResponse)
  async login(
    // now we can nicely reuse this 👇
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [{
          field: 'usernameOrEmail',
          message: `that username doesn't exist`
        }]
      };
    }
    const valid = await argon2.verify(user.password, password);
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

    // store current 
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ) {
    return new Promise(resolve => req.session.destroy((err: any) => {
      // destroy cookie even if session is not destroyed
      res.clearCookie(COOKIE_NAME);
      if (err) {
        console.log(err);
        return resolve(false)
      }
      return resolve(true);
    }));
  }
}
