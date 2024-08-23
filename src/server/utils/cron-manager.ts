import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";
import { getConfig } from "@/config";

declare global {
  // eslint-disable-next-line no-var
  var scheduler: ToadScheduler | undefined;
  // eslint-disable-next-line no-var
  var audibleTask: Task | undefined;
}

function getScheduler() {
  if (!globalThis.scheduler) {
    globalThis.scheduler = new ToadScheduler();
  }
  return globalThis.scheduler;
}

function getAudibleTask() {
  if (!globalThis.audibleTask) {
    globalThis.audibleTask = new Task("audibleJob", () =>
      console.log("Audible job completed."),
    );
  }
  return globalThis.audibleTask;
}

function safeRemoveJobById(id: string) {
  const scheduler = getScheduler();
  try {
    scheduler.removeById(id);
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }
    if (err.message != `Job with an id ${id} is not registered.`) {
      throw err;
    }
  }
}

export function refreshAudibleJobSchedule() {
  const newInterval = getConfig().audibleRefreshInterval.value;
  const audibleRefreshJobId = "audibleRefreshJobId";
  safeRemoveJobById(audibleRefreshJobId);
  const scheduler = getScheduler();
  scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      // TODO: switch seconds to minutes
      { seconds: newInterval, runImmediately: true },
      getAudibleTask(),
      { id: audibleRefreshJobId, preventOverrun: true },
    ),
  );
  console.log(`Set audible refresh job for ${newInterval} minutes`);
}
