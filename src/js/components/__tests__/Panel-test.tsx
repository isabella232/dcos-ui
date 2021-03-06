import * as React from "react";
import { shallow } from "enzyme";

import Panel from "../Panel";

let thisOnClickSpy, thisInstance;

describe("Panel", () => {
  beforeEach(() => {
    thisOnClickSpy = jasmine.createSpy("onClickSpy");
    thisInstance = shallow(
      <Panel
        className="foo"
        contentClass="bar"
        footer="footer"
        footerClass="qux"
        heading="heading"
        headingClass="norf"
        onClick={thisOnClickSpy}
      >
        <div className="quis" />
      </Panel>
    );
  });

  describe("#render", () => {
    it("renders children", () => {
      expect(thisInstance.find(".quis").exists()).toBe(true);
    });

    it("renders with given className", () => {
      expect(thisInstance.prop("className")).toContain("foo");
    });

    it("overrides className to content node", () => {
      expect(thisInstance.find(".bar").prop("className")).toContain("bar");
    });

    it("uses default className to content node", () => {
      expect(
        shallow(<Panel />)
          .find(".panel-content")
          .prop("className")
      ).toContain("panel-content");
    });

    it("overrides className to footer node", () => {
      expect(thisInstance.find(".bar").prop("className")).toContain("bar");
    });

    it("uses default className to footer node", () => {
      expect(
        shallow(<Panel footer="footer" />)
          .find(".panel-footer")
          .prop("className")
      ).toContain("panel-footer");
    });

    it("does not render footer when none is given", () => {
      const panel = shallow(<Panel />);
      expect(panel.find(".panel-footer").length).toBe(0);
    });

    it("overrides className to heading node", () => {
      expect(thisInstance.find(".bar").prop("className")).toContain("bar");
    });

    it("uses default className to heading node", () => {
      expect(
        shallow(<Panel heading="heading" />)
          .find(".panel-header")
          .prop("className")
      ).toContain("panel-header");
    });

    it("does not render heading when none is given", () => {
      const panel = shallow(<Panel />);
      expect(panel.find(".panel-header").length).toBe(0);
    });

    it("is able to add an onClick to the panel node", () => {
      thisInstance.simulate("click");
      expect(thisOnClickSpy).toHaveBeenCalled();
    });
  });
});
