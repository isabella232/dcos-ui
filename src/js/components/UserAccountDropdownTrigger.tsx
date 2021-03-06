import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

export default class UserAccountDropdownTrigger extends mixin(StoreMixin) {
  static propTypes = {
    content: PropTypes.string.isRequired,
    onUpdate: PropTypes.func,
    onTrigger: PropTypes.func,
  };

  store_listeners = [
    { name: "metadata", events: ["success"], unmountWhen: () => true },
  ];

  componentDidUpdate() {
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  render() {
    const { content, onTrigger } = this.props;

    return (
      <span className="header-bar-dropdown-trigger" onClick={onTrigger}>
        <span className="header-bar-dropdown-trigger-content text-overflow">
          {content}
        </span>
      </span>
    );
  }
}
