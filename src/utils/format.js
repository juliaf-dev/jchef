/*
  Funções compartilhadas para formatar valores e tratar textos e URLs.
  Dados da API não são interpolados em HTML: o controller usa textContent.
 */

// Formata um preço numérico em reais sem inventar preço para valor ausente.
export function money(value) {
  return Number.isFinite(value)
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'Preço não informado';
}

// Padroniza textos para pesquisas sem diferença de acento ou caixa.
export function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Aceita apenas fotos locais do projeto ou endereços HTTP e HTTPS.
export function safeImage(value) {
  if (typeof value !== 'string') return '';
  if (value.startsWith('/images/')) return value;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

// Retorna uma descrição curta para cards sem cortar no meio de palavras.
export function excerpt(text, limit = 80) {
  return text.length > limit ? text.slice(0, limit).replace(/\s+\S*$/, '') + '…' : text;
}
