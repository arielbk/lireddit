import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post],
  dbName: "lireddit",
  type: "postgresql",
  debug: !__prod__,
  // this will give us autocompletion for the init function 👇
} as Parameters<typeof MikroORM.init>[0];
