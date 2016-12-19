import SockJS from 'sockjs-client';
import { Stomp } from 'stompjs/lib/stomp.min.js';
import _ from 'lodash';

import config from '../../../config';
import { ACTIONS } from '../../../redux/modules/events/actions';
import { ACTIONS as jobACTIONS } from '../../../redux/modules/jobs/actions';

export function connectWebsocketEventsListener(store) {
  let url = config.eventServer;

  // TODO: Make this configurable or maybe use HTTPS as default fallback
  if (!url.startsWith('http')) {
    url = `http://${url}`;
  }

  let state = store.getState();
  let token;
  console.log("esState: ", state);
  if (state && state.auth && state.auth.token) {
    url = `${url}?token=${state.auth.token.key}`;
  } else {
    return false;
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

  stompClient.connect(stompHeaders, (connectFrame) => {
    stompClient.send('/app/subscriptions/available');

    stompClient.subscribe('/user/queue/subscriptions/get', (message) => {
      console.log('Current subscription: ', message.body);
    });

    stompClient.subscribe('/user/queue/subscriptions/available', (message) => {
      console.log('Available channels: ', message.body);
    });

    stompClient.subscribe('/user/queue/*', (message) => {
      if (message.headers && message.body) {
        let destination = _.get(message.headers, 'destination', '').match(/[^/]+.$/g);
        let key = destination && destination[0] ? destination[0] : null;
        switch (key) {
          case 'bus.cluman.errors-stats':
            store.dispatch({
              type: ACTIONS.NEW_STAT_EVENT,
              topic: key,
              event: JSON.parse(message.body)
            });
            return;
          case 'bus.cluman.job':
            store.dispatch({
              type: jobACTIONS.JOB_EVENT,
              topic: key,
              event: JSON.parse(message.body)
            });
            return;
          default:
            return;
        }
      }
    });
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let defaultChannels = [
      {
        source: 'bus.cluman.job',
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
  }, (error) => {
  });
}
