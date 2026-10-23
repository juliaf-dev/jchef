/*
  Cria cards a partir dos templates locais de Layout.html.
  Dados externos entram por textContent e URLs validadas, nunca como HTML.
  Mantém o visual compartilhado entre início, listas, detalhes e favoritos.
 */
import { getFavorites } from '../utils/storage.js';
import { money, excerpt, safeImage } from '../utils/format.js';

// Preenche uma foto ou a substitui por uma imagem local em caso de falha.
export function setImage(image, value, label, fallback = '/images/marmita.jpg') {
  image.alt = label;
  const url = safeImage(value);
  image.src = url || fallback;
  if (!url) image.alt = `${label} — imagem ilustrativa`;
  image.onerror = () => {
    image.onerror = null;
    image.src = fallback;
    image.alt = `${label} — imagem ilustrativa`;
  };
}

// Sincroniza cada coração com a lista persistida no navegador.
export function syncFavoriteButtons(root) {
  const saved = new Set(getFavorites().map((item) => `${item.resource}:${item.id}`));
  root.querySelectorAll('[data-favorite]').forEach((button) => {
    const selected = saved.has(button.dataset.favorite);
    button.textContent = selected ? '♥' : '♡';
    button.classList.toggle('saved', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute(
      'aria-label',
      selected ? 'Remover dos favoritos' : 'Salvar nos favoritos',
    );
  });
}

// Retorna a taxa apenas quando esse valor existe nos dados.
export function deliveryLabel(restaurant) {
  return restaurant.deliveryFee === 0
    ? 'Entrega grátis'
    : Number.isFinite(restaurant.deliveryFee)
      ? `Entrega ${money(restaurant.deliveryFee)}`
      : 'Consulte a entrega';
}

// Clona e preenche os cards de alimentos, registrando ações por ID.
export function renderFoods(root, grid, foods, items) {
  grid.replaceChildren();
  foods.forEach((food) => {
    items.set(`foods:${food.id}`, food);
    const card = root.querySelector('#food-card-template').content.cloneNode(true);
    const url = `/foods/${food.id}`;
    card.querySelector('.photo-link').href = url;
    const link = card.querySelector('[data-food-link]');
    link.href = url;
    link.textContent = food.name;
    setImage(card.querySelector('img'), food.image, food.name);
    card.querySelector('[data-favorite]').dataset.favorite = `foods:${food.id}`;
    card.querySelector('[data-restaurant-name]').textContent =
      food.restaurantName || food.category || 'Escolha do cardápio';
    card.querySelector('.card-description').textContent = excerpt(food.description);
    card.querySelector('.price').textContent = money(food.price);
    const button = card.querySelector('[data-add]');
    button.dataset.add = food.id;
    button.disabled = !Number.isFinite(food.price);
    button.setAttribute('aria-label', `Adicionar ${food.name} à sacola`);
    grid.append(card);
  });
  syncFavoriteButtons(root);
}

// Clona cards de restaurantes com avaliação e prazo somente se disponíveis.
export function renderRestaurants(root, grid, restaurants, items) {
  grid.replaceChildren();
  restaurants.forEach((restaurant) => {
    items.set(`restaurants:${restaurant.id}`, restaurant);
    const card = root
      .querySelector('#restaurant-card-template')
      .content.cloneNode(true);
    card
      .querySelectorAll('a')
      .forEach((link) => (link.href = `/restaurants/${restaurant.id}`));
    card.querySelector('[data-name-link]').textContent = restaurant.name;
    setImage(card.querySelector('img'), restaurant.image, restaurant.name);
    card.querySelector('[data-favorite]').dataset.favorite =
      `restaurants:${restaurant.id}`;
    card.querySelector('.restaurant-meta').textContent = [
      restaurant.category,
      restaurant.deliveryTime,
    ]
      .filter(Boolean)
      .join(' · ');
    card.querySelector('.restaurant-rating').textContent =
      `${restaurant.rating === null ? '' : `★ ${restaurant.rating.toFixed(1)} · `}` +
      deliveryLabel(restaurant);
    grid.append(card);
  });
  syncFavoriteButtons(root);
}

// Mostra a lista de perfis da API sem transformar e-mails em HTML.
export function renderUsers(root, grid, users) {
  grid.replaceChildren();
  users.forEach((user) => {
    const card = root.querySelector('#user-card-template').content.cloneNode(true);
    card.querySelector('.avatar').textContent = user.name.slice(0, 1).toUpperCase();
    card.querySelectorAll('a').forEach((link) => (link.href = `/users/${user.id}`));
    card.querySelector('h3 a').textContent = user.name;
    card.querySelector('p').textContent = user.address || user.email || 'Ver perfil';
    grid.append(card);
  });
}
