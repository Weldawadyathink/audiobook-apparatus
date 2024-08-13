"use client";

import { api } from "@/trpc/react";

export function Test() {
  const q = api.audible.processItem.useQuery("0593398424");
  return <button>Do the thing</button>;
}
