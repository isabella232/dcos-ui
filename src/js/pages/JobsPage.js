import { i18nMark } from "@lingui/react";
import React from "react";

import Icon from "../components/Icon";
import SidebarActions from "../events/SidebarActions";

class JobsPage extends React.Component {
  render() {
    return this.props.children;
  }
}

JobsPage.routeConfig = {
  label: i18nMark("Jobs"),
  icon: <Icon id="jobs-inverse" size="small" family="product" />,
  matches: /^\/jobs/
};

JobsPage.willTransitionTo = function() {
  SidebarActions.close();
};

module.exports = JobsPage;
