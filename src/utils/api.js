/*
  Consulta as seis rotas da API do professor e normaliza seus registros.
  Se houver erro de rede ou servidor, usa dados locais com indicação de demo.
  Erro 404 não vira demonstração: a tela informa que o registro não existe.
  O cache dura um minuto e é limpo pelo botão de nova tentativa.
 */
import { demo } from '../data/demo.js';
import { safeImage } from './format.js';

export const API_URL = 'https://apifakedelivery.vercel.app';
const cache = new Map();

// Converte preços e avaliações recebidos como números ou textos simples.
function number(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace('R$', '').trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

// Transforma um endereço textual ou um objeto em uma linha legível.
function address(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return [
    value.street || value.rua,
    value.number || value.numero,
    value.neighborhood || value.bairro,
    value.city || value.cidade,
    value.state || value.estado,
  ]
    .filter(Boolean)
    .join(', ');
}

// Normaliza nomes comuns de campos sem inventar avaliações ou preços da API.
function normalizeRecord(item, resource) {
  if (!item || !/^\d+$/.test(String(item.id))) {
    throw new Error('A API retornou um registro sem identificação válida.');
  }
  const restaurant = item.restaurant || item.restaurante;
  return {
    id: Number(item.id),
    name: String(item.name || item.nome || item.title || 'Nome não informado'),
    description: String(item.description || item.descricao || ''),
    image: safeImage(
      item.image ||
        item.img ||
        item.photo ||
        item.imagem ||
        item.imageUrl ||
        item.logo ||
        item.avatar ||
        item.url,
    ),
    category: String(item.category?.name || item.category || item.categoria || ''),
    price: number(item.price ?? item.preco ?? item.valor),
    rating: number(item.rating ?? item.rate ?? item.avaliacao),
    deliveryTime: String(item.deliveryTime || item.delivery_time || item.tempo || ''),
    deliveryFee: number(item.deliveryFee ?? item.delivery_fee ?? item.frete),
    address: address(item.address || item.endereco),
    restaurantId: number(
      item.restaurantId ??
        item.restaurant_id ??
        item.idRestaurant ??
        restaurant?.id ??
        item.restauranteId,
    ),
    restaurantName: String(item.restaurantName || restaurant?.name || ''),
    email: String(item.email || ''),
    phone: String(item.phone || item.telefone || ''),
    resource,
  };
}

// Permite que uma nova tentativa consulte o servidor em vez do cache recente.
export function clearApiCache() {
  cache.clear();
}

// Consulta lista ou detalhe; retorna dados, origem e motivo da demonstração.
export async function getResource(resource, id, signal) {
  const path = `/${resource}${id ? `/${id}` : ''}`;
  const saved = cache.get(path);
  if (saved && Date.now() - saved.time < 60000) return saved.result;
  let data;
  let source = 'api';
  let reason = '';
  try {
    const response = await fetch(API_URL + path, {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(12000)])
        : AbortSignal.timeout(12000),
    });
    if (response.status === 404) {
      throw Object.assign(new Error('Registro não encontrado na API.'), {
        notFound: true,
      });
    }
    if (!response.ok) throw new Error(`Servidor respondeu HTTP ${response.status}.`);
    const body = await response.json();
    const payload = body.data ?? body[resource] ?? body.results ?? body;
    if (!id && !Array.isArray(payload)) {
      throw new Error('A API retornou uma lista em formato inesperado.');
    }
    data = id
      ? normalizeRecord(Array.isArray(payload) ? payload[0] : payload, resource)
      : payload.map((item) => normalizeRecord(item, resource));
  } catch (error) {
    if (signal?.aborted || error.notFound) throw error;
    source = 'demo';
    reason = error.message;
    const records = demo[resource];
    const item = id ? records.find((record) => record.id === Number(id)) : null;
    if (id && !item) {
      throw new Error('Este registro não está disponível no modo demonstração.');
    }
    data = id
      ? normalizeRecord(item, resource)
      : records.map((record) => normalizeRecord(record, resource));
  }
  data = Array.isArray(data)
    ? data.map((item) => ({ ...item, source }))
    : { ...data, source };
  const result = { data, source, reason, path };
  cache.set(path, { time: Date.now(), result });
  return result;
}
