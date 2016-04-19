require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'hb1.codeabovelab.com',
  apiPort: 8761,
  app: {
    title: 'Dockmaster',
    head: {
      titleTemplate: 'Dockmaster: %s',
      meta: [
        {charset: 'utf-8'},
      ]
    }
  },

}, environment);
