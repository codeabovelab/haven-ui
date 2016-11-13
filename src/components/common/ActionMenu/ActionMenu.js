import React, {Component, PropTypes} from 'react';
import {Button, ButtonToolbar, DropdownButton, SplitButton, MenuItem} from 'react-bootstrap';

export default class ActionMenu extends Component {
  DEFAULT_STYLE = "info";

  static propTypes = {
    subject: PropTypes.any,
    actions: PropTypes.array,
    title: PropTypes.string,
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
    let actions = this.props.actions;
    if (actions && actions.length > 0) {
      let titleWithoutAction = this.props.title;
      if (titleWithoutAction) {
        return (
          <ButtonToolbar>
            <DropdownButton bsStyle={this.DEFAULT_STYLE}
                         title={titleWithoutAction}
                         pullRight
            >
              {this.renderItems()}
            </DropdownButton>
          </ButtonToolbar>
        );
      }
      let defaultAction = this.getDefaultAction();
      if (actions.length === 1) {
        return (
          <ButtonToolbar>
            <Button bsStyle={this.DEFAULT_STYLE}
                    disabled={defaultAction.disabled}
                    onClick={this.handleClick.bind(this, defaultAction.key, this.props.subject)}
            >
              {defaultAction.title}
            </Button>
          </ButtonToolbar>
        );
      }
      return (
          <ButtonToolbar>
            <SplitButton bsStyle={this.DEFAULT_STYLE}
                         title={defaultAction.title}
                         disabled={defaultAction.disabled}
                         onClick={this.handleClick.bind(this, defaultAction.key, this.props.subject)}
                         pullRight
            >
              {this.renderItems()}
            </SplitButton>
          </ButtonToolbar>
        );
    }

    return (
      <div />
    );
  }

  renderItems() {
    return this.props.actions.map((action, index) => {
      if (action) {
        return (
          <MenuItem key={index}
                    disabled={action.disabled}
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
    });
  }
}
