import React, {Component, PropTypes} from 'react';
import {Nav, NavItem} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';

export default class NavContainer extends Component {

  static propTypes = {
    clusterName: PropTypes.string.isRequired
  };


  render() {
    const {clusterName} = this.props;
    const nodesNavId = clusterName === "all" ? "/nodes" : "/clusters/" + clusterName + "/" + "nodes";

    return (
    <Nav bsStyle="tabs" className="dockTable-nav">
      <LinkContainer to={"/clusters/" + clusterName}>
        <NavItem eventKey={1}>Containers</NavItem>
      </LinkContainer>
      <LinkContainer to={"/clusters/" + clusterName + "/" + "services"}>
        <NavItem eventKey={2} disabled={clusterName === "all"}>Services</NavItem>
      </LinkContainer>
      <LinkContainer to={nodesNavId}>
        <NavItem eventKey={3}>Nodes</NavItem>
      </LinkContainer>
      <LinkContainer to={"/clusters/" + clusterName + "/" + "images"}>
        <NavItem eventKey={4} disabled={clusterName === "all"}>Update</NavItem>
      </LinkContainer>
      <LinkContainer to={"/clusters/" + clusterName + "/" + "events"}>
        <NavItem eventKey={5}>Events</NavItem>
      </LinkContainer>
      <LinkContainer to={"/clusters/" + clusterName + "/" + "registries"}>
        <NavItem eventKey={6} disabled={clusterName === "all"}>Registries</NavItem>
      </LinkContainer>
      <LinkContainer to={"/clusters/" + clusterName + "/" + "applications"}>
        <NavItem eventKey={7} disabled={clusterName === "all"}>Applications</NavItem>
      </LinkContainer>
      <LinkContainer to={"/clusters/" + clusterName + "/" + "networks"}>
        <NavItem eventKey={8} disabled={clusterName === "all"}>Networks</NavItem>
      </LinkContainer>
    </Nav>
    );
  }
}
