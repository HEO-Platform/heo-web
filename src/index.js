import React from 'react';
import App from './components/App';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import config from 'react-global-configuration';
import configuration from './config';

import './index.css';
import 'semantic-ui-css/semantic.min.css'

(function clientJS() {
    config.set(configuration);
    ReactDOM.render(
        <Router>
            <App />
        </Router>,
        document.getElementById('root')
    )
}());
