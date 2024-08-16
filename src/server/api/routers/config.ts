import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getConfig, setConfig, configObjectValidator } from "@/config";

export const configRouter = createTRPCRouter({
  getConfig: publicProcedure.query(() => getConfig()),
  setConfig: publicProcedure.input(configObjectValidator).query(({ input }) => {
    setConfig(input);
    return "Config updated";
  }),
});
