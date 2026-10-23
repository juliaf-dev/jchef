/*
  Dados locais fictícios, usados somente quando a API não responde.
  A interface sempre sinaliza o modo demonstração e oferece nova tentativa.
  As fotos ficam em public/images e não dependem da API indisponível.
 */
export const demo = {
  users: [
    {
      id: 1,
      name: 'Júlia Costa',
      email: 'julia@example.com',
      phone: '(16) 99999-0101',
      address: 'Centro, Taquaritinga · SP',
      avatar: '',
    },
    {
      id: 2,
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      phone: '(16) 99999-0102',
      address: 'Jardim São José, Taquaritinga · SP',
      avatar: '',
    },
    {
      id: 3,
      name: 'Pedro Santos',
      email: 'pedro@example.com',
      phone: '(16) 99999-0103',
      address: 'Vila Rosa, Taquaritinga · SP',
      avatar: '',
    },
  ],
  restaurants: [
    {
      id: 1,
      name: 'Cantina da Júlia',
      category: 'Marmitas',
      description:
        'Comida de verdade, feita com carinho. Seu almoço de todos os dias com aquele gostinho de casa.',
      image: '/images/marmita.jpg',
      rating: 4.9,
      deliveryTime: '25–35 min',
      deliveryFee: 0,
      address: 'Centro, Taquaritinga · SP',
    },
    {
      id: 2,
      name: 'Burger Lab',
      category: 'Lanches',
      description:
        'Pão macio, carne suculenta e combinações que surpreendem. Um novo favorito a cada mordida.',
      image: '/images/burger.jpg',
      rating: 4.8,
      deliveryTime: '30–40 min',
      deliveryFee: 3.9,
      address: 'Jardim São José, Taquaritinga · SP',
    },
    {
      id: 3,
      name: 'Forno & Pizza',
      category: 'Pizzas',
      description:
        'Massa artesanal, ingredientes selecionados e um forno sempre aquecido esperando seu pedido.',
      image: '/images/pizza.jpg',
      rating: 4.7,
      deliveryTime: '35–45 min',
      deliveryFee: 0,
      address: 'Vila Rosa, Taquaritinga · SP',
    },
    {
      id: 4,
      name: 'Santo Grão',
      category: 'Saudáveis',
      description:
        'Cores e sabores que fazem bem. Refeições frescas para deixar seu dia mais leve.',
      image: '/images/salad.jpg',
      rating: 4.9,
      deliveryTime: '20–30 min',
      deliveryFee: 0,
      address: 'Centro, Taquaritinga · SP',
    },
  ],
  foods: [
    {
      id: 1,
      name: 'Marmita caseira',
      category: 'Marmitas',
      description:
        'Arroz soltinho, feijão temperado, frango grelhado e salada fresquinha. Sabor de casa em cada garfada.',
      image: '/images/marmita.jpg',
      price: 19.9,
      restaurantId: 1,
      restaurantName: 'Cantina da Júlia',
    },
    {
      id: 2,
      name: 'Combo da casa',
      category: 'Lanches',
      description:
        'Hambúrguer artesanal com queijo, alface, tomate e molho especial, acompanhado de batatas crocantes.',
      image: '/images/burger.jpg',
      price: 34.5,
      restaurantId: 2,
      restaurantName: 'Burger Lab',
    },
    {
      id: 3,
      name: 'Pizza pepperoni',
      category: 'Pizzas',
      description:
        'Massa fina e artesanal com molho de tomate, mussarela e pepperoni. Perfeita para compartilhar.',
      image: '/images/pizza.jpg',
      price: 39.9,
      restaurantId: 3,
      restaurantName: 'Forno & Pizza',
    },
    {
      id: 4,
      name: 'Cheeseburger',
      category: 'Lanches',
      description:
        'Pão brioche, hambúrguer grelhado, queijo derretido e molho da casa. Um clássico que sempre combina.',
      image: '/images/burger.jpg',
      price: 24.9,
      restaurantId: 2,
      restaurantName: 'Burger Lab',
    },
    {
      id: 5,
      name: 'Bowl de verão',
      category: 'Saudáveis',
      description:
        'Folhas selecionadas, legumes coloridos e grãos, com um molho leve que une todos os sabores.',
      image: '/images/salad.jpg',
      price: 27.9,
      restaurantId: 4,
      restaurantName: 'Santo Grão',
    },
    {
      id: 6,
      name: 'Salada especial',
      category: 'Saudáveis',
      description:
        'Uma seleção fresca de vegetais, preparada na hora para uma refeição leve e cheia de cor.',
      image: '/images/vegetables.jpg',
      price: 22.5,
      restaurantId: 4,
      restaurantName: 'Santo Grão',
    },
    {
      id: 7,
      name: 'Doce encontro',
      category: 'Doces',
      description:
        'Sorvete cremoso com uma combinação especial de sabores. A pausa que seu dia merece.',
      image: '/images/dessert.jpg',
      price: 16.9,
      restaurantId: 1,
      restaurantName: 'Cantina da Júlia',
    },
    {
      id: 8,
      name: 'Marmita do dia',
      category: 'Marmitas',
      description:
        'Uma combinação diferente a cada dia, com arroz, feijão, proteína e acompanhamentos caseiros.',
      image: '/images/marmita.jpg',
      price: 23.9,
      restaurantId: 1,
      restaurantName: 'Cantina da Júlia',
    },
  ],
};
