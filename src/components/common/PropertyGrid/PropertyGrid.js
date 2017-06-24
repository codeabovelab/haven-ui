import React, {Component, PropTypes} from 'react';
import PropertyGridLeaf from './PropertyGridLeaf';

export default class PropertyGrid extends Component {
  static propTypes = {
    data: React.PropTypes.any.isRequired,
    hideRoot: React.PropTypes.bool
  };

  render() {
    return (
      <div className="property-grid">
        <div className="pg-leaf" style={{textAlign: 'center'}}>
          <span className="pg-label" style={{fontWeight: 'bold'}}>Attribute Name</span>
          <span className="pg-value" style={{fontWeight: 'bold'}}>Values</span>
        </div>
        <PropertyGridLeaf data={this.props.data}
                          label="root"
                          isRoot
                          hideRoot={this.props.hideRoot || true}
        />
      </div>
    );
  }
}
