import React, {Component} from 'react';
import { Grid } from 'react-bootstrap';
import { BrowserRouter as Router } from 'react-router-dom';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Route, Redirect, Switch } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import url from 'url';
import urjJoin from 'url-join';

import logger from '../../../logger';
import Header from '../Header/Header';

import VersionA from '../VersionA';
import VersionB from '../VersionB';

import './App.css';

const navSpec = [
  { label: 'Version A', path: 'A', component: VersionA },
  { label: 'Version B', path: 'B', component: VersionB },
];


export default class App extends Component {
    render() {
      const basePath = url.parse(process.env.PUBLIC_URL).pathname || '';
      return (
        <Router basename={urjJoin(basePath, '#')}>
          <div>
            <Navbar fluid>
              <Nav>
                {
                  navSpec.map(({label, path}) => (
                    <LinkContainer to={`/${path}`}>
                      <NavItem eventKey={path}>
                        {label}
                      </NavItem>
                    </LinkContainer>
                  ))
                }
              </Nav>
            </Navbar>

            <Grid fluid className="App">
                <Header/>
                <Switch>
                  {
                    navSpec.map(({path, component}) => (
                      <Route path={`/${path}`} component={component}/>
                    ))
                  }
                  <Redirect to={'/A'}/>
                </Switch>
            </Grid>
          </div>
        </Router>
        );
    }
}
