import { Trans } from "@lingui/macro";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import StoreMixin from "#SRC/js/mixins/StoreMixin";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import Loader from "../../components/Loader";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import UnitHealthStore from "../../stores/UnitHealthStore";
import UnitsHealthNodeDetailPanel from "./units-health-node-detail/UnitsHealthNodeDetailPanel";
import UnitSummaries from "../../constants/UnitSummaries";

const UnitHealthNodeDetailBreadcrumbs = ({ node, unit }) => {
  const crumbs = [
    <Breadcrumb key={0} title="Components">
      <BreadcrumbTextContent>
        <Link to="/components">
          <Trans render="span">Components</Trans>
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  if (unit != null) {
    const unitTitle = unit.getTitle();

    crumbs.push(
      <Breadcrumb key={1} title={unitTitle}>
        <BreadcrumbTextContent>
          <Link to={`/components/${unit.get("id")}`}>{unitTitle}</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  if (node != null && unit != null) {
    const nodeIP = node.get("host_ip");
    const healthStatus = node.getHealth();

    crumbs.push(
      <Breadcrumb key={2} title={nodeIP}>
        <BreadcrumbTextContent>
          <Link to={`/components/${unit.get("id")}/nodes/${nodeIP}`}>
            {`${nodeIP} `}
            <span className={healthStatus.classNames}>
              ({healthStatus.title})
            </span>
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Components}
      breadcrumbs={crumbs}
    />
  );
};

class UnitsHealthNodeDetail extends mixin(StoreMixin) {
  state = {
    hasError: false,
    isLoadingUnit: true,
    isLoadingNode: true,
  };

  // prettier-ignore
  store_listeners = [
      {name: "unitHealth", events: ["unitSuccess", "unitError", "nodeSuccess", "nodeError"], suppressUpdate: true}
    ];

  componentDidMount(...args) {
    super.componentDidMount(...args);
    const { unitID, unitNodeID } = this.props.params;

    UnitHealthStore.fetchUnit(unitID);
    UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
  }

  onUnitHealthStoreUnitSuccess() {
    this.setState({ isLoadingUnit: false });
  }

  onUnitHealthStoreUnitError() {
    this.setState({ hasError: true });
  }

  onUnitHealthStoreNodeSuccess() {
    this.setState({ isLoadingNode: false });
  }

  onUnitHealthStoreNodeError() {
    this.setState({ hasError: true });
  }

  render() {
    const { unitID, unitNodeID } = this.props.params;

    const node = UnitHealthStore.getNode(unitNodeID);
    const unit = UnitHealthStore.getUnit(unitID);

    const { hasError, isLoadingNode, isLoadingUnit } = this.state;

    if (hasError) {
      return (
        <div className="pod">
          <RequestErrorMsg />
        </div>
      );
    }

    if (isLoadingNode || isLoadingUnit) {
      return <Loader />;
    }

    const unitSummary = UnitSummaries[unit.get("id")] || {};
    const unitDocsURL =
      unitSummary.getDocumentationURI && unitSummary.getDocumentationURI();

    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <UnitHealthNodeDetailBreadcrumbs node={node} unit={unit} />
          }
        />

        <UnitsHealthNodeDetailPanel
          routes={this.props.routes}
          params={this.props.params}
          docsURL={unitDocsURL}
          hostIP={node.get("host_ip")}
          output={node.getOutput()}
          summary={unitSummary.summary}
        />
      </Page>
    );
  }
}
export default UnitsHealthNodeDetail;
