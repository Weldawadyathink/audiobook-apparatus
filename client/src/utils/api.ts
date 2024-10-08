import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/main.ts";

export const api = createTRPCReact<AppRouter>();
