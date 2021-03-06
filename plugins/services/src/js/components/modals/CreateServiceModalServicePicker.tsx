import { Trans } from "@lingui/macro";
import { MountService } from "foundation-ui";
import PropTypes from "prop-types";

import * as React from "react";

import CreateServiceModalServicePickerOption from "#SRC/js/components/CreateServiceModalServicePickerOption";
import CreateServiceModalServicePickerOptionContent from "#SRC/js/components/CreateServiceModalServicePickerOptionContent";
import CreateServiceModalServicePickerOptionImage from "#SRC/js/components/CreateServiceModalServicePickerOptionImage";
import CreateServiceModalServicePickerOptionWrapper from "#SRC/js/components/CreateServiceModalServicePickerOptionWrapper";
import defaultServiceImage from "../../../img/icon-service-default-large@2x.png";
import jsonServiceImage from "../../../img/service-image-json-large@2x.png";

function SingleContainerOption({ columnClasses, onOptionSelect }) {
  return (
    <CreateServiceModalServicePickerOption
      columnClasses={columnClasses}
      onOptionSelect={onOptionSelect.bind(null, { type: "app" })}
    >
      <CreateServiceModalServicePickerOptionImage src={defaultServiceImage} />
      <CreateServiceModalServicePickerOptionContent>
        <Trans render="span">Single Container</Trans>
      </CreateServiceModalServicePickerOptionContent>
    </CreateServiceModalServicePickerOption>
  );
}

function MultiContainerOption({ columnClasses, onOptionSelect }) {
  return (
    <CreateServiceModalServicePickerOption
      columnClasses={columnClasses}
      onOptionSelect={onOptionSelect.bind(null, { type: "pod" })}
    >
      <CreateServiceModalServicePickerOptionImage src={defaultServiceImage} />
      <CreateServiceModalServicePickerOptionContent>
        <Trans render="span">Multi-container (Pod)</Trans>
      </CreateServiceModalServicePickerOptionContent>
    </CreateServiceModalServicePickerOption>
  );
}

function JSONOption({ columnClasses, onOptionSelect }) {
  return (
    <CreateServiceModalServicePickerOption
      columnClasses={columnClasses}
      onOptionSelect={onOptionSelect.bind(null, { type: "json" })}
    >
      <CreateServiceModalServicePickerOptionImage src={jsonServiceImage} />
      <CreateServiceModalServicePickerOptionContent>
        <Trans render="span">JSON Configuration</Trans>
      </CreateServiceModalServicePickerOptionContent>
    </CreateServiceModalServicePickerOption>
  );
}

const OPTIONS = [JSONOption, MultiContainerOption, SingleContainerOption];

class CreateServiceModalServicePicker extends React.Component {
  static propTypes = {
    onServiceSelect: PropTypes.func,
  };
  componentDidMount() {
    OPTIONS.forEach((component, index) => {
      MountService.MountService.registerComponent(
        component,
        "CreateService:ServicePicker:GridOptions",
        index + 1
      );
    });
  }

  componentWillUnmount() {
    OPTIONS.forEach((component) => {
      MountService.MountService.unregisterComponent(
        component,
        "CreateService:ServicePicker:GridOptions"
      );
    });
  }

  render() {
    return (
      <div className="create-service-modal-service-picker container">
        <div className="create-service-modal-service-picker-options">
          <div className="row">
            <MountService.Mount
              alwaysWrap={true}
              onOptionSelect={this.props.onServiceSelect}
              type="CreateService:ServicePicker:GridOptions"
              wrapper={CreateServiceModalServicePickerOptionWrapper}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CreateServiceModalServicePicker;
