/*
  Ponto de entrada: importa Bootstrap e os CSS separados por página.
  Monta App no root do index.html. Continue a leitura em routers/AppRouter.jsx.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/components.css';
import './styles/home.css';
import './styles/foods.css';
import './styles/restaurants.css';
import './styles/restaurant-details.css';
import './styles/not-found.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
