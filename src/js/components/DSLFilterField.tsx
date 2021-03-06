import PropTypes from "prop-types";
import * as React from "react";

import DSLInputField from "./DSLInputField";
import DSLExpression from "../structs/DSLExpression";
import DSLFormDropdownPanel from "./DSLFormDropdownPanel";

/**
 * This component interactively edits a DSL expression and calls back with the
 * filtering function when there is a change.
 */
class DSLFilterField extends React.Component {
  static defaultProps = {
    formSections: [],
    onChange() {},
  };
  static propTypes = {
    expression: PropTypes.instanceOf(DSLExpression).isRequired,
    filters: PropTypes.instanceOf(Array).isRequired,
    formSections: PropTypes.array,
    onChange: PropTypes.func,
  };

  state = { dropdownVisible: false };

  /**
   * Listen for body-wide events for dismissing the panel
   * @override
   */
  componentDidMount() {
    window.addEventListener("click", this.handleDismissClick, false);
  }

  /**
   * Remove body-wide listeners
   * @override
   */
  componentWillUnmount() {
    window.removeEventListener("click", this.handleDismissClick);
  }

  /**
   * Component should update only when filters or expressions changes
   *
   * @override
   */
  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.expression.value !== nextProps.expression.value ||
      this.props.filters !== nextProps.filters ||
      this.state.dropdownVisible !== nextState.dropdownVisible
    );
  }

  /**
   * Clicks on the body are dismissing the panel
   */
  handleDismissClick = () => {
    if (!this.state.dropdownVisible) {
      return;
    }

    this.setState({ dropdownVisible: false });
  };

  /**
   * Handle click on the dropdown button of the input field
   */
  handleDropdownClick = () => {
    this.setState({ dropdownVisible: !this.state.dropdownVisible });
  };

  /**
   * Handle focus on the dropdown of the input field
   */
  handleInputFocus = () => {
    this.setState({ dropdownVisible: true });
  };

  /**
   * Handle closing of the dropdown
   */
  handleDropdownClose = () => {
    this.setState({ dropdownVisible: false });
  };

  /**
   * Clicks on the panel region are stopped in order for them not to reach
   * the body handler (that dismisses the dropdown)
   *
   * @param {SyntheticEvent} event - The click event
   */
  handleIgnoreClick = (event) => {
    event.stopPropagation();
  };

  render() {
    const { expression, formSections, onChange, defaultData } = this.props;
    const { dropdownVisible } = this.state;
    const hasForm = formSections.length > 0;

    return (
      <div
        className="form-group dropdown-panel-group"
        onClick={this.handleIgnoreClick}
      >
        <DSLInputField
          hasErrors={expression.hasErrors}
          hasDropdown={hasForm}
          dropdownVisible={dropdownVisible}
          onChange={onChange}
          onDropdownClick={this.handleDropdownClick}
          onFocus={this.handleInputFocus}
          expression={expression}
        />

        <DSLFormDropdownPanel
          expression={expression}
          isVisible={dropdownVisible}
          onChange={onChange}
          onClose={this.handleDropdownClose}
          sections={formSections}
          defaultData={defaultData}
        />
      </div>
    );
  }
}

export default DSLFilterField;
