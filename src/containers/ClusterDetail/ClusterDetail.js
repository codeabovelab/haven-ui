import React, {Component, PropTypes} from 'react';
import {isLoaded, load as loadClusterList} from 'redux/modules/clusterList';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { Link } from 'react-router';

@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch, getState}}) => {
    if (!isLoaded(getState())) {
      return dispatch(loadClusterList());
    }
  }
}])
@connect(
  state => ({
    clusterList: state.clusterList.data,
    error: state.clusterList.error,
    loading: state.clusterList.loading
  }))
export default class ClusterList extends Component {
  static propTypes = {
    clusterList: PropTypes.array,
    error: PropTypes.string,
    loading: PropTypes.bool,
    params: PropTypes.object
  };

  render() {
    const s = require('./ClusterDetail.scss');
    const {clusterList, params} = this.props; // eslint-disable-line no-shadow
    console.log(params.name);

    return (
      <div className={"container " + s.clusterDetail}>
        <div className="">
          <h1>
            <Link to="/ClusterList">Clusters</Link> / {String(params.name)}
          </h1>
        </div>
      </div>
    );
  }
}
