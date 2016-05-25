import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

export default class DockTable extends Component {
  static propTypes = {
    title: PropTypes.string,
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    groupBy: PropTypes.string
  };


  //general
  total = 0; // before filtering
  pagesTotal = 0; // before filtering
  groupByColumn;
  pageSize = 10;


  //after filtering and sorting
  query = "";
  filteredTotal = 0;
  groups;
  columns;
  pagesNumber = 1;

  //for current page
  currentGroups = [];

  //noinspection JSDuplicatedDeclaration
  constructor(...params) {
    super(...params);
    this.state = {
      pageCurrent: 1,
      groupsState: {},
      closedGroups: {},
      query: ""
    };

    const {rows, groupBy, columns} = this.props;
    this.columns = columns.filter(column => column.name !== groupBy);
    this.groupByColumn = columns.find(column => column.name === groupBy);
    this.total = rows.length;
    this.pagesTotal = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.applyFilteringAndSorting();
  }

  render() {
    if (this.query !== this.state.query) {
      this.applyFilteringAndSorting();
    }
    const s = require('./DockTable.scss');
    const {groupBy, title} = this.props;
    return (
      <div className={s.dockTable}>
        <div className="docktable-header">
          <h2>{title}</h2>
          <input className="form-control form-control-sm input-search" onChange={this.queryChange.bind(this)}
                 placeholder="Search"/>
        </div>
        <div className="table-responsive">
          {groupBy && this.groupsRender()}
        </div>
        {this.renderPagination()}
      </div>
    );
  }

  groupsRender() {
    const {closedGroups} = this.state;
    const groupEls = [];
    let columns = this.columns;
    this.currentGroups.forEach(group => {
      let closed = _.get(closedGroups, group.key, false);
      if (group.rows.length === 1) {
        let model = group.rows[0];
        groupEls.push(
          <tbody key={group.key}>
          <tr className="tr-value tr-single-value" {...model.__attributes}>
            {DockTable.tdRender(this.groupByColumn.name, model)}
            {columns.map(column => DockTable.tdRender(column.name, model))}
          </tr>
          </tbody>);
      } else {
        groupEls.push(
          <tbody key={group.key}>
          <tr className="tr-group">
            <td colSpan={columns.length + 1}>
              <span className="group-title" onClick={this.toggleGroup.bind(this, group.key)}>
              {!closed && <i className="fa fa-minus"/>}
                {closed && <i className="fa fa-plus"/>}
                {group.key}
              </span>
              <span className="text-muted">{' '}({group.rows.length})</span>
            </td>
          </tr>
          {!closed && group.currentRows.map((model, i) =>
            <tr key={i} className="tr-value" {...model.__attributes}>
              <td/>
              {columns.map(column => DockTable.tdRender(column.name, model))}
            </tr>
          )}
          </tbody>
        );
      }
    });


    return (
      <table className="table table-bordered table-striped table-sm">
        <thead>
        <tr>
          {this.groupByColumn && <th>{DockTable.columnLabel(this.groupByColumn)}</th>}
          {columns && columns.map(column => <th className="sorting"
                                                key={column.name}>{DockTable.columnLabel(column)}</th>)}
        </tr>
        </thead>
        {groupEls}
      </table>
    );
  }

  applyFilteringAndSorting() {
    const {rows, groupBy, columns} = this.props;
    let columnNames = columns.map(column => column.name);
    this.query = this.state.query;
    let filteredRows = this.filterRows(this.query, rows, columnNames);
    this.filteredTotal = filteredRows.length;
    let groups = null;
    if (groupBy) {
      groups = _.groupBy(filteredRows, groupBy);
      groups = _.mapValues(groups, (rows, key) => ({rows: rows, opened: true, key: key}));
    }
    this.groups = groups;
    this.pagesNumber = Math.max(1, Math.ceil(filteredRows.length / this.pageSize));
    this.generateCurrentGroups();
  }

  generateCurrentGroups(page = null) {
    const pageCurrent = page ? page : this.state.pageCurrent;
    this.currentGroups = [];
    if (this.groups.length === 0) {
      return;
    }
    let groups = [];
    //to save order of properties use _.forOwn instead _.values
    _.forOwn(this.groups, (group, key) => groups.push(group));
    let toSkip = this.pageSize * (pageCurrent - 1);
    let skipped = 0;
    let i = 0;
    //wholes group to skip
    while ((groups.length > i) && (skipped + groups[i].rows.length <= toSkip)) {
      skipped += groups[i].rows.length;
      i++;
    }

    let leftToSkip = toSkip - skipped;
    let leftToAdd = this.pageSize;
    //group that was split between two pages
    if ((groups.length > i) && (leftToSkip > 0)) {
      let group = {...groups[i]};
      group.currentRows = group.rows.slice(leftToSkip, leftToSkip + leftToAdd);
      leftToAdd -= group.currentRows.length;
      this.currentGroups.push(group);
      i++;
    }
    while ((groups.length > i) && leftToAdd && groups[i].rows.length <= leftToAdd) {
      let group = {...groups[i]};
      group.currentRows = group.rows;
      this.currentGroups.push(group);
      leftToAdd -= group.currentRows.length;
      i++;
    }

    //group that was split between two pages
    if ((groups.length > i) && leftToAdd) {
      let group = {...groups[i]};
      group.currentRows = group.rows.slice(-leftToAdd);
      this.currentGroups.push(group);
    }
  }

  toggleGroup(groupName) {
    let closed = _.get(this.state.closedGroups, groupName, false);
    this.setState({
      ...this.state,
      closedGroups: {...this.state.closedGroups, [groupName]: !closed}
    });
  }

  static columnLabel(column) {
    if (column.label) {
      return column.label;
    }

    return column.name[0].toUpperCase() + column.name.slice(1);
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

  renderPagination() {
    const {pageCurrent} = this.state;
    const MAX_PAGES_LINKS = 5;

    if (this.pagesTotal <= 1) {
      return <div></div>;
    }
    let from = (pageCurrent - 1) * this.pageSize + 1;
    let to = Math.min(pageCurrent * this.pageSize, this.filteredTotal);
    let pagesLinks = Math.min(this.pagesNumber, MAX_PAGES_LINKS);

    let pagesNumbers = new Array(pagesLinks); // 3, 4, 5, 6, 7
    //Math.floor((pagesLinks - 1) / 2) - left center eq to this.page.Current
    let startPage = Math.max(1, pageCurrent - Math.floor((pagesLinks - 1) / 2));
    for (let i = 0; i < pagesLinks; i++) {
      pagesNumbers[i] = startPage + i;
    }

    pagesNumbers = pagesNumbers.filter(pageNumber => pageNumber <= this.pagesNumber);
    while ((pagesNumbers.length < MAX_PAGES_LINKS) && (pagesNumbers[0] > 1)) {
      //if array is small like 5,6,7 - let's add few more links at start
      pagesNumbers.unshift(pagesNumbers[0] - 1);
    }

    return (
      <div className="pagination-wrapper">
        <div className="pagination-showing text-muted">
          {pagesNumbers.length > 1 && <span>Showing {from} to {to} of {this.filteredTotal} entries</span>}
          {pagesNumbers.length === 1 && <span>Showing {this.filteredTotal} entries</span>}
        </div>
        <nav>
          <ul className="pagination">
            <li className={"page-item " + (pageCurrent === 1 ? 'disabled' : '')}>
              <a className="page-link" onClick={this.changePage.bind(this, pageCurrent - 1)} aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
                <span className="sr-only">Previous</span>
              </a>
            </li>
            {pagesNumbers.map(pageNumber => {
              return (
                <li className={"page-item " + (pageCurrent === pageNumber ? 'active' : '')} key={pageNumber}>
                  <a className="page-link" onClick={this.changePage.bind(this, pageNumber)}>{pageNumber}</a>
                </li>
              );
            })}
            <li className={"page-item " + (pageCurrent === this.pagesNumber ? 'disabled' : '')}>
              <a className="page-link" onClick={this.changePage.bind(this, pageCurrent + 1)} aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
                <span className="sr-only">Next</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }

  changePage(pageNumber) {
    if ((pageNumber < 1) || (this.state.pageCurrent === pageNumber) || (pageNumber > this.pagesNumber)) {
      return;
    }

    this.setState({
      ...this.state,
      pageCurrent: pageNumber
    });
    this.generateCurrentGroups(pageNumber);
  }

  queryChange(e) {
    let query = e.target.value;
    this.setState({
      ...this.state,
      query
    });
  }

  filterRows(query, rows, columnsNames) {
    if (!query) {
      return rows;
    }
    let q = query.toLowerCase();

    return rows.filter(row => {
      let data = _.pick(row, columnsNames);
      for (let fieldName in data) {
        if (data.hasOwnProperty(fieldName)) {
          let fieldValue = data[fieldName];
          if (fieldValue != null) {
            fieldValue = fieldValue.toString().toLowerCase();
            if (fieldValue.includes(q)) return true;
          }
        }
      }
      return false;
    });
  }
}
