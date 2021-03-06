import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";

import DSLCombinerTypes from "#SRC/js/constants/DSLCombinerTypes";
import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLExpressionPart from "#SRC/js/structs/DSLExpressionPart";
import DSLFormWithExpressionUpdates from "#SRC/js/components/DSLFormWithExpressionUpdates";
import DSLUtil from "#SRC/js/utils/DSLUtil";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";

const EXPRESSION_PARTS = {
  is_active: DSLExpressionPart.attribute("is", "active"),
  is_completed: DSLExpressionPart.attribute("is", "completed"),
  is_failed: DSLExpressionPart.attribute("is", "failed"),
  is_killed: DSLExpressionPart.attribute("is", "killed"),
};

const TasksStatusDSLSection = (props) => {
  const { expression, onChange } = props;
  const enabled = DSLUtil.canProcessParts(expression, EXPRESSION_PARTS);
  const data = DSLUtil.getPartValues(expression, EXPRESSION_PARTS);

  return (
    <DSLFormWithExpressionUpdates
      enabled={enabled}
      expression={expression}
      groupCombiner={DSLCombinerTypes.AND}
      itemCombiner={DSLCombinerTypes.OR}
      onChange={onChange}
      parts={EXPRESSION_PARTS}
    >
      <Trans render="label">Status</Trans>
      <div className="row">
        <div className="column-6">
          <FormGroup>
            <FieldLabel>
              <FieldInput
                checked={data.is_active}
                disabled={!enabled}
                name="is_active"
                type="checkbox"
              />
              <Trans render="span">Active</Trans>
            </FieldLabel>
            <FieldLabel>
              <FieldInput
                checked={data.is_completed}
                disabled={!enabled}
                name="is_completed"
                type="checkbox"
              />
              <Trans render="span">Completed</Trans>
            </FieldLabel>
            <FieldLabel>
              <FieldInput
                checked={data.is_failed}
                disabled={!enabled}
                name="is_failed"
                type="checkbox"
              />
              <Trans render="span">Failed</Trans>
            </FieldLabel>
            <FieldLabel>
              <FieldInput
                checked={data.is_killed}
                disabled={!enabled}
                name="is_killed"
                type="checkbox"
              />
              <Trans render="span">Killed</Trans>
            </FieldLabel>
          </FormGroup>
        </div>
      </div>
    </DSLFormWithExpressionUpdates>
  );
};

TasksStatusDSLSection.defaultProps = {
  expression: new DSLExpression(""),
  onChange() {},
};

TasksStatusDSLSection.propTypes = {
  expression: PropTypes.instanceOf(DSLExpression).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TasksStatusDSLSection;
