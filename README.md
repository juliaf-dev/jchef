# JChef — Delivery

Protótipo acadêmico de delivery desenvolvido com React, Vite, JavaScript e
Bootstrap, seguindo as telas fornecidas e a identidade visual JChef.

## Executar no computador

Use Node.js 20.19+ ou 22.12+ e npm. O desenvolvimento foi verificado com Node 24.

```powershell
cd "C:\Users\julia\Downloads\desg\projetos\jchef"
npm.cmd ci
npm.cmd run dev
```

Abra o endereço exibido no terminal, normalmente `http://localhost:5173`.
Se a porta estiver ocupada pelo JCine, o Vite escolherá outra porta disponível.
Mantenha o terminal aberto e use **Ctrl+C** para encerrar.

Não é necessário token ou `.env` para os endpoints fornecidos nesta atividade.
Não abra `index.html` diretamente: o projeto precisa do servidor Vite.

## Escopo da atividade

A tarefa pede prototipação, telas de front-end, consumo de API e apresentação
para os colegas. As seis rotas têm telas próprias:

| Página local     | Rota da API                                            |
| ---------------- | ------------------------------------------------------ |
| `/users`         | `GET https://apifakedelivery.vercel.app/users`         |
| `/users/1`       | `GET https://apifakedelivery.vercel.app/users/1`       |
| `/restaurants`   | `GET https://apifakedelivery.vercel.app/restaurants`   |
| `/restaurants/1` | `GET https://apifakedelivery.vercel.app/restaurants/1` |
| `/foods`         | `GET https://apifakedelivery.vercel.app/foods`         |
| `/foods/1`       | `GET https://apifakedelivery.vercel.app/foods/1`       |

O ID `1` é um exemplo: os cards usam o ID de cada registro para abrir o detalhe.
Além dessas telas, o projeto inclui início (`/`), favoritos (`/favoritos`),
sacola (`/sacola`) e uma tela de caminho não encontrado.

## Situação da API e modo demonstração

Na implementação, **as seis rotas fornecidas retornaram HTTP 500**. Esse é um
problema no servidor da API, fora do controle deste front-end.

O projeto tenta consultar a API antes de usar qualquer exemplo. Se houver
falha de rede, timeout, erro de servidor ou formato incompatível, utiliza
`src/data/demo.js` e exibe um aviso visível de **Modo demonstração**.
Nomes, restaurantes, preços e demais registros desse arquivo são fictícios.
Eles não são apresentados como uma resposta real do serviço.

O botão **Tentar API novamente** limpa o cache e refaz as consultas. Se as
respostas forem válidas, a tela passa a usar a API e remove o aviso. Respostas
404 mostram uma mensagem de registro inexistente, sem inventar um registro.
Os detalhes indisponíveis no conjunto de demonstração também exibem aviso.

A integração dos seis endpoints está implementada, mas o formato real dos dados
precisa ser confirmado quando o servidor voltar. O normalizador em
`src/utils/api.js` aceita nomes comuns de campos e concentra os ajustes que
possam ser necessários. Campos ausentes não recebem avaliações ou preços
inventados. Fotos ausentes usam uma imagem local identificada como ilustrativa.

Não se deve apresentar o modo demonstração como comprovação de que a API
externa está funcionando. A interface e o README deixam essa diferença clara.

## Funcionalidades

- Início com marca, saudação, destaque, categorias, comidas e restaurantes.
- Listas e detalhes das três entidades exigidas pelo professor.
- Pesquisa por nome e especialidade sem distinção de acentos ou maiúsculas.
- Categorias de comidas, com escolha e texto de pesquisa preservados na URL.
- Relação do cardápio por ID do restaurante, quando o dado estiver disponível.
- Favoritos de comidas e restaurantes, persistidos no localStorage.
- Sacola com inclusão, alteração de quantidades, remoção e subtotal.
- Confirmação de pedido explicitamente simulada, sem cobrança ou entrega real.
- Estados de carregamento, listas vazias, erros e nova tentativa.
- Navegação com histórico, teclado e menu inferior no celular.

A sacola e os favoritos são locais e não usam rotas POST da API. Não há login,
pagamento, envio de pedido, cálculo de distância ou entrega real.
O endereço apresentado pertence ao perfil recebido ou ao exemplo fictício;
não é uma localização obtida por GPS. O subtotal não inclui frete.

## Organização

```text
jchef/
├── public/
│   ├── images/
│   ├── jchef-logo.png
│   ├── jchef-logo.svg
│   ├── jchef-icon.png
│   └── jchef-icon.svg
├── src/
│   ├── controllers/
│   │   ├── appController.js
│   │   └── cardsController.js
│   ├── data/
│   │   └── demo.js
│   ├── pages/
│   │   ├── Layout.html
│   │   ├── Home.html
│   │   ├── Foods.html
│   │   ├── FoodDetails.html
│   │   ├── Restaurants.html
│   │   ├── RestaurantDetails.html
│   │   ├── Users.html
│   │   ├── UserDetails.html
│   │   ├── Favorites.html
│   │   ├── Cart.html
│   │   └── NotFound.html
│   ├── routers/
│   │   ├── AppRouter.jsx
│   │   └── routes.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── components.css
│   │   ├── home.css
│   │   ├── foods.css
│   │   ├── food-details.css
│   │   ├── restaurants.css
│   │   ├── restaurant-details.css
│   │   ├── users.css
│   │   ├── user-details.css
│   │   ├── favorites.css
│   │   ├── cart.css
│   │   └── not-found.css
│   ├── utils/
│   │   ├── api.js
│   │   ├── format.js
│   │   └── storage.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

HTML, CSS e JavaScript ficam separados. O CSS de cada tela está em `styles`;
`components.css` reúne os cards, mensagens e controles compartilhados.
O layout é **mobile first**, com adaptações por `min-width` para telas maiores.

O React monta o layout e usa `useEffect` para iniciar o controller. As telas
são templates HTML locais, preenchidos com a API do DOM. A navegação utiliza
History API, sem React Router, como no JCine. O controller cancela consultas
antigas e remove os eventos ao desmontar.

Somente templates locais entram em `innerHTML`. Nomes, descrições e dados
externos são inseridos por `textContent`; imagens têm seus endereços validados.
O timeout da API é de 12 segundos. Respostas ficam em cache por um minuto,
e o botão de nova tentativa invalida esse cache.

Os comentários iniciais explicam cada arquivo. JavaScript usa `//` nos trechos
internos e cabeçalhos `/* ... */`, sem asteriscos por linha. HTML usa comentários
`<!-- ... -->`. A indentação é de dois espaços e as linhas são curtas.

## Comandos

| Comando               | Finalidade                                    |
| --------------------- | --------------------------------------------- |
| `npm.cmd ci`          | Instala as versões registradas no lockfile.   |
| `npm.cmd run dev`     | Inicia o servidor local.                      |
| `npm.cmd run build`   | Gera a versão de produção em `dist`.          |
| `npm.cmd run preview` | Serve a versão já compilada para conferência. |

O projeto não inclui pastas, dependências ou scripts de testes automatizados,
nem configurações de Prettier ou EditorConfig. A conferência de navegação foi
realizada no navegador sem adicionar ferramentas ao repositório.

## Conferência e apresentação

1. Abra o início e apresente a marca, o protótipo e a prioridade para celular.
2. Explique o aviso de demonstração se a API ainda estiver indisponível.
3. Abra `/users` e um perfil, mostrando lista e detalhe.
4. Abra `/restaurants` e um restaurante, mostrando seu cardápio vinculado.
5. Abra `/foods`, pesquise um nome e experimente uma categoria.
6. Abra uma comida, ajuste a quantidade e adicione à sacola.
7. Salve favoritos, recarregue a página e confira a persistência.
8. Altere as quantidades da sacola e mostre o subtotal.
9. Explique que a confirmação é somente uma simulação e não faz cobrança.
10. Use **Tentar API novamente** para verificar se o serviço voltou.

Foram conferidos os seis caminhos no modo demonstração, favoritos e sacola
após recarregar, quantidades, confirmação, estados vazios e caminho inexistente.
Também foi verificada a ausência de rolagem horizontal nas larguras de
320, 390, 768 e 1440 pixels. A indisponibilidade externa impede confirmar os
registros reais do serviço neste momento.

## Arquivos para o GitHub

Envie `src`, `public`, `index.html`, `package.json`, `package-lock.json`,
`vite.config.js`, `.gitignore` e `README.md`. Não envie `node_modules` ou `dist`.
Em hospedagem estática, configure o fallback para `index.html` para que links
de detalhes abertos diretamente sejam resolvidos pelo front-end.

## Referências

- API fornecida na atividade: https://apifakedelivery.vercel.app
- Protótipo e logos JChef fornecidos pela autora.
- Fotos ilustrativas: URLs do Unsplash presentes no protótipo fornecido,
  baixadas em `public/images` para não depender da disponibilidade externa.
- React, Vite e Bootstrap.

As versões SVG da marca incorporam os PNGs enviados e apenas ajustam o
viewBox para enquadrar as margens transparentes, sem redesenhar a identidade.
