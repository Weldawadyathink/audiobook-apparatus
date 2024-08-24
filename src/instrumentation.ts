import { refreshAudibleJobSchedule } from "@/server/utils/cron-manager";

export function register() {
  refreshAudibleJobSchedule();
}
