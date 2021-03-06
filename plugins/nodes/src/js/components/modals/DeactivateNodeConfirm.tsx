import * as React from "react";
import { i18nMark, withI18n } from "@lingui/react";

import { Trans } from "@lingui/macro";
import { InfoBoxInline } from "@dcos/ui-kit";

import { Confirm } from "reactjs-components";

import Node from "#SRC/js/structs/Node";
import NodeMaintenanceActions from "#PLUGINS/nodes/src/js/actions/NodeMaintenanceActions";

interface Props {
  open: boolean;
  onClose: () => void;
  node: Node | null;
  i18n: any;
}

function DeactivateNodeConfirm(props: Props) {
  const { open, onClose, node, i18n } = props;

  const [inProgress, setInProgress] = React.useState<boolean>(false);
  const [
    networkError,
    setNetworkError,
  ] = React.useState<React.ReactElement | null>(null);

  const handleClose = () => {
    setNetworkError(null);
    setInProgress(false);
    onClose();
  };

  const handleDeactivate = (node: Node | null) => {
    if (node == null) {
      return;
    }

    setInProgress(true);

    NodeMaintenanceActions.deactivateNode(node, {
      onSuccess: handleClose,
      onError: ({ code, message }: { code: number; message: string }) => {
        setInProgress(true);
        setNetworkError(
          code === 0 ? (
            <Trans>Network is offline</Trans>
          ) : (
            <Trans>
              Unable to complete request. Please try again. The error returned
              was {code} {message}
            </Trans>
          )
        );
      },
    });
  };

  const deactivateText = inProgress
    ? i18n._(i18nMark("Deactivating..."))
    : i18n._(i18nMark("Deactivate"));

  return (
    <Confirm
      closeByBackdropClick={true}
      disabled={inProgress}
      header={<Trans render="strong">Deactivate Node</Trans>}
      open={open}
      onClose={handleClose}
      rightButtonCallback={handleDeactivate.bind(null, node)}
      leftButtonCallback={handleClose}
      leftButtonClassName="button button-primary-link flush-left"
      leftButtonText={i18n._(i18nMark("Cancel"))}
      rightButtonClassName="button button-danger"
      rightButtonText={deactivateText}
      showHeader={true}
    >
      {networkError && (
        <InfoBoxInline
          appearance="danger"
          className="error-unanchored"
          message={networkError}
        />
      )}
      <Trans>Are you sure you want to deactivate this node?</Trans>
    </Confirm>
  );
}

const DeactivateNodeConfirmWithI18n = withI18n()(DeactivateNodeConfirm);

export { DeactivateNodeConfirmWithI18n as default };
