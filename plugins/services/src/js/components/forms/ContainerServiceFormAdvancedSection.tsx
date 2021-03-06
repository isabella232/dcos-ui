import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import { Tooltip } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";

import { FormReducer as ContainerReducer } from "../../reducers/serviceForm/Container";
import { FormReducer as ContainersReducer } from "../../reducers/serviceForm/FormReducers/Containers";
import ArtifactsSection from "./ArtifactsSection";
import ContainerConstants from "../../constants/ContainerConstants";
import PodSpec from "../../structs/PodSpec";
import dcosVersion$ from "#SRC/js/stores/dcos-version";
import { Subscription } from "rxjs";

const { DOCKER, MESOS } = ContainerConstants.type;

const containerSettings = {
  privileged: {
    runtimes: [DOCKER],
    label: i18nMark("Grant Runtime Privileges"),
    helpText: i18nMark(
      "By default, containers are “unprivileged” and cannot, for example, run a Docker daemon inside a Docker container."
    ),
    unavailableText: i18nMark(
      "Grant runtime privileges option isn't supported by selected runtime."
    ),
  },
  forcePullImage: {
    runtimes: [DOCKER, MESOS],
    label: i18nMark("Force Pull Image On Launch"),
    helpText: i18nMark(
      "Force Docker to pull the image before launching each instance."
    ),
    unavailableText: i18nMark(
      "Force pull image on launch option isn't supported by selected runtime."
    ),
  },
};

const appPaths = {
  artifacts: "fetch",
  cmd: "cmd",
  containerName: "",
  cpus: "cpus",
  disk: "disk",
  forcePullImage: "{basePath}.docker.forcePullImage",
  gpus: "gpus",
  image: "{basePath}.docker.image",
  mem: "mem",
  privileged: "{basePath}.docker.privileged",
  type: "{basePath}.type",
  limits: "limits",
};

const podPaths = {
  artifacts: "{basePath}.artifacts",
  cmd: "{basePath}.exec.command.shell",
  containerName: "{basePath}.name",
  cpus: "{basePath}.resources.cpus",
  disk: "{basePath}.resources.disk",
  forcePullImage: "",
  gpus: "",
  image: "{basePath}.image.id",
  mem: "{basePath}.resources.mem",
  privileged: "",
  type: "{basePath}.type",
};

type resourceLimitType = { value: number; unlimited: boolean };

class ContainerServiceFormAdvancedSection extends React.Component<
  unknown & {
    errors: unknown & { limits: string };
    data: unknown & {
      limits: { cpus: resourceLimitType; mem: resourceLimitType };
    };
  },
  { hasVerticalBursting: boolean }
> {
  static defaultProps = {
    data: {},
    errors: {},
    onAddItem() {},
    onRemoveItem() {},
    path: "container",
  };
  static propTypes = {
    data: PropTypes.object,
    errors: PropTypes.object,
    onAddItem: PropTypes.func,
    onRemoveItem: PropTypes.func,
    path: PropTypes.string,
  };

  $dcosVersion?: Subscription;
  state = { hasVerticalBursting: false };

  componentDidMount() {
    this.$dcosVersion = dcosVersion$.subscribe(({ hasVerticalBursting }) => {
      this.setState({ hasVerticalBursting });
    });
  }
  componentWillUnmount() {
    this.$dcosVersion?.unsubscribe();
  }

  getFieldPath(basePath, fieldName) {
    if (this.props.service instanceof PodSpec) {
      return podPaths[fieldName].replace("{basePath}", basePath);
    }

    return appPaths[fieldName].replace("{basePath}", basePath);
  }

  isGpusDisabled() {
    const { data, path } = this.props;
    const typePath = this.getFieldPath(path, "type");

    return findNestedPropertyInObject(data, typePath) === DOCKER;
  }

  getGPUSField() {
    const { data, errors, path, service } = this.props;
    if (service instanceof PodSpec) {
      return null;
    }

    const gpusPath = this.getFieldPath(path, "gpus");
    const gpusErrors = findNestedPropertyInObject(errors, gpusPath);
    const gpusDisabled = this.isGpusDisabled();

    let inputNode = (
      <FieldInput
        disabled={gpusDisabled}
        min="0"
        name={gpusPath}
        step="any"
        type="number"
        value={findNestedPropertyInObject(data, gpusPath)}
        autoFocus={Boolean(!gpusDisabled && gpusErrors)}
      />
    );

    if (gpusDisabled) {
      inputNode = (
        <Tooltip
          content={
            <Trans render="span">
              Docker Engine does not support GPU resources, please select
              Universal Container Runtime (UCR) if you want to use GPU
              resources.
            </Trans>
          }
          interactive={true}
          maxWidth={300}
          wrapText={true}
          wrapperClassName="tooltip-wrapper tooltip-block-wrapper"
        >
          {inputNode}
        </Tooltip>
      );
    }

    return (
      <FormGroup
        className="column-4"
        showError={Boolean(!gpusDisabled && gpusErrors)}
      >
        <FieldLabel className="text-no-transform">
          <FormGroupHeadingContent primary={true}>
            <Trans render="span">GPUs</Trans>
          </FormGroupHeadingContent>
        </FieldLabel>
        {inputNode}
        <FieldError>{gpusErrors}</FieldError>
      </FormGroup>
    );
  }

  getContainerSettings() {
    const { data, errors, path, service } = this.props;
    if (service instanceof PodSpec) {
      return null;
    }

    const typePath = this.getFieldPath(path, "type");
    const containerType = findNestedPropertyInObject(data, typePath);
    const typeErrors = findNestedPropertyInObject(errors, typePath);
    const sectionCount = Object.keys(containerSettings).length;
    const selections = Object.keys(containerSettings).map(
      (settingName, index) => {
        const {
          runtimes,
          helpText,
          label,
          unavailableText,
        } = containerSettings[settingName];
        const settingsPath = this.getFieldPath(path, settingName);
        const checked = findNestedPropertyInObject(data, settingsPath);
        const isDisabled = !runtimes.includes(containerType);
        const labelNodeClasses = classNames({
          "disabled muted": isDisabled,
          "flush-bottom": index === sectionCount - 1,
        });

        let labelNode = (
          <FieldLabel key={`label.${index}`} className={labelNodeClasses}>
            <FieldInput
              checked={!isDisabled && Boolean(checked)}
              name={settingsPath}
              type="checkbox"
              disabled={isDisabled}
              value={settingName}
            />
            <Trans render="span" id={label} />
            <FieldHelp>
              <Trans render="span" id={helpText} />
            </FieldHelp>
          </FieldLabel>
        );

        if (isDisabled) {
          labelNode = (
            <Tooltip
              content={<Trans render="span" id={unavailableText} />}
              elementTag="label"
              key={`tooltip.${index}`}
              position="top"
              width={300}
              wrapperClassName="tooltip-wrapper tooltip-block-wrapper"
              wrapText={true}
            >
              {labelNode}
            </Tooltip>
          );
        }

        return labelNode;
      }
    );

    return (
      <FormGroup showError={Boolean(typeErrors)}>
        {selections}
        <FieldError>{typeErrors}</FieldError>
      </FormGroup>
    );
  }

  render() {
    const { data, errors, path } = this.props;
    const artifactsPath = this.getFieldPath(path, "artifacts");
    const artifacts = findNestedPropertyInObject(data, artifactsPath) || [];
    const artifactErrors =
      findNestedPropertyInObject(errors, artifactsPath) || [];
    const diskPath = this.getFieldPath(path, "disk");
    const diskErrors = findNestedPropertyInObject(errors, diskPath);
    const limitsErrors = errors?.limits;

    return (
      <div>
        <Trans render="h2" className="short-bottom">
          Advanced Settings
        </Trans>
        <Trans render="p">
          Advanced settings related to the runtime you have selected above.
        </Trans>
        {this.getContainerSettings()}
        <FormRow>
          {this.getGPUSField()}
          <FormGroup className="column-4" showError={Boolean(diskErrors)}>
            <FieldLabel className="text-no-transform">
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Disk (MiB)</Trans>
              </FormGroupHeadingContent>
            </FieldLabel>
            <FieldInput
              min="0"
              name={diskPath}
              step="any"
              type="number"
              value={findNestedPropertyInObject(data, diskPath)}
              autoFocus={Boolean(diskErrors)}
            />
            <FieldError>{diskErrors}</FieldError>
          </FormGroup>
        </FormRow>
        {this.state.hasVerticalBursting ? (
          <React.Fragment>
            <Trans render="h2" className="short-bottom">
              Limits
            </Trans>
            <Trans render="p">Limits settings for cpu and mem.</Trans>
            <FormRow>
              <FormGroup className="column-4" showError={Boolean(limitsErrors)}>
                <FieldLabel className="text-no-transform">
                  <FormGroupHeading>
                    <FormGroupHeadingContent>
                      <Trans render="span">CPUs</Trans>
                    </FormGroupHeadingContent>
                  </FormGroupHeading>
                </FieldLabel>
                <FieldInput
                  min="0"
                  name="limits.cpus"
                  step="0.01"
                  type="number"
                  value={data?.limits?.cpus?.value ?? ""}
                  autoFocus={Boolean(limitsErrors)}
                  disabled={data?.limits?.cpus?.unlimited === true}
                />
                <FieldLabel matchInputHeight={true}>
                  <FieldInput
                    name="limits.cpus.unlimited"
                    type="checkbox"
                    checked={data?.limits?.cpus?.unlimited}
                  />
                  unlimited
                </FieldLabel>
                <FieldError>{limitsErrors}</FieldError>
              </FormGroup>
              <FormGroup className="column-4" showError={Boolean(limitsErrors)}>
                <FieldLabel className="text-no-transform">
                  <FormGroupHeading>
                    <FormGroupHeadingContent>
                      <Trans render="span">Memory (MiB)</Trans>
                    </FormGroupHeadingContent>
                  </FormGroupHeading>
                </FieldLabel>
                <FieldInput
                  min="0"
                  name="limits.mem"
                  step="0.01"
                  type="number"
                  value={data?.limits?.mem?.value ?? ""}
                  autoFocus={Boolean(limitsErrors)}
                  disabled={data?.limits?.mem?.unlimited === true}
                />
                <FieldLabel matchInputHeight={true}>
                  <FieldInput
                    name="limits.mem.unlimited"
                    type="checkbox"
                    checked={data?.limits?.mem?.unlimited}
                  />
                  unlimited
                </FieldLabel>
                <FieldError>{limitsErrors}</FieldError>
              </FormGroup>
            </FormRow>
          </React.Fragment>
        ) : null}
        <ArtifactsSection
          data={artifacts}
          path={artifactsPath}
          errors={artifactErrors}
          onRemoveItem={this.props.onRemoveItem}
          onAddItem={this.props.onAddItem}
        />
      </div>
    );
  }
}

ContainerServiceFormAdvancedSection.configReducers = {
  container: ContainerReducer,
  containers: ContainersReducer,
};

export default ContainerServiceFormAdvancedSection;
