import {
  GET_AGENTS,
  AGENT_ADDED,
  AGENT_REMOVED,
} from "../../../constants/MesosStreamMessageTypes";

function processAgent(agentMessage) {
  let agent = agentMessage;

  // recovering_agents consist only of AgentInfo
  if (agentMessage.agent_info) {
    const { agent_info, ...rest } = agentMessage;
    agent = { ...agent_info, ...rest };
  }

  agent.id = agent.id.value;

  return agent;
}

export function getAgentsAction(state, message) {
  if (message.type !== GET_AGENTS) {
    return state;
  }

  const agents = Object.keys(message.get_agents).reduce(
    (acc, key) => acc.concat(message.get_agents[key].map(processAgent)),
    []
  );

  return {
    ...state,
    slaves: agents,
  };
}

export function agentAddedAction(state, message) {
  if (message.type !== AGENT_ADDED) {
    return state;
  }

  const agent = processAgent(message.agent_added.agent);

  return {
    ...state,
    slaves: [...state.slaves, agent],
  };
}

export function agentRemovedAction(state, message) {
  if (message.type !== AGENT_REMOVED) {
    return state;
  }

  const removedAgentID = message.agent_removed.agent_id.value;
  const slaves = state.slaves.filter((agent) => removedAgentID !== agent.id);

  return {
    ...state,
    slaves,
  };
}
