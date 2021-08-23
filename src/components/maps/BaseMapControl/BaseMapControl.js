import React, { PureComponent } from 'react';
import StaticControl from '../StaticControl';
import BaseMapSelector from '../../selectors/BaseMapSelector';
import layersIcon from 'leaflet/dist/images/layers.png';
import { Button } from 'react-bootstrap';

import styles from './BaseMapControl.module.css';


export default class BaseMapControl extends PureComponent {
  state = {
    showControls: false,
  };

  handleMouseEnter = () => this.setState({ showControls: true });
  handleMouseLeave = () => this.setState({ showControls: false });

  render() {
    const { position, ...rest } = this.props;
    return (
      <StaticControl position={position}>
        <div
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {
            this.state.showControls ? (
              <div className={styles.container}>
                <BaseMapSelector {...rest}/>
              </div>
            ) : (
              <Button>
                <img src={layersIcon}/>
              </Button>
            )
          }
        </div>
      </StaticControl>
    );
  }
}
