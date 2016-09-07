import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import {DockTable, OnOff} from '../index';
import {Label, Badge, ButtonToolbar, SplitButton, MenuItem, Panel, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class ImagesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool
  };

  COLUMNS = [
    {
      name: 'registry',
      label: 'Registry Address',
      width: '40%',
      sortable: true
    },
    {
      name: 'name',
      label: 'Image Name',
      width: '35%',
      sortable: true
    },
    {
      name: 'tags',
      label: 'Downloaded Tags',
      width: '15%',
      render: this.tagsRender
    },
    {
      name: 'Actions',
      width: '10%',
      render: this.actionsRender
    }
  ];

  render() {
    const GROUP_BY_SELECT = ['registry', 'name'];

    const panelHeader = (
      <div className="clearfix">
        <h3>Image List</h3>
      </div>
    );

    return (
      <Panel header={panelHeader}>
        {this.props.loading && (
        <ProgressBar active now={100} />
        )}
      {(this.props.data && !this.props.loading) && (
        <DockTable columns={this.COLUMNS}
                  rows={this.props.data}
                  groupBy="registry"
                  groupBySelect={GROUP_BY_SELECT} />
      )}
      {this.props.data && this.props.data.length === 0 && (
        <div className="alert alert-info">
          No Images yet
        </div>
      )}
      </Panel>
    );
  }

  tagsRender(image) {
    let tagsList = [];
    return (
      <td key="tags">
        {image.tags.map((tag, i) => {
          if (i < 5) {
            return (<Label bsStyle="info">{tag}</Label>);
          }
          else if (i >= 5 && i < image.tags.length - 1) {
            tagsList.push(tag);
          }
          else {
            return (<a title={tagsList.join(', ')}>...</a>);
          }
        })}
      </td>
    );
  }

  actionsRender() {
    return (
      <td key="actions" className="td-actions">
      <ButtonToolbar bsStyle="default">
      <SplitButton bsStyle="info" title="Info">
      <MenuItem eventKey="1">Information</MenuItem>
      <MenuItem divider />
      <MenuItem eventKey="2">Delete</MenuItem>
      </SplitButton>
      </ButtonToolbar>
      </td>
    );
  }
}

