import * as React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "reactjs-components";

export default class UserAccountDropdown extends React.Component {
  static propTypes = {
    menuItems: PropTypes.arrayOf(PropTypes.object),
    trigger: PropTypes.node,
  };
  handleItemSelection(item) {
    if (item.onClick) {
      item.onClick();
    }
  }

  render() {
    return (
      <Dropdown
        trigger={this.getTrigger()}
        dropdownMenuClassName="user-account-dropdown-menu dropdown-menu header-bar-dropdown-menu"
        dropdownMenuListClassName="user-account-dropdown-list dropdown-menu-list"
        items={this.getMenuItems()}
        onItemSelection={this.handleItemSelection}
        persistentID="dropdown-trigger"
        transition={true}
      />
    );
  }
}
