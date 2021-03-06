import { Trans, t } from "@lingui/macro";
import { withI18n, i18nMark } from "@lingui/react";
import { Confirm } from "reactjs-components";
import { routerShape } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";
import { NotificationServiceType } from "@extension-kid/notification-service";
import {
  ToastNotification,
  ToastAppearance,
} from "@extension-kid/toast-notifications";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import container from "#SRC/js/container";
import { TYPES } from "#SRC/js/types/containerTypes";

import AppLockedMessage from "./AppLockedMessage";
import Framework from "../../structs/Framework";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

// This needs to be at least equal to @modal-animation-duration
const REDIRECT_DELAY = 300;

const notificationService = container.get(NotificationServiceType);

function i18nTranslate(id, values) {
  const i18n = container.get(TYPES.I18n);
  if (i18n) {
    return i18n._(id, values);
  }
  return id;
}

class ServiceDestroyModal extends React.PureComponent {
  static propTypes = {
    deleteItem: PropTypes.func.isRequired,
    errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    isPending: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    service: PropTypes.oneOfType([
      PropTypes.instanceOf(Framework),
      PropTypes.instanceOf(Pod),
      PropTypes.instanceOf(ServiceTree),
      PropTypes.instanceOf(Service),
    ]).isRequired,
  };

  state = { errorMsg: null, serviceNameConfirmationValue: "" };

  UNSAFE_componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.redirectToServices();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { i18n } = this.props;
    const { errors } = nextProps;
    const defaultErrorMsg = i18n._(
      t`The delete action failed. Please try again.`
    );

    if (!errors) {
      this.setState({ errorMsg: null });

      return;
    }

    if (typeof errors === "string") {
      this.setState({ errorMsg: errors });

      return;
    }

    let { message: errorMsg = defaultErrorMsg, details } = errors;
    const hasDetails = details && details.length !== 0;

    if (hasDetails) {
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

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }
  handleModalClose = () => {
    if (this.state.errorMsg) {
      notificationService.push(this.getNotification(this.state.errorMsg));
    }
    this.setState({ serviceNameConfirmationValue: "" });
    this.props.onClose();
  };
  handleRightButtonClick = () => {
    if (!this.getIsRightButtonDisabled()) {
      this.props.deleteItem(this.shouldForceUpdate());
      this.setState({ serviceNameConfirmationValue: "" });
    }
  };
  handleChangeInputFieldDestroy = (event) => {
    this.setState({
      serviceNameConfirmationValue: event.target.value,
    });
  };
  handleFormSubmit = (event) => {
    event.preventDefault();
    this.handleRightButtonClick();
  };

  getIsRightButtonDisabled() {
    return (
      this.props.service.getName() !== this.state.serviceNameConfirmationValue
    );
  }

  getErrorMessage() {
    const { errorMsg = null } = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage service={this.props.service} />;
    }

    return (
      <h4 className="text-align-center text-danger flush-bottom">{errorMsg}</h4>
    );
  }
  getNotification = (errorMsg) => {
    const { service } = this.props;
    const serviceId = service.getId().split("/").slice(-1)[0];
    const title = i18nTranslate(
      i18nMark('Failed to delete service "{serviceId}"'),
      { serviceId }
    );

    return new ToastNotification(title, {
      appearance: ToastAppearance.Danger,
      autodismiss: true,
      description: errorMsg,
    });
  };

  redirectToServices() {
    const { router } = this.context;
    const { service } = this.props;

    const parentService = DCOSStore.serviceTree.getItemParent(service.getId());
    const servicePath = parentService
      ? `/services/overview/${encodeURIComponent(parentService.getId())}`
      : "/services/overview";

    // Close the modal and redirect after the close animation has completed
    this.handleModalClose();
    setTimeout(() => {
      router.push({ pathname: servicePath });
    }, REDIRECT_DELAY);
  }

  getServiceDeleteForm() {
    const { service } = this.props;
    const serviceName = service.getName();
    const serviceLabel = this.getServiceLabel();

    return (
      <div>
        <Trans render="p">
          This action <strong>CANNOT</strong> be undone. This will permanently
          delete the <strong>{serviceName}</strong> {serviceLabel.toLowerCase()}
          .
        </Trans>
        <div className="form-group flush-bottom">
          <Trans render="label">Type "{serviceName}" to confirm</Trans>
          <input
            className="form-control filter-input-text"
            onChange={this.handleChangeInputFieldDestroy}
            type="text"
            value={this.state.serviceNameConfirmationValue}
            autoFocus={true}
          />
        </div>
      </div>
    );
  }

  getDestroyServiceModal() {
    const { open, i18n, isPending } = this.props;
    const serviceLabel = this.getServiceLabel();
    const itemText = isPending
      ? i18n._(t`Deleting...`)
      : i18n._(t`Delete`) + ` ${serviceLabel}`;

    return (
      <Confirm
        disabled={this.getIsRightButtonDisabled()}
        header={this.getModalHeading()}
        open={open}
        onClose={this.handleModalClose}
        leftButtonText={i18n._(t`Cancel`)}
        leftButtonClassName="button button-primary-link flush-left"
        leftButtonCallback={this.handleModalClose}
        rightButtonText={itemText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleRightButtonClick}
        showHeader={true}
      >
        <form onSubmit={this.handleFormSubmit}>
          {this.getServiceDeleteForm()}
          {this.getErrorMessage()}
        </form>
      </Confirm>
    );
  }

  getModalHeading() {
    const serviceLabel = this.getServiceLabel();

    return (
      <ModalHeading className="text-danger">
        <Trans render="span">Delete {serviceLabel}</Trans>
      </ModalHeading>
    );
  }

  getServiceLabel() {
    const { service } = this.props;

    if (service instanceof Pod) {
      return "Pod";
    }

    if (service instanceof ServiceTree) {
      return "Group";
    }

    return "Service";
  }

  render() {
    return this.getDestroyServiceModal();
  }
}

ServiceDestroyModal.contextTypes = {
  router: routerShape,
};

export default withI18n()(ServiceDestroyModal);
