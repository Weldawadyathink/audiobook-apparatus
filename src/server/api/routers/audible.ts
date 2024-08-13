import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { spawn } from "node:child_process";

function getLibrary(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let asinList: string[] = [];
    const process = spawn("audible", ["library", "list"]);

    process.stdout.on("data", (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const lines = data.toString().split("\n") as string[];
      const asins = lines.map((row: string) => row.substring(0, 10));
      asinList = [...asinList, ...asins];
    });

    process.stderr.on("data", (data) => {
      reject(data);
    });

    process.on("close", (code) => {
      if (code == 0) {
        resolve(asinList.filter((s) => s !== ""));
      } else {
        reject(`Process exited with code ${code}`);
      }
    });
  });
}

export const audibleRouter = createTRPCRouter({
  libraryList: publicProcedure.query(getLibrary),
});
