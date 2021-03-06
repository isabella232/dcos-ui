import { Trans, DateFormat } from "@lingui/macro";
import classNames from "classnames";
import { Link } from "react-router";
import * as React from "react";
import { Tooltip } from "reactjs-components";
import {
  Tooltip as UIKitTooltip,
  designTokens as dt,
  Icon,
  Table,
} from "@dcos/ui-kit";
import { SystemIcons as SI } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import DateUtil from "#SRC/js/utils/DateUtil";
import JobStates from "../constants/JobStates";
import JobStatus from "../constants/JobStatus";
import Units from "#SRC/js/utils/Units";

const JobsCronTooltip = React.lazy(
  () =>
    import(
      /* webpackChunkName: "JobsCronTooltip" */ "#SRC/js/components/JobsCronTooltip"
    )
);

type Item = {
  id: string;
  dependencies: Array<{ id: string }>;
  isGroup: boolean;
  name: string;
  schedules: unknown;
  status: unknown;
  lastRun: unknown;
};

const withGroupAlwaysOnTop = (sort) => (_, dir) => (a, b) =>
  a.isGroup !== b.isGroup ? b.isGroup - a.isGroup : sort(a, b) * dir;
const sortName = (a, b) => a.name?.localeCompare(b.name);
const sortStatus = (a, b) =>
  JobStates[a.status].sortOrder - JobStates[b.status].sortOrder;
const sortLastRun = (a, b) =>
  JobStatus[a.lastRun.status]?.sortOrder -
  JobStatus[b.lastRun.status]?.sortOrder;
const sortCPUs = (a, b) => a.cpus - b.cpus;
const sortMem = (a, b) => a.mem - b.mem;
const sortDisk = (a, b) => a.disk - b.disk;
const sortGPUs = (a, b) => a.gpus - b.gpus;
const toId = (el) => el.id + el.isGroup;

export default class JobsOverviewTable extends React.Component<{
  data: { nodes: unknown; path: string };
}> {
  render() {
    return (
      <Table
        data={getData(this.props.data)}
        toId={toId}
        initialSorter={{ by: "name" }}
        columns={[
          {
            id: "name",
            header: <Trans id="Name" />,
            initialWidth: "3fr",
            render: renderName,
            sorter: withGroupAlwaysOnTop(sortName),
          },
          {
            id: "cpus",
            header: <Trans id="CPUs" />,
            render: renderCPUs,
            sorter: withGroupAlwaysOnTop(sortCPUs),
          },
          {
            id: "mem",
            header: <Trans id="Mem" />,
            render: renderMem,
            sorter: withGroupAlwaysOnTop(sortMem),
          },
          {
            id: "disk",
            header: <Trans id="Disk" />,
            render: renderDisk,
            sorter: withGroupAlwaysOnTop(sortDisk),
          },
          {
            id: "gpus",
            header: <Trans id="GPUs" />,
            render: renderGPUs,
            sorter: withGroupAlwaysOnTop(sortGPUs),
          },
          {
            id: "status",
            header: <Trans id="Status" />,
            render: renderStatus,
            sorter: withGroupAlwaysOnTop(sortStatus),
          },
          {
            id: "lastRun",
            header: <Trans id="Last Run" />,
            render: renderLastRunStatus,
            sorter: withGroupAlwaysOnTop(sortLastRun),
          },
        ]}
      />
    );
  }
}

/**
 * converts data from Job to table format.
 */

const getData = ({ nodes, path }): Item[] =>
  Object.values(
    nodes.reduce((acc, job) => {
      if (job.path.length < path.length) {
        return acc;
      }

      /*
       * we can find out if current job is nested in another path by
       * comparing the job.path array with our given path
       *
       * we know already, that all jobs are in our given path -
       * no need to check for something like bar.bar.baz when path is "foo.bar"
       *
       * Example:
       * job.path = "foo.bar.baz";
       * path = "foo.bar";
       * => isGroup should be true, because there is "baz" as extra path below our prefix
       */
      const isGroup = job.path.slice(path.length).length > 0;
      const name = isGroup ? job.path.slice(path.length)[0] : job.name;
      // now we need to extract this "baz" part from above and save it as name
      // and build up "next-level-link" (the `id` variable is named incorrectly to cut the refactoring)
      const id = isGroup ? path.concat([name]).join(".") : job.id;

      // to avoid duplicates in our listing, we need to hack this… (again, this whole thing needs refactoring…)
      // we're getting an array back with the wrapping Object.values(…)
      if (!isGroup || acc[`path:${id}`] === undefined) {
        acc[isGroup ? `path:${id}` : `job:${id}`] = {
          id,
          isGroup,
          name,
          cpus: isGroup ? null : job.cpus,
          mem: isGroup ? null : job.mem,
          dependencies: isGroup ? [] : job.dependencies || [],
          disk: isGroup ? null : job.disk,
          gpus: isGroup ? null : job.gpus,
          schedules: isGroup ? null : job.schedules,
          status: isGroup ? null : job.scheduleStatus,
          lastRun: isGroup
            ? {}
            : {
                status: job.lastRunStatus.status,
                lastSuccessAt: job.lastRunsSummary.lastSuccessAt,
                lastFailureAt: job.lastRunsSummary.lastFailureAt,
              },
        };
      }

      return acc;
    }, {})
  );

const depIcon = (
  <Icon color={dt.greyDark} shape={SI.EllipsisVertical} size={dt.iconSizeXs} />
);
const pageIcon = (
  <Icon color={dt.greyDark} shape={SI.PageDocument} size={dt.iconSizeXs} />
);
const folderIcon = (
  <Icon color={dt.greyDark} shape={SI.Folder} size={dt.iconSizeXs} />
);
const repeatIcon = (
  <Icon color={dt.textColorSecondary} shape={SI.Repeat} size={dt.iconSizeXs} />
);

const renderCPUs = (e) => !e.isGroup && Units.formatResource("cpus", e.cpus);
const renderGPUs = (e) => !e.isGroup && Units.formatResource("gpus", e.gpus);
const renderMem = (e) => !e.isGroup && Units.formatResource("mem", e.mem);
const renderDisk = (e) => !e.isGroup && Units.formatResource("disk", e.disk);

const renderName = ({ dependencies, id, isGroup, name, schedules }) => {
  const url = isGroup
    ? `/jobs/overview/${encodeURIComponent(id)}`
    : `/jobs/detail/${encodeURIComponent(id)}`;

  const icon = isGroup ? folderIcon : pageIcon;
  const schedule = schedules?.nodes?.[0];
  return (
    <Link to={url}>
      <span className="icon-margin-right">{icon}</span>
      <span className="text-overflow">{name}</span>
      {schedule?.enabled ? (
        <span className="icon-margin-left">
          <React.Suspense fallback={repeatIcon}>
            <JobsCronTooltip content={schedule?.cron} />
          </React.Suspense>
        </span>
      ) : null}
      {dependencies.length ? (
        <div style={{ display: "inline-block", paddingLeft: ".5em" }}>
          <UIKitTooltip id="dependencies-tt" trigger={depIcon}>
            {dependencies.map((d) => (
              <div key={id}>{d.id}</div>
            ))}
          </UIKitTooltip>
        </div>
      ) : null}
    </Link>
  );
};

const renderStatus = ({ isGroup, status }) => {
  if (isGroup) {
    return null;
  }

  const { displayName, stateTypes } = JobStates[status];
  return (
    <Trans
      render="span"
      className={classNames({
        "text-success": stateTypes.includes("success"),
        "text-danger": stateTypes.includes("failure"),
      })}
      id={displayName}
    />
  );
};

const renderLastRunStatus = ({ lastRun }) => {
  const { lastFailureAt, lastSuccessAt, status } = lastRun;
  const statusClasses = classNames({
    "text-success": status === "Success",
    "text-danger": status === "Failed",
  });
  const nodes: React.ReactNode[] = [];
  const statusNode = <span className={statusClasses}>{status}</span>;

  if (
    !DateUtil.isValidDate(lastFailureAt) ||
    !DateUtil.isValidDate(lastSuccessAt)
  ) {
    return statusNode;
  }

  if (lastSuccessAt != null) {
    nodes.push(
      <p className="flush-bottom" key="tooltip-success-at">
        <Trans render="span" className="text-success">
          Last Success:
        </Trans>{" "}
        <DateFormat
          value={new Date(lastSuccessAt)}
          format={DateUtil.getFormatOptions()}
        />
      </p>
    );
  }

  if (lastFailureAt != null) {
    nodes.push(
      <p className="flush-bottom" key="tooltip-failure-at">
        <Trans render="span" className="text-danger">
          Last Failure:
        </Trans>{" "}
        <DateFormat
          value={new Date(lastFailureAt)}
          format={DateUtil.getFormatOptions()}
        />
      </p>
    );
  }

  return (
    <Tooltip wrapperClassName="tooltip-wrapper" content={nodes}>
      {statusNode}
    </Tooltip>
  );
};
