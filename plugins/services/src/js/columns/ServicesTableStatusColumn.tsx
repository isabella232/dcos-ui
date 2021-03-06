import * as React from "react";
import { Plural, Trans } from "@lingui/macro";
import { TextCell } from "@dcos/ui-kit";

import ServiceStatusProgressBar from "#PLUGINS/services/src/js/components/ServiceStatusProgressBar";
import * as ServiceStatus from "../constants/ServiceStatus";
import ServiceStatusIcon from "../components/ServiceStatusIcon";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

function statusCountsToTooltipContent(counts: {
  total: number;
  status: Record<ServiceStatus.StatusCategory, number>;
}): JSX.Element[] {
  return Object.keys(counts.status)
    .filter((value) => value in ServiceStatus.StatusCategory)
    .sort(statusCategorySorter)
    .map((value, index) => {
      const category = value as ServiceStatus.StatusCategory;
      return (
        <div key={`status.${index}`}>
          {counts.status[category]}{" "}
          <Trans id={ServiceStatus.toCategoryLabel(category)} />
        </div>
      );
    });
}

export function statusRenderer(node: Service | ServiceTree): React.ReactNode {
  return node instanceof ServiceTree
    ? renderServiceTree(node)
    : renderService(node);
}

function renderService(service: Service | Pod): React.ReactNode {
  const status = service.getStatus();
  if (isNA(status)) {
    return null;
  }
  const instancesCount = service.getInstancesCount();

  return (
    <TextCell>
      <div className="flex">
        <div className="service-status-icon-wrapper">
          <ServiceStatusIcon
            service={service}
            showTooltip={true}
            tooltipContent={
              <Plural
                value={service.getRunningInstancesCount()}
                one={`# instance running out of ${instancesCount}`}
                other={`# instances running out of ${instancesCount}`}
              />
            }
          />
          <Trans id={status} render="span" className="status-bar-text" />
        </div>
        <div className="service-status-progressbar-wrapper">
          <ServiceStatusProgressBar service={service} />
        </div>
      </div>
    </TextCell>
  );
}

function renderServiceTree(service: ServiceTree): React.ReactNode {
  const summary = service.getServiceTreeStatusSummary();
  const statusText = ServiceStatus.toCategoryLabel(summary.status);
  if (isNA(statusText)) {
    return null;
  }
  const totalCount = summary.counts.total;
  const priorityStatusCount = summary.counts.status[summary.status];
  return (
    <TextCell>
      <div className="service-status-icon-wrapper">
        <ServiceStatusIcon
          service={service}
          showTooltip={true}
          tooltipContent={
            <span>{statusCountsToTooltipContent(summary.counts)}</span>
          }
        />
        <span className="status-bar-text">
          <Trans id={statusText} />{" "}
          {totalCount > 1 ? (
            <Trans>
              ({priorityStatusCount} of {totalCount})
            </Trans>
          ) : null}
        </span>
      </div>
    </TextCell>
  );
}

const isNA = (status: string) =>
  status === null || status === ServiceStatus.NA.displayName;

export function statusCategorySorter(a: string, b: string): number {
  return (
    ServiceStatus.toCategoryPriority(b as ServiceStatus.StatusCategory) -
    ServiceStatus.toCategoryPriority(a as ServiceStatus.StatusCategory)
  );
}
