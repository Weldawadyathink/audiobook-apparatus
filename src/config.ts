import fs from "node:fs";
import yaml from "js-yaml";
import { env } from "@/env";
import { z } from "zod";

export const defaultConfig = z.object({
  maxConcurrentDownloads: z.number().int().min(1).catch(5),
  audibleActivationBytes: z.union([z.string(), z.number()]).catch("1A2B3C4D"),
});

export type DefaultConfigType = z.infer<typeof defaultConfig>;

console.log("Loading config file");
let configFileData = undefined;
try {
  configFileData = yaml.load(fs.readFileSync(env.CONFIG_FILE, "utf8"));
  console.log("Loaded config file");
} catch (e) {
  console.log("Failed to load config file");
}

export const config = defaultConfig.parse(configFileData || {});

// Must be run after changing the config
export function writeConfig() {
  const yamlData = yaml.dump(config);
  fs.writeFileSync(env.CONFIG_FILE, yamlData);
}

// Write any missing defaults to config
writeConfig();
