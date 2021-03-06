import * as React from "react";

import { mount } from "enzyme";
import renderer from "react-test-renderer";
import Config from "#SRC/js/config/Config";

jest.mock("../../../utils/ScrollbarUtil");
jest.mock("../../../components/Page", () => {
  const Page = ({ children }) => <div>{children}</div>;
  Page.Header = ({ children }) => <div>{children}</div>;

  return Page;
});

// Setting useFixtures for when we load CosmosPackagesStore/CosmosPackageActions

const configUseFixtures = Config.useFixtures;
Config.useFixtures = true;
const CosmosPackagesStore = require("../../../stores/CosmosPackagesStore")
  .default;
Config.useFixtures = configUseFixtures;

const PackagesTab = require("../PackagesTab").default;
const UniversePackagesList = require("../../../structs/UniversePackagesList")
  .default;

let thisInstance,
  thisCosmosPackagesStoreGetAvailablePackages,
  thisPackages,
  thisGetAvailablePackages,
  thisFetchAvailablePackages;
describe("PackagesTab", () => {
  beforeEach(() => {
    thisInstance = mount(<PackagesTab />);
  });

  describe("#handleDetailOpen", () => {
    beforeEach(() => {
      thisInstance.instance().handleDetailOpen = jasmine.createSpy(
        "handleDetailOpen"
      );
      jest.runAllTimers();
    });

    it("calls handler when panel is clicked", () => {
      thisInstance.setState({ loading: false });
      thisInstance.find(".panel.clickable").at(0).simulate("click");

      expect(
        thisInstance
          .instance()
          .handleDetailOpen.calls.mostRecent()
          .args[0].get("name")
      ).toEqual("arangodb3");
    });
  });

  describe("#getPackageGrid", () => {
    beforeEach(() => {
      thisCosmosPackagesStoreGetAvailablePackages =
        CosmosPackagesStore.getAvailablePackages;
      thisPackages = CosmosPackagesStore.getAvailablePackages();
    });

    afterEach(() => {
      CosmosPackagesStore.getAvailablePackages = thisCosmosPackagesStoreGetAvailablePackages;
    });

    it("returns packages", () => {
      expect(
        thisInstance.instance().getPackageGrid(thisPackages).length
      ).toEqual(97);
    });

    it("doesn't return packages", () => {
      CosmosPackagesStore.getAvailablePackages = () =>
        new UniversePackagesList();

      const packages = CosmosPackagesStore.getAvailablePackages();
      expect(thisInstance.instance().getPackageGrid(packages).length).toEqual(
        0
      );
    });
  });

  describe("with empty state", () => {
    beforeEach(() => {
      thisGetAvailablePackages = CosmosPackagesStore.getAvailablePackages;
      thisFetchAvailablePackages = CosmosPackagesStore.fetchAvailablePackages;
      CosmosPackagesStore.getAvailablePackages = () =>
        new UniversePackagesList();
      CosmosPackagesStore.fetchAvailablePackages = () => {};
    });

    afterEach(() => {
      CosmosPackagesStore.getAvailablePackages = thisGetAvailablePackages;
      CosmosPackagesStore.fetchAvailablePackages = thisFetchAvailablePackages;
    });

    it("displays AlertPanel with action to Package Repositories", () => {
      thisInstance = renderer.create(<PackagesTab />);
      thisInstance.getInstance().onCosmosPackagesStoreAvailableSuccess();

      const tree = thisInstance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe("with packages on the list", () => {
    it("displays the catalog with packages", () => {
      thisInstance = renderer.create(<PackagesTab />);
      thisInstance.getInstance().onCosmosPackagesStoreAvailableSuccess();

      const tree = thisInstance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
