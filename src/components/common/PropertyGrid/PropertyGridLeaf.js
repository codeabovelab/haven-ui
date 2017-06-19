import React, {Component, PropTypes} from 'react';

export default class PropertyGridLeaf extends Component {
  static propTypes = {
    isRoot: React.PropTypes.bool,
    hideRoot: React.PropTypes.bool,
    level: React.PropTypes.number,
    label: React.PropTypes.string.isRequired,
    data: React.PropTypes.any
  };

  constructor(props) {
    super(props);

    this.state = {
      expanded: true // !this.props.isRoot
    };
  }

  componentDidMount() {
    this.colorOddRows();
  }

  componentDidUpdate() {
    this.colorOddRows();
  }

  getType(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  }

  isPrimitiveType(value) {
    let type = this.getType(value);
    return (type !== 'Object') && (type !== 'Array');
  }

  isObject(value) {
    return (Object.keys(value).length === 0);
  }

  onExpandCollapse() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  colorOddRows() {
    const rows = document.getElementsByClassName('pg-row');
    for (let i = 0; i < rows.length; i++) {
      const element = rows.item(i);
      if (i % 2 === 0) {
        element.classList.add('pg-colored-row');
      } else {
        element.classList.remove('pg-colored-row');
      }
    }
  }

  render() {
    let level = this.props.level || 1;

    if (level > 10) {
      console.log('Maximum depth of object structure exceeded');
      return (
        <div />
      );
    }

    let data = this.props.data;
    let type = this.getType(data);
    let typeIcon = ' ';
    if (type === 'Object') typeIcon = '{}';
    if (type === 'Array') typeIcon = '[]';

    let isPrimitive = this.isPrimitiveType(data);
    let isExpanded = this.state && this.state.expanded;
    let isHidden = false;
    let isEmpty = (typeof data === "undefined") || (data === null);

    if (this.props.isRoot === true) {
      isHidden = (this.props.hideRoot === true);
      if (isHidden) level = 0;
    }

    let value = '';
    if (this.isPrimitiveType(data)) {
      value = String(data);
    }

    let children;
    if (!isEmpty && isExpanded && !isPrimitive) {
      children = Object.keys(data).filter((key) => key.charAt(0) !== "_").map((key) => {
        return (
          <PropertyGridLeaf data={data[key]}
                            level={level + 1}
                            label={key}
                            key={key}
          />
        );
      });
    }

    return (
      <div className="pg-leaf">
        {!isHidden && (
          <div className="pg-row">
          <span className="pg-label">
            <span className={"pg-type pg-level-" + String(level) + " " + type + (isPrimitive ? "" : " pg-expandable") + (!isExpanded ? "" : " pg-collapsed")}
                  onClick={this.onExpandCollapse.bind(this)}
            />

            {this.props.label}
          </span>

            <span className="pg-value">
            {value}
          </span>
          </div>
        )}

        {children}
      </div>
    );
  }
}
