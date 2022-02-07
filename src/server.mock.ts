import { setupServer } from "msw/node";
import { rest } from "msw";

export function getHandlers(rpcUrl: string) {
  const handlers = [
    rest.post<{ id: string }>(rpcUrl, (req, res, ctx) => {
      const { id } = req.body;
      console.log(req.body);
      return res(
        ctx.json({
          id,
          result: "a",
        })
      );
    }),
  ];

  return handlers;
}

export const getServer = (rpcUrl: string) =>
  setupServer(...getHandlers(rpcUrl));
