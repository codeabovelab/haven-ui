import SockJS from 'sockjs-client';
import { Stomp } from 'stompjs/lib/stomp.min.js';

import config from '../../../config';
import { ACTIONS } from '../../../redux/modules/events/actions';

export function connectWebsocketEventsListener(store) {
  let url = config.eventServer;

  // TODO: Make this configurable or maybe use HTTPS as default fallback
  if (!url.startsWith('http')) {
    url = `http://${url}`;
  }

  let ws = new SockJS(url);

  let stompClient = Stomp.over(ws);
  let stompHeaders = {
    login: config.eventServerLogin,
    password: config.eventServerPassword,
    'client-id': config.app.title
  };

  stompClient.connect(stompHeaders, (connectFrame) => {
    stompClient.debug = false;

    stompClient.send('/app/subscriptions/available');

    stompClient.subscribe('/user/queue/subscriptions/get', (message) => {
      console.log('Current subscription: ', message.body);
    });

    stompClient.subscribe('/user/queue/subscriptions/available', (message) => {
      console.log('Available channels: ', message.body);
    });

    stompClient.subscribe('/topic/**', (message) => {
      if (message.headers && message.body) {
        store.dispatch({
          type: ACTIONS.NEW,
          topic: message.headers.destination.replace('/topic/', ''),
          event: JSON.parse(message.body)
        });
      }
    });

    stompClient.subscribe('/user/queue/*', (message) => {
      if (message.headers && message.body) {
        store.dispatch({
          type: ACTIONS.NEW,
          topic: message.headers.destination.replace('/topic/', ''),
          event: JSON.parse(message.body)
        });
      }
    });
  });
}
