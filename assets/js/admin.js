/**
 * ==========================================================================
 * BURGUER EXPRESS — CENTRAL ADMINISTRATIVA (JAVASCRIPT)
 * Funções implementadas:
 * - Adicionar novos pedidos e comandas
 * - Excluir pedidos
 * - Avançar status dos pedidos (Recebidos -> Em Preparo -> Prontos -> Encerrados)
 * - Filtragem por status, mesa/local e busca em tempo real
 * - Alternância entre telas: Visão Geral (Kanban), Mesas & Comandas e Histórico
 * - Persistência local via localStorage
 * ==========================================================================
 */

// Chave do localStorage
const STORAGE_KEY = 'burguer_express_orders_v1';

// Dados iniciais demonstrativos para a primeira inicialização
const INITIAL_ORDERS = [
  {
    id: '#1042',
    timestamp: '19:35',
    timeAgo: 'há 10 min',
    customer: 'Mariana Souza',
    table: 'Mesa 04',
    location: 'Salão Principal • Próximo à janela',
    type: 'mesa',
    status: 'recebidos',
    payment: 'PIX (Ao fechar conta)',
    notes: 'Ponto da carne bem passado, refrigerante bem gelado.',
    total: 47.80,
    items: [
      { name: 'Bacon Burger', qty: 1, price: 27.90 },
      { name: 'Batata Frita Crocante', qty: 1, price: 12.90 },
      { name: 'Coca-Cola 350ml', qty: 1, price: 7.00 }
    ]
  },
  {
    id: '#1043',
    timestamp: '19:41',
    timeAgo: 'há 4 min',
    customer: 'Lucas Almeida',
    table: 'Mesa 08',
    location: 'Salão Superior • Mezanino',
    type: 'mesa',
    status: 'recebidos',
    payment: 'Cartão Crédito (Ao fechar)',
    notes: 'Sem cebola em um dos burgers.',
    total: 65.70,
    items: [
      { name: 'Cheeseburger Clássico', qty: 2, price: 24.90 },
      { name: 'Onion Rings Especial', qty: 1, price: 15.90 }
    ]
  },
  {
    id: '#1040',
    timestamp: '19:22',
    timeAgo: 'há 23 min',
    customer: 'Camila Ribeiro',
    table: 'Balcão 02',
    location: 'Consumo no Balcão • Banco 02',
    type: 'balcao',
    status: 'preparo',
    payment: 'Cartão Débito (Ao fechar)',
    notes: 'Cortar burger ao meio, servir milkshake junto.',
    total: 61.80,
    items: [
      { name: 'Combo Duplo Clássico', qty: 1, price: 42.90 },
      { name: 'Milkshake de Chocolate', qty: 1, price: 18.90 }
    ]
  },
  {
    id: '#1038',
    timestamp: '19:15',
    timeAgo: 'há 30 min',
    customer: 'Fernando Gomes',
    table: 'Mesa 02',
    location: 'Salão Principal • Levar à mesa agora',
    type: 'mesa',
    status: 'prontos',
    payment: 'Dinheiro (Ao fechar conta)',
    notes: 'Maionese extra em pote.',
    total: 47.80,
    items: [
      { name: 'Trufado Artesanal', qty: 1, price: 34.90 },
      { name: 'Batata Frita', qty: 1, price: 12.90 }
    ]
  },
  {
    id: '#1035',
    timestamp: '18:50',
    timeAgo: 'Encerrado 19:10',
    customer: 'Renata Castro',
    table: 'Mesa 06',
    location: 'Mesa liberada e higienizada',
    type: 'mesa',
    status: 'finalizados',
    payment: 'Pago no Cartão de Crédito',
    notes: 'Nenhuma observação.',
    total: 73.80,
    items: [
      { name: 'Smash Burger Duplo', qty: 2, price: 29.90 },
      { name: 'Coca-Cola 350ml', qty: 2, price: 7.00 }
    ]
  }
];

// Estado atual da aplicação
let orders = [];
let currentFilterStatus = 'all';
let currentFilterType = 'todas';
let currentSearchTerm = '';
let orderPendingDeletionId = null;

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  setupEventListeners();
  renderAll();
});

/**
 * Carrega pedidos do localStorage ou inicializa os padrões
 */
function loadOrders() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      orders = JSON.parse(stored);
    } catch (e) {
      orders = [...INITIAL_ORDERS];
    }
  } else {
    orders = [...INITIAL_ORDERS];
    saveOrders();
  }
}

/**
 * Salva o estado atual no localStorage
 */
function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/**
 * Configura todos os ouvintes de eventos
 */
function setupEventListeners() {
  // Navegação entre abas
  document.querySelectorAll('[data-admin-view]').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = tab.getAttribute('data-admin-view');
      switchView(targetView);
    });
  });

  // Filtros de status do Kanban
  document.querySelectorAll('[data-filter-status]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilterStatus = btn.getAttribute('data-filter-status');
      renderKanban();
    });
  });

  // Filtro por tipo de acomodação (mesa/balcão)
  const typeSelect = document.getElementById('filter-accommodation');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentFilterType = e.target.value;
      renderKanban();
    });
  }

  // Campo de busca em tempo real
  const searchInput = document.getElementById('admin-search-field');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      renderKanban();
    });
  }

  // Botão para abrir modal de novo pedido
  const btnOpenAddModal = document.getElementById('btn-open-add-order');
  if (btnOpenAddModal) {
    btnOpenAddModal.addEventListener('click', () => {
      openModal('modal-add-order');
    });
  }

  // Botões de fechar modal
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('modal-open');
    });
  });

  // Submissão do formulário de novo pedido
  const formAddOrder = document.getElementById('form-add-order');
  if (formAddOrder) {
    formAddOrder.addEventListener('submit', handleAddOrderSubmit);
  }

  // Confirmação de exclusão
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', confirmDeleteOrder);
  }
}

/**
 * Alterna entre as 3 telas principais do Administrador
 */
function switchView(viewName) {
  // Esconder todas as telas
  document.querySelectorAll('.admin-tab-view').forEach(view => {
    view.style.display = 'none';
  });

  // Remover classe active de todos os links de aba
  document.querySelectorAll('[data-admin-view]').forEach(tab => {
    tab.classList.remove('active');
  });

  // Ativar a tela selecionada
  const targetElement = document.getElementById(`view-${viewName}`);
  if (targetElement) {
    targetElement.style.display = 'block';
  }

  // Ativar os botões da aba correspondente
  document.querySelectorAll(`[data-admin-view="${viewName}"]`).forEach(tab => {
    tab.classList.add('active');
  });

  renderAll();
}

/**
 * Renderiza todas as seções, KPIs e contagens
 */
function renderAll() {
  renderKPIs();
  renderKanban();
  renderTablesView();
  renderHistoryView();
}

/**
 * Atualiza os contadores nos cartões de KPI
 */
function renderKPIs() {
  const counts = {
    recebidos: orders.filter(o => o.status === 'recebidos').length,
    preparo: orders.filter(o => o.status === 'preparo').length,
    prontos: orders.filter(o => o.status === 'prontos').length,
    finalizados: orders.filter(o => o.status === 'finalizados').length,
    total: orders.length
  };

  const kpiRecebidos = document.getElementById('kpi-val-recebidos');
  const kpiPreparo = document.getElementById('kpi-val-preparo');
  const kpiProntos = document.getElementById('kpi-val-prontos');
  const kpiFinalizados = document.getElementById('kpi-val-finalizados');

  if (kpiRecebidos) kpiRecebidos.textContent = counts.recebidos;
  if (kpiPreparo) kpiPreparo.textContent = counts.preparo;
  if (kpiProntos) kpiProntos.textContent = counts.prontos;
  if (kpiFinalizados) kpiFinalizados.textContent = counts.finalizados;

  // Atualizar badges nas colunas
  const badgeRec = document.getElementById('badge-col-recebidos');
  const badgePrep = document.getElementById('badge-col-preparo');
  const badgePron = document.getElementById('badge-col-prontos');
  const badgeFin = document.getElementById('badge-col-finalizados');

  if (badgeRec) badgeRec.textContent = `${counts.recebidos} na fila`;
  if (badgePrep) badgePrep.textContent = `${counts.preparo} na chapa`;
  if (badgePron) badgePron.textContent = `${counts.prontos} para servir`;
  if (badgeFin) badgeFin.textContent = `${counts.finalizados} hoje`;
}

/**
 * Renderiza os cartões dentro das 4 colunas Kanban aplicando os filtros
 */
function renderKanban() {
  const colRecebidos = document.getElementById('kanban-col-recebidos-cards');
  const colPreparo = document.getElementById('kanban-col-preparo-cards');
  const colProntos = document.getElementById('kanban-col-prontos-cards');
  const colFinalizados = document.getElementById('kanban-col-finalizados-cards');

  if (!colRecebidos || !colPreparo || !colProntos || !colFinalizados) return;

  colRecebidos.innerHTML = '';
  colPreparo.innerHTML = '';
  colProntos.innerHTML = '';
  colFinalizados.innerHTML = '';

  // Filtragem
  const filtered = orders.filter(order => {
    // Filtro por status selecionado na barra
    if (currentFilterStatus !== 'all' && order.status !== currentFilterStatus) {
      return false;
    }
    // Filtro por acomodação
    if (currentFilterType === 'mesas' && order.type !== 'mesa') return false;
    if (currentFilterType === 'balcao' && order.type !== 'balcao') return false;

    // Filtro por busca de texto
    if (currentSearchTerm) {
      const matchId = order.id.toLowerCase().includes(currentSearchTerm);
      const matchCustomer = order.customer.toLowerCase().includes(currentSearchTerm);
      const matchTable = order.table.toLowerCase().includes(currentSearchTerm);
      const matchItems = order.items.some(i => i.name.toLowerCase().includes(currentSearchTerm));
      if (!matchId && !matchCustomer && !matchTable && !matchItems) {
        return false;
      }
    }
    return true;
  });

  filtered.forEach(order => {
    const cardEl = createOrderCardElement(order);
    if (order.status === 'recebidos') colRecebidos.appendChild(cardEl);
    else if (order.status === 'preparo') colPreparo.appendChild(cardEl);
    else if (order.status === 'prontos') colProntos.appendChild(cardEl);
    else if (order.status === 'finalizados') colFinalizados.appendChild(cardEl);
  });
}

/**
 * Cria o elemento HTML de um cartão de pedido com botões funcionais
 */
function createOrderCardElement(order) {
  const article = document.createElement('article');
  article.className = 'order-card';
  if (order.status === 'finalizados') {
    article.style.opacity = '0.85';
  }

  // Ações específicas conforme a coluna
  let primaryActionHtml = '';
  if (order.status === 'recebidos') {
    primaryActionHtml = `
      <button type="button" class="btn-card-action btn-action-primary" onclick="advanceOrderStatus('${order.id}', 'preparo')">
        <i class="fa-solid fa-fire-burner" aria-hidden="true"></i>
        <span>Iniciar preparo</span>
      </button>
    `;
  } else if (order.status === 'preparo') {
    primaryActionHtml = `
      <button type="button" class="btn-card-action btn-action-blue" onclick="advanceOrderStatus('${order.id}', 'prontos')">
        <i class="fa-solid fa-bell-concierge" aria-hidden="true"></i>
        <span>Marcar como pronto</span>
      </button>
    `;
  } else if (order.status === 'prontos') {
    primaryActionHtml = `
      <button type="button" class="btn-card-action btn-action-green" onclick="advanceOrderStatus('${order.id}', 'finalizados')">
        <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
        <span>Servido (Conta paga)</span>
      </button>
    `;
  }

  // Lista resumida de itens
  const itemsHtml = order.items.map(item => `
    <div class="order-item-line">
      <span><strong class="order-item-qty">${item.qty}x</strong> ${item.name}</span>
      <span>R$ ${(item.qty * item.price).toFixed(2).replace('.', ',')}</span>
    </div>
  `).join('');

  article.innerHTML = `
    <div class="order-header-row">
      <span class="order-id">${order.id}</span>
      <span class="order-time"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${order.timestamp} (${order.timeAgo})</span>
    </div>

    <div class="order-customer-row">
      <div class="order-customer">
        <i class="fa-regular fa-user" aria-hidden="true"></i>
        <span>${order.customer}</span>
      </div>
      <!-- Botão funcional de Excluir Pedido -->
      <button type="button" class="btn-card-delete" title="Excluir este pedido" onclick="promptDeleteOrder('${order.id}', '${order.customer}')">
        <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
      </button>
    </div>

    <div class="order-modality-block">
      <div>
        <span class="status-tag ${order.type === 'balcao' ? 'tag-counter' : 'tag-table'}">
          <i class="fa-solid ${order.type === 'balcao' ? 'fa-martini-glass' : 'fa-chair'}" aria-hidden="true"></i>
          ${order.table}
        </span>
      </div>
      <p class="order-address-text">
        <i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i>
        <span>${order.location}</span>
      </p>
    </div>

    <div class="order-items-list">
      ${itemsHtml}
    </div>

    ${order.notes ? `
      <div class="order-notes-box">
        <i class="fa-regular fa-comment-dots" aria-hidden="true"></i>
        <span>Obs: ${order.notes}</span>
      </div>
    ` : ''}

    <div class="order-footer-info">
      <span class="order-total-price">R$ ${order.total.toFixed(2).replace('.', ',')}</span>
      <span class="order-payment-method"><i class="fa-solid fa-wallet" aria-hidden="true"></i> ${order.payment}</span>
    </div>

    <div class="order-card-actions">
      ${primaryActionHtml}
      <button type="button" class="btn-card-action btn-action-details" onclick="viewOrderDetails('${order.id}')">
        <i class="fa-regular fa-eye" aria-hidden="true"></i>
        <span>Ver comanda</span>
      </button>
    </div>
  `;

  return article;
}

/**
 * Função funcional: Avançar status do pedido
 */
window.advanceOrderStatus = function(orderId, nextStatus) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.status = nextStatus;
  if (nextStatus === 'preparo') {
    order.timeAgo = 'na chapa';
    showToast(`Pedido ${orderId} movido para a chapa!`);
  } else if (nextStatus === 'prontos') {
    order.timeAgo = 'pronto para servir';
    showToast(`Pedido ${orderId} pronto para ser servido!`);
  } else if (nextStatus === 'finalizados') {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    order.timeAgo = `Encerrado às ${timeStr}`;
    showToast(`Comanda do pedido ${orderId} finalizada e paga!`);
  }

  saveOrders();
  renderAll();
};

/**
 * Função funcional: Solicitar confirmação de exclusão do pedido
 */
window.promptDeleteOrder = function(orderId, customerName) {
  orderPendingDeletionId = orderId;
  const msgEl = document.getElementById('delete-modal-msg');
  if (msgEl) {
    msgEl.innerHTML = `Tem certeza que deseja excluir o <strong>Pedido ${orderId}</strong> do cliente <strong>${customerName}</strong>?<br><br>Esta ação removerá a comanda da esteira de produção.`;
  }
  openModal('modal-delete-order');
};

/**
 * Função funcional: Confirmação e remoção do pedido do array e localStorage
 */
function confirmDeleteOrder() {
  if (!orderPendingDeletionId) return;

  const deletedId = orderPendingDeletionId;
  orders = orders.filter(o => o.id !== orderPendingDeletionId);
  orderPendingDeletionId = null;

  saveOrders();
  renderAll();
  closeModal('modal-delete-order');
  showToast(`Pedido ${deletedId} excluído com sucesso!`);
}

/**
 * Função funcional: Submissão do formulário para adicionar novo pedido
 */
function handleAddOrderSubmit(e) {
  e.preventDefault();

  const tableInput = document.getElementById('new-order-table').value.trim();
  const customerInput = document.getElementById('new-order-customer').value.trim();
  const paymentSelect = document.getElementById('new-order-payment').value;
  const notesInput = document.getElementById('new-order-notes').value.trim();

  // Coleta os itens selecionados e suas quantidades
  const itemCheckboxes = document.querySelectorAll('.product-checkbox-item:checked');
  if (itemCheckboxes.length === 0) {
    alert('Por favor, selecione ao menos um produto para criar o pedido.');
    return;
  }

  const selectedItems = [];
  let calculatedTotal = 0;

  itemCheckboxes.forEach(cb => {
    const name = cb.getAttribute('data-name');
    const price = parseFloat(cb.getAttribute('data-price')) || 0;
    const qtyInput = document.getElementById(`qty-${cb.value}`);
    const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

    selectedItems.push({ name, qty, price });
    calculatedTotal += (qty * price);
  });

  // Gerador de número de pedido sequencial
  const nextNum = orders.length > 0 
    ? Math.max(...orders.map(o => parseInt(o.id.replace('#', ''), 10) || 1000)) + 1 
    : 1044;
  const newId = `#${nextNum}`;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const isBalcao = tableInput.toLowerCase().includes('balcão') || tableInput.toLowerCase().includes('balcao');

  const newOrder = {
    id: newId,
    timestamp: timeStr,
    timeAgo: 'há poucos segundos',
    customer: customerInput || 'Cliente Salão',
    table: tableInput,
    location: isBalcao ? 'Consumo no Balcão' : 'Mesa no Salão',
    type: isBalcao ? 'balcao' : 'mesa',
    status: 'recebidos',
    payment: `${paymentSelect} (Ao fechar conta)`,
    notes: notesInput || 'Sem observações especiais.',
    total: calculatedTotal,
    items: selectedItems
  };

  // Adiciona no início da lista
  orders.unshift(newOrder);
  saveOrders();
  renderAll();

  // Reset do formulário e fechar modal
  e.target.reset();
  closeModal('modal-add-order');
  showToast(`Novo Pedido ${newId} (${tableInput}) adicionado com sucesso!`);
}

/**
 * Função funcional: Detalhes da Comanda no Modal
 */
window.viewOrderDetails = function(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const contentEl = document.getElementById('view-details-content');
  if (!contentEl) return;

  const itemsListHtml = order.items.map(item => `
    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #29323A;">
      <span><strong>${item.qty}x</strong> ${item.name}</span>
      <span style="font-weight: 700; color: #FFAA16;">R$ ${(item.qty * item.price).toFixed(2).replace('.', ',')}</span>
    </div>
  `).join('');

  contentEl.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
      <h3 style="font-size: 20px; color: #FFAA16; font-weight: 800;">${order.id}</h3>
      <span class="status-tag ${order.type === 'balcao' ? 'tag-counter' : 'tag-table'}">${order.table}</span>
    </div>

    <p style="color: #F5F5F5; font-size: 14.5px; margin-bottom: 4px;"><strong>Cliente:</strong> ${order.customer}</p>
    <p style="color: #AAB2BA; font-size: 13.5px; margin-bottom: 12px;"><strong>Horário de Abertura:</strong> ${order.timestamp} (${order.timeAgo})</p>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 14px; text-transform: uppercase; color: #AAB2BA; margin-bottom: 8px; letter-spacing: 0.5px;">Itens Solicitados</h4>
      ${itemsListHtml}
    </div>

    <div style="margin-bottom: 14px; background: rgba(255, 170, 22, 0.08); padding: 10px; border-radius: 8px;">
      <p style="font-size: 13px; color: #FDE68A;"><strong>Observações:</strong> ${order.notes || 'Nenhuma'}</p>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 800; padding-top: 10px; border-top: 2px solid #29323A;">
      <span>Total da Comanda:</span>
      <span style="color: #FFAA16;">R$ ${order.total.toFixed(2).replace('.', ',')}</span>
    </div>
    <p style="font-size: 13px; color: #AAB2BA; text-align: right; margin-top: 4px;">Forma de Pagamento: <strong>${order.payment}</strong></p>
  `;

  openModal('modal-view-details');
};

/**
 * Renderiza a Tela 2: Mesas & Comandas (Visão Geral de Todas as Mesas Físicas)
 */
function renderTablesView() {
  const gridEl = document.getElementById('tables-grid-container');
  if (!gridEl) return;

  // Lista padrão de mesas físicas da lanchonete
  const allTables = [
    'Mesa 01', 'Mesa 02', 'Mesa 03', 'Mesa 04',
    'Mesa 05', 'Mesa 06', 'Mesa 07', 'Mesa 08',
    'Mesa 09', 'Mesa 10', 'Mesa 11', 'Mesa 12',
    'Balcão 01', 'Balcão 02', 'Balcão 03', 'Balcão 04'
  ];

  gridEl.innerHTML = '';

  allTables.forEach(tableName => {
    // Procura se tem pedido ativo (que não esteja finalizado)
    const activeOrder = orders.find(o => 
      o.table.toLowerCase() === tableName.toLowerCase() && o.status !== 'finalizados'
    );

    const card = document.createElement('div');
    card.className = `table-card ${activeOrder ? 'is-occupied' : 'is-free'}`;

    if (activeOrder) {
      card.innerHTML = `
        <div class="table-header-status">
          <span class="table-name"><i class="fa-solid fa-chair" style="color: #FFAA16;"></i> ${tableName}</span>
          <span class="table-badge-busy">Ocupada</span>
        </div>
        <div class="table-body-details">
          <p><strong>${activeOrder.customer}</strong> (${activeOrder.id})</p>
          <p style="color: #FFAA16; font-weight: 700; margin-top: 2px;">R$ ${activeOrder.total.toFixed(2).replace('.', ',')} • ${activeOrder.items.length} itens</p>
          <p style="font-size: 12px; color: #AAB2BA;">Status: ${activeOrder.status.toUpperCase()}</p>
        </div>
        <div class="table-footer-actions">
          <button type="button" class="btn btn-sm btn-secondary" style="flex: 1;" onclick="viewOrderDetails('${activeOrder.id}')">
            Ver Comanda
          </button>
          <button type="button" class="btn btn-sm btn-outline" onclick="advanceOrderStatus('${activeOrder.id}', 'finalizados')" title="Encerrar e liberar mesa">
            Liberar
          </button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="table-header-status">
          <span class="table-name"><i class="fa-solid fa-chair" style="color: #4ADE80;"></i> ${tableName}</span>
          <span class="table-badge-free">Livre</span>
        </div>
        <div class="table-body-details">
          <p style="color: #707A84;">Mesa higienizada e livre para novos clientes sentarem.</p>
        </div>
        <div class="table-footer-actions">
          <button type="button" class="btn btn-sm btn-secondary btn-block" onclick="openAddOrderForTable('${tableName}')">
            <i class="fa-solid fa-plus" aria-hidden="true"></i> Abrir Pedido
          </button>
        </div>
      `;
    }

    gridEl.appendChild(card);
  });
}

/**
 * Atalho para abrir modal de novo pedido já com a mesa preenchida
 */
window.openAddOrderForTable = function(tableName) {
  const tableInput = document.getElementById('new-order-table');
  if (tableInput) tableInput.value = tableName;
  openModal('modal-add-order');
};

/**
 * Renderiza a Tela 3: Histórico de Vendas & Comandas Encerradas
 */
function renderHistoryView() {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  const finalizedOrders = orders.filter(o => o.status === 'finalizados');
  tbody.innerHTML = '';

  if (finalizedOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: #707A84; padding: 30px;">
          Nenhuma comanda encerrada no momento.
        </td>
      </tr>
    `;
    return;
  }

  finalizedOrders.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color: #FFAA16;">${order.id}</strong></td>
      <td>${order.timestamp}</td>
      <td><span class="status-tag tag-table">${order.table}</span></td>
      <td><strong>${order.customer}</strong></td>
      <td>${order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
      <td><strong style="color: #F5F5F5;">R$ ${order.total.toFixed(2).replace('.', ',')}</strong></td>
      <td>${order.payment}</td>
      <td style="text-align: right;">
        <button type="button" class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${order.id}')" title="Ver Comanda">
          <i class="fa-regular fa-eye" aria-hidden="true"></i>
        </button>
        <button type="button" class="btn-card-delete" onclick="promptDeleteOrder('${order.id}', '${order.customer}')" title="Excluir do histórico">
          <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Utilitários para abrir/fechar modais
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('modal-open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('modal-open');
}

/**
 * Exibe notificação flutuante de sucesso
 */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #FFAA16;"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

