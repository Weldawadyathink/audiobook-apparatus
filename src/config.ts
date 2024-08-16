import fs from "node:fs";
import yaml from "js-yaml";
import { env } from "@/env";
import { z } from "zod";

const yamlFile = z.preprocess(
  (input) => input || {},
  z.record(z.string(), z.unknown()).default({}),
);

// All options should fall back to defaults if parsing fails, so overall parse never fails
export const configObjectValidator = z.object({
  audibleActivationBytes: z.preprocess(
    (input) => input || {},
    z.object({
      userFacingName: z.preprocess(
        () => "Audible Activation Bytes",
        z.string(),
      ),
      value: z.string().default("1A2B3C4D"),
    }),
  ),

  maxConcurrentDownloads: z.preprocess(
    (input) => input || {},
    z.object({
      userFacingName: z.preprocess(
        () => "Max Concurrent Downloads",
        z.string(),
      ),
      value: z.coerce.number().int().min(1).default(5),
    }),
  ),
});

export function getConfig() {
  const configFileData = {};
  try {
    const tempConfig = yaml.load(fs.readFileSync(env.CONFIG_FILE, "utf8"));
    const parsedConfig = yamlFile.parse(tempConfig);
    for (const [key, value] of Object.entries(parsedConfig)) {
      // @ts-expect-error These keys are fine
      configFileData[key] = { value: value };
    }
  } catch (e) {
    console.log("Failed to load config file");
  }

  return configObjectValidator.readonly().parse(configFileData);
}

export function setConfig(config: z.infer<typeof configObjectValidator>) {
  const parsedConfig = configObjectValidator.parse(config);
  const remappedConfig = {};
  for (const [key, value] of Object.entries(parsedConfig)) {
    // @ts-expect-error These keys are fine
    remappedConfig[key] = value.value;
  }
  const yamlData = yaml.dump(remappedConfig);
  fs.writeFileSync(env.CONFIG_FILE, yamlData);
}
