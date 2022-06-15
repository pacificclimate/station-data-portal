import React, {Component} from 'react';
import { Row, Col } from 'react-bootstrap';

import './Header.css';

class Header extends Component {

    render() {
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
                <Col lg={7}>
                    <h1>{process.env.REACT_APP_TITLE}</h1>
                </Col>
                <Col lg={2} className='text-right'>
                  <p>Version: {process.env.REACT_APP_VERSION}</p>
                  <p>
                    <a
                      href="https://data.pacificclimate.org/portal/docs/"
                      target="_blank"
                    >
                      User Docs
                    </a>
                  </p>
                </Col>
            </Row>
        );
    }
}

export default Header;
