import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import * as React from "react";
import { Tooltip } from "reactjs-components";
import { Trans } from "@lingui/macro";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import PageHeaderActionsMenu from "./PageHeaderActionsMenu";

const getDropdownAction = (action, index) => {
  if (React.isValidElement(action)) {
    return action;
  }

  const { className, label, onItemSelect } = action;
  const itemClasses = classNames(className);

  return (
    <span className={itemClasses} onItemSelect={onItemSelect} key={index}>
      <Trans id={label} render="span" />
    </span>
  );
};

const classProps = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string,
]);

const menuActionsProps = PropTypes.shape({
  className: classProps,
  onItemSelect: PropTypes.func.isRequired,
  label: PropTypes.node.isRequired,
});

export default class PageHeaderActions extends React.Component {
  static defaultProps = {
    actions: [],
    actionsDisabled: false,
  };
  static propTypes = {
    addButton: PropTypes.oneOfType([
      PropTypes.arrayOf(menuActionsProps),
      menuActionsProps,
    ]),
    actions: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.node, menuActionsProps])
    ),
    supplementalContent: PropTypes.node,
    actionsDisabled: PropTypes.bool,
  };
  renderActionsMenu() {
    const { actions, actionsDisabled } = this.props;

    if (actions.length > 0) {
      const dropdownElements = actions.map(getDropdownAction);

      return (
        <PageHeaderActionsMenu actionsDisabled={actionsDisabled}>
          {dropdownElements}
        </PageHeaderActionsMenu>
      );
    }
  }

  renderAddButton() {
    const { addButton, actionsDisabled } = this.props;

    if (Array.isArray(addButton) && addButton.length > 0) {
      const dropdownElements = addButton.map(getDropdownAction);

      return (
        <PageHeaderActionsMenu
          iconID={SystemIcons.Plus}
          actionsDisabled={actionsDisabled}
        >
          {dropdownElements}
        </PageHeaderActionsMenu>
      );
    }

    if (addButton != null) {
      const { label, onItemSelect, className } = addButton;
      const buttonClasses = classNames(
        "button button-primary-link button-narrow",
        className
      );

      const button = (
        <button className={buttonClasses} onClick={onItemSelect}>
          <Icon
            shape={SystemIcons.Plus}
            size={iconSizeXs}
            color="currentColor"
          />
        </button>
      );

      if (label != null) {
        return <Tooltip content={label}>{button}</Tooltip>;
      }

      return button;
    }
  }

  render() {
    return (
      <div className="page-header-actions-inner">
        {this.props.supplementalContent}
        <div className="button-collection-flush-bottom">
          {this.renderAddButton()}
          {this.renderActionsMenu()}
        </div>
      </div>
    );
  }
}
