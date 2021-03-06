import { Trans, DateFormat } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import * as React from "react";
import { Table } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import Units from "#SRC/js/utils/Units";
import DateUtil from "#SRC/js/utils/DateUtil";

import ContainerConstants from "../constants/ContainerConstants";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";
import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue,
} from "../utils/ServiceConfigDisplayUtil";

const {
  type: { DOCKER, MESOS },
  labelMap,
} = ContainerConstants;

class ServiceGeneralConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem(row) {
    const { appConfig } = this.props;

    switch (row.key) {
      case "resourceLimits.cpus":
        return !findNestedPropertyInObject(appConfig, "resourceLimits.cpus");
      case "resourceLimits.mem":
        return !findNestedPropertyInObject(appConfig, "resourceLimits.mem");
      case "fetch":
        return !findNestedPropertyInObject(appConfig, "fetch.length");
      case "gpus":
        return !findNestedPropertyInObject(appConfig, "gpus");
      case "backoffSeconds":
        return !findNestedPropertyInObject(appConfig, "backoffSeconds");
      case "backoffFactor":
        return !findNestedPropertyInObject(appConfig, "backoffFactor");
      case "maxLaunchDelaySeconds":
        return !findNestedPropertyInObject(appConfig, "maxLaunchDelaySeconds");
      case "minHealthOpacity":
        return !findNestedPropertyInObject(appConfig, "minHealthOpacity");
      case "maxOverCapacity":
        return !findNestedPropertyInObject(appConfig, "maxOverCapacity");
      case "acceptedResourceRoles":
        return !findNestedPropertyInObject(
          appConfig,
          "acceptedResourceRoles.length"
        );
      case "dependencies":
        return !findNestedPropertyInObject(appConfig, "dependencies.length");
      case "executor":
        return !findNestedPropertyInObject(appConfig, "executor");
      case "user":
        return !findNestedPropertyInObject(appConfig, "user");
      case "args":
        return !findNestedPropertyInObject(appConfig, "args.length");
      case "version":
        return !findNestedPropertyInObject(appConfig, "version");
      default:
        return false;
    }
  }

  /**
   * @override
   */
  getMountType() {
    return "CreateService:ServiceConfigDisplay:App:General";
  }
  /**
   * @override
   */
  getDefinition() {
    const { onEditClick } = this.props;

    return {
      tabViewID: "services",
      values: [
        {
          heading: <Trans render="span">Service</Trans>,
          headingLevel: 1,
        },
        {
          key: "id",
          label: <Trans render="span">Service ID</Trans>,
        },
        {
          heading: <Trans render="span">Resources</Trans>,
          headingLevel: 2,
        },
        {
          key: "cpus",
          label: <Trans render="span">CPU</Trans>,
        },
        {
          key: "resourceLimits.cpus",
          label: <Trans render="span">CPU Limit</Trans>,
        },
        {
          key: "mem",
          label: <Trans render="span">Memory</Trans>,
          transformValue(value) {
            if (value == null) {
              return value;
            }

            return Units.formatResource("mem", value);
          },
        },
        {
          key: "resourceLimits.mem",
          label: <Trans render="span">Memory Limit</Trans>,
          transformValue(value) {
            if (value == null || value === "unlimited") {
              return value;
            }

            return Units.formatResource("mem", value);
          },
        },
        {
          heading: <Trans render="span">General</Trans>,
          headingLevel: 2,
        },
        {
          key: "instances",
          label: <Trans render="span">Instances</Trans>,
        },
        {
          key: "container.type",
          label: <Trans render="span">Container Runtime</Trans>,
          transformValue(runtime) {
            const transId = labelMap[runtime] || labelMap[MESOS];

            return <Trans render="span" id={transId} />;
          },
        },
        {
          key: "disk",
          label: <Trans render="span">Disk</Trans>,
          transformValue(value) {
            if (value == null) {
              return value;
            }

            return Units.formatResource("disk", value);
          },
        },
        {
          key: "gpus",
          label: <Trans render="span">GPU</Trans>,
        },
        {
          key: "backoffSeconds",
          label: <Trans render="span">Backoff Seconds</Trans>,
        },
        {
          key: "backoffFactor",
          label: <Trans render="span">Backoff Factor</Trans>,
        },
        {
          key: "maxLaunchDelaySeconds",
          label: <Trans render="span">Backoff Max Launch Delay</Trans>,
        },
        {
          key: "minHealthOpacity",
          label: <Trans render="span">Upgrade Min Health Capacity</Trans>,
        },
        {
          key: "maxOverCapacity",
          label: <Trans render="span">Upgrade Max Overcapacity</Trans>,
        },
        {
          key: "container.docker.image",
          label: <Trans render="span">Container Image</Trans>,
          transformValue(value, appConfig) {
            const runtime = findNestedPropertyInObject(
              appConfig,
              "container.type"
            );

            // Disabled for MESOS
            return getDisplayValue(value, runtime == null || runtime === MESOS);
          },
        },
        {
          key: "container.docker.privileged",
          label: <Trans render="span">Extended Runtime Priv.</Trans>,
          transformValue(value, appConfig) {
            const runtime = findNestedPropertyInObject(
              appConfig,
              "container.type"
            );
            // Disabled for DOCKER
            if (runtime !== DOCKER && value == null) {
              return getDisplayValue(null, true);
            }

            // Cast boolean as a string.
            return String(Boolean(value));
          },
        },
        {
          key: "container.docker.forcePullImage",
          label: <Trans render="span">Force Pull on Launch</Trans>,
          transformValue(value, appConfig) {
            const runtime = findNestedPropertyInObject(
              appConfig,
              "container.type"
            );
            // Disabled for DOCKER
            if (runtime !== DOCKER && value == null) {
              return getDisplayValue(null, true);
            }

            // Cast boolean as a string.
            return String(Boolean(value));
          },
        },
        {
          key: "cmd",
          label: <Trans render="span">Command</Trans>,
          type: "pre",
        },
        {
          key: "acceptedResourceRoles",
          label: <Trans render="span">Resource Roles</Trans>,
          transformValue(value = []) {
            return value.join(", ");
          },
        },
        {
          key: "dependencies",
          label: <Trans render="span">Dependencies</Trans>,
          transformValue(value = []) {
            return value.join(", ");
          },
        },
        {
          key: "executor",
          label: <Trans render="span">Executor</Trans>,
        },
        {
          key: "user",
          label: <Trans render="span">User</Trans>,
        },
        {
          key: "args",
          label: <Trans render="span">Args</Trans>,
          transformValue(value = []) {
            if (!value.length) {
              return getDisplayValue(null);
            }

            const args = value.map((arg, index) => (
              <pre key={index} className="flush transparent wrap">
                {arg}
              </pre>
            ));

            return <div>{args}</div>;
          },
        },
        {
          key: "version",
          label: <Trans render="span">Version</Trans>,
          transformValue(value = []) {
            const timeString = new Date(value);

            return (
              <DateFormat
                value={timeString}
                format={DateUtil.getFormatOptions()}
              />
            );
          },
        },
        {
          key: "fetch",
          heading: <Trans render="span">Container Artifacts</Trans>,
          headingLevel: 2,
        },
        {
          key: "fetch",
          render(data) {
            const columns = [
              {
                heading: getColumnHeadingFn(i18nMark("Artifact Uri")),
                prop: "uri",
                render: (prop, row) => {
                  const value = row[prop];

                  return getDisplayValue(value);
                },
                className: getColumnClassNameFn(
                  "configuration-map-table-label"
                ),
                sortable: true,
              },
            ];

            if (onEditClick) {
              columns.push({
                heading() {
                  return null;
                },
                className: "configuration-map-action",
                prop: "edit",
                render() {
                  return (
                    <a
                      className="button button-link flush table-display-on-row-hover"
                      onClick={onEditClick.bind(null, "services")}
                    >
                      <Trans>Edit</Trans>
                    </a>
                  );
                },
              });
            }

            return (
              <Table
                key="artifacts-table"
                className="table table-flush table-borderless-outer table-borderless-inner-columns vertical-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={data}
              />
            );
          },
        },
      ],
    };
  }
}

export default ServiceGeneralConfigSection;
