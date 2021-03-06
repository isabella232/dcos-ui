import UserStore from "../UserStore";
import AppDispatcher from "../../events/AppDispatcher";
import * as EventTypes from "../../constants/EventTypes";

import * as ActionTypes from "../../constants/ActionTypes";

describe("UserStore", () => {
  describe("dispatcher", () => {
    afterEach(() => {
      UserStore.removeAllListeners();
    });

    describe("create", () => {
      it("emits event after success event is dispatched", () => {
        UserStore.addChangeListener(EventTypes.USER_CREATE_SUCCESS, () => {
          expect(true).toEqual(true);
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_SUCCESS,
        });
      });

      it("emits success event with the userID", () => {
        UserStore.addChangeListener(
          EventTypes.USER_CREATE_SUCCESS,
          (userID) => {
            expect(userID).toEqual("foo");
          }
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_SUCCESS,
          userID: "foo",
        });
      });

      it("emits event after error event is dispatched", () => {
        UserStore.addChangeListener(EventTypes.USER_CREATE_ERROR, () => {
          expect(true).toEqual(true);
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_ERROR,
        });
      });

      it("emits success event with the userID", () => {
        UserStore.addChangeListener(
          EventTypes.USER_CREATE_ERROR,
          (errorMsg, userID) => {
            expect(userID).toEqual("foo");
          }
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_ERROR,
          userID: "foo",
        });
      });

      it("emits success event with the xhr", () => {
        UserStore.addChangeListener(
          EventTypes.USER_CREATE_ERROR,
          (errorMsg, userID, xhr) => {
            expect(xhr).toEqual({ foo: "bar" });
          }
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_ERROR,
          userID: "foo",
          xhr: { foo: "bar" },
        });
      });
    });

    describe("delete", () => {
      it("emits event after success event is dispatched", () => {
        UserStore.addChangeListener(EventTypes.USER_DELETE_SUCCESS, () => {
          expect(true).toEqual(true);
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_DELETE_SUCCESS,
        });
      });

      it("emits success event with the userID", () => {
        UserStore.addChangeListener(
          EventTypes.USER_DELETE_SUCCESS,
          (userID) => {
            expect(userID).toEqual("foo");
          }
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_DELETE_SUCCESS,
          userID: "foo",
        });
      });

      it("emits event after error event is dispatched", () => {
        UserStore.addChangeListener(EventTypes.USER_DELETE_ERROR, () => {
          expect(true).toEqual(true);
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_DELETE_ERROR,
        });
      });

      it("emits error event with the userID and error", () => {
        UserStore.addChangeListener(
          EventTypes.USER_DELETE_ERROR,
          (error, userID) => {
            expect(userID).toEqual("foo");
            expect(error).toEqual("error");
          }
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_DELETE_ERROR,
          userID: "foo",
          data: "error",
        });
      });
    });
  });
});
