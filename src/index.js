import 'bootstrap/dist/css/bootstrap.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'leaflet-draw/dist/leaflet.draw.css';
// TODO: Move import of leaflet styles here.

import { createRoot } from 'react-dom/client';

import './bootstrap-extension.css';
import './index.css';

import App from './components/main/App';
import registerServiceWorker from './registerServiceWorker';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
registerServiceWorker();
