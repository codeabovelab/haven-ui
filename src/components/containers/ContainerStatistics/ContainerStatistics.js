import React, {Component, PropTypes} from 'react';
import {loadStatistics} from 'redux/modules/containers/containers';
import {connect} from 'react-redux';
import _ from 'lodash';
const GROUPS = {
  cpu: {label: "CPU (hh:mm:ss)"},
  memory: {label: "Memory"},
  network: {label: 'IO'}
};
const GROUPS_KEYS = Object.keys(GROUPS);
const GROUPS_WITH_OTHER = Object.assign({}, GROUPS, {other: {label: 'Other'}});

@connect(
  state => ({
    containers: state.containers,
    containersUI: state.containersUI
  }),
  {loadStatistics})
export default class ContainerStatistics extends Component {
  static propTypes = {
    containers: PropTypes.object.isRequired,
    containersUI: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    loadStatistics: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {container, loadStatistics} = this.props;
    loadStatistics(container);
  }

  render() {
    const {container, containers, containersUI} = this.props;
    let containerDetailed = containers[container.id];
    let loadingStatistics = _.get(containersUI, `[${container.id}].loadingStatistics`, false);
    let statistics = containerDetailed.statistics ? containerDetailed.statistics : {};
    let groups = _.groupBy(statistics, (stat) => {
      for (let name of GROUPS_KEYS) {
        if (stat.includes(name)) return name;
      }
      return 'other';
    });
    return (
      <div>
        <h5>{container.name}</h5>
        {loadingStatistics &&
        <div className="text-xs-center">
          <i className="fa fa-spinner fa-5x fa-pulse"/>
        </div>
        }
        {!loadingStatistics &&
        <div className="jumbotron-text">
          {_.values(groups, (group, key) =>
            <div key={key}>
              <h6>{GROUPS_WITH_OTHER[key].label}</h6>
            </div>
          )}
        </div>
        }
      </div>
    );
  }
}
