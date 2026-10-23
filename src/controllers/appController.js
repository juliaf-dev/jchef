import home from '../pages/Home.html?raw';
import notFound from '../pages/NotFound.html?raw';
import foods from '../pages/Foods.html?raw';
import { resolveRoute } from '../routers/routes.js';
import { getCart } from '../utils/storage.js';
import { getResource, clearApiCache } from '../utils/api.js';
import { money, normalize } from '../utils/format.js';
import { setImage, syncFavoriteButtons, deliveryLabel, renderFoods } from './cardsController.js';
const pages = { home, notFound, foods };
const titles = {
  home: 'Sabor que chega até você',
  foods: 'Descubra comidas',
  restaurants: 'Restaurantes',
  users: 'Perfis',
  favorites: 'Seus favoritos',
  cart: 'Sua sacola',
  foodDetails: 'Detalhes da comida',
  restaurantDetails: 'Detalhes do restaurante',
  userDetails: 'Perfil',
  notFound: 'Página não encontrada',
};
export function mountApplication(root) {
  const main = root.querySelector('#main');
  const items = new Map();
  const events = new AbortController();
  const eventOptions = { signal: events.signal };
  let requestController;
  let toastTimer;
  let detailFood;
  let detailCount = 1;
  let disposed = false;
  const find = (selector) => main.querySelector(selector);

  // Muda a URL sem recarregar e recoloca o foco no conteúdo principal.
  function navigate(url) {
    history.pushState(null, '', url);
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.focus({ preventScroll: true });
  }

function toast(message) {
    const box = root.querySelector('[data-toast]');
    box.textContent = message;
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      box.hidden = true;
    }, 3500);
  }

function updateNavigation() {
    const route = resolveRoute(location);
    const active =
      route.name === 'home'
        ? '/'
        : route.name.includes('restaurant')
          ? '/restaurants'
          : route.name.includes('food')
            ? '/foods'
            : route.name.includes('user')
              ? '/users'
              : route.name === 'favorites'
                ? '/favoritos'
                : '/sacola';
    root.querySelectorAll('nav a').forEach((link) => {
      const selected = link.pathname === active;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    root
      .querySelectorAll('[data-cart-count]')
      .forEach((label) => (label.textContent = count));
  }

function status(message, retry = false) {
    const box = find('[data-status]');
    if (!box) return;
    box.replaceChildren();
    box.className = message ? 'status-box' : '';
    if (!message) return;
    const text = document.createElement('p');
    text.textContent = message;
    box.append(text);
    if (retry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-outline-danger btn-sm';
      button.dataset.retryApi = '';
      button.textContent = 'Tentar novamente';
      box.append(button);
    }
  }

function showSource(results) {
    const usedDemo = results.some((result) => result.source === 'demo');
    const banner = root.querySelector('[data-demo-banner]');
    banner.hidden = !usedDemo;
  }
async function render() {
    requestController?.abort(); requestController = new AbortController();
    const { signal } = requestController;
    const route = resolveRoute(location);
    main.innerHTML = pages[route.name]; items.clear(); detailFood = null;
    updateNavigation(); document.title = titles[route.name] + ' | JChef';
    const searchInput = find('input[name="q"]'); if (searchInput) searchInput.value = route.query || '';
    if (route.name === 'notFound') return;
    
    
    status('Carregando dados...');
    try {
      const results = [];
      const load = async (resource, id) => { const result = await getResource(resource, id, signal); results.push(result); return result.data; };
      if (route.name === 'home') {
        const foodList = await load('foods');
        
        
        if (signal.aborted || disposed) return;
        renderFoods(root, find('[data-food-grid]'), foodList.slice(0, 4), items);
        find('[data-restaurant-grid]').closest('section').hidden = true;
        status(foodList.length ? '' : 'Nenhum item disponível.');
      } else if (['foods', 'restaurants', 'users'].includes(route.name)) {
        const list = await load(route.name); if (signal.aborted || disposed) return;
        let filtered = list;
        if (route.name === 'foods') {
          
          renderFoods(root, find('[data-food-grid]'), filtered, items);
        } 
        
        find('[data-result-count]').textContent = filtered.length + ' resultados encontrados';
        status(filtered.length ? '' : 'Nenhum resultado encontrado.');
      } else {
        const record = await load(route.resource, route.id); if (signal.aborted || disposed) return;
        
        
        
        status('');
      }
      if (!signal.aborted && !disposed) showSource(results);
    } catch (error) { if (!signal.aborted && !disposed) status(error.message, true); }
  }
function onClick(event) {
    const target = event.target;
    const link = target.closest('a[data-route]');
    if (
      link &&
      event.button === 0 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      navigate(link.href);
      return;
    }
    const button = target.closest('button');
    if (!button || button.disabled) return;
    try {
      if (button.hasAttribute('data-retry-api')) {
        clearApiCache();
        render();
      }
    } catch (error) {
      toast(error.message);
    }
  }

root.addEventListener('click', onClick, eventOptions);

window.addEventListener('popstate', render, eventOptions);

render();
return () => { disposed = true; requestController?.abort(); events.abort(); clearTimeout(toastTimer); };
}
