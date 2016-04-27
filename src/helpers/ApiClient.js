import superagent from 'superagent';
import config from '../config';

const methods = ['get', 'post', 'put', 'patch', 'del'];

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  if (global.__DISABLE_SSR__ || __SERVER__) {
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
        const AUTH = 'Basic YWRtaW46cGFzc3dvcmQ=';
        request.set('Authorization', AUTH);

        if (params) {
          request.query(params);
        }

        if (data) {
          request.send(data);
        }

        request.end((err, { body } = {}) => err ? reject(body || err) : resolve(body));
      }));
  }

  /*
   * This silly function to avoid mysterious "ReferenceError: ApiClient is not defined" error.
   * See Issue #14. https://github.com/erikras/react-redux-universal-hot-example/issues/14
   *
   * Remove it at your own risk.
   */
  func() {

  }
}
