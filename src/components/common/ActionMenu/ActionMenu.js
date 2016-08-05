import React, {Component, PropTypes} from 'react';
import {ButtonToolbar, SplitButton, MenuItem} from 'react-bootstrap';

export default class ActionMenu extends Component {
  DEFAULT_STYLE = "info";

  static propTypes = {
    subject: PropTypes.any,
    actions: PropTypes.array,
    actionHandler: PropTypes.func
  };

  getDefaultAction() {
    let actions = this.props.actions.filter((action) => action && action.default === true);

    if (actions.length === 0) {
      return this.props.actions[0];
    }

    return actions[0];
  }

  handleClick(action, subject) {
    this.props.actionHandler(action, subject);
  }

  render() {
    if (this.props.actions && this.props.actions.length > 0) {
      let defaultAction = this.getDefaultAction();

      return (
        <ButtonToolbar>
          <SplitButton bsStyle={this.DEFAULT_STYLE}
                       title={defaultAction.title}
                       onClick={this.handleClick.bind(this, defaultAction.key, this.props.subject)}
                       pullRight
          >

            {this.props.actions.map((action, index) => {
              if (action) {
                return (
                  <MenuItem key={index}
                            onClick={this.handleClick.bind(this, action.key, this.props.subject)}
                  >
                    {action.title}
                  </MenuItem>
                );
              }

              return (
                <MenuItem key={index}
                          divider
                />
              );
            })}

          </SplitButton>
        </ButtonToolbar>
      );
    }

    return (
      <div />
    );
  }
}
