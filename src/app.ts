import fetch from "node-fetch";
import { JsonRpcEngine } from "json-rpc-engine";
import {
  createFetchMiddleware,
  createWalletMiddleware,
  providerFromEngine,
  createFetchConfigFromReq,
} from "eth-json-rpc-middleware";
import { publicKeyCreate } from "secp256k1";
import create from "keccak";
import { TransactionFactory } from "@ethereumjs/tx";
import Common from "@ethereumjs/common";

import Web3 from "web3";

async function query(rpcUrl: string, method: string, params: string[]) {
  const { fetchUrl, fetchParams } = createFetchConfigFromReq({
    rpcUrl,
    req: {
      method,
      params,
      id: 42,
    },
  });

  const response = await fetch(fetchUrl, fetchParams);
  console.log({ response });

  const body = await response.json();

  if (body.error) {
    return Promise.reject(body.error);
  }

  return body.result;
}

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

      async processTransaction(txParams, req) {
        console.log({ txParams, params: req.params });

        const common = new Common({ chain: "rinkeby" });
        const gasPrice = await query(rpcUrl, "eth_gasPrice", []);
        const gas = await query(rpcUrl, "eth_estimateGas", [txParams] as any);
        const nonce = await query(rpcUrl, "eth_getTransactionCount", [
          txParams.from,
          "pending",
        ]);
        const tx = TransactionFactory.fromTxData(
          { gasPrice, gas, nonce, gasLimit: 21000, ...txParams } as any,
          {
            common,
          }
        );
        console.log({ tx });

        const signedTx = tx.sign(Buffer.from(privateKey.substring(2), "hex"));

        const data = `0x${signedTx.serialize().toString("hex")}`;
        const hash = await query(rpcUrl, "eth_sendRawTransaction", [data]);
        console.log({ hash });
        return `${hash}` as any;
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
  const address = (await web3.eth.getAccounts())[0];
  console.log(await web3.eth.sendTransaction({ from: address, to: address }));
}

main();

process.on("unhandledRejection", (reason) => {
  console.error(reason);
  process.exit(1);
});
