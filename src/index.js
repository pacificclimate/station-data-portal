import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
// import 'react-datepicker/dist/react-datepicker.css';
import 'leaflet-draw/dist/leaflet.draw.css'

import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './components/main/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
