import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import { Trans } from "@lingui/macro";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

import EndpointClipboardTrigger from "./EndpointClipboardTrigger";
import Service from "../../structs/Service";
import MesosDNSList from "./MesosDNSList";
import { getDisplayValue } from "../../utils/ServiceConfigDisplayUtil";

class ServicePodConnectionEndpointList extends React.Component {
  static propTypes = {
    onEditClick: PropTypes.func,
    errors: PropTypes.array,
    service: PropTypes.instanceOf(Service),
  };
  handleOpenEditConfigurationModal = () => {
    const { router } = this.context;
    router.push(
      `/services/detail/${encodeURIComponent(this.props.service.getId())}/edit/`
    );
  };

  getClipboardTrigger(command) {
    return <EndpointClipboardTrigger command={command} />;
  }

  getProtocolValue(portDefinition) {
    let protocol = portDefinition.protocol || [];
    protocol = protocol.join(",");

    if (protocol !== "") {
      return this.getClipboardTrigger(getDisplayValue(protocol));
    }

    return getDisplayValue(protocol);
  }

  getContainerPortValue(portDefinition) {
    const portValue = portDefinition.containerPort;

    if (portValue) {
      return (
        <EndpointClipboardTrigger
          command={getDisplayValue(portValue.toString())}
        />
      );
    }

    return getDisplayValue(portValue);
  }

  getHostPortValue({ hostPort }) {
    return hostPort ? (
      <EndpointClipboardTrigger
        command={getDisplayValue(hostPort.toString())}
      />
    ) : (
      <Trans render="span">Auto Assigned</Trans>
    );
  }

  getPortDefinitions(endpoints) {
    return endpoints.map((portDefinition, index) => (
      <ConfigurationMapSection key={index}>
        <ConfigurationMapHeading>{portDefinition.name}</ConfigurationMapHeading>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Protocol</Trans>
          <ConfigurationMapValue>
            <span>{this.getProtocolValue(portDefinition)}</span>
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="container-port">
          <Trans render={<ConfigurationMapLabel />}>Container Port</Trans>
          <ConfigurationMapValue>
            {this.getContainerPortValue(portDefinition)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Host Port</Trans>
          <ConfigurationMapValue>
            {this.getHostPortValue(portDefinition)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Container</Trans>
          <ConfigurationMapValue>
            <span>{portDefinition.containerName}</span>
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    ));
  }

  render() {
    const { service } = this.props;
    let endpoints = [];

    if (
      service.spec &&
      service.spec.containers &&
      service.spec.containers.length > 0
    ) {
      service.spec.containers.forEach((container) => {
        const containerEndpoints = container.endpoints
          ? container.endpoints.slice(0)
          : [];
        containerEndpoints.forEach((containerEndpoint) => {
          containerEndpoint.containerName = container.name;
        });
        endpoints = endpoints.concat(containerEndpoints);
      });
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {this.getPortDefinitions(endpoints)}
          <MesosDNSList service={service} />
        </ConfigurationMap>
      </div>
    );
  }
}

ServicePodConnectionEndpointList.contextTypes = {
  router: routerShape,
};

export default ServicePodConnectionEndpointList;
