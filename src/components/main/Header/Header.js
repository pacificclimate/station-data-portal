import React from 'react';
import { Row, Col } from 'react-bootstrap';

import './Header.css';
import config from '../../../utils/configuration';

function Header() {
  return (
      <Row className={'Header'}>
          <Col lg={3} className="text-left">
              <a href='https://pacificclimate.org/'>
                  <img
                      src={require('./logo.png')}
                      width='328'
                      height='38'
                      alt='Pacific Climate Impacts Consortium'
                  />
              </a>
          </Col>
          <Col lg={7}><h1>{config.appTitle}</h1></Col>
          <Col lg={2} className='text-right'>
            <p>Version: {config.appVersion}</p>
            {config.userDocsShowLink && (
              <p>
                <a href={config.userDocsUrl} target="_blank">
                  {config.userDocsText}
                </a>
              </p>
            )}
          </Col>
      </Row>
  );
}

export default Header;
