import fetch from "node-fetch";

import { createFetchConfigFromReq } from "eth-json-rpc-middleware";

export type Address = string;

export type BlockNumber = string;
export type BlockTag = "earliest" | "latest" | "pending";

// eslint-disable-next-line @typescript-eslint/ban-types
export type Block = (BlockNumber & {}) | BlockTag;

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

export async function getTransactionCount(
  rpcUrl: string,
  address: Address,
  block: Block
): Promise<string> {
  const method = "eth_getTransactionCount";
  const params = [address, block];

  return query(rpcUrl, method, params);
}
