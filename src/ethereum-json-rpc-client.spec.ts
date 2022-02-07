/* eslint-disable jest/no-hooks */
import { getTransactionCount } from "./ethereum-json-rpc-client";
import { getServer } from "./server.mock";

describe("ethereum-json-rpc-client", () => {
  const rpcUrl = "http://locahost:8545";
  const server = getServer(rpcUrl);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  describe("getTransactionCount", () => {
    it("ok", async () => {
      expect.assertions(1);
      expect(1).toBe(1);
      await getTransactionCount(rpcUrl, "address", "pending");
    });
  });
});
