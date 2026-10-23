const FAVORITES = 'jchef:favorites:v1';

function read(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function validItem(item) {
  return Number.isInteger(item?.id) && item.id > 0 && typeof item.name === 'string';
}

function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    throw new Error('Não foi possível salvar. Habilite o armazenamento do navegador.');
  }
}

export function getFavorites() {
  return read(FAVORITES)
    .filter(
      (item) => validItem(item) && ['foods', 'restaurants'].includes(item.resource),
    )
    .map((item) => ({
      ...item,
      description: typeof item.description === 'string' ? item.description : '',
      category: typeof item.category === 'string' ? item.category : '',
      restaurantName:
        typeof item.restaurantName === 'string' ? item.restaurantName : '',
      deliveryTime: typeof item.deliveryTime === 'string' ? item.deliveryTime : '',
      rating: Number.isFinite(item.rating) ? item.rating : null,
      deliveryFee: Number.isFinite(item.deliveryFee) ? item.deliveryFee : null,
      price: Number.isFinite(item.price) ? item.price : null,
    }));
}

export function toggleFavorite(item) {
  const current = getFavorites();
  const exists = current.some(
    (saved) => saved.id === item.id && saved.resource === item.resource,
  );
  write(
    FAVORITES,
    exists
      ? current.filter(
          (saved) => saved.id !== item.id || saved.resource !== item.resource,
        )
      : [...current, item],
  );
  return !exists;
}
export const getCart = () => [];
