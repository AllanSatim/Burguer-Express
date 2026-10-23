# 🍔 Pixel Burguer — Arcade & Gourmet
## Documentação do projeto

Projeto de uma hamburgueria com temática gamer, desenvolvido em **HTML, CSS e JavaScript**. Possui nove telas, identidade visual própria, cardápio, carrinho de compras e painel administrativo demonstrativo.

## 1. Como executar o projeto

1. Extraia os arquivos mantendo a estrutura das pastas.
2. Abra a pasta `pixel-burguer-gamer` no Visual Studio Code.
3. Execute o arquivo `index.html` utilizando a extensão Live Server.
4. Navegue pelas páginas e teste as funcionalidades, como adicionar produtos ao carrinho e finalizar um pedido demonstrativo.

O Live Server é recomendado para que o armazenamento local funcione de maneira mais consistente entre as páginas.

## 2. Estrutura de arquivos

```text
pixel-burguer-gamer/
├── index.html
├── cardapio.html
├── pedido.html
├── admin.html
├── login.html
├── cadastro.html
├── recuperar-senha.html
├── sobre.html
├── contato.html
├── README.md
└── assets/
    ├── css/
    │   ├── style.css
    │   └── tema-gamer.css
    ├── js/
    │   ├── comum.js
    │   └── scripts das páginas
    └── images/
        ├── logo.svg
        ├── burger-icon.svg
        ├── ilustrações dos produtos
        └── gerar_ilustracoes.py
```

## 3. Explicação das páginas HTML

- **`index.html` — Início:** apresenta a marca, a busca, os atalhos de navegação e os produtos em destaque.
- **`cardapio.html` — Cardápio:** organiza os produtos por categorias e permite pesquisar itens disponíveis.
- **`pedido.html` — Meu Pedido:** apresenta os produtos adicionados, as quantidades, os valores e o resumo do pedido.
- **`admin.html` — Administração:** mostra indicadores, filtros e etapas de pedidos ilustrativos.
- **`login.html` — Login:** permite alternar visualmente entre Cliente e Administrador.
- **`cadastro.html` — Cadastro:** apresenta o formulário de criação de conta.
- **`recuperar-senha.html` — Recuperação:** apresenta a interface para recuperação de acesso.
- **`sobre.html` — Sobre:** apresenta a proposta e os diferenciais da hamburgueria.
- **`contato.html` — Contato:** reúne informações ilustrativas e um formulário de contato.

Os comentários em HTML (`<!-- ... -->`) explicam a finalidade dos principais blocos e facilitam a manutenção do código. Elementos semânticos, como `header`, `nav`, `main`, `section` e `footer`, ajudam a organizar o conteúdo.

## 4. CSS e identidade visual

O projeto utiliza dois arquivos de estilos:

- **`assets/css/style.css`:** contém os estilos originais preservados.
- **`assets/css/tema-gamer.css`:** complementa o visual com cores, botões, cartões, formulários, efeitos e ajustes para celulares.

O tema gamer está organizado em 15 seções comentadas, incluindo variáveis de cores, menu lateral, cabeçalho, banner principal, cardápio, formulários, painel administrativo, acessibilidade e responsividade.

### Paleta de cores

| Aplicação | Cor |
|---|---|
| Fundo | `#10121B` |
| Cartões | `#1A1E2B` |
| Textos | `#F5F1E9` |
| Ações principais | `#E6AE70` |
| Detalhes gamer | `#80B6B6` |
| Detalhes secundários | `#9890B7` |

Para alterar as cores, edite as variáveis do bloco `:root` em `tema-gamer.css`. O arquivo deve ser carregado depois de `style.css` para que as regras do tema possam sobrescrever os estilos originais quando necessário.

## 5. JavaScript e funcionalidades

O arquivo `assets/js/comum.js` reúne as funcionalidades compartilhadas pelas páginas e está organizado em 16 blocos comentados.

Suas principais responsabilidades são:

1. Recuperar e atualizar o carrinho.
2. Converter preços e calcular totais.
3. Exibir mensagens de confirmação (*toast*).
4. Controlar os botões de quantidade e adicionar ou remover produtos.
5. Montar os itens do carrinho utilizando elementos do DOM.
6. Pesquisar produtos por nome ou ingrediente.
7. Simular a finalização de pedidos.
8. Demonstrar o acesso de cliente e administrador.
9. Inicializar as funcionalidades compartilhadas por meio de `window.PixelBurguer`.

Os scripts específicos de cada página complementam essas funções. O uso de `textContent` na apresentação de textos ajuda a evitar que conteúdo inserido pelo usuário seja interpretado como HTML.

## 6. Funcionalidades disponíveis

- Navegação entre as nove páginas.
- Layout responsivo para computadores e celulares.
- Cardápio organizado por categorias.
- Busca por produtos e ingredientes.
- Controles para aumentar e diminuir quantidades.
- Adição e remoção de produtos do carrinho.
- Atualização de subtotais e total.
- Armazenamento local do carrinho por `localStorage`.
- Simulação de finalização do pedido.
- Formulários visuais de login, cadastro, contato e recuperação de senha.
- Painel administrativo com dados e filtros demonstrativos.
- Ilustrações SVG armazenadas localmente.

## 7. Limitações do protótipo

O projeto funciona como demonstração visual e de navegação, mas ainda não possui:

- Backend ou banco de dados.
- Autenticação real de usuários.
- Envio de pedidos para a cozinha.
- Sincronização entre dispositivos.
- Processamento de pagamentos.
- Envio real de e-mails ou mensagens.

Os preços, produtos, horários e pedidos administrativos são ilustrativos e devem ser substituídos pelos dados reais antes da publicação.

## 8. Como evoluir o projeto

Para transformar o protótipo em um sistema real, será necessário desenvolver uma API, integrar um banco de dados, implementar autenticação segura e permitir que a cozinha receba e atualize os pedidos.

Os preços e as permissões devem ser validados no servidor. O `localStorage` deve ser utilizado apenas para dados locais, e não como fonte oficial de pedidos ou informações financeiras.

## 9. Ilustrações

Os arquivos SVG de `assets/images/` representam a marca e os produtos. São vetores editáveis utilizados para manter as imagens disponíveis localmente. O script `gerar_ilustracoes.py` documenta a geração dessas artes, que são ilustrativas e não fotografias de produtos reais.

## 10. Conclusão

O **Pixel Burguer — Arcade & Gourmet** reúne as telas, o visual gamer e as principais interações de um sistema de hamburgueria. A estrutura separa HTML, CSS, JavaScript e imagens, facilitando a compreensão e a manutenção do projeto.

Este documento reúne as instruções de execução, a estrutura dos arquivos, a explicação das telas, os principais componentes do código e as limitações atuais, substituindo a necessidade de manter um README e um guia de código separados.
