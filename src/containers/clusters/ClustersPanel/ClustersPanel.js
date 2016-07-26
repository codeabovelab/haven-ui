import React, {Component, PropTypes} from 'react';
import {load} from 'redux/modules/clusters/clusters';
import {connect} from 'react-redux';
import { Link } from 'react-router';
import {DockTable, ClustersList, StatisticsPanel} from '../../../components';
import {ClusterAdd} from '../../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar} from 'react-bootstrap';

@connect(
  state => ({
    clusters: state.clusters,
    clustersIds: state.clustersUI.list
  }), {load})
export default class ClustersPanel extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    clustersIds: PropTypes.array,
    load: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {load} = this.props;
    load();
    $('.input-search').focus();
  }

  render() {
    const {clusters, clustersIds} = this.props;
    const clustersList = clustersIds !== null ? clustersIds.map(id => clusters[id]) : null;

    const clustersHeaderBar = (
      <div className="clearfix">
        <h3>Clusters</h3>

        <ButtonToolbar>
          <Button
            bsStyle="primary"
            onClick={this.createCluster.bind(this)}
          >
            <i className="fa fa-plus" />&nbsp;
            New Cluster
          </Button>
        </ButtonToolbar>
      </div>
    );

    const eventsHeaderBar = (
      <div className="clearfix">
        <h3>Events</h3>
      </div>
    );

    return (
      <div>
        <StatisticsPanel>
          test
        </StatisticsPanel>

        <ClustersList loading={typeof clustersList === "undefined"}
                      data={clustersList}
                      onNewCluster={this.createCluster.bind()}
        />

        <Panel header={eventsHeaderBar}>
          {!clustersList && (
            <ProgressBar active now={100} />
          )}
        </Panel>
      </div>
    );
  }

  createCluster() {
    let contentComponent = <ClusterAdd/>;
    window.simpleModal.show({
      contentComponent,
      focus: ClusterAdd.focusSelector
    });
  }
}
