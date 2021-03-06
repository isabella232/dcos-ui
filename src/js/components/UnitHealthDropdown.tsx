import { Trans } from "@lingui/macro";

import { Dropdown } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";

import UnitHealthStatus from "../constants/UnitHealthStatus";

const DEFAULT_ITEM = {
  id: "all",
  html: <Trans render="span">All Health Checks</Trans>,
  selectedHtml: <Trans render="span">All Health Checks</Trans>,
};

class UnitHealthDropdown extends React.PureComponent {
  static defaultProps = {
    className: "button dropdown-toggle text-align-left",
    dropdownMenuClassName: "dropdown-menu",
  };
  static propTypes = {
    className: PropTypes.string,
    dropdownMenuClassName: PropTypes.string,
    initialID: PropTypes.string,
    onHealthSelection: PropTypes.func,
  };
  state = { dropdownItems: this.getDropdownItems() };

  getDropdownItems() {
    const keys = Object.keys(UnitHealthStatus).filter(
      (key) => key !== "NA" && key !== "WARN"
    );

    const items = keys.map((key) => ({
      id: key,
      html: <Trans render="span" id={UnitHealthStatus[key].title} />,
      selectedHtml: <Trans render="span" id={UnitHealthStatus[key].title} />,
    }));

    items.unshift(DEFAULT_ITEM);

    return items;
  }

  setDropdownValue(id) {
    this.dropdown.setState({
      selectedID: id,
    });
  }

  render() {
    const {
      className,
      dropdownMenuClassName,
      initialID,
      onHealthSelection,
    } = this.props;
    const { dropdownItems } = this.state;

    return (
      <Dropdown
        buttonClassName={className}
        dropdownMenuClassName={dropdownMenuClassName}
        dropdownMenuListClassName="dropdown-menu-list"
        initialID={initialID}
        items={dropdownItems}
        onItemSelection={onHealthSelection}
        ref={(ref) => (this.dropdown = ref)}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        wrapperClassName="dropdown"
      />
    );
  }
}

export default UnitHealthDropdown;
