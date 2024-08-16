"use client";

import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { type configObjectValidator } from "@/config";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type z } from "zod";

export default function Page() {
  const serverConfig = api.config.getConfig.useQuery();
  const [config, setConfig] = useState<z.infer<typeof configObjectValidator>>();

  useEffect(() => {
    setConfig(serverConfig.data);
  }, [serverConfig.data]);

  function setConfigKey(
    key: keyof z.infer<typeof configObjectValidator>,
    value: unknown,
  ) {
    const temp = structuredClone(config)!;
    // @ts-expect-error Types are verified with trpc, so ignore them here
    temp[key].value = value;
    setConfig(temp);
  }

  const { refetch: sendConfigUpdate } = api.config.setConfig.useQuery(config!, {
    enabled: false,
  });

  function saveConfig() {
    console.log("Sending config update");
    void sendConfigUpdate()
      .then(() => serverConfig.refetch())
      .catch(console.error);
  }

  return (
    <div className="flex flex-col">
      {!serverConfig.isSuccess && <LoadingSpinner />}
      {serverConfig.isSuccess && config && (
        <>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="audibleActivationBytes">
              Audible Activation Bytes
            </Label>
            <Input
              className="text-black"
              type="text"
              id="audibleActivationBytes"
              value={config.audibleActivationBytes.value}
              onChange={(e) =>
                setConfigKey("audibleActivationBytes", e.target.value)
              }
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="maxConcurrentDownloads">
              Max Concurrent Downloads
            </Label>
            <Input
              className="text-black"
              type="number"
              id="maxConcurrentDownloads"
              value={config.maxConcurrentDownloads.value}
              onChange={(e) =>
                setConfigKey("maxConcurrentDownloads", e.target.value)
              }
            />
          </div>

          <Button onClick={saveConfig}>Save</Button>
        </>
      )}
    </div>
  );
}
