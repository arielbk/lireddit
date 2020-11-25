import { QueryInput, Cache } from "@urql/exchange-graphcache";

// helper function for URQL types (which suck)
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any);
}
