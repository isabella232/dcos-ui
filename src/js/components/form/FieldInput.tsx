import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import * as React from "react";

import { omit } from "../../utils/Util";

const FieldInput = props => {
  const { className, inputRef, type } = props;
  const classes = classNames("form-control", className);

  let toggleIndicator;
  if (["radio", "checkbox"].includes(type)) {
    toggleIndicator = <span className="form-control-toggle-indicator" />;
  }

  return (
    <span>
      <input
        className={classes}
        ref={inputRef}
        {...omit(props, ["className", "inputRef"])}
      />
      {toggleIndicator}
    </span>
  );
};

FieldInput.defaultProps = {
  onChange: () => undefined,
  value: ""
};

FieldInput.propTypes = {
  type: PropTypes.string,
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.bool
  ]),

  // Classes
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

export default FieldInput;