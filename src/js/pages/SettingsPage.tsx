import { i18nMark } from "@lingui/react";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const SettingsPage = ({ children }) => {
  return children;
};

SettingsPage.routeConfig = {
  label: i18nMark("Settings"),
  icon: <Icon shape={ProductIcons.GearInverse} size={iconSizeS} />,
  matches: /^\/settings/,
};

export default SettingsPage;
