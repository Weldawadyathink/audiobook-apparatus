import fs from "node:fs";
import yaml from "js-yaml";
import { env } from "@/env";
import { z } from "zod";

const defaultConfig = z.object({
  maxConcurrentDownloads: z.number().int().min(1).catch(5),
  audibleActivationBytes: z.union([z.string(), z.number()]).catch("1A2B3C4D"),
});

console.log("Loading config file");
let configFileData = undefined;
try {
  configFileData = yaml.load(fs.readFileSync(env.CONFIG_FILE, "utf8"));
  console.log("Loaded config file");
} catch (e) {
  console.log("Failed to load config file");
}

const internalConfig = defaultConfig.parse(configFileData || {});

function writeConfig() {
  const yamlData = yaml.dump(internalConfig);
  fs.writeFileSync(env.CONFIG_FILE, yamlData);
}

// Write any missing defaults to config
writeConfig();

// @ts-expect-error Missing properties will be added shortly
const config: z.infer<typeof defaultConfig> = {};
Object.keys(internalConfig).forEach((key) => {
  Object.defineProperty(config, key, {
    get() {
      return (internalConfig as Record<string, unknown>)[key];
    },
    set(newValue) {
      (internalConfig as Record<string, unknown>)[key] = newValue;
      writeConfig();
    },
  });
});

export { config };
