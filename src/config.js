require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

const portApi = 80;
const hostApi = 'hb1.codeabovelab.com';

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  //apiHost: '178.62.246.249',
  //apiPort: 8762,
  apiHost: hostApi,
  apiPort: portApi,
  eventServer: hostApi + ':' + portApi + '/ui/stomp',
  mock: false,
  app: {
    title: 'Dockmaster',
    head: {
      titleTemplate: 'Dockmaster: %s',
      meta: [
        {charset: 'utf-8'}
      ]
    }
  }

}, environment);
