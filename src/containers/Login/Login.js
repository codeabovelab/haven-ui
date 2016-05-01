import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import * as authActions from 'redux/modules/auth/auth';

@connect(
  state => ({user: state.auth.user, auth: state.auth}),
  authActions)
export default class Login extends Component {
  static propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const iUsername = this.refs.username;
    const username = iUsername.value;
    const iPassword = this.refs.password;
    const password = iPassword.value;
    this.props.login(username, password)
      .then(() => {
        const {auth} = this.props;
        if (auth && auth.token) {
          console.log('auth', auth.token);
        }
      });
    iUsername.value = '';
    iPassword.value = '';
  };

  render() {
    const {user, logout} = this.props;
    const s = require('./Login.scss');
    return (
      <div className={s.loginPage}>
        <div className={s.loginWrapper}>
          <div className={"container " + s.loginContainer}>
            <Helmet title="Login"/>
            <h1 className="text-xs-center">Login</h1>
            {!user &&
            <form className="login-form" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input type="text" ref="username" placeholder="Enter a username"
                       className="form-control form-control-lg"/>
              </div>
              <div className="form-group">
                <input type="password" ref="password" placeholder="Enter a password"
                       className="form-control form-control-lg"/>
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={this.handleSubmit}><i
                className="fa fa-sign-in"/>{' '}Log In
              </button>
            </form>
            }
            {user &&
            <div>
              <p>You are currently logged in as {user.name}.</p>

              <div>
                <button className="btn btn-danger" onClick={logout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
              </div>
            </div>
            }
          </div>
        </div>
      </div>
    );
  }
}
