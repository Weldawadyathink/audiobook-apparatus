import { refreshAudibleJobSchedule } from "@/server/utils/cron-manager";
import { getConfig, setConfig } from "@/config";

export function register() {
  refreshAudibleJobSchedule();
  setConfig(getConfig());
}
