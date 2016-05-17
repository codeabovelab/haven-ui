import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

export default class DockTable extends Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    groupBy: PropTypes.string
  };

  constructor(...params) {
    super(...params);
    const {rows, groupBy} = this.props;
    let groups = null;
    if (groupBy) {
      groups = _.groupBy(rows, groupBy);
      groups = _.mapValues(groups, rows => ({rows: rows, opened: true}));
    }
    this.state = {groups};
  }

  render() {
    const s = require('./DockTable.scss');
    const {groupBy} = this.props;
    return (
      <div className={"table-responsive " + s.dockTable}>
        {groupBy && this.groupsRender()}
      </div>
    );
  }

  groupsRender() {
    const {columns} = this.props;

    const groupEls = [];
    const {groups} = this.state;

    _.forOwn(groups, (group, groupName) => {
      groupEls.push(
        <tbody key={groupName}>
        <tr className="tr-group">
          <td colSpan={columns.length}>
            {group.opened && <i className="fa fa-plus" onClick={this.toggleGroup.bind(this, groupName)}/>}
            {!group.opened && <i className="fa fa-minus" onClick={this.toggleGroup.bind(this, groupName)}/>}
            {groupName} (<spanh className="text-muted">{group.rows.length} rows</spanh>)
          </td>
        </tr>
        {group.opened && group.rows.map((model, i) =>
          <tr key={i}>
            {columns.map(column =>
              <td key={column.name}>{model[column.name]}</td>
            )}
          </tr>
        )}
        </tbody>
      );
    });


    return (
      <table className="table table-bordered table-striped table-sm">
        <thead>
        <tr>{columns && columns.map(column => <th key={column.name}>{column.name}</th>)}
        </tr>
        </thead>
        {groupEls}
      </table>
    );
  }

  toggleGroup(groupName) {
    let group = this.state.groups[groupName];
    this.setState({
      ...this.state,
      groups: {...this.state.groups, [groupName]: {...group, opened: !group.opened}}
    });
  }
}
