import { Trans } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import PropTypes from "prop-types";
import * as React from "react";
import { Icon, InfoBoxInline } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import ErrorMessageUtil from "../utils/ErrorMessageUtil";

const ErrorsAlert = (props) => {
  const {
    errors,
    hideTopLevelErrors,
    hidePermissiveErrors,
    pathMapping,
    i18n,
  } = props;
  let showErrors = [].concat(...errors);

  if (hidePermissiveErrors) {
    showErrors = showErrors.filter((error) => !error.isPermissive);
  }

  if (hideTopLevelErrors) {
    showErrors = showErrors.filter((error) => error.path.length === 0);
  }

  if (showErrors.length === 0) {
    return <noscript />;
  }

  // De-duplicate error messages that have exactly the same translated output
  const errorMessages = showErrors.reduce((messages, error) => {
    const message = ErrorMessageUtil.getUnanchoredErrorMessage(
      error,
      pathMapping,
      i18n
    );
    if (messages.indexOf(message) !== -1) {
      return messages;
    }

    messages.push(message);

    return messages;
  }, []);

  const errorItems = errorMessages.map((message, index) => (
    <li key={index} className="errorsAlert-listItem">
      {message}.
    </li>
  ));

  return (
    <div className="infoBoxWrapper">
      <InfoBoxInline
        appearance="danger"
        message={
          <div className="flex">
            <div>
              <Icon
                shape={SystemIcons.Yield}
                size={iconSizeXs}
                color="currentColor"
              />
            </div>
            <div className="errorsAlert-message">
              <Trans render="h4">
                There is an error with your configuration
              </Trans>
              <ul className="errorsAlert-list">{errorItems}</ul>
            </div>
          </div>
        }
      />
    </div>
  );
};

ErrorsAlert.defaultProps = {
  errors: [],
  hideTopLevelErrors: false,
  hidePermissiveErrors: true,
  pathMapping: [],
};

ErrorsAlert.propTypes = {
  errors: PropTypes.array,
  hideTopLevelErrors: PropTypes.bool,
  hidePermissiveErrors: PropTypes.bool,
  pathMapping: PropTypes.array,
};

export default withI18n()(ErrorsAlert);
