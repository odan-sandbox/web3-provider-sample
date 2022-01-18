import { JsonRpcEngine } from "json-rpc-engine";
import {
  createFetchMiddleware,
  providerFromEngine,
} from "eth-json-rpc-middleware";

import Web3 from "web3";

function createSampleProvider(rpcUrl: string) {
  const engine = new JsonRpcEngine();

  engine.push(createFetchMiddleware({ rpcUrl }));

  return providerFromEngine(engine);
}

async function main(): Promise<void> {
  const rpcUrl = process.env.RINKEBY_URL;

  if (!rpcUrl) {
    throw new Error("RINKEBY_URL is undefiend");
  }

  const sampleProvider = createSampleProvider(rpcUrl);

  const web3 = new Web3(sampleProvider as any);

  console.log(await web3.eth.getBlockNumber());
}

main();

process.on("unhandledRejection", (reason) => {
  console.error(reason);
  process.exit(1);
});
