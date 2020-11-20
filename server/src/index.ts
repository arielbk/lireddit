import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  // run `npx mikro-orm migration:create` to create our migration schema
  // 👇 this will run our migration when the app starts
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
  
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        // keep sessions alive forever
        disableTouch: true,
        client: redisClient
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        // for security, we can't access the cookie through js
        httpOnly: true,
        sameSite: 'lax', // protect against csrf
        secure: __prod__, // locally we use localhost (not https)
      },
      secret: 'akejncvkbdvalewg23r',
      resave: false,
      saveUninitialized: true,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 3030;
  app.listen(3030, () => {
    console.log(`server listening on ${port}`);
  });
};

main().catch((err) => console.error(err));
