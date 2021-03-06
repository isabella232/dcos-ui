import { Hooks } from "#SRC/js/plugin-bridge/PluginSDK";
import {
  deepCopy,
  findNestedPropertyInObject,
  filterEmptyValues,
} from "#SRC/js/utils/Util";

import {
  Container,
  DockerParameter,
  FormOutput,
  JobOutput,
  JobSpec,
  PlacementConstraint,
} from "./JobFormData";
import { schedulePropertiesCanBeDiscarded } from "./ScheduleUtil";
import { isArray } from "util";

function isPresent(value: any) {
  return value != null && value !== "";
}

// Array<[string, T]> => Record<string, T>
const zipObject = <T>(list: Array<[string, T]>): Record<string, T> =>
  list.reduce<Record<string, T>>((acc, [k, v]) => ({ ...acc, [k]: v }), {});

export function jobSpecToOutputParser(jobSpec: JobSpec): JobOutput {
  const jobSpecCopy = deepCopy(jobSpec);
  if (jobSpecCopy.job && jobSpecCopy.job.run) {
    if (jobSpecCopy.job.run.gpus === "") {
      delete jobSpecCopy.job.run.gpus;
    }
    if (jobSpecCopy.cmdOnly) {
      delete jobSpecCopy.job.run.docker;
      delete jobSpecCopy.job.run.ucr;
      delete jobSpecCopy.job.run.args;
    } else if (jobSpecCopy.container) {
      if (jobSpecCopy.job.run.cmd === "") {
        // You are allowed to run a job with a container and no command, but
        // the API will return an error if `cmd` is in the object but does not have
        // a minimum length of one.
        delete jobSpecCopy.job.run.cmd;
      }
      const container = jobSpecCopy.job.run[jobSpecCopy.container];
      delete jobSpecCopy.job.run.docker;
      delete jobSpecCopy.job.run.ucr;
      jobSpecCopy.job.run[jobSpecCopy.container] = container;
      if (jobSpecCopy.container !== Container.UCR) {
        delete jobSpecCopy.job.run.gpus;
      }
      if (jobSpecCopy.container !== Container.Docker) {
        delete jobSpecCopy.job.run.args;
      }
      if (jobSpecCopy.container === Container.Docker) {
        if (jobSpecCopy.job.run.docker.parameters) {
          const filteredParams = Array.isArray(
            jobSpecCopy.job.run.docker.parameters
          )
            ? jobSpecCopy.job.run.docker.parameters.filter(
                (param: DockerParameter) => param.key || param.value
              )
            : [];
          if (filteredParams.length) {
            jobSpecCopy.job.run.docker.parameters = filteredParams;
          } else {
            delete jobSpecCopy.job.run.docker.parameters;
          }
        }
        if (jobSpecCopy.job.run.args) {
          const filteredArgs = Array.isArray(jobSpecCopy.job.run.args)
            ? jobSpecCopy.job.run.args.filter((arg: string) => !!arg)
            : [];
          if (filteredArgs.length) {
            jobSpecCopy.job.run.args = filteredArgs;
          } else {
            delete jobSpecCopy.job.run.args;
          }
        }
      }
    }

    // VOLUMES

    const { volumes } = jobSpecCopy.job.run;
    if (volumes && Array.isArray(volumes)) {
      jobSpecCopy.job.run.volumes = volumes.filter(
        ({ hostPath, containerPath, mode }) => hostPath || containerPath || mode
      );
      if (!jobSpecCopy.job.run.volumes.length) {
        delete jobSpecCopy.job.run.volumes;
      }
    }

    // PLACEMENT
    if (
      jobSpecCopy.job.run.placement &&
      jobSpecCopy.job.run.placement.constraints &&
      isArray(jobSpecCopy.job.run.placement.constraints)
    ) {
      jobSpecCopy.job.run.placement.constraints = (jobSpecCopy.job.run.placement
        .constraints as PlacementConstraint[])
        .filter(
          ({ operator, attribute, value }) =>
            isPresent(operator) || isPresent(attribute) || isPresent(value)
        )
        .map(({ operator, attribute, value }) => ({
          operator,
          attribute,
          value,
        }));
      if (!jobSpecCopy.job.run.placement.constraints.length) {
        delete jobSpecCopy.job.run.placement;
      }
    }

    // RUN CONFIG
    const { artifacts } = jobSpecCopy.job.run;
    jobSpecCopy.job.run.artifacts = Array.isArray(artifacts)
      ? artifacts.filter((a) => a.uri || a.extract || a.executable || a.cache)
      : artifacts;

    try {
      // filter out empty keys ("")
      const labels = zipObject((jobSpec.job.labels || []).filter(([k]) => k));

      // don't show labels in JSON-editor unless we actually have key-value-pairs
      jobSpecCopy.job.labels =
        Object.keys(labels).length > 0 ? labels : undefined;
    } catch {
      // someone entered invalid stuff in the JSON editor
    }

    // ENVIRONMENT
    try {
      // filter out empty keys ("")
      const env = zipObject((jobSpec.job.run.env || []).filter(([k]) => k));
      // don't show labels in JSON-editor unless we actually have key-value-pairs
      jobSpecCopy.job.run.env = Object.keys(env).length > 0 ? env : undefined;
    } catch {
      // someone entered invalid stuff in the JSON editor
    }
  }

  if (
    jobSpecCopy.job.schedules &&
    Array.isArray(jobSpecCopy.job.schedules) &&
    jobSpecCopy.job.schedules.length
  ) {
    const schedule = jobSpecCopy.job.schedules[0];
    if (schedule && schedule.startingDeadlineSeconds === "") {
      delete schedule.startingDeadlineSeconds;
    }
    if (schedule) {
      const filteredSchedule = filterEmptyValues(schedule);
      if (
        !Object.keys(filteredSchedule).length ||
        schedulePropertiesCanBeDiscarded(filteredSchedule)
      ) {
        delete jobSpecCopy.job.schedules;
      }
    }
  }

  const jobOutput = jobSpecCopy.job;

  return Hooks.applyFilter("jobSpecToOutputParser", jobOutput);
}

export const jobSpecToFormOutputParser = (jobSpec: JobSpec): FormOutput => {
  const container = jobSpec.container;
  const run = jobSpec.job.run;

  const containerImage =
    container === Container.UCR
      ? findNestedPropertyInObject(jobSpec, "job.run.ucr.image.id")
      : findNestedPropertyInObject(jobSpec, "job.run.docker.image");
  const dockerParameters =
    run.docker &&
    Array.isArray(run.docker.parameters) &&
    run.docker.parameters.length > 0
      ? run.docker.parameters
      : [];
  const args = Array.isArray(run.args) && run.args.length > 0 ? run.args : [];
  const imageForcePull =
    container === Container.UCR
      ? findNestedPropertyInObject(jobSpec, "job.run.ucr.image.forcePull")
      : findNestedPropertyInObject(jobSpec, "job.run.docker.forcePullImage");
  const grantRuntimePrivileges =
    container === Container.Docker &&
    findNestedPropertyInObject(jobSpec, "job.run.docker.privileged");
  const constraints = findNestedPropertyInObject(
    jobSpec,
    "job.run.placement.constraints"
  );
  const placementConstraints =
    constraints && Array.isArray(constraints) ? constraints : [];
  const schedules = findNestedPropertyInObject(jobSpec, "job.schedules");
  let schedule = {};
  if (schedules && Array.isArray(schedules) && schedules.length) {
    schedule = schedules[0];
  }

  return {
    dependencies: jobSpec.job.dependencies,
    jobId: jobSpec.job.id,
    description: jobSpec.job.description,
    cmdOnly: jobSpec.cmdOnly,
    container,
    cmd: run.cmd,
    containerImage,
    imageForcePull,
    grantRuntimePrivileges,
    env: run.env || [],
    cpus: run.cpus,
    gpus: run.gpus,
    mem: run.mem,
    disk: run.disk,
    dockerParams: dockerParameters,
    maxLaunchDelay: run.maxLaunchDelay,
    killGracePeriod: run.taskKillGracePeriodSeconds,
    user: run.user,
    restartPolicy: findNestedPropertyInObject(run, "restart.policy"),
    retryTime: findNestedPropertyInObject(run, "restart.activeDeadlineSeconds"),
    labels: jobSpec.job.labels,
    artifacts: run.artifacts,
    args,
    scheduleId: findNestedPropertyInObject(schedule, "id"),
    cronSchedule: findNestedPropertyInObject(schedule, "cron"),
    scheduleEnabled: findNestedPropertyInObject(schedule, "enabled"),
    timezone: findNestedPropertyInObject(schedule, "timezone"),
    startingDeadline: findNestedPropertyInObject(
      schedule,
      "startingDeadlineSeconds"
    ),
    volumes: findNestedPropertyInObject(jobSpec, "job.run.volumes") || [],
    placementConstraints,
    concurrencyPolicy: findNestedPropertyInObject(
      schedule,
      "concurrencyPolicy"
    ),
  };
};

export const removeBlankProperties = (jobSpec: JobOutput): JobOutput => {
  const jobSpecCopy = deepCopy(jobSpec);
  const job = filterEmptyValues(jobSpecCopy);
  job.run = filterEmptyValues(job.run);
  const schedules = job.schedules;
  let schedule;
  if (schedules && Array.isArray(schedules) && schedules.length) {
    schedule = schedules[0];
  }
  if (schedule) {
    const filteredSchedule = filterEmptyValues(schedule);
    schedule = Object.keys(filteredSchedule).length
      ? filteredSchedule
      : undefined;
  }
  if (!schedule) {
    delete job.schedules;
  }
  return job;
};
