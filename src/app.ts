import { JsonRpcEngine } from "json-rpc-engine";
import {
  createFetchMiddleware,
  createWalletMiddleware,
  providerFromEngine,
} from "eth-json-rpc-middleware";
import { publicKeyCreate } from "secp256k1";
import create from "keccak";

import Web3 from "web3";

function createSampleProvider(rpcUrl: string, privateKey: string) {
  const engine = new JsonRpcEngine();

  engine.push(
    createWalletMiddleware({
      getAccounts: async () => {
        const publicKey = publicKeyCreate(
          Buffer.from(privateKey.substring(2), "hex"),
          false
        ).slice(1);

        const address = create("keccak256")
          .update(Buffer.from(publicKey))
          .digest()
          .slice(12, 32);

        return Promise.resolve([`0x${address.toString("hex")}`]);
      },
    })
  );

  engine.push(createFetchMiddleware({ rpcUrl }));

  return providerFromEngine(engine);
}

async function main(): Promise<void> {
  const rpcUrl = process.env.RINKEBY_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl) {
    throw new Error("RINKEBY_URL is undefiend");
  }
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is undefiend");
  }

  const sampleProvider = createSampleProvider(rpcUrl, privateKey);

  const web3 = new Web3(sampleProvider as any);

  console.log(await web3.eth.getBlockNumber());
  console.log(await web3.eth.getAccounts());
}

main();

process.on("unhandledRejection", (reason) => {
  console.error(reason);
  process.exit(1);
});
