/*
  Salva favoritos e a sacola somente neste navegador, com validação na leitura.
  O fechamento do pedido é uma simulação: não envia pagamento ou entrega.
  Falhas de armazenamento são informadas à interface, sem sucesso fictício.
 */
const CART = 'jchef:cart:v1';
const FAVORITES = 'jchef:favorites:v1';

// Lê uma lista local e ignora JSON inválido ou conteúdo de outro formato.
function read(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Exige identificação e nome antes de usar qualquer registro salvo.
function validItem(item) {
  return Number.isInteger(item?.id) && item.id > 0 && typeof item.name === 'string';
}

// Salva a lista ou informa ao usuário que o navegador impediu a operação.
function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    throw new Error('Não foi possível salvar. Habilite o armazenamento do navegador.');
  }
}

// Retorna a sacola com valores e quantidades válidos.
export function getCart() {
  return read(CART).filter(
    (item) =>
      validItem(item) &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 99,
  );
}

// Adiciona uma unidade ou atualiza a quantidade do alimento existente.
export function addToCart(food, quantity = 1) {
  if (!Number.isFinite(food.price) || food.price < 0) {
    throw new Error('Este alimento não tem preço disponível para adicionar à sacola.');
  }
  const cart = getCart();
  const existing = cart.find((item) => item.id === food.id);
  if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
  else cart.push({ ...food, quantity: Math.min(99, Math.max(1, quantity)) });
  write(CART, cart);
}

// Altera uma quantidade; zero remove o alimento da sacola.
export function changeQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find((food) => food.id === id);
  if (item) item.quantity = Math.min(99, item.quantity + delta);
  write(
    CART,
    cart.filter((food) => food.quantity > 0),
  );
}

// Esvazia a sacola após a confirmação explícita da simulação de pedido.
export function clearCart() {
  write(CART, []);
}

// Retorna favoritos de alimentos ou restaurantes, identificados pelo recurso.
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

// Alterna um favorito e retorna se ele ficou salvo ou foi removido.
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
