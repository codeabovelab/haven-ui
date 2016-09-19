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
      width: '0%',
      sortable: true
    },
    {
      name: 'name',
      label: 'Image Name',
      width: '50%',
      sortable: true
    },
    {
      name: 'tags',
      label: 'Downloaded Tags',
      width: '20%',
      render: this.itemsRenderFactory({
        key: "tags",
        items: (image) => image.tags
      })
    },
    {
      name: 'nodes',
      label: 'Nodes',
      width: '20%',
      render: this.itemsRenderFactory({
        key: "nodes",
        items: (image) => image.nodes.concat(image.nodes, image.nodes, image.nodes, image.nodes),
        render: (node) => (<a href="#TODO">{node}</a>)
      })
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
                  groupBySelect={GROUP_BY_SELECT}
                  hideGroupColumn
                  />
      )}
      {this.props.data && this.props.data.length === 0 && (
        <div className="alert alert-info">
          No Images yet
        </div>
      )}
      </Panel>
    );
  }

//TODO we need to declare component for this
  itemsRenderFactory(arg) {
    return (image) => {
      let first = 5;
      let items = [];
      let src = arg.items(image);
      let itemRender = arg.render || ((a) => a);
      let labelRender = (item) => (<Label bsStyle="info label-image">{itemRender(item)}</Label>);
      return (
        <td key={arg.key}>
          {src.map((item, i) => {
            if (i < first) {
              return labelRender(item);
            } else if (i >= first && i < src.length - 1) {
              items.push(item);
            } else {
              //we show last element after '...'
              return [
                <Label bsStyle="etc"><a title={items.join(', ')}>...</a></Label>,
                labelRender(item)
              ];
            }
          })}
        </td>
      );
    };
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

