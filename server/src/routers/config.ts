import { createRouter, publicProcedure } from "../trpc.ts";
import { getConfig, setConfig, configObjectValidator } from "../config.ts";

export const configRouter = createRouter({
  getConfig: publicProcedure.query(() => getConfig()),
  setConfig: publicProcedure.input(configObjectValidator).query(({ input }) => {
    setConfig(input);
    return "Config updated";
  }),
});
