import mixin from "reactjs-mixin";

import * as React from "react";

import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  greyDark,
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import DeploymentsModal from "./DeploymentsModal";

export default class DeploymentStatusIndicator extends mixin(StoreMixin) {
  store_listeners = [{ name: "dcos", events: ["change"] }];

  state = { isOpen: false };

  UNSAFE_componentWillReceiveProps() {
    const deployments = DCOSStore.deploymentsList.getItems();

    if (this.state.isOpen && deployments.length === 0) {
      this.setState({ isOpen: false });
    }
  }
  handleDeploymentsButtonClick = () => {
    this.setState({ isOpen: true });
  };
  handleModalClose = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const deployments = DCOSStore.deploymentsList.getItems();
    const deploymentsCount = deployments.length;
    const loading = !DCOSStore.serviceDataReceived;

    if (loading || deploymentsCount === 0) {
      return null;
    }

    // L10NTODO: Pluralize
    const deploymentText =
      deploymentsCount === 1 ? i18nMark("deployment") : i18nMark("deployments");

    return (
      <button
        className="button button-primary-link button--deployments"
        onClick={this.handleDeploymentsButtonClick}
      >
        <Icon color={greyDark} shape={SystemIcons.Spinner} size={iconSizeXs} />
        <div className="button--deployments__copy">
          {deploymentsCount} <Trans id={deploymentText} render="span" />
        </div>
        <DeploymentsModal
          isOpen={this.state.isOpen}
          onClose={this.handleModalClose}
        />
      </button>
    );
  }
}
