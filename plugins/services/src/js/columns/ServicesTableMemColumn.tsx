import * as React from "react";
import { Trans } from "@lingui/macro";
import { NumberCell, Tooltip } from "@dcos/ui-kit";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Units from "#SRC/js/utils/Units";
import { getResourceLimits } from "./resourceLimits";

export const ServiceMem = React.memo(
  ({
    resource,
    limit,
  }: {
    resource: string;
    limit?: number | string;
    id: string;
  }) => {
    if (limit != null && limit !== 0 && limit !== resource) {
      return (
        <NumberCell>
          <Tooltip
            id={`mem{id}`}
            trigger={Units.formatResources("mem", resource, limit)}
            maxWidth={150}
          >
            <Trans
              id="{resource} are being guaranteed with a limit of {limit}"
              render="span"
              values={{
                resource: Units.formatResource("mem", resource),
                limit: Units.formatResource("mem", limit),
              }}
            />
          </Tooltip>
        </NumberCell>
      );
    }
    return (
      <NumberCell>
        <span>{Units.formatResource("mem", resource)}</span>
      </NumberCell>
    );
  }
);

type TreeItem = Service | Pod | ServiceTree;
export const memRenderer = (service: TreeItem): React.ReactNode => (
  <ServiceMem
    id={service.getId()}
    resource={service.getResources().mem}
    limit={getResourceLimits(service, true).mem}
  />
);
