import { i18nMark } from "@lingui/react";
import StatusIcon from "#SRC/js/constants/StatusIcon";
import Node from "#SRC/js/structs/Node";

const build = (
  priority: number,
  icon: StatusIcon,
  displayName: string
): Status => ({ priority, icon, displayName });

const active = build(2, StatusIcon.SUCCESS, i18nMark("Active"));
const deactivated = build(3, StatusIcon.STOPPED, i18nMark("Deactivated"));
const drained = build(5, StatusIcon.STOPPED, i18nMark("Drained"));
const draining = build(4, StatusIcon.LOADING, i18nMark("Draining"));
const unknown = build(1, StatusIcon.ERROR, i18nMark("Unknown"));

const fromNode = (n: Node) => {
  if (!n.isDeactivated()) {
    return active;
  }

  const info = n.getDrainInfo();
  if (info === undefined) {
    return deactivated;
  }

  // FIXME transform to exhaustiveness check
  switch (info.state as "DRAINING" | "DRAINED" | "UNKNOWN") {
    case "DRAINING":
      return draining;
    case "DRAINED":
      return drained;
    case "UNKNOWN":
      return unknown;
  }
  return unknown;
};

export enum StatusAction {
  DRAIN = "drain",
  DEACTIVATE = "deactivate",
  REACTIVATE = "reactivate",
}

export const actionAllowed = (action: StatusAction, status: Status) => {
  switch (action) {
    case StatusAction.DRAIN:
      return status === active;
    case StatusAction.DEACTIVATE:
      return status === active;
    case StatusAction.REACTIVATE:
      return status !== active;
    default:
      return false;
  }
};

export type Status = {
  displayName: string;
  icon: StatusIcon;
  priority: number;
};

export const Status = {
  // The filters to be displayed in the NodesPage.
  // Should not be a concern of this module but feels still better than exporting
  // the statuses.
  filters: {
    active,
    deactivated,
    draining,
    drained,
  },
  fromNode,
};
