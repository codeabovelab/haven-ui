import {Stomp} from 'stompjs/lib/stomp.min.js';
import SockJS from 'sockjs-client';
import config from '../../../config';
import {EventsHandler} from './eventsHandler';
import {eventsMock} from './eventsMock';

function uri() {
  let url = config.eventServer;
  if (!url.startsWith('http')) {
    url = `http://${url}`;
  }
  return url;
}
export function connectEvents(store) {
  EventsHandler.setStore(store);
  let socket = new SockJS(uri());
  let stompClient = Stomp.over(socket);
  stompClient.connect({}, (frame) => {
    console.log('Connected: ' + frame);
    stompClient.subscribe('/topic/*', (msg) => {
      console.log('msg', msg.body);
      EventsHandler.dispatch(msg.body);
    });
  });
  //mock
  eventsMock(store);
}
