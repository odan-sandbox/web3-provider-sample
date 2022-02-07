import { createAsyncMiddleware } from "json-rpc-engine";

export type Params = {
  from?: string;
};

export function createNonceMiddleware() {
  return createAsyncMiddleware<Params, unknown>(async (req, res, next) => {
    const from = req.params?.from;

    if (!from) {
      throw new TypeError();
    }
  });
}
