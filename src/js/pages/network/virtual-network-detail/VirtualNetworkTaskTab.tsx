import { i18nMark, withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import classNames from "classnames";
import { routerShape, Link } from "react-router";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { Table } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXxs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import StoreMixin from "#SRC/js/mixins/StoreMixin";
import FilterBar from "../../../components/FilterBar";
import FilterHeadline from "../../../components/FilterHeadline";
import FilterInputText from "../../../components/FilterInputText";
import Loader from "../../../components/Loader";
import MesosStateStore from "../../../stores/MesosStateStore";
import Overlay from "../../../structs/Overlay";
import RequestErrorMsg from "../../../components/RequestErrorMsg";
import TaskUtil from "../../../../../plugins/services/src/js/utils/TaskUtil";
import VirtualNetworkUtil from "../../../utils/VirtualNetworkUtil";
import Util from "../../../utils/Util";

const headerMapping = {
  id: i18nMark("Task"),
  ip_address: i18nMark("Container IP"),
  port_mappings: i18nMark("Port Mappings"),
};

const agentIPPath = "statuses.0.container_status.network_infos.0.ip_addresses";

class VirtualNetworkTaskTab extends mixin(StoreMixin) {
  static propTypes = {
    overlay: PropTypes.instanceOf(Overlay),
  };

  state = {
    errorMessage: null,
    searchString: "",
    tasksDataReceived: false,
  };

  store_listeners = [
    { name: "state", events: ["success", "error"], suppressUpdate: true },
  ];

  onStateStoreError(errorMessage) {
    this.setState({ tasksDataReceived: true, errorMessage });
  }

  onStateStoreSuccess() {
    this.setState({ tasksDataReceived: true, errorMessage: null });
  }
  handleSearchStringChange = (searchString = "") => {
    this.setState({ searchString });
  };
  resetFilter = () => {
    this.setState({ searchString: "" });
  };

  isLoading() {
    return !this.state.tasksDataReceived;
  }

  getFilteredTasks(tasks, searchString = "") {
    if (searchString === "") {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.name.includes(searchString) || task.id.includes(searchString)
    );
  }

  getClassName(prop, sortBy) {
    return classNames({
      active: prop === sortBy.prop,
    });
  }

  getColumns() {
    const getClassName = this.getClassName;
    const heading = this.renderHeading;

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "id",
        render: this.renderID,
        sortable: false,
      },
      {
        className: getClassName,
        getValue: this.getAgentIP,
        headerClassName: getClassName,
        heading,
        prop: "ip_address",
        render: this.renderAgentIP,
        sortable: false,
      },
      {
        className: getClassName,
        getValue: TaskUtil.getPortMappings,
        headerClassName: getClassName,
        heading,
        prop: "port_mappings",
        render: this.renderPorts,
        sortable: false,
      },
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "50%" }} />
        <col />
        <col />
      </colgroup>
    );
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getTaskLink(taskID, value, title, hierarchy = {}) {
    if (!value) {
      value = taskID;
    }

    if (!title) {
      title = taskID;
    }

    const classes = classNames({
      "table-cell-link-primary": hierarchy.primary,
      "table-cell-link-secondary": hierarchy.secondary,
    });

    const overlayName = this.props.overlay.name;

    return (
      <Link
        className={classes}
        key={value}
        title={title}
        to={`/networking/networks/${overlayName}/tasks/${taskID}`}
      >
        {value}
      </Link>
    );
  }

  getTitle(portMappings) {
    return portMappings
      .map(
        (mapping) =>
          `${mapping.container_port} > ${mapping.host_port} (${mapping.protocol})`
      )
      .join(", ");
  }

  getAgentIP(task) {
    const ipAddresses = Util.findNestedPropertyInObject(task, agentIPPath);

    if (!ipAddresses || !Array.isArray(ipAddresses)) {
      return ipAddresses;
    }

    return ipAddresses.map((ipAddress) => ipAddress.ip_address).join(", ");
  }
  renderAgentIP = (prop, task) => {
    const ipAddress = this.getAgentIP(task);

    if (!ipAddress) {
      return "N/A";
    }

    return ipAddress;
  };

  renderHeading(prop) {
    return (
      <Trans
        id={headerMapping[prop]}
        render="span"
        className="table-header-title"
      />
    );
  }
  renderID = (prop, task) => {
    return this.getTaskLink(task.id, null, null, { primary: true });
  };
  renderPorts = (prop, task) => {
    let portMappings = TaskUtil.getPortMappings(task);
    if (!portMappings) {
      return "N/A";
    }

    const title = this.getTitle(portMappings);
    if (portMappings.length > 3) {
      portMappings = portMappings.slice(0, 2);
      portMappings.push({ container_port: "..." });
    }

    const { id } = task;

    return portMappings.map((mapping, index) => {
      let mapTo = null;

      if (mapping.host_port) {
        mapTo = (
          <span className="list-inline-separator">
            <Icon shape={SystemIcons.CaretRight} size={iconSizeXxs} />
            {this.getTaskLink(
              id,
              `${mapping.host_port} (${mapping.protocol})`,
              title,
              { secondary: true }
            )}
          </span>
        );
      }

      return (
        <div key={index} className="table-cell-value">
          <div className="table-cell-details-secondary flex-box flex-box-align-vertical-center table-cell-flex-box">
            <div className="text-overflow service-link">
              {this.getTaskLink(id, mapping.container_port, title, {
                secondary: true,
              })}
              {mapTo}
            </div>
          </div>
        </div>
      );
    });
  };

  render() {
    const { errorMessage, searchString } = this.state;
    if (this.isLoading()) {
      return <Loader />;
    }

    if (errorMessage) {
      return this.getErrorScreen();
    }

    const { overlay, i18n } = this.props;
    if (!overlay) {
      return VirtualNetworkUtil.getEmptyNetworkScreen();
    }

    const tasks = MesosStateStore.getRunningTasksFromVirtualNetworkName(
      overlay.name
    );
    const filteredTasks = this.getFilteredTasks(tasks, searchString);

    return (
      <div>
        {/* L10NTODO: Pluralize
        We should pluralize FilterHeadline name here using lingui macro instead of
        doing it manually in FilterHeadline */}
        <FilterHeadline
          onReset={this.resetFilter}
          name={i18n._(t`Task`)}
          currentLength={filteredTasks.length}
          totalLength={tasks.length}
        />
        <FilterBar>
          <FilterInputText
            searchString={searchString}
            handleFilterChange={this.handleSearchStringChange}
          />
        </FilterBar>
        <Table
          className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={filteredTasks}
        />
      </div>
    );
  }
}

VirtualNetworkTaskTab.contextTypes = {
  router: routerShape,
};

export default withI18n()(VirtualNetworkTaskTab);
