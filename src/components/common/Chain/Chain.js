import React, {Component, PropTypes} from 'react';
import {Button, ProgressBar} from 'react-bootstrap';

export default class Chain extends Component {
  static propTypes = {
    maxCount: PropTypes.number,
    data: PropTypes.any.isRequired,
    render: PropTypes.func
  };

  render() {
    const s = require('./Chain.scss');
    let maxCount = (this.props.maxCount || 5);
    let src = this.props.data;
    if (src instanceof Function) {
      src = src();
    }
    if (src instanceof String) {
      src = src.split(" ");
    }
    src = src || [];
    let first = maxCount >= src.length ? maxCount : maxCount - 2;
    let items = [];
    let itemRender = this.props.render || ((a) => a);
    let labelRender = (item, i) => (<Button key={"item." + i} bsStyle="info" className="spaced-items">{itemRender(item)}</Button>);
    return (
      <span className={s.chain}>
        {src.map((item, i) => {
          if (i <= first) {
            return labelRender(item, i);
          } else if (i > first && i < src.length - 1) {
            items.push(item);
          } else {
            //we show last element after '...', note that label always append to first style 'label-' prefix.
            return [
              <Button key="item.etc" className="etc spaced-items" title={items.join(', ')}>...</Button>,
              labelRender(item, i)
            ];
          }
        })}
      </span>
    );
  }
}
