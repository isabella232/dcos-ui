import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { Confirm } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";

import FieldInput from "#SRC/js/components/form/FieldInput";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

import AppLockedMessage from "./AppLockedMessage";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";
import { getActionModalReadableError } from "../../utils/ServiceActionModalsUtil";

class ServiceResumeModal extends React.PureComponent {
  static propTypes = {
    errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    isPending: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    resumeService: PropTypes.func.isRequired,
    service: PropTypes.oneOfType([
      PropTypes.instanceOf(ServiceTree),
      PropTypes.instanceOf(Service),
    ]).isRequired,
  };

  state = { instancesFieldValue: 1, errorMsg: null };

  UNSAFE_componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;
    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { errors, open } = nextProps;

    if (open && !this.props.open) {
      this.setState({ instancesFieldValue: 1 });
    }

    if (!errors) {
      this.setState({ errorMsg: null });

      return;
    }

    if (typeof errors === "string") {
      this.setState({ errorMsg: errors });

      return;
    }

    let { message: errorMsg = "", details } = errors;
    const hasDetails = details && details.length !== 0;

    if (hasDetails && Array.isArray(details)) {
      errorMsg = details.reduce(
        (memo, error) => `${memo} ${error.errors.join(" ")}`,
        ""
      );
    }

    if (!errorMsg || !errorMsg.length) {
      errorMsg = null;
    }

    this.setState({ errorMsg });
  }
  handleConfirmation = () => {
    const instances =
      this.state.instancesFieldValue == null
        ? 1
        : this.state.instancesFieldValue;

    this.props.resumeService(instances, this.shouldForceUpdate());
  };
  handleInstancesFieldChange = (event) => {
    this.setState({
      instancesFieldValue: event.target.value,
    });
  };

  getErrorMessage() {
    const { errorMsg = null } = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage service={this.props.service} />;
    }

    return (
      <Trans
        render="h4"
        className="text-align-center text-danger flush-top"
        id={getActionModalReadableError(errorMsg)}
      />
    );
  }

  getModalContent() {
    const {
      props: { service },
    } = this;

    if (
      !(service instanceof ServiceTree) &&
      service.getLabels().MARATHON_SINGLE_INSTANCE_APP
    ) {
      return (
        <Trans render="p">
          This service is currently stopped. Do you want to resume this service?
        </Trans>
      );
    }

    return (
      <div>
        <Trans render="p">
          This service is currently stopped. Do you want to resume this service?
          You can change the number of instances to resume by using the field
          below.
        </Trans>
        <FormRow>
          <FormGroup className="form-row-element column-12 form-row-input">
            <FieldInput
              name="instances"
              onChange={this.handleInstancesFieldChange}
              type="number"
              value={this.state.instancesFieldValue}
            />
          </FormGroup>
        </FormRow>
      </div>
    );
  }

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }

  render() {
    const { isPending, onClose, open, i18n } = this.props;

    const heading = (
      <ModalHeading>
        <Trans render="span">Resume Service</Trans>
      </ModalHeading>
    );
    const rightButtonText = isPending
      ? i18n._(t`Resuming...`)
      : i18n._(t`Resume Service`);

    return (
      <Confirm
        disabled={isPending}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        leftButtonClassName="button button-primary-link flush-left"
        rightButtonText={rightButtonText}
        rightButtonClassName="button button-primary"
        rightButtonCallback={this.handleConfirmation}
        showHeader={true}
      >
        {this.getModalContent()}
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

export default withI18n()(ServiceResumeModal);
