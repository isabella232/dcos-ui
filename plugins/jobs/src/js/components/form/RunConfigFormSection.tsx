import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";

import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldError from "#SRC/js/components/form/FieldError";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import { FormOutput, FormError, RestartPolicy } from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";
import { JobDataPlaceholders } from "./helpers/DefaultFormData";

interface RunConfigSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

class RunConfigFormSection extends React.Component<RunConfigSectionProps> {
  public render() {
    const {
      formData,
      errors,
      showErrors,
      onAddItem,
      onRemoveItem,
    } = this.props;
    const labels = formData.labels || [];
    const artifacts = formData.artifacts || [];

    try {
      return (
        <div className="form-section">
          {/*

            RUN CONFIGURATION

          */}
          <Trans render="h1" className="flush-top short-bottom">
            Run Configuration
          </Trans>
          <Trans render="p">More advanced settings for this job.</Trans>
          {/*

            MAX LAUNCH DELAY

          */}
          <FormRow>
            <FormGroup className="column-3">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent title="Max Launch Delay">
                    <Trans render="span">Max Launch Delay</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent title="Max Launch Delay Info">
                    <Tooltip
                      content={
                        <Trans>
                          The number of seconds until the job needs to be
                          running. If the deadline is reached without
                          successfully running the job, the job is aborted.
                        </Trans>
                      }
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                type="number"
                name="job.run.maxLaunchDelay"
                value={formData.maxLaunchDelay}
                placeholder={JobDataPlaceholders.maxLaunchDelay}
              />
              <FieldHelp>
                <Trans render="span">Enter in seconds</Trans>
              </FieldHelp>
            </FormGroup>
          </FormRow>
          {/*

            KILL GRACE PERIOD

          */}
          <FormRow>
            <FormGroup className="column-3">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent title="Kill Grace Period">
                    <Trans render="span">Kill Grace Period</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent title="Kill Grace Period Info">
                    <Tooltip
                      content={
                        <Trans>
                          Configures the number of seconds between escalating
                          from SIGTERM to SIGKILL when signalling tasks to
                          terminate. Using this grace period, tasks should
                          perform orderly shut down immediately upon receiving
                          SIGTERM.
                        </Trans>
                      }
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                type="number"
                name="job.run.taskKillGracePeriodSeconds"
                value={formData.killGracePeriod}
              />
              <FieldHelp>
                <Trans render="span">Enter in seconds</Trans>
              </FieldHelp>
            </FormGroup>
          </FormRow>
          {/*

            USERNAME

          */}
          <FormRow>
            <FormGroup className="column-6">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent title="Username">
                    <Trans render="span">Username</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent title="Username Info">
                    <Tooltip
                      content={
                        <Trans>
                          The user to use to run the tasks on the agent
                        </Trans>
                      }
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput name="job.run.user" value={formData.user} />
              <FieldHelp>
                <Trans render="span">
                  Enter user to run tasks on the agent
                </Trans>
              </FieldHelp>
            </FormGroup>
          </FormRow>
          {/*

            ARTIFACT URI

          */}
          <h3 className="short-bottom">
            <FormGroupHeading>
              <FormGroupHeadingContent>
                <Trans render="span">Artifact URI</Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={
                    <Trans>
                      Provided URIs are passed to Mesos fetcher module and
                      resolved in runtime
                    </Trans>
                  }
                  interactive={true}
                  maxWidth={300}
                  wrapText={true}
                >
                  <InfoTooltipIcon />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </h3>

          {artifacts.map((artifact, i) => (
            <FormGroupContainer key={i} onRemove={onRemoveItem("artifacts", i)}>
              <FormRow>
                <FormGroup className="column-11">
                  <FieldAutofocus>
                    <FieldInput
                      name={`uri.${i}.artifacts`}
                      type="text"
                      value={artifact.uri}
                      placeholder="http://www.artifact.com"
                    />
                  </FieldAutofocus>
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup className="column-auto">
                  <FieldLabel matchInputHeight={true}>
                    <FieldInput
                      checked={artifact.executable}
                      name={`executable.${i}.artifacts`}
                      type="checkbox"
                    />
                    Executable
                  </FieldLabel>
                </FormGroup>
                <FormGroup className="column-auto">
                  <FieldLabel matchInputHeight={true}>
                    <FieldInput
                      checked={artifact.extract}
                      name={`extract.${i}.artifacts`}
                      type="checkbox"
                    />
                    Extract
                  </FieldLabel>
                </FormGroup>
                <FormGroup className="column-auto">
                  <FieldLabel matchInputHeight={true}>
                    <FieldInput
                      checked={artifact.cache}
                      name={`cache.${i}.artifacts`}
                      type="checkbox"
                    />
                    Cache
                  </FieldLabel>
                </FormGroup>
              </FormRow>
            </FormGroupContainer>
          ))}

          <FormRow>
            <FormGroup className="column-12">
              <AddButton onClick={onAddItem("artifacts")}>
                <Trans>Add Artifact</Trans>
              </AddButton>
            </FormGroup>
          </FormRow>

          {/*

            RESTART CONFIGURATION

          */}
          <Trans render="h2" className="short-bottom">
            Restart Policy
          </Trans>
          <Trans render="p">
            The steps to take if a job fails. Either never relaunch a job or try
            to start a job when it fails.
          </Trans>
          {/*

            RESTART JOB

          */}
          <FormGroup>
            <FieldLabel>
              <FieldInput
                checked={formData.restartPolicy !== RestartPolicy.OnFailure}
                name="restartPolicy"
                type="radio"
                value={RestartPolicy.Never}
              />
              <Trans render="span">Never</Trans>
            </FieldLabel>
            <FieldLabel>
              <FieldInput
                checked={formData.restartPolicy === RestartPolicy.OnFailure}
                name="restartPolicy"
                type="radio"
                value={RestartPolicy.OnFailure}
              />
              <Trans render="span">On Failure</Trans>
            </FieldLabel>
          </FormGroup>
          {/*

            RETRY TIME

          */}
          <FormRow>
            <FormGroup className="column-3">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent title="Retry Time">
                    <Trans render="span">Keep Trying Time</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent title="Retry Time Info">
                    <Tooltip
                      content={
                        <Trans>
                          If the job fails, how long should we try to restart
                          the job. If no value is set, this means forever.
                        </Trans>
                      }
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                type="number"
                name="activeDeadlineSeconds"
                value={formData.retryTime}
                disabled={formData.restartPolicy !== RestartPolicy.OnFailure}
              />
              <FieldHelp>
                <Trans render="span">
                  If no value is set, this means forever
                </Trans>
              </FieldHelp>
            </FormGroup>
          </FormRow>
          {/*

            LABELS

          */}
          <Trans render="h2" className="short-bottom">
            Labels
          </Trans>
          <Trans render="p">
            Attach metadata to expose additional information in other services.
          </Trans>
          {labels.length > 0 ? (
            <FormRow>
              <FormGroup className="column-6 short-bottom">
                <FieldLabel>
                  <FormGroupHeading>
                    <FormGroupHeadingContent>
                      <Trans render="span">Key</Trans>
                    </FormGroupHeadingContent>
                  </FormGroupHeading>
                </FieldLabel>
              </FormGroup>
              <FormGroup className="column-6 short-bottom">
                <FieldLabel>
                  <FormGroupHeading>
                    <FormGroupHeadingContent>
                      <Trans render="span">Value</Trans>
                    </FormGroupHeadingContent>
                  </FormGroupHeading>
                </FieldLabel>
              </FormGroup>
              <span style={{ visibility: "hidden", height: 0 }}>
                {/* fake horizontal spacing, countering the buttons below */}
                <DeleteRowButton />
              </span>
            </FormRow>
          ) : null}
          {labels.map(([key, value], i) => (
            <FormRow key={i}>
              <FormGroup
                className="column-6"
                showError={Boolean(
                  showErrors && getFieldError(`labels.${i}`, errors)
                )}
              >
                <FieldAutofocus>
                  <FieldInput name={`key.${i}.labels`} value={key} />
                  <FieldError>
                    {getFieldError(`labels.${i}`, errors)}
                  </FieldError>
                </FieldAutofocus>
                <span className="emphasis form-colon">:</span>
              </FormGroup>
              <FormGroup className="column-6">
                <FieldInput name={`value.${i}.labels`} value={value} />
              </FormGroup>
              <FormGroup hasNarrowMargins={true}>
                <DeleteRowButton onClick={onRemoveItem("labels", i)} />
              </FormGroup>
            </FormRow>
          ))}
          <FormRow>
            <FormGroup className="column-12">
              <AddButton onClick={onAddItem("labels")}>
                <Trans>Add Label</Trans>
              </AddButton>
            </FormGroup>
          </FormRow>
        </div>
      );
    } catch {
      return (
        <Trans>
          Sorry! An error occured while trying to parse and render the JSON you
          specified.
        </Trans>
      );
    }
  }
}

export default RunConfigFormSection;
