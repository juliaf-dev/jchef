import { getFavorites } from '../utils/storage.js';

import { money, excerpt, safeImage } from '../utils/format.js';

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

export function deliveryLabel(restaurant) {
  return restaurant.deliveryFee === 0
    ? 'Entrega grátis'
    : Number.isFinite(restaurant.deliveryFee)
      ? `Entrega ${money(restaurant.deliveryFee)}`
      : 'Consulte a entrega';
}

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
