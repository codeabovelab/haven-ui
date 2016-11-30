import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {login, logout} from 'redux/modules/auth/auth';
import {browserHistory} from 'react-router';

@connect(
  state => ({user: state.auth.user, auth: state.auth, loginError: state.auth.loginError}),
  {login, logout})
export default class Login extends Component {
  static propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    location: PropTypes.object,
    loginError: PropTypes.string,
    login: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired
  };

  constructor(...params) {
    super(...params);
    this.state = {
      outdatedToken: "",
    };
  }

  componentWillMount() {
    const LS_KEY = 'auth';
    const {user, logout} = this.props;
    if (!window.ls[LS_KEY] && user) {
      this.setState({
        outdatedToken: true
      });
      logout();
    }
  }

  componentDidMount() {
    this.refs.username.focus();
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const iUsername = this.refs.username;
    const username = iUsername.value;
    const iPassword = this.refs.password;
    const password = iPassword.value;
    if (username.trim() === '' || password.trim() === '' ) {
      this.refs.error.textContent = 'Please, fill username and password';
      return;
    }
    this.props.login(username, password)
      .then(() => {
        const {auth} = this.props;

        if (auth && auth.token) {
          iUsername.value = '';
          iPassword.value = '';

          if (this.state.outdatedToken) {
            browserHistory.go(-1);
          }
        }
      });
  };

  render() {
    const {user, logout, loginError} = this.props;
    let errorMessage = 'Incorrect username or password';
    if (loginError && loginError.substr(0, 13) === 'Error status:') {
      errorMessage = loginError;
    }
    return (
      <div className="loginPage">
        <div className="loginWrapper">
          <h2 className="text-lg-center"><img className="login-logo" src="/logo.png" />Haven</h2>
          <h4 className="text-xs-center">Container Management Simplified</h4>
          <div className={"container loginContainer"}>
            <Helmet title="Login"/>
            {!user &&
            <div>
              <form className="login-form" onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <input type="text" ref="username" placeholder="Enter a username"
                         className="form-control form-control-lg"/>
                </div>
                <div className="form-group">
                  <input type="password" ref="password" placeholder="Enter a password"
                         className="form-control form-control-lg"/>
                </div>
                <button className="btn btn-primary btn-lg" onClick={this.handleSubmit}><i
                  className="fa fa-sign-in"/>{' '}Log In
                </button>
              </form>
              <div ref="error" className="text-danger text-xs-center text-error">
                {!loginError && <span>&nbsp;</span>}
                {loginError && errorMessage}
              </div>
            </div>
            }
            {user &&
            <div>
              <p className="text-xs-center lead">You are currently logged in as <strong>{user.name}</strong>.</p>
              <div className="text-xs-center">
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
