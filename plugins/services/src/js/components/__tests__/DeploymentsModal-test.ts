import Item from "#SRC/js/structs/Item";
import { WrappedComponent } from "../DeploymentsModal";

import Deployment from "../../structs/Deployment";
import Application from "../../structs/Application";

const instance = new WrappedComponent();
describe("DeploymentsModal", () => {
  describe("#getRollbackModalText", () => {
    it("returns a removal message when passed a starting deployment", () => {
      let text = instance.getRollbackModalText(
        new Deployment({
          id: "deployment-id",
          affectedApps: ["app1"],
          affectedServices: [new Application({ name: "app1" })],
          steps: [{ actions: [{ type: "StartApplication" }] }],
        })
      ).props.id;
      text = text.replace(/\s{1,}/g, " ");
      expect(text).toContain("delete the affected service");
    });

    it("returns a revert message when passed a non-starting deployment", () => {
      const text = instance.getRollbackModalText(
        new Deployment({
          id: "deployment-id",
          affectedApps: ["app1"],
          affectedServices: [new Application({ name: "app1" })],
          steps: [{ actions: [{ type: "ScaleApplication" }] }],
        })
      ).props.id;
      expect(text).toContain("revert the affected service");
    });
  });

  describe("#renderStatus", () => {
    it("Returns N/A for empty Application", () => {
      const app = new Application({ deployment: {} });
      expect(instance.renderStatus(null, app, {})).toEqual("N/A");
    });

    it("Returns null for Item without getStatus function", () => {
      const item = new Item({ deployment: {} });
      expect(instance.renderStatus(null, item, {})).toEqual(null);
    });
  });
});
