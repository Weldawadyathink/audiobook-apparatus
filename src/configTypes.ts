import { z } from "zod";

export const configValidator = z.object({
  maxConcurrentDownloads: z
    .number()
    .int({ message: "Must be an integer" })
    .min(1, { message: "Cannot be below 1" }),
  audibleActivationBytes: z.union([z.string(), z.number()]),
});

export const sparseConfigValidator = configValidator.partial();
