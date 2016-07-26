import {EventsHandler} from './eventsHandler';

export function eventsMock(store) {
  let data = {
    info: {name: "309370e8e48a", containers: 0, images: 0, ncpu: 0, memory: 0.0, nodeCount: 0, nodeList: []}
  };
  setInterval(() => {
    let state = store.getState();
    if (state.auth.user) {
      let event = Object.assign({}, data);
      EventsHandler.dispatch(event);
    }
  }, 10000);
}
