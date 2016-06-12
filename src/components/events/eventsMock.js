import {EventsHandler} from './eventsHandler';
export function eventsMock() {
  let data = {
    info: {name: "309370e8e48a", containers: 0, images: 0, ncpu: 0, memory: 0.0, nodeCount: 0, nodeList: []}
  };
  setInterval(() => {
    EventsHandler.dispatch(data);
  }, 3000);
}
