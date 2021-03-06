import List from "#SRC/js/structs/List";
import PodInstancesRegionFilter from "../PodInstancesRegionFilter";
import InstanceUtil from "../../utils/InstanceUtil";

jest.mock("../../utils/TaskUtil");
import SearchDSL from "#SRC/resources/grammar/SearchDSL";

let thisMockItems;

describe("PodInstancesRegionFilter", () => {
  beforeEach(() => {
    InstanceUtil.getNode = (item) => item;
    thisMockItems = [
      { getRegionName: () => "region-1" },
      { getRegionName: () => "region-2" },
    ];
  });

  it("keeps tasks with specific region mentioned", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("region:region-1");

    const filters = [PodInstancesRegionFilter];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0],
    ]);
  });
});
