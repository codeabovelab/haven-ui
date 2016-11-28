import config from '../config';
import SockJS from 'sockjs-client';
import {Stomp} from 'stompjs/lib/stomp.min.js';

export function connectToStomp(client, token) {
  return new Promise((resolve, reject) => {
    let stompClient = client;
    let url = config.eventServer;
    if (!url.startsWith('http')) {
      url = `http://${url}`;
    }
    if (token) {
      url = `${url}?token=${token.key}`;
    }
    let ws = new SockJS(url);
    stompClient = Stomp.over(ws);
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
      resolve(stompClient);
    }, (error) => {
      reject(error);
    });
  });
}
