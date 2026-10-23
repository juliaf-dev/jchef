import home from '../pages/Home.html?raw';
import notFound from '../pages/NotFound.html?raw';
import foods from '../pages/Foods.html?raw';
import restaurants from '../pages/Restaurants.html?raw';
import restaurantDetails from '../pages/RestaurantDetails.html?raw';
import users from '../pages/Users.html?raw';
import userDetails from '../pages/UserDetails.html?raw';
import foodDetails from '../pages/FoodDetails.html?raw';
import favorites from '../pages/Favorites.html?raw';
import { resolveRoute } from '../routers/routes.js';
import { getCart } from '../utils/storage.js';
import { getResource, clearApiCache } from '../utils/api.js';
import { money, normalize } from '../utils/format.js';
import { setImage, syncFavoriteButtons, deliveryLabel, renderFoods, renderRestaurants, renderUsers } from './cardsController.js';
import { getFavorites, toggleFavorite } from '../utils/storage.js';
const pages = { home, notFound, foods, restaurants, restaurantDetails, users, userDetails, foodDetails, favorites };
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

function showRestaurant(restaurant, allFoods) {
    items.set(`restaurants:${restaurant.id}`, restaurant);
    find('[data-detail]').hidden = false;
    document.title = `${restaurant.name} | JChef`;
    setImage(find('[data-restaurant-image]'), restaurant.image, restaurant.name);
    find('[data-restaurant-name]').textContent = restaurant.name;
    find('[data-restaurant-description]').textContent =
      restaurant.description || 'Conheça os sabores deste restaurante.';
    find('[data-restaurant-category]').textContent =
      restaurant.category || 'Cozinha perto de você';
    find('[data-restaurant-address]').textContent =
      restaurant.address || 'Endereço não informado';
    find('[data-restaurant-facts]').textContent = [
      restaurant.rating === null ? '' : `★ ${restaurant.rating.toFixed(1)}`,
      restaurant.deliveryTime,
      deliveryLabel(restaurant),
    ]
      .filter(Boolean)
      .join(' · ');
    find('[data-favorite]').dataset.favorite = `restaurants:${restaurant.id}`;
    const related = allFoods.filter(
      (food) =>
        food.restaurantId === restaurant.id && food.source === restaurant.source,
    );
    if (!related.length) {
      find('[data-menu-note]').textContent =
        'Nenhuma comida vinculada a este restaurante foi encontrada.';
    }
    renderFoods(root, find('[data-food-grid]'), related, items);
    syncFavoriteButtons(root);
  }

function greet(user) {
    const firstName = user.name.split(' ')[0];
    root.querySelector('[data-greeting]').textContent = `Olá, ${firstName}`;
    root.querySelector('[data-avatar]').textContent = firstName.slice(0, 1);
    root.querySelector('[data-location]').textContent =
      user.address || 'Endereço não informado';
    if (find('[data-welcome]')) {
      find('[data-welcome]').textContent = `O que vamos comer hoje, ${firstName}?`;
    }
  }

function showUser(user) {
    find('[data-detail]').hidden = false;
    document.title = `${user.name} | JChef`;
    find('[data-user-name]').textContent = user.name;
    find('[data-user-avatar]').textContent = user.name.slice(0, 1).toUpperCase();
    for (const field of ['email', 'phone', 'address']) {
      find(`[data-user-${field}]`).textContent = user[field] || 'Não informado';
    }
  }

function showFood(food) {
    detailFood = food;
    detailCount = 1;
    items.set(`foods:${food.id}`, food);
    find('[data-detail]').hidden = false;
    document.title = `${food.name} | JChef`;
    setImage(find('[data-food-image]'), food.image, food.name);
    find('[data-food-name]').textContent = food.name;
    find('[data-food-category]').textContent = food.category || 'Feito para sua fome';
    find('[data-food-description]').textContent =
      food.description || 'Descrição não informada pelo restaurante.';
    find('[data-food-price]').textContent = money(food.price);
    find('[data-favorite]').dataset.favorite = `foods:${food.id}`;
    find('[data-add-detail]').disabled = !Number.isFinite(food.price);
    const restaurantLink = find('[data-food-restaurant]');
    if (food.restaurantId) {
      restaurantLink.href = `/restaurants/${food.restaurantId}`;
      restaurantLink.textContent = `${food.restaurantName || 'Ver restaurante'} ↗`;
    } else restaurantLink.hidden = true;
    syncFavoriteButtons(root);
  }

function categories(list, route) {
    const box = find('[data-categories]');
    const names = [...new Set(list.map((food) => food.category).filter(Boolean))];
    if (route.category && !names.includes(route.category)) names.push(route.category);
    for (const label of [
      'Todas',
      ...names.sort((a, b) => a.localeCompare(b, 'pt-BR')),
    ]) {
      const link = document.createElement('a');
      const params = new URLSearchParams();
      if (route.query) params.set('q', route.query);
      if (label !== 'Todas') params.set('categoria', label);
      link.href = `/foods${params.size ? `?${params}` : ''}`;
      link.dataset.route = '';
      link.textContent = label;
      const active = label === (route.category || 'Todas');
      link.className = active ? 'active' : '';
      if (active) link.setAttribute('aria-current', 'page');
      box.append(link);
    }
    find('[data-category-value]').value = route.category;
  }
async function render() {
    requestController?.abort(); requestController = new AbortController();
    const { signal } = requestController;
    const route = resolveRoute(location);
    main.innerHTML = pages[route.name]; items.clear(); detailFood = null;
    updateNavigation(); document.title = titles[route.name] + ' | JChef';
    const searchInput = find('input[name="q"]'); if (searchInput) searchInput.value = route.query || '';
    if (route.name === 'notFound') return;
    
    if (route.name === 'favorites') {
      const saved = getFavorites();
      showSource(saved);
      const foodList = saved.filter((item) => item.resource === 'foods');
      const restaurantList = saved.filter((item) => item.resource === 'restaurants');
      find('[data-saved-foods]').hidden = !foodList.length;
      find('[data-saved-restaurants]').hidden = !restaurantList.length;
      renderFoods(root, find('[data-food-grid]'), foodList, items);
      renderRestaurants(root, find('[data-restaurant-grid]'), restaurantList, items);
      if (!saved.length)
        status(
          'Sua lista está esperando novos sabores. Toque no coração de uma comida ou restaurante para salvar.',
        );
      return;
    }
    status('Carregando dados...');
    try {
      const results = [];
      const load = async (resource, id) => { const result = await getResource(resource, id, signal); results.push(result); return result.data; };
      if (route.name === 'home') {
        const foodList = await load('foods');
        const restaurantList = await load('restaurants');
        const userList = await load('users'); if (userList[0]) greet(userList[0]);
        if (signal.aborted || disposed) return;
        renderFoods(root, find('[data-food-grid]'), foodList.slice(0, 4), items);
        renderRestaurants(root, find('[data-restaurant-grid]'), restaurantList.slice(0, 4), items);
        status(foodList.length ? '' : 'Nenhum item disponível.');
      } else if (['foods', 'restaurants', 'users'].includes(route.name)) {
        const list = await load(route.name); if (signal.aborted || disposed) return;
        let filtered = list.filter(item => normalize(`${item.name} ${item.category}`).includes(normalize(route.query)));
        if (route.name === 'foods') {
          categories(list, route); filtered = filtered.filter(food => !route.category || normalize(food.category) === normalize(route.category));
          renderFoods(root, find('[data-food-grid]'), filtered, items);
        } else if (route.name === 'restaurants') renderRestaurants(root, find('[data-restaurant-grid]'), filtered, items);
        else renderUsers(root, find('[data-user-grid]'), filtered);
        find('[data-result-count]').textContent = filtered.length + ' resultados encontrados';
        status(filtered.length ? '' : 'Nenhum resultado encontrado.');
      } else {
        const record = await load(route.resource, route.id); if (signal.aborted || disposed) return;
        if (route.name === 'restaurantDetails') { const foodList = await load('foods'); if (signal.aborted || disposed) return; showRestaurant(record, foodList); }
        else if (route.name === 'userDetails') showUser(record);
        else if (route.name === 'foodDetails') showFood(record);
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
      } else if (button.hasAttribute('data-favorite')) {
        const item = items.get(button.dataset.favorite);
        if (!item) return;
        const saved = toggleFavorite(item);
        if (resolveRoute(location).name === 'favorites') render();
        else syncFavoriteButtons(root);
        toast(saved ? 'Salvo nos seus favoritos.' : 'Removido dos favoritos.');
      } else if (button.hasAttribute('data-detail-quantity')) {
        detailCount = Math.max(
          1,
          Math.min(99, detailCount + Number(button.dataset.detailQuantity)),
        );
        find('[data-detail-count]').textContent = detailCount;
      }
    } catch (error) {
      toast(error.message);
    }
  }
function onSubmit(event) {
    if (!event.target.matches('[data-search]')) return;
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const params = new URLSearchParams();
    const query = String(data.get('q') || '').trim();
    if (query) params.set('q', query);
    if (data.get('categoria')) params.set('categoria', data.get('categoria'));
    navigate(`/${form.dataset.search}${params.size ? `?${params}` : ''}`);
  }

root.addEventListener('click', onClick, eventOptions);
root.addEventListener('submit', onSubmit, eventOptions);
window.addEventListener('popstate', render, eventOptions);
window.addEventListener('storage', event => { if (!event.key || event.key.startsWith('jchef:')) render(); }, eventOptions);
render();
return () => { disposed = true; requestController?.abort(); events.abort(); clearTimeout(toastTimer); };
}
