import CliInstallModal from "../CliInstallModal";

import * as React from "react";
import ReactDOM from "react-dom";

// Set a new Getter. Navigator doesn't have a Setter.
function setUserAgent(agent) {
  window.navigator.__defineGetter__("userAgent", () => agent);
}

let thisCallback,
  thisContainer,
  thisInstance,
  thisContainer1,
  thisContainer2,
  thisInstance1,
  thisInstance2;

describe("CliInstallModal", () => {
  describe("#onClose", () => {
    beforeEach(() => {
      thisCallback = jasmine.createSpy();
      thisContainer = window.document.createElement("div");
      thisInstance = ReactDOM.render(
        <CliInstallModal onClose={thisCallback} showFooter={false} title="" />,
        thisContainer
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer);
    });

    it("doesn't call the callback after initialization", () => {
      expect(thisCallback).not.toHaveBeenCalled();
    });

    it("calls the callback when #onClose is called", () => {
      thisInstance.onClose();
      expect(thisCallback).toHaveBeenCalled();
    });
  });

  describe("#getCliInstructions", () => {
    beforeEach(() => {
      thisContainer1 = window.document.createElement("div");
      thisContainer2 = window.document.createElement("div");
      setUserAgent(
        "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)"
      );
      thisInstance1 = ReactDOM.render(
        <CliInstallModal onClose={() => {}} showFooter={false} title="" />,
        thisContainer1
      );
      setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36"
      );
      thisInstance2 = ReactDOM.render(
        <CliInstallModal onClose={() => {}} showFooter={false} title="" />,
        thisContainer2
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(thisContainer1);
      ReactDOM.unmountComponentAtNode(thisContainer2);
    });

    it("it returns different data depending on OS", () => {
      const firstCall = thisInstance1.getCliInstructions();
      const secondCall = thisInstance2.getCliInstructions();

      expect(firstCall).not.toEqual(secondCall);
    });
  });
});
