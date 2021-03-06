import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import { combineReducers, simpleReducer } from "#SRC/js/utils/ReducerUtil";
import ContainerUtil from "#SRC/js/utils/ContainerUtil";
import { DEFAULT_POD_CONTAINER } from "../../../constants/DefaultPod";
import { FormReducer as endpointsFormReducer } from "./Endpoints";
import { FormReducer as multiContainerArtifacts } from "./MultiContainerArtifacts";
import { FormReducer as multiContainerHealthFormReducer } from "../MultiContainerHealthChecks";
import { resourceLimitReducer } from "./resourceLimits";

const containerReducer = combineReducers({
  cpus: simpleReducer("resources.cpus"),
  mem: simpleReducer("resources.mem"),
  disk: simpleReducer("resources.disk"),
});

const limits = combineReducers({
  cpus: resourceLimitReducer("cpus", parseFloat),
  mem: resourceLimitReducer("mem"),
});

export function FormReducer(
  this: { cache: null | any[]; healthCheckState: null | any[] },
  state: any,
  { type, path, value }: { type: symbol; path: string[]; value: any }
) {
  const [, index, field, subField] = path || [];

  if (!path.includes("containers")) {
    return state;
  }

  if (this.cache == null) {
    this.cache = [];
  }

  if (this.healthCheckState == null) {
    this.healthCheckState = [];
  }

  if (!state) {
    state = [];
  }

  let newState = state.slice();
  const joinedPath = path.join(".");

  if (joinedPath === "containers") {
    switch (type) {
      case ADD_ITEM:
        const name = ContainerUtil.getNewContainerName(
          newState.length,
          newState
        );

        newState.push({
          ...DEFAULT_POD_CONTAINER,
          name,
        });
        this.cache.push({});
        break;
      case REMOVE_ITEM:
        newState = newState.filter(
          (_: unknown, itemIndex: number) => itemIndex !== value
        );
        this.cache = this.cache.filter(
          (_item, itemIndex: number) => itemIndex !== value
        );
        break;
    }

    return newState;
  }

  if (field === "endpoints") {
    if (newState[index].endpoints == null) {
      newState[index].endpoints = [];
    }

    newState[index].endpoints = endpointsFormReducer(
      newState[index].endpoints,
      { type, path, value }
    );
  }

  if (field === "healthCheck") {
    if (this.healthCheckState[index] == null) {
      this.healthCheckState[index] = {};
    }

    newState[index].healthCheck = multiContainerHealthFormReducer.call(
      this.healthCheckState[index],
      newState[index].healthCheck,
      { type, path: path.slice(3), value }
    );
  }

  if (field === "artifacts") {
    if (newState[index].artifacts == null) {
      newState[index].artifacts = [];
    }

    newState[index].artifacts = multiContainerArtifacts(
      newState[index].artifacts,
      { type, path, value }
    );
  }

  if (type === SET && joinedPath === `containers.${index}.name`) {
    newState[index].name = value;
  }

  if (type === SET && joinedPath === `containers.${index}.exec.command.shell`) {
    newState[index].exec = {
      ...newState[index].exec,
      command: { shell: value },
    };
  }

  if (type === SET && field === "resources") {
    // Do not parse numbers, as user might be in the middle of
    // entering a number. 0.0 would then equal 0, yielding it impossible to
    // enter, e.g. 0.001
    newState[index].resources = containerReducer.call(
      this.cache[index],
      newState[index].resources,
      { type, value, path: [field, subField] }
    );
  }

  if (type === SET && "limits" === field) {
    // Parse numbers
    newState[index].limits = limits.call(
      this.cache[index],
      newState[index].limits,
      { type, value, path: [field, subField] }
    );
  }

  if (type === SET && joinedPath === `containers.${index}.image.id`) {
    newState[index].image = {
      ...newState[index].image,
      id: value,
    };
  }

  if (type === SET && joinedPath === `containers.${index}.image.forcePull`) {
    newState[index].image = {
      ...newState[index].image,
      forcePull: value,
    };
  }

  return newState;
}
