import * as React from "react";
import { Trans } from "@lingui/macro";

import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldError from "#SRC/js/components/form/FieldError";
import { FormOutput, FormError, DockerParameter } from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";

interface ParametersSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

class ParametersSection extends React.Component<
  ParametersSectionProps,
  object
> {
  public getParamsInputs() {
    const {
      formData: { dockerParams },
      onRemoveItem,
      errors,
      showErrors,
    } = this.props;

    return dockerParams.map((parameter: DockerParameter, index: number) => {
      const keyErrors = getFieldError(
        `run.docker.parameters.${index}.key`,
        errors
      );
      const valueErrors = getFieldError(
        `run.docker.parameters.${index}.value`,
        errors
      );
      const generalParamError = getFieldError(
        `run.docker.parameters.${index}`,
        errors
      );

      return (
        <FormRow key={index}>
          <FormGroup
            className="column-6"
            required={false}
            showError={Boolean(showErrors && (keyErrors || generalParamError))}
          >
            <FieldAutofocus>
              <FieldInput
                name={`key.${index}.dockerParams`}
                type="text"
                value={parameter.key || ""}
              />
            </FieldAutofocus>
            <FieldError>{keyErrors}</FieldError>
            <span className="emphasis form-colon">:</span>
          </FormGroup>
          <FormGroup
            className="column-6"
            required={false}
            showError={Boolean(
              showErrors && (valueErrors || generalParamError)
            )}
          >
            <FieldInput
              name={`value.${index}.dockerParams`}
              type="text"
              value={parameter.value || ""}
              autoFocus={Boolean(
                showErrors && (valueErrors || generalParamError)
              )}
            />
            <FieldError>{valueErrors}</FieldError>
          </FormGroup>
          <FormGroup hasNarrowMargins={true}>
            <DeleteRowButton onClick={onRemoveItem("dockerParams", index)} />
          </FormGroup>
        </FormRow>
      );
    });
  }

  public render() {
    const { onAddItem } = this.props;
    const paramsLines = this.getParamsInputs();

    return (
      <div className="form-section">
        {paramsLines.length > 0 ? (
          <FormRow>
            <FormGroup className="column-6 short-bottom">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans>Parameter Name</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
            </FormGroup>
            <FormGroup className="column-6 short-bottom">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans>Parameter Value</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
            </FormGroup>
            <div style={{ visibility: "hidden", height: "0" }}>
              <DeleteRowButton />
            </div>
          </FormRow>
        ) : null}
        {paramsLines}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton onClick={onAddItem("dockerParams")}>
              <Trans>Add Parameter</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

export default ParametersSection;
