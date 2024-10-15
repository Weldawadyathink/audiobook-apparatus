import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";
import { getConfig } from "../config.ts";
const globalForToad = globalThis;
function getScheduler() {
    if (!globalForToad.scheduler) {
        globalForToad.scheduler = new ToadScheduler();
    }
    return globalForToad.scheduler;
}
function getAudibleTask() {
    if (!globalForToad.audibleTask) {
        globalForToad.audibleTask = new Task("audibleJob", () => console.log("Audible job completed."));
    }
    return globalForToad.audibleTask;
}
function safeRemoveJobById(id) {
    const scheduler = getScheduler();
    try {
        scheduler.removeById(id);
    }
    catch (err) {
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
    scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: newInterval, runImmediately: true }, getAudibleTask(), { id: audibleRefreshJobId, preventOverrun: true }));
    console.log(`Set audible refresh job for ${newInterval} minutes`);
}
