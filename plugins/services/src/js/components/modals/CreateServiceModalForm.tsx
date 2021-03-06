import { Trans } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import { MountService } from "foundation-ui";
import { Hooks } from "PluginSDK";
import PropTypes from "prop-types";
import * as React from "react";

import { deepCopy, findNestedPropertyInObject } from "#SRC/js/utils/Util";
import AdvancedSection from "#SRC/js/components/form/AdvancedSection";
import AdvancedSectionContent from "#SRC/js/components/form/AdvancedSectionContent";
import AdvancedSectionLabel from "#SRC/js/components/form/AdvancedSectionLabel";
import Batch from "#SRC/js/structs/Batch";
import DataValidatorUtil from "#SRC/js/utils/DataValidatorUtil";
import ErrorMessageUtil from "#SRC/js/utils/ErrorMessageUtil";
import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import PageHeaderNavigationDropdown from "#SRC/js/components/PageHeaderNavigationDropdown";
import SplitPanel, {
  PrimaryPanel,
  SidePanel,
} from "#SRC/js/components/SplitPanel";
import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import TabView from "#SRC/js/components/TabView";
import TabViewList from "#SRC/js/components/TabViewList";
import Transaction from "#SRC/js/structs/Transaction";
import * as TransactionTypes from "#SRC/js/constants/TransactionTypes";
import FormErrorUtil, { FormError } from "#SRC/js/utils/FormErrorUtil";

import { getContainerNameWithIcon } from "../../utils/ServiceConfigDisplayUtil";
import ArtifactsSection from "../forms/ArtifactsSection";
import ContainerServiceFormSection from "../forms/ContainerServiceFormSection";
import CreateServiceModalFormUtil from "../../utils/CreateServiceModalFormUtil";
import EnvironmentFormSection from "../forms/EnvironmentFormSection";
import GeneralServiceFormSection from "../forms/GeneralServiceFormSection";
import HealthChecksFormSection from "../forms/HealthChecksFormSection";
import MultiContainerHealthChecksFormSection from "../forms/MultiContainerHealthChecksFormSection";
import MultiContainerNetworkingFormSection from "../forms/MultiContainerNetworkingFormSection";
import MultiContainerVolumesFormSection from "../forms/MultiContainerVolumesFormSection";
import MultiContainerFormAdvancedSection from "../forms/MultiContainerFormAdvancedSection";
import PlacementSection from "../forms/PlacementSection";
import NetworkingFormSection from "../forms/NetworkingFormSection";
import PodSpec from "../../structs/PodSpec";
import ServiceErrorMessages from "../../constants/ServiceErrorMessages";
import ServiceErrorPathMapping from "../../constants/ServiceErrorPathMapping";
import ServiceErrorTabPathRegexes from "../../constants/ServiceErrorTabPathRegexes";
import ServiceUtil from "../../utils/ServiceUtil";
import VolumesFormSection from "../forms/VolumesFormSection";
import ApplicationSpec from "../../structs/ApplicationSpec";
import ServiceSpec from "../../structs/ServiceSpec";

/**
 * Since the form input fields operate on a different path than the one in the
 * data, it's not always possible to figure out which error paths to unmute when
 * the field is edited. Therefore, form fields that do not map 1:1 with the data
 * are opted out from the error muting feature.
 *
 * TODO: This should be removed when DCOS-13524 is completed
 */
const CONSTANTLY_UNMUTED_ERRORS = [
  /^constraints\.[0-9]+\./,
  /^portDefinitions\.[0-9]+\./,
  /^container.docker.portMappings\.[0-9]+\./,
  /^volumes\.[0-9]+\./,
];

function cleanConfig(config) {
  const { labels = {}, env = {}, environment = {}, ...serviceConfig } = config;

  let newServiceConfig = CreateServiceModalFormUtil.stripEmptyProperties(
    serviceConfig
  );
  if (Object.keys(labels).length !== 0) {
    newServiceConfig = { labels, ...newServiceConfig };
  }
  if (Object.keys(env).length !== 0) {
    newServiceConfig = { env, ...newServiceConfig };
  }
  if (Object.keys(environment).length !== 0) {
    newServiceConfig = { environment, ...newServiceConfig };
  }

  return newServiceConfig;
}

const JSONEditor = React.lazy(
  () =>
    import(/* webpackChunkName: "jsoneditor" */ "#SRC/js/components/JSONEditor")
);

class CreateServiceModalForm extends React.Component<
  {
    activeTab?: string;
    errors: FormError[];
    expandAdvancedSettings: boolean;
    handleTabChange: (a: string) => void;
    inputConfigReducers: unknown;
    isEdit: boolean;
    isJSONModeActive: boolean;
    onChange: (s: ServiceSpec) => void;
    onConvertToPod: (spec: unknown) => void;
    onErrorsChange: (e: FormError[]) => void;
    resetExpandAdvancedSettings: () => void;
    service: ApplicationSpec;
    showAllErrors: boolean;
  },
  {
    appConfig: {} | null;
    baseConfig: unknown;
    batch: Batch;
    editedFieldPaths: string[];
    editingFieldPath: null | string;
    editorWidth?: number;
    isPod: boolean;
  }
> {
  static defaultProps = {
    errors: [],
    expandAdvancedSettings: false,
    handleTabChange() {},
    isJSONModeActive: false,
    onChange() {},
    onErrorStateChange() {},
    showAllErrors: false,
  };
  static propTypes = {
    activeTab: PropTypes.string,
    errors: PropTypes.array,
    expandAdvancedSettings: PropTypes.bool,
    handleTabChange: PropTypes.func,
    isJSONModeActive: PropTypes.bool,
    onChange: PropTypes.func,
    onErrorStateChange: PropTypes.func,
    service: PropTypes.object,
    showAllErrors: PropTypes.bool,
    resetExpandAdvancedSettings: PropTypes.func,
  };
  constructor(props) {
    super(props);

    // Hint: When you add something to the state, make sure to update the
    //       shouldComponentUpdate function, since we are trying to reduce
    //       the number of updates as much as possible.
    // In the Next line we are destructing the config to keep labels as it is and even keep labels with an empty value
    const newServiceConfig = cleanConfig(
      ServiceUtil.getServiceJSON(props.service)
    );
    this.state = {
      appConfig: null,
      batch: new Batch(),
      editedFieldPaths: [],
      editingFieldPath: null,
      ...this.getNewStateForJSON(
        newServiceConfig,
        props.service instanceof PodSpec
      ),
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    const nextJSON = ServiceUtil.getServiceJSON(nextProps.service);
    const isPod = nextProps.service instanceof PodSpec;

    // Note: We ignore changes that might derive from the `onChange` event
    // handler. In that case the contents of nextJSON would be the same
    // as the contents of the last rendered appConfig in the state.
    if (
      this.state.isPod !== isPod ||
      (!isEqual(prevJSON, nextJSON) &&
        !isEqual(this.state.appConfig, nextJSON) &&
        !isEqual(this.props.errors, nextProps.errors))
    ) {
      this.setState(this.getNewStateForJSON(nextJSON, isPod));
    }
  }

  componentDidUpdate(_, prevState) {
    const { editingFieldPath, appConfig } = this.state;
    const { onChange, service } = this.props;

    if (this.props.expandAdvancedSettings) {
      this.props.resetExpandAdvancedSettings();
    }

    const shouldUpdate =
      editingFieldPath === null &&
      (prevState.editingFieldPath !== null ||
        !isEqual(appConfig, prevState.appConfig));
    if (shouldUpdate) {
      onChange(service.constructor(appConfig));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Update if json state changed
    if (this.props.isJSONModeActive !== nextProps.isJSONModeActive) {
      return true;
    }

    // Update if showAllErrors changed
    if (this.props.showAllErrors !== nextProps.showAllErrors) {
      return true;
    }

    // Update if pod type changed
    if (this.state.isPod !== nextProps.service instanceof PodSpec) {
      return true;
    }

    // Update if service property has changed
    //
    // Note: We ignore changes that might derrive from the `onChange` event
    // handler. In that case the contents of nextJSON would be the same
    // as the contents of the last rendered appConfig in the state.
    //
    const prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    const nextJSON = ServiceUtil.getServiceJSON(nextProps.service);
    if (
      !isEqual(prevJSON, nextJSON) &&
      !isEqual(this.state.appConfig, nextJSON)
    ) {
      return true;
    }

    if (
      nextProps.expandAdvancedSettings !== this.props.expandAdvancedSettings
    ) {
      return true;
    }

    const didBaseConfigChange = this.state.baseConfig !== nextState.baseConfig;
    const didBatchChange = this.state.batch !== nextState.batch;
    const didEditingFieldPathChange =
      this.state.editingFieldPath !== nextState.editingFieldPath;
    const didActiveTabChange = this.props.activeTab !== nextProps.activeTab;

    // Otherwise update if the state has changed
    return (
      didBaseConfigChange ||
      didBatchChange ||
      didEditingFieldPathChange ||
      didActiveTabChange ||
      !isEqual(this.props.errors, nextProps.errors)
    );
  }
  getNewStateForJSON = (baseConfig = {}, isPod = this.state.isPod) => {
    const newState = { baseConfig, isPod };

    // Regenerate batch
    newState.batch = this.props
      .jsonParserReducers(deepCopy(baseConfig))
      .reduce((batch, item) => batch.add(item), new Batch());

    // Update appConfig
    newState.appConfig = this.getAppConfig(newState.batch, baseConfig);

    return newState;
  };
  handleConvertToPod = () => {
    this.props.onConvertToPod(this.getAppConfig());
  };
  handleDropdownNavigationSelection = (item) => {
    this.props.handleTabChange(item.id);
  };
  handleJSONChange = (jsonObject) => {
    this.setState(this.getNewStateForJSON(jsonObject));
  };
  handleJSONPropertyChange = (path) => {
    const { editedFieldPaths } = this.state;
    const pathStr = path.join(".");
    if (path.length === 0) {
      return;
    }

    if (!editedFieldPaths.includes(pathStr)) {
      this.setState({
        editedFieldPaths: editedFieldPaths.concat([pathStr]),
      });
    }
  };
  handleJSONErrorStateChange = (errorMessage) => {
    if (errorMessage !== null) {
      this.props.onErrorsChange([{ message: errorMessage, path: [] }]);
    } else {
      this.props.onErrorsChange([]);
    }
  };
  handleFormBlur = (event) => {
    const { editedFieldPaths } = this.state;
    const fieldName = event.target.name;
    if (!fieldName) {
      return;
    }

    const newState = { editingFieldPath: null };
    // Keep track of which fields have changed
    if (!editedFieldPaths.includes(fieldName)) {
      newState.editedFieldPaths = editedFieldPaths.concat([fieldName]);
    }
    this.setState(newState);
  };
  handleFormFocus = (event) => {
    const fieldName = event.target.getAttribute("name");
    const newState = {
      editingFieldPath: fieldName,
    };

    if (!fieldName) {
      return;
    }

    this.setState(newState);
  };

  addTransaction = (t) => {
    const batch = this.state.batch.add(t);
    this.setState({ appConfig: this.getAppConfig(batch), batch });
  };

  handleFormChange = ({ target }) => {
    if (!target.name) {
      return;
    }

    const path = target.name.split(".");
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.addTransaction(new Transaction(path, value));
  };
  handleAddItem = ({ path, value }) => {
    this.addTransaction(
      new Transaction(path.split("."), value, TransactionTypes.ADD_ITEM)
    );
  };
  handleRemoveItem = ({ path, value }) => {
    this.addTransaction(
      new Transaction(path.split("."), value, TransactionTypes.REMOVE_ITEM)
    );
  };
  handleClickItem = (item) => {
    this.props.handleTabChange(item);
  };

  getAppConfig(batch = this.state.batch, baseConfig = this.state.baseConfig) {
    // Do a deepCopy once before it goes to reducers
    // so they don't need to perform Object.assign()
    const baseConfigCopy = deepCopy(baseConfig);
    const newConfig = batch.reduce(
      this.props.jsonConfigReducers,
      baseConfigCopy
    );

    // In the Next line we are destructing the config to keep labels as it is and even keep labels with an empty value
    return cleanConfig(newConfig);
  }

  getErrors() {
    return ErrorMessageUtil.translateErrorMessages(
      this.props.errors,
      ServiceErrorMessages,
      this.props.i18n
    );
  }

  getContainerList(data) {
    if (Array.isArray(data.containers) && data.containers.length !== 0) {
      return data.containers.map((item, index) => {
        const fakeContainer = { name: item.name || `container-${index + 1}` };

        return {
          className: "text-overflow",
          id: `container${index}`,
          label: getContainerNameWithIcon(fakeContainer),
          isContainer: true,
        };
      });
    }

    return null;
  }

  getContainerContent(data, errors) {
    const { service, showAllErrors } = this.props;
    const { containers } = data;

    if (containers == null) {
      return [];
    }

    return containers.map((_, index) => {
      const artifactsPath = `containers.${index}.artifacts`;
      const artifacts = findNestedPropertyInObject(data, artifactsPath) || [];
      const artifactErrors =
        findNestedPropertyInObject(errors, artifactsPath) || [];

      return (
        <TabView key={index} id={`container${index}`}>
          <ErrorsAlert
            errors={this.getErrors()}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <Trans render="h1" className="flush-top short-bottom">
            Container
          </Trans>
          <Trans render="p">
            Configure your container below. Enter a container image or command
            you want to run.
          </Trans>
          <ContainerServiceFormSection
            data={data}
            errors={errors}
            onAddItem={this.handleAddItem}
            onRemoveItem={this.handleRemoveItem}
            path={`containers.${index}`}
            service={service}
          />

          <AdvancedSection>
            <AdvancedSectionLabel>
              <Trans render="span">More Settings</Trans>
            </AdvancedSectionLabel>
            <AdvancedSectionContent>
              <MultiContainerFormAdvancedSection
                data={data}
                path={`containers.${index}`}
              />
              <ArtifactsSection
                data={artifacts}
                path={artifactsPath}
                errors={artifactErrors}
                onRemoveItem={this.handleRemoveItem}
                onAddItem={this.handleAddItem}
              />
            </AdvancedSectionContent>
          </AdvancedSection>
        </TabView>
      );
    });
  }

  getFormDropdownList(navigationItems, activeTab, { isNested = false } = {}) {
    return navigationItems.reduce((accumulator, item, index) => {
      accumulator.push({
        className: classNames({ "page-header-menu-item-nested": isNested }),
        id: item.id,
        isActive: activeTab === item.id || (activeTab == null && index === 0),
        label: item.label,
      });

      if (item.children) {
        accumulator = accumulator.concat(
          this.getFormDropdownList(item.children, activeTab, { isNested: true })
        );
      }

      return accumulator;
    }, []);
  }

  getFormNavigationItems(appConfig, data) {
    // L10NTODO: Pluralize
    const serviceLabel =
      (findNestedPropertyInObject(appConfig, "containers.length") || 1) === 1
        ? "Service"
        : "Services";

    type Tab = {
      id: string;
      label: string;
      key?: string;
      children?: unknown;
    };
    let tabList: Tab[] = [
      {
        id: "services",
        label: serviceLabel,
        children: this.getContainerList(data),
      },
    ];

    if (this.state.isPod) {
      tabList.push(
        { id: "placement", key: "placement", label: i18nMark("Placement") },
        {
          id: "networking",
          key: "multinetworking",
          label: i18nMark("Networking"),
        },
        { id: "volumes", key: "multivolumes", label: i18nMark("Volumes") },
        {
          id: "healthChecks",
          key: "multihealthChecks",
          label: i18nMark("Health Checks"),
        },
        {
          id: "environment",
          key: "multienvironment",
          label: i18nMark("Environment"),
        }
      );
      tabList = Hooks.applyFilter(
        "createServiceMultiContainerTabList",
        tabList
      );
    } else {
      tabList.push(
        { id: "placement", key: "placement", label: i18nMark("Placement") },
        { id: "networking", key: "networking", label: i18nMark("Networking") },
        { id: "volumes", key: "volumes", label: i18nMark("Volumes") },
        {
          id: "healthChecks",
          key: "healthChecks",
          label: i18nMark("Health Checks"),
        },
        {
          id: "environment",
          key: "environment",
          label: i18nMark("Environment"),
        }
      );
      tabList = Hooks.applyFilter(
        "createServiceMultiContainerTabList",
        tabList
      );
    }

    return tabList;
  }

  getFormTabList(navigationItems) {
    if (navigationItems == null) {
      return null;
    }

    const errorsByTab = FormErrorUtil.getTopLevelTabErrors(
      this.props.errors,
      ServiceErrorTabPathRegexes,
      ServiceErrorPathMapping,
      this.props.i18n
    );

    return navigationItems.map((item) => {
      const finalErrorCount = item.isContainer
        ? findNestedPropertyInObject(
            FormErrorUtil.getContainerTabErrors(errorsByTab),
            `${item.id}.length`
          )
        : findNestedPropertyInObject(errorsByTab, `${item.id}.length`);

      return (
        <TabButton
          className={item.className}
          id={item.id}
          label={
            typeof item.label === "string" ? (
              <Trans render="span" id={item.label} />
            ) : (
              item.label
            )
          }
          key={item.key || item.id}
          count={finalErrorCount}
          showErrorBadge={Boolean(finalErrorCount) && this.props.showAllErrors}
          description={
            // TODO: pluralize
            <Trans render="span">
              {finalErrorCount} issues need addressing
            </Trans>
          }
        >
          {this.getFormTabList(item.children)}
        </TabButton>
      );
    });
  }

  getSectionContent(data, errorMap) {
    const { showAllErrors } = this.props;
    const errors = this.getErrors();

    const pluginTabProps = {
      data,
      errors,
      errorMap,
      hideTopLevelErrors: !showAllErrors,
      onAddItem: this.handleAddItem,
      onRemoveItem: this.handleRemoveItem,
      onTabChange: this.props.handleTabChange,
      pathMapping: ServiceErrorPathMapping,
    };

    if (this.state.isPod) {
      const tabs = [
        <TabView id="placement" key="placement">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <MountService.Mount
            type="CreateService:MultiContainerPlacementSection"
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          >
            <PlacementSection
              data={data}
              errors={errorMap}
              onRemoveItem={this.handleRemoveItem}
              onAddItem={this.handleAddItem}
            />
          </MountService.Mount>
        </TabView>,
        <TabView id="networking" key="multinetworking">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <MultiContainerNetworkingFormSection
            data={data}
            errors={errorMap}
            handleTabChange={this.props.handleTabChange}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          />
        </TabView>,
        <TabView id="volumes" key="multivolumes">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <MultiContainerVolumesFormSection
            data={data}
            errors={errorMap}
            handleTabChange={this.props.handleTabChange}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          />
        </TabView>,
        <TabView id="healthChecks" key="multihealthChecks">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <MultiContainerHealthChecksFormSection
            data={data}
            errors={errorMap}
            handleTabChange={this.props.handleTabChange}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          />
        </TabView>,
        <TabView id="environment" key="multienvironment">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <EnvironmentFormSection
            data={data}
            onChange={this.handleFormChange}
          />
        </TabView>,
      ];

      return Hooks.applyFilter(
        "createServiceMultiContainerTabViews",
        tabs,
        pluginTabProps
      );
    }

    const tabs = [
      <TabView id="placement" key="placement">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <MountService.Mount
          type="CreateService:PlacementSection"
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
        >
          <PlacementSection
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          />
        </MountService.Mount>
      </TabView>,
      <TabView id="networking" key="networking">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <NetworkingFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
        />
      </TabView>,
      <TabView id="volumes" key="volumes">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <VolumesFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
          onChange={this.handleFormChange}
        />
      </TabView>,
      <TabView id="healthChecks" key="healthChecks">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <HealthChecksFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
        />
      </TabView>,
      <TabView id="environment" key="environment">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <EnvironmentFormSection data={data} onChange={this.handleFormChange} />
      </TabView>,
    ];

    return Hooks.applyFilter("createServiceTabViews", tabs, pluginTabProps);
  }

  /**
   * This function filters the error list in order to keep only the
   * errors that should be displayed to the UI.
   *
   * @returns {Array} - Returns an array of errors that passed the filter
   */
  getUnmutedErrors() {
    const { showAllErrors } = this.props;
    const { editedFieldPaths, editingFieldPath } = this.state;
    const errors: FormError[] = [...this.getErrors()];

    return errors.filter((error) => {
      const errorPath = error.path.join(".");

      // Always mute the error on the field we are editing
      if (editingFieldPath != null && errorPath === editingFieldPath) {
        return false;
      }

      // Never mute fields in the CONSTANTLY_UNMUTED_ERRORS fields
      const isUnmuted = CONSTANTLY_UNMUTED_ERRORS.some((rule) =>
        rule.test(errorPath)
      );

      return isUnmuted || showAllErrors || editedFieldPaths.includes(errorPath);
    });
  }
  onEditorResize = (newSize) => {
    this.setState({ editorWidth: newSize });
  };

  render() {
    const { appConfig, batch } = this.state;
    const {
      activeTab,
      expandAdvancedSettings,
      handleTabChange,
      isEdit,
      isJSONModeActive,
      onConvertToPod,
      service,
      showAllErrors,
    } = this.props;
    const data = batch.reduce(this.props.inputConfigReducers, {});
    const unmutedErrors = this.getUnmutedErrors();
    const errors = this.getErrors();

    const errorMap = DataValidatorUtil.errorArrayToMap(unmutedErrors);
    const navigationItems = this.getFormNavigationItems(appConfig, data);
    const tabButtonListItems = this.getFormTabList(navigationItems);
    const navigationDropdownItems = this.getFormDropdownList(
      navigationItems,
      activeTab
    );

    return (
      <SplitPanel onResize={this.onEditorResize}>
        <PrimaryPanel className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
          <PageHeaderNavigationDropdown
            handleNavigationItemSelection={
              this.handleDropdownNavigationSelection
            }
            items={navigationDropdownItems}
          />
          <FluidGeminiScrollbar>
            <div className="modal-body-padding-surrogate create-service-modal-form-container">
              <form
                className="create-service-modal-form container"
                onChange={this.handleFormChange}
                onBlur={this.handleFormBlur}
                onFocus={this.handleFormFocus}
              >
                <Tabs
                  activeTab={activeTab}
                  handleTabChange={handleTabChange}
                  vertical={true}
                >
                  <TabButtonList>{tabButtonListItems}</TabButtonList>
                  <TabViewList>
                    <TabView id="services">
                      <ErrorsAlert
                        errors={errors}
                        pathMapping={ServiceErrorPathMapping}
                        hideTopLevelErrors={!showAllErrors}
                      />
                      <GeneralServiceFormSection
                        errors={errorMap}
                        expandAdvancedSettings={expandAdvancedSettings}
                        data={data}
                        isEdit={isEdit}
                        onConvertToPod={onConvertToPod}
                        service={service}
                        onRemoveItem={(options, event) => {
                          event.stopPropagation();
                          this.handleRemoveItem(options);
                        }}
                        onClickItem={this.handleClickItem}
                        onAddItem={this.handleAddItem}
                      />
                    </TabView>

                    {this.getContainerContent(data, errorMap)}
                    {this.getSectionContent(data, errorMap)}
                  </TabViewList>
                </Tabs>
              </form>
            </div>
          </FluidGeminiScrollbar>
        </PrimaryPanel>
        <SidePanel isActive={isJSONModeActive} className="jsonEditorWrapper">
          <React.Suspense fallback={<div>Loading...</div>}>
            <JSONEditor
              errors={errors}
              onChange={this.handleJSONChange}
              onPropertyChange={this.handleJSONPropertyChange}
              onErrorStateChange={this.handleJSONErrorStateChange}
              showGutter={true}
              showPrintMargin={false}
              theme="monokai"
              height="100%"
              value={appConfig}
              width={
                this.state.editorWidth ? `${this.state.editorWidth}px` : "100%"
              }
            />
          </React.Suspense>
        </SidePanel>
      </SplitPanel>
    );
  }
}

export default withI18n()(CreateServiceModalForm);
