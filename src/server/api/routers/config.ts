import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { config, defaultConfig } from "@/config";

export const configRouter = createTRPCRouter({
  getConfig: publicProcedure.query(() => config),
  setConfig: publicProcedure.input(defaultConfig).query(({ input }) => {
    for (const [key, value] of Object.entries(input)) {
      // @ts-expect-error Shut up typescript this is fine
      config[key] = value;
    }
  }),
});
