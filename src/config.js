require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

const apiHost = process.env.API_HOST || typeof window !== "undefined" && window.location.host || null;

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: apiHost,
  eventServer: apiHost + '/ui/stomp',
  mock: false,
  app: {
    title: 'Haven',
    head: {
      titleTemplate: 'Haven: %s',
      meta: [
        {charset: 'utf-8'}
      ]
    }
  }

}, environment);
