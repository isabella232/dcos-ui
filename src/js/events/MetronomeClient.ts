import { request, RequestResponse } from "@dcos/http-service";
import { Observable, throwError } from "rxjs";
import Config from "../config/Config";
import {
  JobSchedule,
  JobAPIOutput,
  ConcurrentPolicy,
} from "plugins/jobs/src/js/components/form/helpers/JobFormData";
import { switchMap, catchError } from "rxjs/operators";
// Add interface information: https://jira.mesosphere.com/browse/DCOS-37725

export interface GenericJobResponse {
  id: string;
  labels: Record<string, string>;
  activeRuns?: ActiveJobRun[];
  dependencies?: Array<{ id: string }>;
  run: {
    cpus: number;
    mem: number;
    disk: number;
    cmd: string;
    env: { [key: string]: string };
    placement: {
      constraints: any[];
    };
    artifacts: any[];
    maxLaunchDelay: number;
    volumes: any[];
    restart: {
      policy: string;
    };
    docker?: JobDocker;
    ucr?: JobUCR;
    secrets: object;
  };
  schedules: Schedule[];
}

interface JobUCR {
  image: {
    id: string;
    kind?: string;
    forcePull?: boolean;
  };
  privileged?: boolean;
}

export interface JobResponse extends GenericJobResponse {
  historySummary: JobHistorySummary;
  _itemData?: any;
}

export interface JobDetailResponse extends GenericJobResponse {
  description: string;
  activeRuns: ActiveJobRun[];
  history: JobHistory;
}

export interface JobDocker {
  secrets: object;
  forcePullImage: boolean;
  image: string;
}

export interface Schedule {
  concurrencyPolicy: ConcurrentPolicy;
  cron: string;
  enabled: boolean;
  id: string;
  nextRunAt: string;
  startingDeadlineSeconds: number;
  timezone: string;
}

type JobStatus =
  | "ACTIVE"
  | "FAILED"
  | "INITIAL"
  | "RUNNING"
  | "STARTING"
  | "COMPLETED";

export interface ActiveJobRun {
  completedAt?: string | null;
  createdAt: string;
  id: string;
  jobId: string;
  status: JobStatus;
  tasks: JobRunTask[];
}

export interface JobRunTask {
  id: string;
  createdAt: string;
  finishedAt: string | null;
  status: JobTaskStatus;
}

export type JobTaskStatus =
  | "TASK_CREATED"
  | "TASK_DROPPED"
  | "TASK_ERROR"
  | "TASK_FAILED"
  | "TASK_FINISHED"
  | "TASK_GONE"
  | "TASK_GONE_BY_OPERATOR"
  | "TASK_KILLED"
  | "TASK_KILLING"
  | "TASK_LOST"
  | "TASK_RUNNING"
  | "TASK_STAGING"
  | "TASK_STARTED"
  | "TASK_STARTING"
  | "TASK_UNKNOWN"
  | "TASK_UNREACHABLE";

export interface JobHistorySummary {
  successCount: number;
  failureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
}

interface JobHistory extends JobHistorySummary {
  successfulFinishedRuns: HistoricJobRun[];
  failedFinishedRuns: HistoricJobRun[];
}

export interface HistoricJobRun {
  id: string;
  createdAt: string;
  finishedAt: string;
  tasks?: string[];
}

export interface JobData {
  id: string;
}

export function isDetailResponse(
  response: GenericJobResponse
): response is JobDetailResponse {
  return (response as JobDetailResponse).history !== undefined;
}

const defaultHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

export function createJob(
  data: JobAPIOutput
): Observable<RequestResponse<JobDetailResponse>> {
  const jobRequest = request(`${Config.metronomeAPI}/v1/jobs`, {
    method: "POST",
    body: JSON.stringify(data.job),
    headers: defaultHeaders,
  });
  return data.schedule
    ? jobRequest.pipe(
        switchMap(() =>
          createSchedule(data.job.id, data.schedule as JobSchedule)
        )
      )
    : (jobRequest as Observable<RequestResponse<JobDetailResponse>>);
}

export function fetchJobs(): Observable<RequestResponse<JobResponse[]>> {
  return request(
    `${Config.metronomeAPI}/v1/jobs?embed=activeRuns&embed=schedules&embed=historySummary`
  );
}

export function fetchJobDetail(
  jobID: string
): Observable<RequestResponse<JobDetailResponse>> {
  return request(
    `${Config.metronomeAPI}/v1/jobs/${jobID}?embed=activeRuns&embed=history&embed=schedules`
  );
}

export function deleteJob(
  jobID: string,
  stopCurrentJobRuns = false
): Observable<RequestResponse<any>> {
  return request(
    `${Config.metronomeAPI}/v1/jobs/${jobID}?stopCurrentJobRuns=${stopCurrentJobRuns}`,
    { method: "DELETE", headers: defaultHeaders }
  );
}

export function updateJob(
  jobID: string,
  data: JobAPIOutput,
  existingSchedule: boolean = true
): Observable<RequestResponse<JobDetailResponse>> {
  const updateJobRequest = request<JobDetailResponse>(
    `${Config.metronomeAPI}/v1/jobs/${jobID}`,
    {
      method: "PUT",
      body: JSON.stringify(data.job),
      headers: defaultHeaders,
    }
  );
  const scheduleRequest = () =>
    existingSchedule
      ? updateSchedule(jobID, data.schedule as JobSchedule)
      : createSchedule(jobID, data.schedule as JobSchedule);

  return data.schedule
    ? updateJobRequest.pipe(switchMap(() => scheduleRequest()))
    : updateJobRequest;
}

export function runJob(jobID: string): Observable<RequestResponse<any>> {
  return request(
    `${Config.metronomeAPI}/v1/jobs/${jobID}/runs?embed=activeRuns&embed=history&embed=schedules`,
    {
      headers: defaultHeaders,
      method: "POST",
      body: "{}",
    }
  );
}

export function stopJobRun(
  jobID: string,
  jobRunID: string
): Observable<RequestResponse<any>> {
  return request(
    `${Config.metronomeAPI}/v1/jobs/${jobID}/runs/${jobRunID}/actions/stop`,
    { headers: defaultHeaders, method: "POST", body: "{}" }
  );
}

export function updateSchedule(
  jobID: string,
  schedule: JobSchedule
): Observable<RequestResponse<any>> {
  return request(
    `${Config.metronomeAPI}/v1/jobs/${jobID}/schedules/${schedule.id}`,
    { method: "PUT", headers: defaultHeaders, body: JSON.stringify(schedule) }
  ).pipe(catchError((e) => throwError({ ...e, type: "SCHEDULE" })));
}

export function createSchedule(jobID: string, schedule: JobSchedule) {
  return request<JobDetailResponse>(
    `${Config.metronomeAPI}/v1/jobs/${jobID}/schedules`,
    {
      method: "POST",
      body: JSON.stringify(schedule),
      headers: defaultHeaders,
    }
  ).pipe(catchError((e) => throwError({ ...e, type: "SCHEDULE" })));
}
