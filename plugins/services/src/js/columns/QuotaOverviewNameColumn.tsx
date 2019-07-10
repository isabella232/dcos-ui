import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import { Icon, TextCell } from "@dcos/ui-kit";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import * as React from "react";
import { Link } from "react-router";

export function nameRenderer(group: ServiceGroup) {
  const serviceLink = `/services/quota/${encodeURIComponent(
    group.id.toString()
  )}`;

  return (
    <TextCell>
      <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box text-overflow">
        <span className="icon-margin-right">
          <Icon color={greyDark} shape={SystemIcons.Folder} size={iconSizeXs} />
        </span>
        <Link
          className="table-cell-value table-cell-flex-box table-cell-link-primary"
          to={serviceLink}
        >
          {group.name}
        </Link>
      </div>
    </TextCell>
  );
}