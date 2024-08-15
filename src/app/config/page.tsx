"use client";

import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { type DefaultConfigType } from "@/config";
import { useEffect, useState } from "react";

export default function Page() {
  const [config, setConfig] = useState<DefaultConfigType>();
  const serverConfig = api.config.getConfig.useQuery();

  useEffect(() => {
    setConfig(serverConfig.data);
  }, [serverConfig.data]);

  const { refetch: setServerConfig } = api.config.setConfig.useQuery(config!, {
    enabled: false,
  });

  return (
    <>
      {!serverConfig.isSuccess && <LoadingSpinner />}
      {serverConfig.isSuccess &&
        config &&
        Object.entries(config).map(([key, value]) => (
          <span key={key}>
            {key}: {value}
          </span>
        ))}
    </>
  );
}
