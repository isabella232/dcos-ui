import { i18nMark } from "@lingui/react";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const OrganizationPage = ({ children }) => {
  return children;
};

OrganizationPage.routeConfig = {
  label: i18nMark("Organization"),
  icon: <Icon shape={ProductIcons.UsersInverse} size={iconSizeS} />,
  matches: /^\/organization/,
};

export default OrganizationPage;
