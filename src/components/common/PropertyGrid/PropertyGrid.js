import React, {Component, PropTypes} from 'react';
import PropertyGridLeaf from './PropertyGridLeaf';
//var D = React.DOM;

// var Leaf = require('./leaf');
// var leaf = React.createFactory(Leaf);
// var SearchBar = require('./search-bar');
// var searchBar = React.createFactory(SearchBar);

// var filterer = require('./filterer');
// var isEmpty = require('./is-empty');
// var lens = require('./lens');
// var noop = require('./noop');

export default class PropertyGrid extends Component {
  static propTypes = {
    data: React.PropTypes.any.isRequired,
    search: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.bool
    ]),
    onClick: React.PropTypes.func,
    isExpanded: React.PropTypes.func,
    filterOptions: React.PropTypes.object,
    query: React.PropTypes.string
  };

  getDefaultProps() {
    return {
      data: null,
      //search: searchBar,
      className: '',
      id: 'json-' + Date.now(),
      //onClick: noop,
    };
  }

  getInitialState() {
    return {
      query: this.props.query || ''
    };
  }

  render() {
    // let isQueryValid = (this.state.query !== '') && (this.props.validateQuery(this.state.query));
    //
    // let isNotFound = (
    //   isQueryValid &&
    //   isEmpty(this.props.data)
    // );

    return (
      <div className="property-grid">
        <PropertyGridLeaf data={this.props.data}
                          label="root"
                          isRoot
                          hideRoot
                          onClick={this.props.onClick}
        />
      </div>
    );

    // return D.div({ className: 'json-inspector ' + p.className },
    //   this.renderToolbar(),
    //   (
    //     isNotFound ?
    //       D.div({ className: 'json-inspector__not-found' }, 'Nothing found') :
    //       leaf({
    //         data: data,
    //         onClick: p.onClick,
    //         id: p.id,
    //         getOriginal: this.getOriginal,
    //         query: (
    //           isQueryValid ?
    //             s.query :
    //             null
    //         ),
    //         label: 'root',
    //         root: true,
    //         isExpanded: p.isExpanded,
    //         interactiveLabel: p.interactiveLabel
    //       })
    //   )
    // );
  }

  renderToolbar() {
    // var search = this.props.search;
    //
    // if (search) {
    //   return D.div({ className: 'json-inspector__toolbar' },
    //     search({
    //       onChange: this.search,
    //       data: this.props.data,
    //       query: this.state.query
    //     })
    //   );
    // }
  }

  search(query) {
    this.setState({
      query: query
    });
  }

  componentWillMount() {
    this.createFilterer(this.props.data, this.props.filterOptions);
  }

  componentWillReceiveProps(p) {
    // this.createFilterer(p.data, p.filterOptions);
    //
    // var isReceivingNewQuery = (
    //   typeof p.query === 'string' &&
    //   p.query !== this.state.query
    // );
    //
    // if (isReceivingNewQuery) {
    //   this.setState({
    //     query: p.query
    //   });
    // }
  }

  shouldComponentUpdate(p, s) {
    return (
      p.query !== this.props.query ||
      s.query !== this.state.query ||
      p.data !== this.props.data ||
      p.onClick !== this.props.onClick
    );
  }

  createFilterer(data, options) {
    // this.setState({
    //   filterer: filterer(data, options)
    // });
  }

  getOriginal(path) {
    // return lens(this.props.data, path);
  }
}
