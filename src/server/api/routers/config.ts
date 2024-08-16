import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { config } from "@/config";
import { sparseConfigValidator } from "@/configTypes";

export const configRouter = createTRPCRouter({
  getConfig: publicProcedure.query(() => config.read()),
  setConfig: publicProcedure.input(sparseConfigValidator).query(({ input }) => {
    config.write(input);
    return "Config updated";
  }),
});
