/*
  Configura o Vite para transformar JSX e atualizar o React no desenvolvimento.
  Os comandos dev, build e preview são definidos no package.json.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });
