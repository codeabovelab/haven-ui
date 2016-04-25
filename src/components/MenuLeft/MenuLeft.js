import Radium from 'radium';
import React, {Component, PropTypes} from 'react';
import { Link } from 'react-router';
import {toggle} from 'redux/modules/menuLeft';
import { connect } from 'react-redux';

//@Radium
@connect(
  state => ({toggled: state.menuLeft.toggled}),
  {toggle}
)
export default class MenuLeft extends Component {
  static propTypes = {
    toggled: PropTypes.bool,
    toggle: PropTypes.func.isRequired
  };

  render() {
    const s = require('./MenuLeft.scss');
    const {toggled, toggle} = this.props; // eslint-disable-line no-shadow
    return (
      <div data-toggle={toggled} className={s.ml}>
        <div className={s.mlHeader}>
          <span className="pull-xs-right hidden-xs-down" onClick={toggle}><i className={'fa fa-bars ' + s['fa-bars']}/></span>
        </div>
        <div className={'nav nav-pills nav-stacked ' + s['nav-pills']}>
          <li className={'nav-item ' + s['nav-item']}>
            <Link to="/clusters" className={'nav-link ' + s['nav-link']}>Cluster List</Link>
          </li>
          <li className={'nav-item ' + s['nav-item']}>
            <Link to="" className={'nav-link ' + s['nav-link']}>Node List</Link>
          </li>
        </div>
      </div>
    );
  }
}
