import faker from 'faker';
import {ACTIONS} from './actions';

export function load() {
  return {
    types: [ACTIONS.LOAD, ACTIONS.LOAD_SUCCESS, ACTIONS.LOAD_FAIL],
    promise: () => {
      let data = [];

      for (let i = 0; i < 25; i++) {
        data.push(generateCluster());
      }
      return () => Promise.resolve(data);
    }
  };
}

export function loadContainers(clusterId) {
  let data = [];

  for (let i = 0; i < 25; i++) {
    data.push(generateContainer());
  }

  return {
    types: [ACTIONS.LOAD_CONTAINERS, ACTIONS.LOAD_CONTAINERS_SUCCESS, ACTIONS.LOAD_CONTAINERS_FAIL],
    id: clusterId,
    promise: () => Promise.resolve(data)
  };
}

function generateCluster() {
  let container = {
    "id": faker.random.uuid(),
    "name": faker.lorem.words(),
    "containers": faker.random.number(100),
    "nodes": faker.random.number(100)
  };

  if (!container.run) {
    container.status = 'stopped';
  }

  return container;
}

function generateContainer() {
  let container = {
    "id": faker.random.uuid(),
    "name": faker.lorem.words(),
    "node": `ip-172-31-6-${faker.random.number(10)}`,
    "image": faker.random.arrayElement(["ubuntu", "centos", "elasticsearch", "nginx"]),
    "readOnly": true,
    "cluster": "all",
    "command": "/bin/bash",
    "status": `Up ${faker.random.number(100)} days`,
    "run": faker.random.arrayElement([true, true, true, true, false])
  };

  if (!container.run) {
    container.status = 'stopped';
  }

  return container;
}
