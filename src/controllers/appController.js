import home from '../pages/Home.html?raw';
import notFound from '../pages/NotFound.html?raw';
import { resolveRoute } from '../routers/routes.js';
import { getCart } from '../utils/storage.js';
const pages = { home, notFound };
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
    const route = resolveRoute(location);
    main.innerHTML = pages[route.name];
    updateNavigation();
    document.title = titles[route.name] + ' | JChef';
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
      
    } catch (error) {
      toast(error.message);
    }
  }

root.addEventListener('click', onClick, eventOptions);

window.addEventListener('popstate', render, eventOptions);

render();
return () => { disposed = true; requestController?.abort(); events.abort(); clearTimeout(toastTimer); };
}
