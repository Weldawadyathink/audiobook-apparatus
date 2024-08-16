"use client";

import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { type configValidator, sparseConfigValidator } from "@/configTypes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type z } from "zod";

export default function Page() {
  const serverConfig = api.config.getConfig.useQuery();
  const [config, setConfig] = useState<z.infer<typeof configValidator>>();

  useEffect(() => {
    setConfig(serverConfig.data);
  }, [serverConfig.data]);

  function setConfigKey(newValue: z.infer<typeof sparseConfigValidator>) {
    setConfig({ ...config, ...newValue } as z.infer<typeof configValidator>);
  }

  const { refetch: sendConfigUpdate } = api.config.setConfig.useQuery(config!, {
    enabled: false,
  });

  function saveConfig() {
    console.log("Sending config update");
    if (sparseConfigValidator.safeParse(config).success) {
      void sendConfigUpdate().then(() => serverConfig.refetch());
    } else {
      console.error("Could not validate config");
    }
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
              value={config.audibleActivationBytes}
              onChange={(e) =>
                setConfigKey({ audibleActivationBytes: e.target.value })
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
              value={config.maxConcurrentDownloads}
              onChange={(e) =>
                setConfigKey({
                  maxConcurrentDownloads: parseInt(e.target.value),
                })
              }
            />
          </div>

          <Button onClick={saveConfig}>Save</Button>
        </>
      )}
    </div>
  );
}
