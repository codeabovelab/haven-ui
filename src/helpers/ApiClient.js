import superagent from 'superagent';
import config from '../config';
import {browserHistory} from 'react-router';
import {replace} from 'react-router-redux';
import {logout} from 'redux/modules/auth/auth';

const methods = ['get', 'post', 'put', 'patch', 'del'];

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  if (__DISABLE_SSR__ || __SERVER__) {
    // Prepend host and port of the API server to the path.
    return 'http://' + config.apiHost + ':' + config.apiPort + adjustedPath;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  return '/api' + adjustedPath;
}

export default class ApiClient {
  constructor(req) {
    methods.forEach((method) =>
      this[method] = (path, { params, data } = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](formatUrl(path));
        this.setToken(request);
        if (params) {
          request.query(params);
        }

        if (data) {
          request.send(data);
        }

        request.end((err, response = {}) => {
          let {body} = response;
          if (err) {
            if (response && (response.status === 401 || (typeof response.status === "undefined" && typeof response.statusCode === "undefined"))) {
              this._store.dispatch(logout);
              this._store.dispatch(replace('/login'));
            }

            reject(body || err);
          } else {
            let res = body ? body : {};
            if (!(res instanceof Array)) {
              res._res = response;
            }
            resolve(res);
          }
        });
      }));
  }

  _store;

  setStore(store) {
    this._store = store;
  }

  setToken(request) {
    let auth = this._store.getState().auth;
    if (auth && auth.token) {
      request.set('X-Auth-Token', auth.token.key);
      //request.set('Authorization', auth.Authorization);
    }
  }
}
