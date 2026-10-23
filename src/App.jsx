/* Componente principal: encaminha a montagem do aplicativo ao AppRouter. */
import AppRouter from './routers/AppRouter.jsx';

// Inicia a estrutura que reúne layout, rotas e controllers.
export default function App() {
  return <AppRouter />;
}
