import fs from "node:fs";
import yaml from "js-yaml";
import { env } from "@/env";

const defaultConfig = {
  // Default config options
  maxConcurrentDownloads: 5,
  audibleActivationBytes: "1234567B",
};

console.log("Loading config file");
let configFileData = undefined;
try {
  configFileData = yaml.load(fs.readFileSync(env.CONFIG_FILE, "utf8"));
  console.log("Loaded config file");
} catch (e) {
  console.log("Failed to load config file");
}

const internalConfig = {
  ...defaultConfig,
  ...(configFileData ? configFileData : {}),
} as typeof defaultConfig;

function writeConfig() {
  const yamlData = yaml.dump(internalConfig);
  fs.writeFileSync(env.CONFIG_FILE, yamlData);
}

// Write any missing defaults to config
writeConfig();

// @ts-expect-error Missing properties will be added shortly
const config: typeof defaultConfig = {};
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
