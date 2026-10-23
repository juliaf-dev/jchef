/*
  Interpreta a URL e escolhe a tela, sem recarregar o navegador.
  Mantém as seis rotas da atividade, além de início, favoritos e sacola.
  Barras ao final do caminho são removidas antes de comparar as rotas.
 */

// Converte a localização atual em uma descrição de tela para o controller.
function resolveOriginalRoute(location) {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(location.search);
  const query = (params.get('q') || '').trim().slice(0, 120);
  const category = (params.get('categoria') || '').slice(0, 60);
  if (path === '/') return { name: 'home' };
  if (path === '/foods') return { name: 'foods', query, category };
  if (path === '/restaurants') return { name: 'restaurants', query };
  if (path === '/users') return { name: 'users', query };
  if (path === '/favoritos') return { name: 'favorites' };
  if (path === '/sacola') return { name: 'cart' };
  const match = path.match(/^\/(foods|restaurants|users)\/(\d+)$/);
  if (match) {
    return {
      name: {
        foods: 'foodDetails',
        restaurants: 'restaurantDetails',
        users: 'userDetails',
      }[match[1]],
      resource: match[1],
      id: match[2],
    };
  }
  return { name: 'notFound' };
}

export function resolveRoute(location) {
  const route = resolveOriginalRoute(location);
  return ["home","notFound","foods","restaurants","restaurantDetails","users","userDetails","foodDetails","favorites"].includes(route.name) ? route : { name: 'notFound' };
}
