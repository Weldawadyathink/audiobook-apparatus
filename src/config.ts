import fs from "node:fs";
import yaml from "js-yaml";
import { env } from "@/env";
import { configValidator, type sparseConfigValidator } from "@/configTypes";
import type { z } from "zod";

const defaultConfig: z.infer<typeof configValidator> = {
  maxConcurrentDownloads: 5,
  audibleActivationBytes: "1A2B3C4D",
};

let configFileData = {};
try {
  configFileData = yaml.load(
    fs.readFileSync(env.CONFIG_FILE, "utf8"),
  ) as object;
  console.log("Loaded config file");
} catch (e) {
  console.log("Failed to load config file");
}

let internalConfig = configValidator.parse({
  ...defaultConfig,
  ...configFileData,
});

export function writeConfig() {
  const yamlData = yaml.dump(internalConfig);
  fs.writeFileSync(env.CONFIG_FILE, yamlData);
}

// Write any missing defaults to config
writeConfig();

export const config = {
  read: () => internalConfig,
  write: (obj: z.infer<typeof sparseConfigValidator>) => {
    internalConfig = configValidator.parse({ ...internalConfig, ...obj });
    writeConfig();
  },
};
