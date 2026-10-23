/*
  Conecta o React ao layout HTML local e ao controller da aplicação.
  A limpeza retornada pelo controller cancela consultas e remove eventos.
  Somente HTML do próprio projeto é inserido nesta montagem.
 */
import { useEffect, useRef } from 'react';
import layout from '../pages/Layout.html?raw';
import { mountApplication } from '../controllers/appController.js';

// Monta o layout e inicia o controller quando os elementos estão disponíveis.
export default function AppRouter() {
  const root = useRef(null);
  useEffect(() => mountApplication(root.current), []);
  return (
    <div
      ref={root}
      dangerouslySetInnerHTML={{ __html: layout }}
    />
  );
}
