import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {ActionMenu, DockTable, OnOff, Chain, ImageInfo, NodeInfo} from '../index';
import {Label, Badge, ButtonToolbar, DropdownButton, MenuItem, Panel, Popover, Button, ProgressBar, Glyphicon} from 'react-bootstrap';

export default class ImagesList extends Component {
  static propTypes = {
    data: PropTypes.array,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.bool
  };

  COLUMNS = [
    {
      name: 'registry',
      label: 'Registry Address',
      width: '0%',
      sortable: true,
      render: (img) => {
        let registry = img.registry;
        if (registry == null) return "[no registry]";
        if (registry === "") return "[docker hub]";
        return registry;
      }
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
      render: (image) => {
        let popoverRender = (img) => (
          <Popover id="image-info-popover">
            <ImageInfo imageName={img.tags.length ? (image.name + ":" + img.tags[0]) : null} imageId={img.id} />
          </Popover>
        );
        let title = (img) => `id: ${img.id}\nname: ${img.tags.map(tag => image.name + ":" + tag)}`;
        return (
          <td key="tags">
            <Chain data={image.ids || []}
              popoverPlacement="right"
              popoverRender={popoverRender}
              render={(img) => (<span title={title(img)}>{String(img.tags) || "[untagged]"}</span>)}
            />
          </td>
        );
      }
    },
    {
      name: 'nodes',
      label: 'Nodes',
      width: '20%',
      render: (image) => {
        let data = image.nodes;
        return (<td key="nodes">
          <Chain data={data}
            popoverPlacement="right"
            popoverRender={(node) => (<Popover id="node-info-popover"><NodeInfo node={node} /></Popover>)}
          />
        </td>);
      }
    },
    {
      name: 'Actions',
      width: '10%',
      render: (image) => {
        let actions = this.props.actions;
        return (<td key="actions" className="td-actions">
          <ActionMenu subject={image}
                    actions={actions.list}
                    actionHandler={actions.handler}
                    title="Delete"
          />
        </td>);
      }
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
}

