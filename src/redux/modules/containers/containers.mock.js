import faker from 'faker';

export function containersList() {
  let data = [];

  for (let i = 0; i < 15; i++) {
    data.push(generateContainer());
  }
  return data;
}

function generateContainer() {
  let container = {
    "id": "c0d0305691e7bc0cf55ea95576f8050139008cbcd2a4ca7cbfa23fafe6f0924f",
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
