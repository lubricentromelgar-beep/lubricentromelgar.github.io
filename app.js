// ════════════════════════════════════════════════════════════════
//  app.js — Lubricentro Melgar
//  Sistema de Gestión v1.5
//
//  SECCIONES:
//  1. Firebase Init + Auth
//  2. Login / Logout
//  3. Navegación
//  4. Dashboard
//  5. Inventario (Productos + Servicios)
//  6. POS / Nueva Venta
//  7. Clientes
//  8. Órdenes de Servicio
//  9. Historial de Ventas + Anulación
// 10. Reportes
// 11. Proveedores
// 12. Configuración
// 13. Utilidades (fmt, dateStr, toast, etc.)
//
//  Depende de: firebase.js (cargado antes en index.html)
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
//  INIT FIREBASE
// ════════════════════════════════════════════════════════════════
let app, auth, db;
let currentUser = null;
let currentUserData = null;

function initFirebase() {
  try {
    app  = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db   = firebase.firestore();
    db.enablePersistence().catch(() => {});
    setupAuthListener();
  } catch(e) {
    console.warn('Firebase init error:', e);
    // Demo mode sin Firebase
    showScreen('login');
  }
}

function setupAuthListener() {
  auth.onAuthStateChanged(async user => {
    if (user) {
      currentUser = user;
      await loadUserData(user.uid);
      showScreen('app');
      initApp();
    } else {
      currentUser = null;
      showScreen('login');
    }
  });
}

async function loadUserData(uid) {
  try {
    const doc = await db.collection('usuarios').doc(uid).get();
    if (doc.exists) {
      currentUserData = doc.data();
    } else {
      // Crear usuario básico si no existe
      currentUserData = {
        nombre: currentUser.displayName || currentUser.email.split('@')[0],
        email: currentUser.email,
        rol: 'admin'
      };
      await db.collection('usuarios').doc(uid).set(currentUserData);
    }
  } catch(e) {
    currentUserData = { nombre: 'Usuario', rol: 'admin' };
  }
  updateUserUI();
}

function updateUserUI() {
  if (!currentUserData) return;
  const nombre = currentUserData.nombre || 'Usuario';
  const rol    = currentUserData.rol   || 'admin';
  document.getElementById('user-name').textContent = nombre;
  document.getElementById('user-role').textContent = rol.charAt(0).toUpperCase() + rol.slice(1);
  document.getElementById('user-avatar').textContent = nombre.charAt(0).toUpperCase();
  // Ocultar items de admin si no es admin
  if (rol !== 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }
}

// ════════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════════
document.getElementById('btn-login').addEventListener('click', doLogin);
document.getElementById('login-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  const btn   = document.getElementById('btn-login');
  errEl.style.display = 'none';
  if (!email || !pass) { errEl.textContent = 'Completa todos los campos.'; errEl.style.display='block'; return; }
  btn.disabled = true; btn.textContent = 'Iniciando…';
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(e) {
    const msgs = {
      'auth/user-not-found':  'Usuario no encontrado.',
      'auth/wrong-password':  'Contraseña incorrecta.',
      'auth/invalid-email':   'Correo inválido.',
      'auth/too-many-requests': 'Demasiados intentos. Espera un momento.'
    };
    errEl.textContent = msgs[e.code] || 'Error al iniciar sesión.';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = 'Iniciar sesión';
  }
}

document.getElementById('btn-logout').addEventListener('click', () => {
  auth.signOut();
});

// ════════════════════════════════════════════════════════════════
//  SCREEN MANAGER
// ════════════════════════════════════════════════════════════════
function showScreen(screen) {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('login-page').style.display     = screen === 'login' ? 'flex' : 'none';
  document.getElementById('app').style.display            = screen === 'app'   ? 'flex' : 'none';
}

// ════════════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════════════
const PAGE_TITLES = {
  dashboard:  'Dashboard',
  ventas:     'Nueva venta',
  inventario: 'Inventario',
  clientes:   'Clientes',
  historial:  'Historial de ventas',
  reportes:   'Reportes',
  config:     'Configuración',
  proveedores: 'Proveedores'
};

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page)?.classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
  document.getElementById('topbar-title').textContent = PAGE_TITLES[page] || page;
  document.getElementById('topbar-actions').innerHTML = '';
  // Cerrar sidebar en mobile
  document.getElementById('sidebar').classList.remove('open');
  // Page-specific init
  if (page === 'ventas')     loadPOSProducts();
  if (page === 'proveedores') { fillProveedorSelects(); renderHistorialCompras(); }
  if (page === 'historial') { const d = new Date(); document.getElementById('hist-fecha').value = toDateInput(d); loadHistorial(); }
  if (page === 'reportes')   { document.getElementById('rpt-fecha').value = toDateInput(new Date()); loadTopProductos(); }
  if (page === 'proveedores') renderProveedores();
}

document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

document.getElementById('btn-menu').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ════════════════════════════════════════════════════════════════
//  APP INIT
// ════════════════════════════════════════════════════════════════
let unsubs = [];

function initApp() {
  navigate('dashboard');
  listenDashboard();
  listenInventario();
  listenClientes();
  listenProveedores();
  loadConfig();
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════
function listenDashboard() {
  const hoy = todayStr();
  // Ventas de hoy
  unsubs.push(db.collection('ventas')
    .where('fecha', '>=', hoy + 'T00:00:00')
    .where('fecha', '<=', hoy + 'T23:59:59')
    .onSnapshot(snap => {
      const ventas = snap.docs.map(d => ({id:d.id,...d.data()}));
      const total  = ventas.reduce((s,v) => s + (v.total||0), 0);
      document.getElementById('stat-ventas-hoy').textContent   = fmt(total);
      document.getElementById('stat-ventas-count').textContent = `${ventas.length} transacciones`;
      renderUltimasVentas(ventas.slice(-5).reverse());
    }));
}

function renderUltimasVentas(ventas) {
  const el = document.getElementById('dash-ultimas-ventas');
  if (!ventas.length) {
    el.innerHTML = '<div class="empty-state" style="padding:20px"><span class="icon" style="font-size:2rem">🛒</span><p>Sin ventas hoy</p></div>';
    return;
  }
  el.innerHTML = ventas.map(v => `
    <div class="flex items-center justify-between" style="padding:8px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:600;font-size:.88rem">${v.items?.length||0} productos</div>
        <div style="font-size:.78rem;color:var(--text3)">${timeStr(v.fecha)} · ${v.metodoPago||'—'}</div>
      </div>
      <div class="text-accent" style="font-weight:700">${fmt(v.total)}</div>
    </div>`).join('');
}

// ════════════════════════════════════════════════════════════════
//  INVENTARIO / PRODUCTOS
// ════════════════════════════════════════════════════════════════
let allProducts = [];
let invFilter   = 'todos';

function listenInventario() {
  unsubs.push(db.collection('productos').orderBy('nombre').onSnapshot(snap => {
    allProducts = snap.docs.map(d => ({id:d.id,...d.data()}));
    // Stats
    document.getElementById('stat-productos').textContent = allProducts.length;
    const bajo = allProducts.filter(p => (p.stock||0) <= (p.stockMin||0));
    document.getElementById('stat-stock-bajo').textContent = bajo.length;
    // Badge nav
    const badge = document.getElementById('nav-alerta-badge');
    badge.style.display = bajo.length ? 'inline' : 'none';
    badge.textContent   = bajo.length;
    // Dashboard alertas
    renderAlertasStock(bajo);
    // Tabla inventario
    renderInventario();
    // Rellenar selects
    fillProductoSelects();
  }));
}

function renderAlertasStock(bajo) {
  const el = document.getElementById('dash-alertas-stock');
  if (!bajo.length) {
    el.innerHTML = '<div class="empty-state" style="padding:20px"><span class="icon" style="font-size:2rem">✅</span><p>Stock OK</p></div>';
    return;
  }
  el.innerHTML = bajo.map(p => {
    const pct  = p.stockMin ? Math.min((p.stock / p.stockMin) * 100, 100) : 0;
    const color = p.stock === 0 ? 'var(--red)' : 'var(--accent)';
    return `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
      <div class="flex justify-between items-center">
        <span style="font-size:.88rem;font-weight:600">${p.nombre}</span>
        <span class="badge ${p.stock===0?'badge-red':'badge-amber'}">${p.stock===0?'Agotado':'Stock bajo'}</span>
      </div>
      <div class="flex justify-between" style="font-size:.78rem;color:var(--text3);margin-top:2px">
        <span>${p.stock} ${p.unidad||'u'} de mín ${p.stockMin||0}</span>
      </div>
      <div class="stock-bar mt-4">
        <div class="stock-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
    </div>`;
  }).join('');
}

function renderInventario() {
  const tbody = document.getElementById('inventario-tbody');
  const q = document.getElementById('inv-search')?.value.toLowerCase() || '';
  let prods = allProducts.filter(p =>
    (!q || p.nombre.toLowerCase().includes(q) || (p.marca||'').toLowerCase().includes(q) || (p.sku||'').toLowerCase().includes(q)) &&
    (invFilter === 'todos' || p.categoria === invFilter)
  );

  if (!prods.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text3)">Sin productos</td></tr>';
    return;
  }
  tbody.innerHTML = prods.map(p => {
    const esServicio = p.categoria === 'servicio';
    const bajo  = !esServicio && (p.stock||0) <= (p.stockMin||0);
    const agot  = !esServicio && (p.stock||0) === 0;
    const estado = esServicio
      ? '<span class="badge badge-blue">Servicio</span>'
      : agot ? '<span class="badge badge-red">Agotado</span>'
      : bajo ? '<span class="badge badge-amber">Stock bajo</span>'
      : '<span class="badge badge-green">OK</span>';
    return `<tr>
      <td>
        <div style="font-weight:600">${p.nombre}</div>
        <div style="font-size:.78rem;color:var(--text3)">${p.marca||''} ${p.sku ? '· ' + p.sku : ''}</div>
      </td>
      <td><span class="badge badge-gray">${p.categoria||'—'}</span></td>
      <td>
        ${esServicio
          ? '<span style="color:var(--text3);font-size:.8rem">N/A</span>'
          : `<span style="font-weight:700;color:${agot?'var(--red)':bajo?'var(--accent)':'var(--green)'}">${p.stock||0}</span>
             <span style="color:var(--text3);font-size:.8rem"> ${p.unidad||'u'}</span>`
        }
      </td>
      <td style="color:var(--text3)">${esServicio ? '—' : (p.stockMin||0)}</td>
      <td style="color:var(--text3)">${esServicio ? '—' : fmt(p.costo||0)}</td>
      <td style="font-weight:600">${fmt(p.precio||0)}</td>
      <td>${estado}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-sm btn-ghost btn-icon" onclick='editProducto("${p.id}")' title="Editar">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon" onclick='eliminarProducto("${p.id}","${p.nombre}")' title="Eliminar">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Filtros categoría
  buildCatFilters();
}

function buildCatFilters() {
  const cats = [...new Set(allProducts.map(p => p.categoria).filter(Boolean))];
  const el = document.getElementById('inv-cat-filters');
  if (!el) return;
  el.innerHTML = `<button class="filter-chip ${invFilter==='todos'?'active':''}" onclick="setInvFilter('todos',this)">Todos</button>` +
    cats.map(c => `<button class="filter-chip ${invFilter===c?'active':''}" onclick="setInvFilter('${c}',this)">${c}</button>`).join('');
}

function setInvFilter(cat, btn) {
  invFilter = cat;
  document.querySelectorAll('#inv-cat-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderInventario();
}

function filterInventario() { renderInventario(); }

function fillProductoSelects() {
  // Para entrada de inventario
  const entSel = document.getElementById('entrada-producto');
  if (entSel) {
    entSel.innerHTML = allProducts.map(p =>
      `<option value="${p.id}">${p.nombre} ${p.marca?'('+p.marca+')':''} — stock: ${p.stock||0}</option>`
    ).join('');
  }
}

// Modal producto
function openModalProducto(id) {
  clearModalProducto();
  document.getElementById('modal-prod-title').textContent = 'Nuevo producto / servicio';
  document.getElementById('modal-producto').classList.add('open');
}

function clearModalProducto() {
  ['prod-nombre','prod-marca','prod-sku','prod-desc'].forEach(id => document.getElementById(id).value = '');
  ['prod-costo','prod-precio','prod-stock-min','prod-stock'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-categoria').value = 'lubricante';
  document.getElementById('prod-unidad').value = 'litro';
  onCatChange('lubricante');
}

async function editProducto(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  document.getElementById('prod-id').value         = id;
  document.getElementById('prod-nombre').value     = p.nombre || '';
  document.getElementById('prod-marca').value      = p.marca  || '';
  document.getElementById('prod-sku').value        = p.sku    || '';
  document.getElementById('prod-desc').value       = p.descripcion || '';
  document.getElementById('prod-costo').value      = p.costo  || '';
  document.getElementById('prod-precio').value     = p.precio || '';
  document.getElementById('prod-stock-min').value  = p.stockMin || '';
  document.getElementById('prod-stock').value      = p.stock  || '';
  document.getElementById('prod-categoria').value  = p.categoria || 'lubricante';
  document.getElementById('prod-unidad').value     = p.unidad || 'litro';
  onCatChange(p.categoria || 'lubricante');
  document.getElementById('modal-prod-title').textContent = p.categoria === 'servicio' ? 'Editar servicio' : 'Editar producto';
  document.getElementById('modal-producto').classList.add('open');
}

async function guardarProducto() {
  const nombre  = document.getElementById('prod-nombre').value.trim();
  const precio  = parseFloat(document.getElementById('prod-precio').value) || 0;
  if (!nombre)  { toast('Ingresa el nombre del producto', 'error'); return; }
  if (!precio)  { toast('Ingresa el precio de venta',     'error'); return; }

  const data = {
    nombre,
    marca:       document.getElementById('prod-marca').value.trim(),
    sku:         document.getElementById('prod-sku').value.trim(),
    descripcion: document.getElementById('prod-desc').value.trim(),
    categoria:   document.getElementById('prod-categoria').value,
    unidad:      document.getElementById('prod-unidad').value,
    costo:       parseFloat(document.getElementById('prod-costo').value) || 0,
    precio,
    stockMin:    parseInt(document.getElementById('prod-stock-min').value) || 0,
    stock:       parseInt(document.getElementById('prod-stock').value)     || 0,
    updatedAt:   new Date().toISOString()
  };

  try {
    const id = document.getElementById('prod-id').value;
    if (id) {
      await db.collection('productos').doc(id).update(data);
      toast('Producto actualizado', 'success');
    } else {
      data.createdAt = new Date().toISOString();
      await db.collection('productos').add(data);
      toast('Producto creado', 'success');
    }
    closeModal('modal-producto');
  } catch(e) {
    toast('Error al guardar: ' + e.message, 'error');
  }
}

// Entrada de inventario
function openModalEntrada() {
  document.getElementById('entrada-qty').value  = '';
  document.getElementById('entrada-costo').value = '';
  document.getElementById('entrada-ref').value  = '';
  document.getElementById('modal-entrada').classList.add('open');
}

async function guardarEntrada() {
  const prodId = document.getElementById('entrada-producto').value;
  const qty    = parseInt(document.getElementById('entrada-qty').value) || 0;
  if (!prodId) { toast('Selecciona un producto', 'error'); return; }
  if (qty <= 0) { toast('Ingresa una cantidad válida', 'error'); return; }

  const prod = allProducts.find(p => p.id === prodId);
  if (!prod) return;

  const batch = db.batch();
  // Actualizar stock
  batch.update(db.collection('productos').doc(prodId), {
    stock: (prod.stock || 0) + qty
  });
  // Registrar movimiento
  const movRef = db.collection('movimientos').doc();
  batch.set(movRef, {
    tipo:       'entrada',
    productoId: prodId,
    productoNombre: prod.nombre,
    qty,
    costo:      parseFloat(document.getElementById('entrada-costo').value) || prod.costo || 0,
    referencia: document.getElementById('entrada-ref').value.trim(),
    usuarioId:  currentUser?.uid,
    fecha:      new Date().toISOString()
  });

  try {
    await batch.commit();
    toast(`+${qty} ${prod.unidad||'u'} de ${prod.nombre} ingresadas`, 'success');
    closeModal('modal-entrada');
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ════════════════════════════════════════════════════════════════
//  POS — PUNTO DE VENTA
// ════════════════════════════════════════════════════════════════
let cart = [];
let posFilter = '';
let posProducts = [];

function loadPOSProducts() {
  posProducts = allProducts;
  renderPOSGrid();
  buildPOSCatFilters();
  // Llenar select de clientes
  fillClienteSelects();
}

function renderPOSGrid() {
  const grid = document.getElementById('product-grid');
  const q    = (document.getElementById('pos-search')?.value || '').toLowerCase();
  let prods  = posProducts.filter(p =>
    (!q || p.nombre.toLowerCase().includes(q) || (p.marca||'').toLowerCase().includes(q)) &&
    (!posFilter || p.categoria === posFilter)
  );

  if (!prods.length) {
    grid.innerHTML = '<div class="empty-state"><span class="icon">📦</span><p>Sin productos</p></div>';
    return;
  }
  grid.innerHTML = prods.map(p => {
    const esServicio = p.categoria === 'servicio';
    const out = !esServicio && (p.stock || 0) === 0;
    return `<div class="product-card ${out?'out-of-stock':''}" onclick="${out?'':'addToCart(\''+p.id+'\')'}">
      <div class="prod-cat-badge">${esServicio ? '🔧 servicio' : (p.categoria||'producto')}</div>
      <div class="prod-name">${p.nombre}</div>
      <div class="prod-brand">${p.marca||''}</div>
      <div class="prod-price">${fmt(p.precio||0)}</div>
      <div class="prod-stock">${esServicio ? '<span style="color:var(--blue)">Servicio</span>' : out?'<span style="color:var(--red)">Agotado</span>':'Stock: '+p.stock+' '+(p.unidad||'u')}</div>
    </div>`;
  }).join('');
}

function buildPOSCatFilters() {
  const cats = [...new Set(allProducts.map(p => p.categoria).filter(Boolean))];
  const el   = document.getElementById('pos-cat-filters');
  if (!el) return;
  el.innerHTML = `<button class="filter-chip ${!posFilter?'active':''}" onclick="setPosFilter('',this)">Todos</button>` +
    cats.map(c => `<button class="filter-chip" onclick="setPosFilter('${c}',this)">${c}</button>`).join('');
}

function setPosFilter(cat, btn) {
  posFilter = cat;
  document.querySelectorAll('#pos-cat-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPOSGrid();
}

function filterProducts() { renderPOSGrid(); }

function addToCart(prodId) {
  const p = allProducts.find(x => x.id === prodId);
  if (!p) return;
  const esServicio = p.categoria === 'servicio';
  if (!esServicio && !p.stock) { toast('Producto agotado', 'error'); return; }
  const existing = cart.find(x => x.id === prodId);
  if (existing) {
    if (!esServicio && existing.qty >= p.stock) { toast('No hay más stock disponible', 'error'); return; }
    existing.qty++;
  } else {
    cart.push({ id: prodId, nombre: p.nombre, marca: p.marca||'', precio: p.precio, qty: 1 });
  }
  renderCart();
}

function changeQty(prodId, delta) {
  const item = cart.find(x => x.id === prodId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== prodId);
  renderCart();
}

function removeFromCart(prodId) {
  cart = cart.filter(x => x.id !== prodId);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function renderCart() {
  const el    = document.getElementById('cart-items');
  const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  document.getElementById('cart-total').textContent = fmt(total);
  document.getElementById('btn-cobrar').disabled = cart.length === 0;

  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty">Agrega productos haciendo clic</div>';
    return;
  }
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div style="flex:1;min-width:0">
        <div class="cart-item-name">${item.nombre}</div>
        <div class="cart-item-brand">${item.marca}</div>
      </div>
      <div class="cart-qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
      </div>
      <div class="cart-item-total">${fmt(item.precio * item.qty)}</div>
      <button class="cart-item-del" onclick="removeFromCart('${item.id}')">✕</button>
    </div>`).join('');
}

async function procesarVenta() {
  if (!cart.length) return;
  const btn = document.getElementById('btn-cobrar');
  btn.disabled = true; btn.textContent = 'Procesando…';

  const clienteId = document.getElementById('pos-cliente')?.value || '';
  const metodo    = document.getElementById('metodo-pago')?.value || 'efectivo';
  const total     = cart.reduce((s,i) => s + i.precio * i.qty, 0);

  const venta = {
    fecha:       new Date().toISOString(),
    cajeroId:    currentUser?.uid,
    cajeroNombre: currentUserData?.nombre || '—',
    clienteId,
    items: cart.map(i => ({
      productoId: i.id,
      nombre:     i.nombre,
      precio:     i.precio,
      qty:        i.qty,
      subtotal:   i.precio * i.qty
    })),
    total,
    metodoPago: metodo
  };

  try {
    const batch = db.batch();
    // Guardar venta
    const ventaRef = db.collection('ventas').doc();
    batch.set(ventaRef, venta);
    // Descontar stock solo para productos físicos (los servicios no tienen stock)
    for (const item of cart) {
      const prod = allProducts.find(p => p.id === item.id);
      if (prod && prod.categoria !== 'servicio') {
        batch.update(db.collection('productos').doc(item.id), {
          stock: Math.max(0, (prod.stock||0) - item.qty)
        });
        const movRef = db.collection('movimientos').doc();
        batch.set(movRef, {
          tipo:           'salida',
          productoId:     item.id,
          productoNombre: item.nombre,
          qty:            item.qty,
          precio:         item.precio,
          ventaId:        ventaRef.id,
          usuarioId:      currentUser?.uid,
          fecha:          new Date().toISOString()
        });
      }
    }
    await batch.commit();
    toast(`Venta registrada — ${fmt(total)}`, 'success');
    // Imprimir ticket
    printTicket({...venta, id: ventaRef.id});
    clearCart();
    document.getElementById('pos-cliente').value = '';
  } catch(e) {
    toast('Error al procesar venta: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Cobrar venta';
  }
}

// ════════════════════════════════════════════════════════════════
//  CLIENTES
// ════════════════════════════════════════════════════════════════
let allClientes = [];

function listenClientes() {
  unsubs.push(db.collection('clientes').orderBy('nombre').onSnapshot(snap => {
    allClientes = snap.docs.map(d => ({id:d.id,...d.data()}));
    renderClientes();
    fillClienteSelects();
  }));
}

function fillClienteSelects() {
  const selects = [
    document.getElementById('pos-cliente'),
  ];
  selects.forEach(sel => {
    if (!sel) return;
    const current = sel.value;
    const base = sel.id === 'pos-cliente' ? '<option value="">— Cliente (opcional) —</option>'
                                           : '<option value="">— Seleccionar —</option>';
    sel.innerHTML = base + allClientes.map(c =>
      `<option value="${c.id}">${c.nombre} ${c.vehiculos?.length ? '· '+c.vehiculos[0].placa : ''}</option>`
    ).join('');
    if (current) sel.value = current;
  });
}

function renderClientes() {
  const tbody = document.getElementById('clientes-tbody');
  const q     = (document.getElementById('cli-search')?.value || '').toLowerCase();
  const clis  = allClientes.filter(c =>
    !q ||
    c.nombre?.toLowerCase().includes(q) ||
    c.telefono?.toLowerCase().includes(q) ||
    c.vehiculos?.some(v => v.placa?.toLowerCase().includes(q))
  );

  if (!clis.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text3)">Sin clientes</td></tr>';
    return;
  }
  tbody.innerHTML = clis.map(c => {
    const placas = c.vehiculos?.map(v => `<span class="badge badge-blue" style="margin:1px">${v.placa}</span>`).join('') || '—';
    return `<tr>
      <td>
        <div style="font-weight:600">${c.nombre}</div>
        <div style="font-size:.78rem;color:var(--text3)">${c.email||''}</div>
      </td>
      <td>${c.telefono||'—'}</td>
      <td>${placas}</td>
      <td style="color:var(--text3);font-size:.85rem">${c.ultimaVisita ? dateStr(c.ultimaVisita) : '—'}</td>
      <td>${c.totalServicios||0}</td>
      <td>
        <button class="btn btn-sm btn-ghost btn-icon" onclick='editCliente("${c.id}")' title="Editar">✏️</button>
      </td>
    </tr>`;
  }).join('');
}

function filterClientes() { renderClientes(); }

function openModalCliente() {
  ['cli-nombre','cli-tel','cli-email','cli-placa','cli-veh-marca','cli-veh-modelo','cli-aceite'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('cli-veh-anio').value = '';
  document.getElementById('cli-veh-km').value = '';
  document.getElementById('cli-id').value = '';
  document.getElementById('modal-cli-title').textContent = 'Nuevo cliente';
  document.getElementById('modal-cliente').classList.add('open');
}

async function editCliente(id) {
  const c = allClientes.find(x => x.id === id);
  if (!c) return;
  document.getElementById('cli-id').value     = id;
  document.getElementById('cli-nombre').value = c.nombre || '';
  document.getElementById('cli-tel').value    = c.telefono || '';
  document.getElementById('cli-email').value  = c.email || '';
  const v = c.vehiculos?.[0];
  if (v) {
    document.getElementById('cli-placa').value     = v.placa || '';
    document.getElementById('cli-veh-marca').value = v.marca || '';
    document.getElementById('cli-veh-modelo').value= v.modelo || '';
    document.getElementById('cli-veh-anio').value  = v.anio || '';
    document.getElementById('cli-veh-km').value    = v.km || '';
    document.getElementById('cli-aceite').value    = v.tipoAceite || '';
  }
  document.getElementById('modal-cli-title').textContent = 'Editar cliente';
  document.getElementById('modal-cliente').classList.add('open');
}

async function guardarCliente() {
  const nombre = document.getElementById('cli-nombre').value.trim();
  const tel    = document.getElementById('cli-tel').value.trim();
  if (!nombre) { toast('Ingresa el nombre', 'error'); return; }

  const vehiculo = {
    placa:      document.getElementById('cli-placa').value.trim().toUpperCase(),
    marca:      document.getElementById('cli-veh-marca').value.trim(),
    modelo:     document.getElementById('cli-veh-modelo').value.trim(),
    anio:       parseInt(document.getElementById('cli-veh-anio').value) || null,
    km:         parseInt(document.getElementById('cli-veh-km').value) || null,
    tipoAceite: document.getElementById('cli-aceite').value.trim()
  };

  const data = {
    nombre, telefono: tel,
    email: document.getElementById('cli-email').value.trim(),
    vehiculos: vehiculo.placa ? [vehiculo] : [],
    updatedAt: new Date().toISOString()
  };

  try {
    const id = document.getElementById('cli-id').value;
    if (id) {
      // Preservar vehículos existentes al editar
      const existing = allClientes.find(c => c.id === id);
      if (existing?.vehiculos?.length && vehiculo.placa) {
        const idx = existing.vehiculos.findIndex(v => v.placa === vehiculo.placa);
        if (idx >= 0) existing.vehiculos[idx] = vehiculo;
        else existing.vehiculos.unshift(vehiculo);
        data.vehiculos = existing.vehiculos;
      }
      await db.collection('clientes').doc(id).update(data);
      toast('Cliente actualizado', 'success');
    } else {
      data.createdAt = new Date().toISOString();
      data.totalServicios = 0;
      await db.collection('clientes').add(data);
      toast('Cliente registrado', 'success');
    }
    closeModal('modal-cliente');
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ════════════════════════════════════════════════════════════════
//  HISTORIAL
// ════════════════════════════════════════════════════════════════
let lastVentaDetail = null;

async function loadHistorial() {
  const fecha = document.getElementById('hist-fecha').value;
  if (!fecha) return;
  const tbody = document.getElementById('historial-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text3)">Cargando…</td></tr>';

  try {
    const snap = await db.collection('ventas')
      .where('fecha', '>=', fecha + 'T00:00:00')
      .where('fecha', '<=', fecha + 'T23:59:59')
      .orderBy('fecha','desc')
      .get();

    const ventas = snap.docs.map(d => ({id:d.id,...d.data()}));
    const total  = ventas.reduce((s,v) => s + (v.total||0), 0);
    const avg    = ventas.length ? total / ventas.length : 0;

    document.getElementById('hist-total').textContent = fmt(total);
    document.getElementById('hist-count').textContent = ventas.length;
    document.getElementById('hist-avg').textContent   = fmt(avg);

    if (!ventas.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text3)">Sin ventas en esta fecha</td></tr>';
      return;
    }
    tbody.innerHTML = ventas.map(v => `<tr style="${v.anulada?'opacity:.45;text-decoration:line-through':''}" >
      <td style="color:var(--text3);font-size:.85rem">${timeStr(v.fecha)}</td>
      <td style="font-size:.85rem">${v.items?.map(i=>`${i.nombre} ×${i.qty}`).join(', ')}</td>
      <td style="color:var(--text3)">${v.clienteId ? (allClientes.find(c=>c.id===v.clienteId)?.nombre||'—') : '—'}</td>
      <td><span class="badge badge-gray">${v.metodoPago||'—'}</span></td>
      <td style="color:var(--text3);font-size:.82rem">${v.cajeroNombre||'—'}</td>
      <td style="font-weight:700;color:${v.anulada?'var(--text3)':'var(--accent)'}">${v.anulada?'<span class="badge badge-red">Anulada</span>':fmt(v.total)}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-sm btn-ghost btn-icon" onclick='showVentaDetail(${JSON.stringify(v).replace(/'/g,"&#39;")})' title="Detalle">👁️</button>
          ${!v.anulada ? `<button class="btn btn-sm btn-danger btn-icon" onclick='pedirAnulacion("${v.id}")' title="Anular venta">🚫</button>` : ''}
        </div>
      </td>
    </tr>`).join('');
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--red)">Error: ${e.message}</td></tr>`;
  }
}

function showVentaDetail(venta) {
  lastVentaDetail = venta;
  const el = document.getElementById('venta-detail-content');
  el.innerHTML = `
    <div class="flex justify-between items-center mb-16">
      <div>
        <div style="font-size:.82rem;color:var(--text3)">${dateStr(venta.fecha)} ${timeStr(venta.fecha)}</div>
        <div style="font-size:.82rem;color:var(--text3)">Cajero: ${venta.cajeroNombre||'—'}</div>
      </div>
      <span class="badge badge-gray">${venta.metodoPago||'—'}</span>
    </div>
    <table style="width:100%;font-size:.88rem;margin-bottom:16px">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px;color:var(--text3)">Producto</th>
          <th style="text-align:center;padding:6px;color:var(--text3)">Cant</th>
          <th style="text-align:right;padding:6px;color:var(--text3)">Precio</th>
          <th style="text-align:right;padding:6px;color:var(--text3)">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${(venta.items||[]).map(i=>`<tr>
          <td style="padding:6px">${i.nombre}</td>
          <td style="padding:6px;text-align:center">${i.qty}</td>
          <td style="padding:6px;text-align:right">${fmt(i.precio)}</td>
          <td style="padding:6px;text-align:right;font-weight:600">${fmt(i.subtotal)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <hr class="divider">
    <div class="flex justify-between" style="font-size:1.1rem;font-weight:700">
      <span>Total</span><span class="text-accent">${fmt(venta.total)}</span>
    </div>`;
  document.getElementById('modal-venta-detail').classList.add('open');
}

function reprintTicket() {
  if (lastVentaDetail) printTicket(lastVentaDetail);
}

// ════════════════════════════════════════════════════════════════
//  REPORTES
// ════════════════════════════════════════════════════════════════
async function loadTopProductos() {
  try {
    const snap = await db.collection('ventas').orderBy('fecha','desc').limit(200).get();
    const counts = {};
    snap.docs.forEach(d => {
      (d.data().items||[]).forEach(item => {
        counts[item.nombre] = (counts[item.nombre]||0) + item.qty;
      });
    });
    const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const el = document.getElementById('top-productos');
    if (!sorted.length) { el.textContent = 'Sin datos'; return; }
    el.innerHTML = sorted.map(([nombre, qty], i) => `
      <div class="flex justify-between items-center" style="padding:6px 0;border-bottom:1px solid var(--border)">
        <div class="flex items-center gap-8">
          <span style="color:var(--text3);font-size:.78rem;width:16px">${i+1}</span>
          <span style="font-size:.88rem">${nombre}</span>
        </div>
        <span class="badge badge-amber">${qty} u</span>
      </div>`).join('');
  } catch(e) {
    document.getElementById('top-productos').textContent = 'Error cargando datos';
  }
}

async function generarReporteDiario() {
  const fecha = document.getElementById('rpt-fecha').value;
  if (!fecha) { toast('Selecciona una fecha', 'error'); return; }
  const snap = await db.collection('ventas')
    .where('fecha', '>=', fecha + 'T00:00:00')
    .where('fecha', '<=', fecha + 'T23:59:59')
    .orderBy('fecha','asc').get();
  const ventas = snap.docs.map(d => d.data());
  const config = getConfig();
  generarReportePDF(ventas, fecha, config);
}

function generarReportePDF(ventas, fecha, config) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const total = ventas.reduce((s,v) => s + (v.total||0), 0);
  const negocio = config.nombre || 'Lubricentro';

  doc.setFontSize(18); doc.setFont(undefined,'bold');
  doc.text(negocio, 105, 18, {align:'center'});
  doc.setFontSize(11); doc.setFont(undefined,'normal');
  doc.text(`Reporte de ventas — ${fecha}`, 105, 26, {align:'center'});
  if (config.tel) doc.text(`Tel: ${config.tel}`, 105, 32, {align:'center'});
  doc.line(14, 36, 196, 36);

  let y = 44;
  doc.setFontSize(9);
  doc.setFont(undefined,'bold');
  doc.text('Hora', 14, y); doc.text('Productos', 38, y); doc.text('Método', 130, y); doc.text('Total', 186, y, {align:'right'});
  doc.setFont(undefined,'normal');
  y += 4; doc.line(14, y, 196, y); y += 5;

  ventas.forEach(v => {
    const items = (v.items||[]).map(i=>`${i.nombre} ×${i.qty}`).join(', ');
    const itemsShort = items.length > 60 ? items.substring(0,57)+'…' : items;
    doc.text(timeStr(v.fecha), 14, y);
    doc.text(itemsShort, 38, y);
    doc.text(v.metodoPago||'', 130, y);
    doc.setFont(undefined,'bold');
    doc.text(`$${(v.total||0).toFixed(2)}`, 186, y, {align:'right'});
    doc.setFont(undefined,'normal');
    y += 6;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  doc.line(14, y, 196, y); y += 6;
  doc.setFontSize(11); doc.setFont(undefined,'bold');
  doc.text(`Total del día: $${total.toFixed(2)}`, 186, y, {align:'right'});
  doc.text(`Transacciones: ${ventas.length}`, 14, y);

  doc.save(`reporte-${fecha}.pdf`);
  toast('PDF generado', 'success');
}

// ════════════════════════════════════════════════════════════════
//  TICKET PDF
// ════════════════════════════════════════════════════════════════
function printTicket(venta) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ format:[80, 180], unit:'mm' });
    const cfg = getConfig();
    const negocio = cfg.nombre || 'Lubricentro';

    let y = 8;
    doc.setFontSize(14); doc.setFont(undefined,'bold');
    doc.text(negocio, 40, y, {align:'center'}); y += 6;
    doc.setFontSize(8); doc.setFont(undefined,'normal');
    if (cfg.tel) { doc.text(cfg.tel, 40, y, {align:'center'}); y += 4; }
    if (cfg.dir) { doc.text(cfg.dir, 40, y, {align:'center'}); y += 4; }
    doc.text(`${dateStr(venta.fecha)} ${timeStr(venta.fecha)}`, 40, y, {align:'center'}); y += 4;
    doc.text(`Cajero: ${venta.cajeroNombre||'—'}`, 40, y, {align:'center'}); y += 4;
    doc.line(4, y, 76, y); y += 4;

    doc.setFontSize(7);
    (venta.items||[]).forEach(item => {
      doc.text(`${item.nombre}`, 4, y);
      doc.text(`${item.qty} x ${fmt(item.precio)}`, 42, y);
      doc.setFont(undefined,'bold');
      doc.text(fmt(item.subtotal), 76, y, {align:'right'});
      doc.setFont(undefined,'normal');
      y += 4;
    });

    doc.line(4, y, 76, y); y += 4;
    doc.setFontSize(9); doc.setFont(undefined,'bold');
    doc.text('TOTAL', 4, y);
    doc.text(fmt(venta.total||0), 76, y, {align:'right'}); y += 5;
    doc.setFontSize(7); doc.setFont(undefined,'normal');
    doc.text(`Pago: ${venta.metodoPago||'—'}`, 40, y, {align:'center'}); y += 5;
    doc.text('¡Gracias por su visita!', 40, y, {align:'center'});

    doc.autoPrint();
    doc.output('dataurlnewwindow');
  } catch(e) {
    toast('Error al generar ticket: ' + e.message, 'error');
  }
}

// ════════════════════════════════════════════════════════════════
//  ELIMINAR PRODUCTO
// ════════════════════════════════════════════════════════════════
async function eliminarProducto(id, nombre) {
  if (!confirm(`¿Eliminar el producto "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
  try {
    await db.collection('productos').doc(id).delete();
    toast(`Producto "${nombre}" eliminado`, 'success');
  } catch(e) {
    toast('Error al eliminar: ' + e.message, 'error');
  }
}

// ── Mostrar/ocultar campos de stock según categoría ──
function onCatChange(cat) {
  const esServicio = cat === 'servicio';
  const stockFields = document.getElementById('stock-actual-group');
  const stockMinGroup = document.getElementById('stock-min-group');
  if (stockFields)   stockFields.style.display   = esServicio ? 'none' : '';
  if (stockMinGroup) stockMinGroup.style.display  = esServicio ? 'none' : '';
  // Precio label
  const lbl = document.querySelector('label[for="prod-precio"]');
  if (lbl && esServicio) lbl.textContent = 'Precio del servicio *';
  else if (lbl) lbl.textContent = 'Precio venta *';
}

// ── Anulación de ventas ──
let ventaAAnular = null;

function pedirAnulacion(ventaId) {
  ventaAAnular = ventaId;
  document.getElementById('anular-pass').value = '';
  document.getElementById('anular-venta-id').value = ventaId;
  document.getElementById('modal-anular').classList.add('open');
  setTimeout(() => document.getElementById('anular-pass').focus(), 200);
}

async function confirmarAnulacion() {
  const pass = document.getElementById('anular-pass').value;
  const ventaId = document.getElementById('anular-venta-id').value;
  if (!pass) { toast('Ingresa la contraseña', 'error'); return; }
  if (!ventaId) return;

  try {
    // Reautenticar al usuario admin con su contraseña
    const { EmailAuthProvider, reauthenticateWithCredential } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js').catch(() => null) || {};

    // Verificación alternativa: comparar con el admin guardado en Firestore
    const adminSnap = await db.collection('usuarios')
      .where('rol', '==', 'admin')
      .limit(5)
      .get();

    // Verificar usando Firebase Auth re-authenticate
    const credential = firebase.auth.EmailAuthProvider.credential(
      currentUser.email,
      pass
    );
    await currentUser.reauthenticateWithCredential(credential);

    // Contraseña correcta → anular
    await db.collection('ventas').doc(ventaId).update({
      anulada:       true,
      anuladaEn:     new Date().toISOString(),
      anuladaPor:    currentUser?.uid,
      anuladaPorNombre: currentUserData?.nombre || '—'
    });

    toast('Venta anulada correctamente', 'success');
    closeModal('modal-anular');
    loadHistorial(); // recargar tabla
    ventaAAnular = null;

  } catch(e) {
    if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
      toast('Contraseña incorrecta', 'error');
    } else {
      toast('Error: ' + e.message, 'error');
    }
  }
}

// ════════════════════════════════════════════════════════════════
//  PROVEEDORES
// ════════════════════════════════════════════════════════════════
let allProveedores = [];
let allCompras     = [];
let compraItems    = [];
let provDetalleId  = null;

function listenProveedores() {
  try {
    unsubs.push(db.collection('proveedores').orderBy('nombre').onSnapshot(snap => {
      allProveedores = snap.docs.map(d => ({id:d.id,...d.data()}));
      const el = document.getElementById('stat-prov-total');
      if (el) el.textContent = allProveedores.length;
      renderProveedores();
      fillProveedorSelects();
    }, err => console.warn('proveedores listener:', err)));

    unsubs.push(db.collection('compras_proveedor').orderBy('fecha','desc').onSnapshot(snap => {
      allCompras = snap.docs.map(d => ({id:d.id,...d.data()}));
      calcEstadisticasCompras();
      renderHistorialCompras();
    }, err => console.warn('compras listener:', err)));
  } catch(e) {
    console.warn('listenProveedores error:', e);
  }
}

function calcEstadisticasCompras() {
  const mesActual = new Date().toISOString().substring(0,7);
  const totalMes  = allCompras.filter(c => c.fecha?.startsWith(mesActual)).reduce((s,c) => s+(c.total||0), 0);
  const totalHist = allCompras.reduce((s,c) => s+(c.total||0), 0);
  const elMes  = document.getElementById('stat-prov-compras-mes');
  const elHist = document.getElementById('stat-prov-total-hist');
  if (elMes)  elMes.textContent  = fmt(totalMes);
  if (elHist) elHist.textContent = fmt(totalHist);
}

function renderProveedores() {
  const tbody = document.getElementById('proveedores-tbody');
  if (!tbody) return;
  if (!allProveedores.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text3)">Sin proveedores registrados</td></tr>';
    return;
  }
  tbody.innerHTML = allProveedores.map(p => {
    const comprasProv = allCompras.filter(c => c.proveedorId === p.id);
    const totalComp   = comprasProv.reduce((s,c) => s+(c.total||0), 0);
    const ultimaComp  = comprasProv[0]?.fecha ? dateStr(comprasProv[0].fecha) : '—';
    const credito     = (p.diasCredito||0) > 0
      ? `<span class="badge badge-blue">${p.diasCredito} días</span>`
      : `<span class="badge badge-gray">Inmediato</span>`;
    return `<tr>
      <td>
        <div style="font-weight:600">${p.nombre}</div>
        <div style="font-size:.78rem;color:var(--text3)">${p.contacto||''}</div>
      </td>
      <td style="color:var(--text2)">${p.telefono||'—'}</td>
      <td style="font-size:.82rem;color:var(--text3);max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.productosQueVende||'—'}</td>
      <td>${credito}</td>
      <td style="font-weight:600;color:var(--accent)">${fmt(totalComp)}</td>
      <td style="color:var(--text3);font-size:.82rem">${ultimaComp}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-sm btn-ghost btn-icon" onclick='verProveedor("${p.id}")' title="Ver detalle">👁️</button>
          <button class="btn btn-sm btn-ghost btn-icon" onclick='editProveedor("${p.id}")' title="Editar">✏️</button>
          <button class="btn btn-sm btn-green btn-icon" onclick='abrirCompra("${p.id}")' title="Registrar compra" style="font-size:.75rem;padding:5px 8px">+ Compra</button>
          <button class="btn btn-sm btn-danger btn-icon" onclick='eliminarProveedor("${p.id}","${p.nombre}")' title="Eliminar">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function renderHistorialCompras() {
  const tbody   = document.getElementById('compras-tbody');
  if (!tbody) return;
  const filtro  = document.getElementById('prov-filtro-select')?.value || '';
  let compras   = filtro ? allCompras.filter(c => c.proveedorId === filtro) : allCompras;
  if (!compras.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text3)">Sin compras registradas</td></tr>';
    return;
  }
  tbody.innerHTML = compras.map(c => `<tr>
    <td style="color:var(--text3);font-size:.85rem">${dateStr(c.fecha)}</td>
    <td style="font-weight:600">${c.proveedorNombre||'—'}</td>
    <td style="font-size:.82rem;color:var(--text2)">${(c.items||[]).map(i=>`${i.nombre} ×${i.qty}`).join(', ')}</td>
    <td style="font-weight:700;color:var(--accent)">${fmt(c.total||0)}</td>
    <td style="color:var(--text3);font-size:.82rem">${c.usuarioNombre||'—'}</td>
  </tr>`).join('');
}

function fillProveedorSelects() {
  const selects = [
    document.getElementById('compra-proveedor'),
    document.getElementById('prov-filtro-select')
  ];
  selects.forEach(sel => {
    if (!sel) return;
    const cur = sel.value;
    const base = sel.id === 'prov-filtro-select'
      ? '<option value="">— Todos los proveedores —</option>'
      : '<option value="">— Seleccionar —</option>';
    sel.innerHTML = base + allProveedores.map(p =>
      `<option value="${p.id}">${p.nombre}</option>`
    ).join('');
    if (cur) sel.value = cur;
  });
}

// ── Modal Proveedor ──
function openModalProveedor() {
  ['prov-nombre','prov-tel','prov-contacto','prov-email','prov-productos','prov-dir','prov-notas'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('prov-credito').value = '0';
  document.getElementById('prov-id').value = '';
  document.getElementById('modal-prov-title').textContent = 'Nuevo proveedor';
  document.getElementById('modal-proveedor').classList.add('open');
}

async function editProveedor(id) {
  const p = allProveedores.find(x => x.id === id);
  if (!p) return;
  document.getElementById('prov-id').value        = id;
  document.getElementById('prov-nombre').value    = p.nombre || '';
  document.getElementById('prov-tel').value       = p.telefono || '';
  document.getElementById('prov-contacto').value  = p.contacto || '';
  document.getElementById('prov-email').value     = p.email || '';
  document.getElementById('prov-productos').value = p.productosQueVende || '';
  document.getElementById('prov-credito').value   = p.diasCredito || 0;
  document.getElementById('prov-dir').value       = p.direccion || '';
  document.getElementById('prov-notas').value     = p.notas || '';
  document.getElementById('modal-prov-title').textContent = 'Editar proveedor';
  document.getElementById('modal-proveedor').classList.add('open');
}

async function guardarProveedor() {
  const nombre = document.getElementById('prov-nombre').value.trim();
  const tel    = document.getElementById('prov-tel').value.trim();
  if (!nombre) { toast('Ingresa el nombre del proveedor', 'error'); return; }

  const data = {
    nombre,
    telefono:         tel,
    contacto:         document.getElementById('prov-contacto').value.trim(),
    email:            document.getElementById('prov-email').value.trim(),
    productosQueVende:document.getElementById('prov-productos').value.trim(),
    diasCredito:      parseInt(document.getElementById('prov-credito').value) || 0,
    direccion:        document.getElementById('prov-dir').value.trim(),
    notas:            document.getElementById('prov-notas').value.trim(),
    updatedAt:        new Date().toISOString()
  };

  try {
    const id = document.getElementById('prov-id').value;
    if (id) {
      await db.collection('proveedores').doc(id).update(data);
      toast('Proveedor actualizado', 'success');
    } else {
      data.createdAt = new Date().toISOString();
      await db.collection('proveedores').add(data);
      toast('Proveedor registrado', 'success');
    }
    closeModal('modal-proveedor');
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

async function eliminarProveedor(id, nombre) {
  if (!confirm(`¿Eliminar al proveedor "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
  try {
    await db.collection('proveedores').doc(id).delete();
    toast(`Proveedor "${nombre}" eliminado`, 'success');
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ── Ver detalle proveedor ──
function verProveedor(id) {
  const p = allProveedores.find(x => x.id === id);
  if (!p) return;
  provDetalleId = id;
  const comprasProv = allCompras.filter(c => c.proveedorId === id);
  const totalComp   = comprasProv.reduce((s,c) => s+(c.total||0), 0);
  document.getElementById('prov-detalle-nombre').textContent = p.nombre;
  document.getElementById('prov-detalle-content').innerHTML = `
    <div class="grid-2" style="gap:12px;margin-bottom:16px">
      <div style="font-size:.85rem">
        <div class="text-muted text-small">Teléfono</div>
        <div style="font-weight:600">${p.telefono||'—'}</div>
      </div>
      <div style="font-size:.85rem">
        <div class="text-muted text-small">Contacto</div>
        <div style="font-weight:600">${p.contacto||'—'}</div>
      </div>
      <div style="font-size:.85rem">
        <div class="text-muted text-small">Email</div>
        <div style="font-weight:600">${p.email||'—'}</div>
      </div>
      <div style="font-size:.85rem">
        <div class="text-muted text-small">Crédito</div>
        <div style="font-weight:600">${(p.diasCredito||0) > 0 ? p.diasCredito+' días' : 'Pago inmediato'}</div>
      </div>
    </div>
    <div style="font-size:.85rem;margin-bottom:12px">
      <div class="text-muted text-small">Productos que suministra</div>
      <div>${p.productosQueVende||'—'}</div>
    </div>
    ${p.notas ? `<div style="font-size:.85rem;margin-bottom:12px"><div class="text-muted text-small">Notas</div><div>${p.notas}</div></div>` : ''}
    <hr class="divider">
    <div class="flex justify-between items-center mb-16">
      <div>
        <div class="text-muted text-small">Total compras</div>
        <div style="font-size:1.4rem;font-weight:700;color:var(--accent)">${fmt(totalComp)}</div>
      </div>
      <div style="text-align:right">
        <div class="text-muted text-small">Compras realizadas</div>
        <div style="font-size:1.4rem;font-weight:700">${comprasProv.length}</div>
      </div>
    </div>
    <h3 style="margin-bottom:10px">Últimas compras</h3>
    ${comprasProv.slice(0,5).map(c => `
      <div class="flex justify-between items-center" style="padding:7px 0;border-bottom:1px solid var(--border);font-size:.85rem">
        <div>
          <div style="font-weight:600">${dateStr(c.fecha)}</div>
          <div style="color:var(--text3)">${(c.items||[]).map(i=>i.nombre+' ×'+i.qty).join(', ')}</div>
        </div>
        <div style="font-weight:700;color:var(--accent)">${fmt(c.total)}</div>
      </div>`).join('') || '<div style="color:var(--text3);font-size:.85rem">Sin compras registradas</div>'}
  `;
  document.getElementById('modal-prov-detalle').classList.add('open');
}

function abrirCompraDesdeDetalle() {
  closeModal('modal-prov-detalle');
  abrirCompra(provDetalleId);
}

// ── Modal Compra ──
function abrirCompra(proveedorId) {
  compraItems = [];
  document.getElementById('compra-factura').value = '';
  document.getElementById('compra-notas').value   = '';
  document.getElementById('compra-fecha').value   = new Date().toISOString().substring(0,10);
  document.getElementById('compra-subtotal').value = '$0.00';
  document.getElementById('compra-total').value    = '$0.00';
  if (proveedorId) document.getElementById('compra-proveedor').value = proveedorId;
  renderCompraItems();
  document.getElementById('modal-compra').classList.add('open');
}

function addCompraItem() {
  compraItems.push({ productoId:'', nombre:'', qty:1, costo:0 });
  renderCompraItems();
}

function renderCompraItems() {
  const el = document.getElementById('compra-items-list');
  if (!compraItems.length) {
    el.innerHTML = '<p style="color:var(--text3);font-size:.85rem;text-align:center;padding:8px">Agrega los productos que compraste</p>';
    return;
  }
  el.innerHTML = compraItems.map((item, i) => `
    <div class="form-row" style="grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end">
      <select onchange="onCompraItemSelect(${i},this.value)">
        <option value="">— Producto del inventario —</option>
        ${allProducts.map(p => `<option value="${p.id}" ${p.id===item.productoId?'selected':''}>${p.nombre} ${p.marca?'('+p.marca+')':''}</option>`).join('')}
        <option value="__otro__" ${item.productoId==='__otro__'?'selected':''}>Otro (no en inventario)</option>
      </select>
      ${item.productoId==='__otro__' ? `<input type="text" placeholder="Nombre del producto" value="${item.nombre}" oninput="onCompraItemNombre(${i},this.value)" style="grid-column:span 1">` : '<div></div>'}
      <input type="number" placeholder="Qty" value="${item.qty}" min="1" oninput="onCompraItemQty(${i},this.value)">
      <input type="number" placeholder="Costo unit." value="${item.costo||''}" step="0.01" oninput="onCompraItemCosto(${i},this.value)">
      <button class="btn btn-sm btn-ghost btn-icon" onclick="removeCompraItem(${i})">✕</button>
    </div>`).join('');
  calcCompraTotal();
}

function onCompraItemSelect(i, val) {
  const p = allProducts.find(x => x.id === val);
  compraItems[i].productoId = val;
  compraItems[i].nombre     = p?.nombre || '';
  compraItems[i].costo      = p?.costo  || 0;
  renderCompraItems();
}

function onCompraItemNombre(i, val) { compraItems[i].nombre = val; }
function onCompraItemQty(i, val)    { compraItems[i].qty = parseInt(val)||1; calcCompraTotal(); }
function onCompraItemCosto(i, val)  { compraItems[i].costo = parseFloat(val)||0; calcCompraTotal(); }
function removeCompraItem(i)        { compraItems.splice(i,1); renderCompraItems(); }

function calcCompraTotal() {
  const total = compraItems.reduce((s,i) => s+(i.costo||0)*(i.qty||1), 0);
  document.getElementById('compra-subtotal').value = fmt(total);
  document.getElementById('compra-total').value    = fmt(total);
}

async function guardarCompra() {
  const provId = document.getElementById('compra-proveedor').value;
  const fecha  = document.getElementById('compra-fecha').value;
  if (!provId)  { toast('Selecciona un proveedor', 'error'); return; }
  if (!compraItems.length) { toast('Agrega al menos un producto', 'error'); return; }

  const prov  = allProveedores.find(p => p.id === provId);
  const total = compraItems.reduce((s,i) => s+(i.costo||0)*(i.qty||1), 0);

  const compra = {
    proveedorId:     provId,
    proveedorNombre: prov?.nombre || '—',
    fecha:           fecha,
    factura:         document.getElementById('compra-factura').value.trim(),
    notas:           document.getElementById('compra-notas').value.trim(),
    items:           compraItems.map(i => ({
      productoId: i.productoId,
      nombre:     i.nombre,
      qty:        i.qty,
      costo:      i.costo,
      subtotal:   i.costo * i.qty
    })),
    total,
    usuarioId:    currentUser?.uid,
    usuarioNombre:currentUserData?.nombre || '—',
    creadoEn:     new Date().toISOString()
  };

  try {
    const batch = db.batch();
    // Guardar compra
    const compraRef = db.collection('compras_proveedor').doc();
    batch.set(compraRef, compra);

    // Actualizar stock e historial de cada producto del inventario
    for (const item of compraItems) {
      if (!item.productoId || item.productoId === '__otro__') continue;
      const prod = allProducts.find(p => p.id === item.productoId);
      if (!prod) continue;
      batch.update(db.collection('productos').doc(item.productoId), {
        stock: (prod.stock||0) + (item.qty||1),
        costo: item.costo || prod.costo
      });
      const movRef = db.collection('movimientos').doc();
      batch.set(movRef, {
        tipo:           'entrada',
        productoId:     item.productoId,
        productoNombre: item.nombre,
        qty:            item.qty,
        costo:          item.costo,
        referencia:     `Compra a ${prov?.nombre||'proveedor'} ${compra.factura ? '· '+compra.factura : ''}`,
        usuarioId:      currentUser?.uid,
        fecha:          new Date().toISOString()
      });
    }

    await batch.commit();
    toast(`Compra de ${fmt(total)} registrada`, 'success');
    closeModal('modal-compra');
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ════════════════════════════════════════════════════════════════
//  CONFIG
// ════════════════════════════════════════════════════════════════
function getConfig() {
  try { return JSON.parse(localStorage.getItem('lubricentro_config') || '{}'); } catch { return {}; }
}

function loadConfig() {
  const cfg = getConfig();
  if (cfg.nombre) document.getElementById('cfg-nombre').value = cfg.nombre;
  if (cfg.tel)    document.getElementById('cfg-tel').value    = cfg.tel;
  if (cfg.dir)    document.getElementById('cfg-dir').value    = cfg.dir;
}

function guardarConfig() {
  const cfg = {
    nombre: document.getElementById('cfg-nombre').value.trim(),
    tel:    document.getElementById('cfg-tel').value.trim(),
    dir:    document.getElementById('cfg-dir').value.trim()
  };
  localStorage.setItem('lubricentro_config', JSON.stringify(cfg));
  toast('Configuración guardada', 'success');
}

// ════════════════════════════════════════════════════════════════
//  DEMO DATA
// ════════════════════════════════════════════════════════════════
async function loadDemoData() {
  if (!db) { toast('Conecta Firebase primero', 'error'); return; }
  toast('Cargando datos demo…', 'info');
  const batch = db.batch();

  const productos = [
    { nombre:'Aceite Mobil 1 5W30', marca:'Mobil', categoria:'lubricante', unidad:'litro', costo:8, precio:12, stock:24, stockMin:5 },
    { nombre:'Aceite Havoline 15W40', marca:'Havoline', categoria:'lubricante', unidad:'litro', costo:5, precio:8, stock:3, stockMin:10 },
    { nombre:'Filtro de aceite Toyota', marca:'Toyota', categoria:'filtro', unidad:'pieza', costo:6, precio:10, stock:15, stockMin:5 },
    { nombre:'Filtro de aire universal', marca:'Genérico', categoria:'filtro', unidad:'pieza', costo:4, precio:7, stock:8, stockMin:5 },
    { nombre:'Refrigerante verde', marca:'Prestone', categoria:'refrigerante', unidad:'litro', costo:3, precio:5, stock:0, stockMin:6 },
    { nombre:'Líquido de frenos DOT4', marca:'ATE', categoria:'aditivo', unidad:'litro', costo:4, precio:7, stock:10, stockMin:4 },
  ];
  productos.forEach(p => {
    batch.set(db.collection('productos').doc(), { ...p, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  const clientes = [
    { nombre:'Carlos Martínez', telefono:'7777-1234', vehiculos:[{placa:'P-123456', marca:'Toyota', modelo:'Corolla', anio:2019, km:45000, tipoAceite:'5W30 sintético'}], totalServicios:3 },
    { nombre:'María González', telefono:'7777-5678', vehiculos:[{placa:'N-987654', marca:'Hyundai', modelo:'Tucson', anio:2021, km:22000, tipoAceite:'5W20 sintético'}], totalServicios:1 },
  ];
  clientes.forEach(c => {
    batch.set(db.collection('clientes').doc(), { ...c, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });

  try {
    await batch.commit();
    toast('Datos demo cargados exitosamente', 'success');
  } catch(e) {
    toast('Error: ' + e.message, 'error');
  }
}

// ════════════════════════════════════════════════════════════════
//  EXPORT CSV
// ════════════════════════════════════════════════════════════════
async function exportCSV() {
  const fecha = document.getElementById('hist-fecha').value;
  if (!fecha) { toast('Selecciona una fecha', 'error'); return; }
  const snap = await db.collection('ventas')
    .where('fecha', '>=', fecha + 'T00:00:00')
    .where('fecha', '<=', fecha + 'T23:59:59')
    .orderBy('fecha').get();
  const rows = [['Hora','Items','Total','Método pago','Cajero']];
  snap.docs.forEach(d => {
    const v = d.data();
    rows.push([
      timeStr(v.fecha),
      (v.items||[]).map(i=>`${i.nombre} x${i.qty}`).join('; '),
      v.total?.toFixed(2)||0,
      v.metodoPago||'',
      v.cajeroNombre||''
    ]);
  });
  const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `ventas-${fecha}.csv`;
  a.click(); URL.revokeObjectURL(url);
  toast('CSV exportado', 'success');
}

// ════════════════════════════════════════════════════════════════
//  MODAL HELPERS
// ════════════════════════════════════════════════════════════════
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ════════════════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════════════════
function toast(msg, type='info') {
  const container = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  el.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ════════════════════════════════════════════════════════════════
//  DATE / FORMAT HELPERS
// ════════════════════════════════════════════════════════════════
function fmt(n)     { return '$' + (n||0).toFixed(2); }
function todayStr() { return new Date().toISOString().substring(0,10); }
function toDateInput(d) { return d.toISOString().substring(0,10); }
function dateStr(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-SV',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function timeStr(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-SV',{hour:'2-digit',minute:'2-digit'});
}

// ════════════════════════════════════════════════════════════════
//  BOOT
// ════════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/lubricentromelgar.github.io/sw.js')
      .catch(() => {});
  }
});
