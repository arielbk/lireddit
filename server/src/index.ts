import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Upvote } from './entities/Upvote';

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'lireddit2',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    // 👇 automatically does migrations
    synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User, Upvote],
  });

  conn.runMigrations();

  // await Post.delete({});

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        // keep sessions alive forever
        disableTouch: true,
        client: redis,
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
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 3030;
  app.listen(3030, () => {
    console.log(`server listening on ${port}`);
  });
};

main().catch((err) => console.error(err));
