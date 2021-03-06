import SideTabs from "../SideTabs";

import * as React from "react";
import ReactDOM from "react-dom";

let thisTabs, thisContainer, thisInstance;

describe("SideTabs", () => {
  describe("#getTabs", () => {
    beforeEach(() => {
      thisTabs = [{ title: "Application" }, { title: "Host" }];
      thisContainer = window.document.createElement("div");
      thisInstance = ReactDOM.render(
        <SideTabs selectedTab="Application" tabs={thisTabs} />,
        thisContainer
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("returns a list item for each tab", () => {
      const node = ReactDOM.findDOMNode(thisInstance);
      const items = node.querySelectorAll("li");
      expect(items.length).toEqual(thisTabs.length);
    });

    it("renders the selected tab with the 'selected' class", () => {
      const node = ReactDOM.findDOMNode(thisInstance);
      const selectedTab = node.querySelector(".selected");

      expect(selectedTab.textContent).toEqual("Application");
    });
  });
});
