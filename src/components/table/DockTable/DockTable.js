import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

export default class DockTable extends Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    groupBy: PropTypes.string
  };

  groupByColumn;
  columns;

  constructor(...params) {
    super(...params);
    const {rows, groupBy, columns} = this.props;
    let groups = null;
    if (groupBy) {
      groups = _.groupBy(rows, groupBy);
      groups = _.mapValues(groups, rows => ({rows: rows, opened: true}));
    }
    this.columns = columns.filter(column => column.name !== groupBy);
    this.groupByColumn = columns.find(column => column.name === groupBy);
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

  static tdRender(key, model) {
    let field = model[key];
    let td = null;
    if (typeof field === 'function') {
      td = field(model);
    } else {
      td = <td key={key}>{field}</td>;
    }
    return td;
  }

  groupsRender() {
    const groupEls = [];
    const {groups} = this.state;
    let columns = this.columns;
    _.forOwn(groups, (group, groupName) => {
      groupEls.push(
        <tbody key={groupName}>
        <tr className="tr-group">
          <td colSpan={columns.length + 1}>
            {group.opened && <i className="fa fa-plus" onClick={this.toggleGroup.bind(this, groupName)}/>}
            {!group.opened && <i className="fa fa-minus" onClick={this.toggleGroup.bind(this, groupName)}/>}
            {groupName} <span className="text-muted">({group.rows.length})</span>
          </td>
        </tr>
        {group.opened && group.rows.map((model, i) =>

          <tr key={i} className="tr-value" {...model.__attributes}>
            <td/>
            {columns.map(column => DockTable.tdRender(column.name, model))}
          </tr>
        )}
        </tbody>
      );
    });


    return (
      <table className="table table-bordered table-striped table-sm">
        <thead>
        <tr>
          {this.groupByColumn && <th>{this.columnLabel(this.groupByColumn)}</th>}
          {columns && columns.map(column => <th key={column.name}>{this.columnLabel(column)}</th>)}
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

  columnLabel(column) {
    if (column.label) {
      return column.label;
    }

    return column.name[0].toUpperCase() + column.name.slice(1);
  }
}
