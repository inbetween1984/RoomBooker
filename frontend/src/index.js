import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';


export const API_URL = "http://127.0.0.1:8000/api/rooms/"
export const PAY_URL = "http://127.0.0.1:8000/api/"


const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <App/>
);



