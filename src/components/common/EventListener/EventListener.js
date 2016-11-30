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

  let state = store.getState();
  let token;

  if (state && state.auth && state.auth.token) {
    url = `${url}?token=${state.auth.token.key}`;
  }

  let ws = new SockJS(url);
  let stompClient = Stomp.over(ws);

  let stompHeaders = {
    command: 'CONNECT',
    header: {
      'accept-version': '1.1,1.0',
      'heart-beat': '10000,10000',
      'client-id': config.app.title
    },
    body: ''
  };

  stompClient.debug = false;

  stompClient.connect({}, (connectFrame) => {
    stompClient.subscribe('/user/queue/subscriptions/get', (message) => {
      console.log('Current subscription: ', message.body);
    });

    stompClient.subscribe('/user/queue/subscriptions/available', (message) => {
      console.log('Available channels: ', JSON.parse(message.body));

      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let defaultChannels = [
        {
          source: 'bus.cluman.errors',
          historyCount: 7,
          historySince: yesterday
        },
        {
          source: 'bus.cluman.node',
          historyCount: 7,
          historySince: yesterday
        },
        {
          source: 'bus.cluman.errors-stats',
          historyCount: 7,
          historySince: yesterday
        }
      ];

      stompClient.send('/app/subscriptions/add', {}, JSON.stringify(defaultChannels));
    });

    stompClient.send('/app/subscriptions/available');

    stompClient.subscribe('/topic/**', (message) => {
      if (message.headers && message.body) {
        let destination = message.headers.destination || '';

        store.dispatch({
          type: ACTIONS.NEW,
          topic: destination.replace('/topic/', ''),
          event: JSON.parse(message.body)
        });
      }
    });

    stompClient.subscribe('/user/queue/*', (message) => {
      if (message.headers && message.body) {
        let destination = message.headers.destination || '';

        store.dispatch({
          type: ACTIONS.NEW,
          topic: destination.replace('/user/queue/', ''),
          event: JSON.parse(message.body)
        });
      }
    });
  }, (error) => {
    if (ws) {
      ws.close();
      ws = null;
    }

    // TODO: Restart connection with some delay

    console.log('Stomp Error: ', error);
  });
}
