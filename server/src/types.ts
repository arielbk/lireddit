import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { Redis } from "ioredis";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  // todo: come back to this any type 👇
  req: Request & { session: any };
  res: Response;
  redis: Redis,
};
