import { QuotaData } from "./Quota";
import { OvercommittedQuotaResource } from "../data/errors/OvercommitQuotaError";

export interface GroupFormData {
  id: string;
  enforceRole: boolean;
  quota: QuotaData;
  [key: string]: unknown;
}

export interface GroupFormErrors {
  id?: JSX.Element | JSX.Element[];
  quota?: {
    cpus?: JSX.Element;
    mem?: JSX.Element;
    disk?: JSX.Element;
    gpus?: JSX.Element;
  };
  form?: JSX.Element[];
}

export interface GroupMutationResponse {
  code: number;
  success: boolean;
  message: string;
  partialSuccess: boolean;
  data?: OvercommittedQuotaResource[];
}
