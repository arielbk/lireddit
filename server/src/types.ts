import { Request, Response } from 'express';
import { Redis } from "ioredis";

export type MyContext = {
  // todo: come back to this any type 👇
  req: Request & { session: any };
  res: Response;
  redis: Redis,
};
