const fs = require('fs');
const path = 'c:/Users/josue/Downloads/PruebaLubri/styles.css';

const css = `/* ═══════════════════════════════════════════════════════════════
   LUBRICENTRO MELGAR — Sistema de Gestión
   Estilo Moderno & Corporativo v2.0
   ═══════════════════════════════════════════════════════════════ */

/* ─── IMPORTS ─── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ─── TOKENS — TEMA OSCURO (default) ─── */
:root {
  --bg: #0b1120;
  --bg2: #111827;
  --bg3: #1f2937;
  --surface: #1e293b;
  --surface-hover: #27354f;
  --border: #334155;
  --border2: #475569;
  --accent: #f59e0b;
  --accent2: #fbbf24;
  --accent3: #d97706;
  --accentBg: rgba(245, 158, 11, .15);
  --accentGlow: rgba(245, 158, 11, .35);
  --green: #10b981;
  --greenBg: rgba(16, 185, 129, .12);
  --greenGlow: rgba(16, 185, 129, .25);
  --red: #ef4444;
  --redBg: rgba(239, 68, 68, .12);
  --redGlow: rgba(239, 68, 68, .25);
  --blue: #3b82f6;
  --blueBg: rgba(59, 130, 246, .12);
  --blueGlow: rgba(59, 130, 246, .25);
  --purple: #8b5cf6;
  --purpleBg: rgba(139, 92, 246, .12);
  --purpleGlow: rgba(139, 92, 246, .25);
  --text: #f8fafc;
  --text2: #cbd5e1;
  --text3: #94a3b8;
  --textMuted: #64748b;
  --radius: 10px;
  --radius-sm: 6px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.3);
  --shadow: 0 4px 6px -1px rgba(0,0,0,.4), 0 2px 4px -2px rgba(0,0,0,.3);
  --shadow-md: 0 10px 15px -3px rgba(0,0,0,.5), 0 4px 6px -4px rgba(0,0,0,.4);
  --shadow-lg: 0 20px 25px -5px rgba(0,0,0,.5), 0 8px 10px -6px rgba(0,0,0,.4);
  --shadow-glow: 0 0 20px var(--accentGlow);
  --font: 'Inter','Segoe UI',system-ui,sans-serif;
  --transition-fast: 150ms cubic-bezier(.4,0,.2,1);
  --transition: 250ms cubic-bezier(.4,0,.2,1);
  --transition-slow: 350ms cubic-bezier(.4,0,.2,1);
}

/* ─── TEMA CLARO ─── */
body.light {
  --bg: #f1f5f9;
  --bg2: #ffffff;
  --bg3: #e2e8f0;
  --surface: #ffffff;
  --surface-hover: #f8fafc;
  --border: #e2e8f0;
  --border2: #cbd5e1;
  --accent: #d97706;
  --accent2: #f59e0b;
  --accent3: #b45309;
  --accentBg: rgba(217,119,6,.10);
  --accentGlow: rgba(217,119,6,.20);
  --green: #059669;
  --greenBg: rgba(5,150,105,.10);
  --greenGlow: rgba(5,150,105,.15);
  --red: #dc2626;
  --redBg: rgba(220,38,38,.10);
  --redGlow: rgba(220,38,38,.15);
  --blue: #2563eb;
  --blueBg: rgba(37,99,235,.10);
  --blueGlow: rgba(37,99,235,.15);
  --purple: #7c3aed;
  --purpleBg: rgba(124,58,237,.10);
  --purpleGlow: rgba(124,58,237,.15);
  --text: #0f172a;
  --text2: #334155;
  --text3: #64748b;
  --textMuted: #94a3b8;
  --shadow-sm: 0 1px 2px rgba(15,23,42,.06);
  --shadow: 0 4px 6px -1px rgba(15,23,42,.08), 0 2px 4px -2px rgba(15,23,42,.04);
  --shadow-md: 0 10px 15px -3px rgba(15,23,42,.08), 0 4px 6px -4px rgba(15,23,42,.04);
  --shadow-lg: 0 20px 25px -5px rgba(15,23,42,.08), 0 8px 10px -6px rgba(15,23,42,.04);
  --shadow-glow: 0 0 20px var(--accentGlow);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100dvh;font-size:15px;line-height:1.6;overflow-x:hidden;transition:background var(--transition),color var(--transition)}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:var(--text3)}
::selection{background:var(--accent);color:#0f172a}

h1{font-size:1.6rem;font-weight:800;letter-spacing:-.02em;line-height:1.2}
h2{font-size:1.25rem;font-weight:700;letter-spacing:-.01em;line-height:1.3}
h3{font-size:1.05rem;font-weight:600;line-height:1.4}
p{color:var(--text2)}
a{color:var(--accent);text-decoration:none;transition:color var(--transition-fast)}
a:hover{color:var(--accent2)}

#app{display:flex;min-height:100dvh;align-items:flex-start}

/* SIDEBAR */
#sidebar{width:240px;min-width:240px;background:linear-gradient(180deg,var(--bg2) 0%,rgba(17,24,39,.95) 100%);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:0;transition:transform var(--transition);position:sticky;top:0;height:100dvh;overflow-y:auto;flex-shrink:0;z-index:100;backdrop-filter:blur(20px)}
body.light #sidebar{background:linear-gradient(180deg,var(--bg2) 0%,rgba(255,255,255,.95) 100%)}
#sidebar-logo{padding:24px 20px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px}
#sidebar-logo .logo-icon{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--accent) 0%,var(--accent3) 100%);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 12px var(--accentGlow);flex-shrink:0}
#sidebar-logo .logo-text{font-weight:800;font-size:1.05rem;color:var(--text);letter-spacing:-.02em}
#sidebar-logo .logo-sub{font-size:.72rem;color:var(--text3);font-weight:500;letter-spacing:.02em}
#sidebar-nav{padding:16px 12px;flex:1;display:flex;flex-direction:column;gap:4px}
.nav-section-label{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--textMuted);padding:12px 12px 6px}
.nav-item{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;cursor:pointer;transition:all var(--transition-fast);font-size:.88rem;color:var(--text2);border:none;background:none;width:100%;text-align:left;position:relative;font-weight:500}
.nav-item::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:0;background:linear-gradient(180deg,var(--accent) 0%,var(--accent2) 100%);border-radius:0 3px 3px 0;transition:height var(--transition-fast)}
.nav-item:hover{background:var(--surface-hover);color:var(--text)}
.nav-item:hover::before{height:20px}
.nav-item.active{background:var(--accentBg);color:var(--accent);font-weight:600}
.nav-item.active::before{height:28px}
.nav-item .nav-icon{font-size:18px;width:22px;text-align:center;transition:transform var(--transition-fast)}
.nav-item:hover .nav-icon{transform:scale(1.1)}
.nav-badge{margin-left:auto;background:linear-gradient(135deg,var(--red) 0%,#dc2626 100%);color:#fff;border-radius:20px;font-size:.68rem;padding:2px 8px;font-weight:700;box-shadow:0 2px 8px var(--redGlow)}
#sidebar-user{padding:16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:12px;background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.1) 100%)}
body.light #sidebar-user{background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.03) 100%)}
.user-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--purple) 0%,#6366f1 100%);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;color:#fff;flex-shrink:0;box-shadow:0 2px 8px var(--purpleGlow)}
.user-info{flex:1;min-width:0}
.user-name{font-size:.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text)}
.user-role{font-size:.72rem;color:var(--text3);font-weight:500}
#btn-logout{background:none;border:none;cursor:pointer;color:var(--text3);font-size:18px;padding:6px;border-radius:8px;transition:all var(--transition-fast);display:flex;align-items:center;justify-content:center}
#btn-logout:hover{color:var(--red);background:var(--redBg)}

#btn-theme{display:flex;align-items:center;gap:10px;width:100%;padding:10px 16px;background:none;border:none;border-top:1px solid var(--border);color:var(--text2);font-size:.82rem;font-family:var(--font);cursor:pointer;transition:all var(--transition-fast);text-align:left}
#btn-theme:hover{background:var(--surface-hover);color:var(--text)}
#btn-theme .theme-icon{font-size:16px;width:20px;text-align:center;transition:transform var(--transition-fast)}
#btn-theme:hover .theme-icon{transform:rotate(15deg)}
#btn-theme .theme-label{flex:1;font-weight:500}
#btn-theme .theme-badge{font-size:.68rem;padding:3px 10px;border-radius:20px;background:var(--accentBg);color:var(--accent);font-weight:600;border:1px solid var(--accentGlow)}

/* MAIN & TOPBAR */
#main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;min-height:100dvh}
#topbar{height:64px;background:linear-gradient(180deg,var(--bg2) 0%,rgba(17,24,39,.9) 100%);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:16px;backdrop-filter:blur(12px);position:sticky;top:0;z-index:50}
body.light #topbar{background:linear-gradient(180deg,var(--bg2) 0%,rgba(255,255,255,.9) 100%)}
#topbar-title{font-weight:800;font-size:1.15rem;flex:1;letter-spacing:-.01em}
#btn-menu{display:none;background:none;border:none;color:var(--text);font-size:22px;cursor:pointer;padding:6px;border-radius:8px;transition:background var(--transition-fast)}
#btn-menu:hover{background:var(--bg3)}
.topbar-btn{background:var(--surface);border:1px solid var(--border);color:var(--text2);border-radius:var(--radius);padding:8px 16px;cursor:pointer;font-size:.85rem;font-weight:500;transition:all var(--transition-fast);display:flex;align-items:center;gap:8px;font-family:var(--font)}
.topbar-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accentBg);box-shadow:0 0 12px var(--accentGlow)}

/* PAGES */
#content{flex:1;overflow-y:auto;padding:28px}
.page{display:none;animation:fadeIn .3s ease}
.page.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* GRID & CARDS */
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.card{background:linear-gradient(145deg,var(--bg2) 0%,var(--surface) 100%);border:1px solid var(--border);border-radius:var(--radius-lg);padding:22px;transition:all var(--transition);position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.08) 50%,transparent 100%)}
body.light .card::before{background:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.04) 50%,transparent 100%)}
.card:hover{border-color:var(--border2);box-shadow:var(--shadow-md);transform:translateY(-2px)}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}

/* STAT CARDS */
.stat-card{background:linear-gradient(145deg,var(--bg2) 0%,var(--surface) 100%);border:1px solid var(--border);border-radius:var(--radius-lg);padding:22px;display:flex;flex-direction:column;gap:8px;transition:all var(--transition);position:relative;overflow:hidden}
.stat-card::after{content:'';position:absolute;top:0;right:0;width:100px;height:100px;background:radial-gradient(circle,var(--accentGlow) 0%,transparent 70%);opacity:0;transition:opacity var(--transition);pointer-events:none}
.stat-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:var(--border2)}
.stat-card:hover::after{opacity:1}
.stat-label{font-size:.78rem;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.stat-value{font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1}
.stat-sub{font-size:.82rem;color:var(--text2);font-weight:500}
.stat-card.accent{border-color:var(--accent);background:linear-gradient(145deg,var(--accentBg) 0%,var(--bg2) 100%)}
.stat-card.accent::after{background:radial-gradient(circle,var(--accentGlow) 0%,transparent 70%);opacity:.3}
.stat-card.green{border-color:var(--green);background:linear-gradient(145deg,var(--greenBg) 0%,var(--bg2) 100%)}
.stat-card.green::after{background:radial-gradient(circle,var(--greenGlow) 0%,transparent 70%)}
.stat-card.red{border-color:var(--red);background:linear-gradient(145deg,var(--redBg) 0%,var(--bg2) 100%)}
.stat-card.red::after{background:radial-gradient(circle,var(--redGlow) 0%,transparent 70%)}
.stat-card.blue{border-color:var(--blue);background:linear-gradient(145deg,var(--blueBg) 0%,var(--bg2) 100%)}
.stat-card.blue::after{background:radial-gradient(circle,var(--blueGlow) 0%,transparent 70%)}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 18px;border-radius:var(--radius);border:none;cursor:pointer;font-size:.88rem;font-weight:600;transition:all var(--transition-fast);white-space:nowrap;font-family:var(--font);position:relative;overflow:hidden}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 100%);opacity:0;transition:opacity var(--transition-fast)}
.btn:hover::after{opacity:1}
.btn:active{transform:scale(.97)}
.btn-primary{background:linear-gradient(135deg,var(--accent) 0%,var(--accent3) 100%);color:#fff;box-shadow:0 4px 14px var(--accentGlow)}
.btn-primary:hover{box-shadow:0 6px 20px var(--accentGlow),var(--shadow-glow);transform:translateY(-1px)}
.btn-secondary{background:var(--bg3);color:var(--text);border:1px solid var(--border)}
.btn-secondary:hover{border-color:var(--border2);background:var(--surface-hover)}
.btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border)}
.btn-ghost:hover{color:var(--text);border-color:var(--border2);background:var(--bg3)}
.btn-danger{background:linear-gradient(135deg,var(--red) 0%,#dc2626 100%);color:#fff;box-shadow:0 4px 14px var(--redGlow)}
.btn-danger:hover{box-shadow:0 6px 20px var(--redGlow);transform:translateY(-1px)}
.btn-green{background:linear-gradient(135deg,var(--green) 0%,#059669 100%);color:#fff;box-shadow:0 4px 14px var(--greenGlow)}
.btn-green:hover{box-shadow:0 6px 20px var(--greenGlow);transform:translateY(-1px)}
.btn-sm{padding:6px 12px;font-size:.82rem}
.btn-icon{padding:8px;min-width:36px;min-height:36px}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important}

/* FORMS */
.form-group{display:flex;flex-direction:column;gap:8px}
.form-label{font-size:.85rem;font-weight:600;color:var(--text2)}
.form-row{display:grid;gap:16px}
.form-row-2{grid-template-columns:1fr 1fr}
.form-row-3{grid-template-columns:1fr 1fr 1fr}
input,select,textarea{background:var(--bg3);border:1.5px solid var(--border);color:var(--text);border-radius:var(--radius);padding:10px 14px;font-size:.9rem;width:100%;transition:all var(--transition-fast);outline:none;font-family:var(--font)}
input:hover,select:hover,textarea:hover{border-color:var(--border2)}
input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accentGlow)}
input::placeholder{color:var(--textMuted)}
select option{background:var(--bg3);color:var(--text)}

/* TABLE */
.table-wrap{overflow-x:auto;border-radius:var(--radius-lg);border:1px solid var(--border);background:var(--bg2)}
table{width:100%;border-collapse:collapse;font-size:.88rem}
thead th{background:linear-gradient(180deg,var(--bg3) 0%,var(--surface) 100%);color:var(--text2);padding:12px 16px;text-align:left;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--border);white-space:nowrap}
tbody td{padding:12px 16px;border-bottom:1px solid var(--border);vertical-align:middle;transition:background var(--transition-fast)}
tbody tr{transition:background var(--transition-fast)}
tbody tr:hover{background:var(--surface-hover)}
tbody tr:last-child td{border-bottom:none}

/* BADGES */
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:700;letter-spacing:.02em;border:1px solid transparent}
.badge-green{background:var(--greenBg);color:var(--green);border-color:var(--greenGlow)}
.badge-red{background:var(--redBg);color:var(--red);border-color:var(--redGlow)}
.badge-amber{background:var(--accentBg);color:var(--accent);border-color:var(--accentGlow)}
.badge-blue{background:var(--blueBg);color:var(--blue);border-color:var(--blueGlow)}
.badge-purple{background:var(--purpleBg);color:var(--purple);border-color:var(--purpleGlow)}
.badge-gray{background:var(--bg3);color:var(--text2);border-color:var(--border)}

/* MODALS */
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);z-index:1000;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
.modal-overlay.open{display:flex}
.modal{background:linear-gradient(145deg,var(--bg2) 0%,var(--surface) 100%);border:1px solid var(--border);border-radius:var(--radius-xl);padding:28px;width:100%;max-width:560px;max-height:90dvh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:modalIn .25s cubic-bezier(.16,1,.3,1)}
@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.modal-footer{display:flex;gap:12px;justify-content:flex-end;margin-top:24px;padding-top:20px;border-top:1px solid var(--border)}
.btn-close{background:none;border:none;color:var(--text3);font-size:24px;cursor:pointer;padding:4px;line-height:1;border-radius:8px;transition:all var(--transition-fast);width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.btn-close:hover{color:var(--text);background:var(--bg3)}

/* SEARCH */
.search-wrap{position:relative}
.search-wrap input{padding-left:40px}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--textMuted);font-size:18px;pointer-events:none}

/* POS */
.pos-layout{display:grid;grid-template-columns:1fr 360px;gap:24px;height:calc(100dvh - 64px - 56px)}
.pos-products{overflow-y:auto}
.pos-cart{display:flex;flex-direction:column;gap:0}
.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:16px;padding-bottom:20px}
.product-card{background:linear-gradient(145deg,var(--bg2) 0%,var(--surface) 100%);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:18px;cursor:pointer;transition:all var(--transition);position:relative;overflow:hidden}
.product-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent) 0%,var(--accent2) 100%);opacity:0;transition:opacity var(--transition-fast)}
.product-card:hover{border-color:var(--accent);transform:translateY(-3px);box-shadow:var(--shadow-md)}
.product-card:hover::before{opacity:1}
.product-card.out-of-stock{opacity:.4;cursor:not-allowed}
.product-card.out-of-stock:hover{transform:none;border-color:var(--border)}
.product-card .prod-name{font-weight:700;font-size:.92rem;margin-bottom:4px;line-height:1.3}
.product-card .prod-brand{font-size:.78rem;color:var(--text3);margin-bottom:10px;font-weight:500}
.product-card .prod-price{color:var(--accent);font-weight:800;font-size:1.1rem;letter-spacing:-.01em}
.product-card .prod-stock{font-size:.75rem;color:var(--text3);margin-top:6px;font-weight:500}
.prod-cat-badge{font-size:.68rem;padding:3px 8px;border-radius:6px;background:var(--bg3);color:var(--text3);margin-bottom:8px;display:inline-block;font-weight:600;text-transform:uppercase;letter-spacing:.04em}

.cart-card{background:linear-gradient(145deg,var(--bg2) 0%,var(--surface) 100%);border:1px solid var(--border);border-radius:var(--radius-xl);display:flex;flex-direction:column;height:100%;overflow:hidden}
.cart-header{padding:18px 20px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,var(--bg2) 0%,transparent 100%)}
.cart-title{font-weight:800;font-size:1.05rem;letter-spacing:-.01em}
.cart-items{flex:1;overflow-y:auto;padding:10px}
.cart-item{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;transition:all var(--transition-fast)}
.cart-item:hover{background:var(--surface-hover)}
.cart-item-name{flex:1;font-size:.88rem;font-weight:600;min-width:0;line-height:1.3}
.cart-item-brand{font-size:.75rem;color:var(--text3);font-weight:500}
.cart-qty-ctrl{display:flex;align-items:center;gap:6px}
.qty-btn{width:28px;height:28px;border-radius:8px;background:var(--bg3);border:1.5px solid var(--border);color:var(--text);cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all var(--transition-fast)}
.qty-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accentBg)}
.qty-num{width:28px;text-align:center;font-weight:700;font-size:.9rem}
.cart-item-total{font-weight:700;color:var(--accent);font-size:.9rem;min-width:56px;text-align:right}
.cart-item-del{background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:4px;border-radius:6px;transition:all var(--transition-fast);width:28px;height:28px;display:flex;align-items:center;justify-content:center}
.cart-item-del:hover{color:var(--red);background:var(--redBg)}
.cart-footer{padding:16px 20px;border-top:1px solid var(--border)}
.cart-total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.cart-total-label{color:var(--text2);font-size:.9rem;font-weight:500}
.cart-total-value{font-size:1.7rem;font-weight:800;color:var(--accent);letter-spacing:-.02em}
.cart-empty{text-align:center;padding:40px 16px;color:var(--text3);font-size:.9rem}

/* SECTION HEADER */
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:14px}
.section-title{font-size:1.35rem;font-weight:800;letter-spacing:-.02em}

/* LOGIN */
#login-page{min-height:100dvh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--bg) 0%,#0f172a 50%,var(--bg2) 100%);padding:20px;position:relative;overflow:hidden}
#login-page::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,var(--accentGlow) 0%,transparent 50%),radial-gradient(circle at 70% 80%,var(--purpleGlow) 0%,transparent 50%);pointer-events:none}
.login-card{background:linear-gradient(145deg,var(--bg2) 0%,var(--surface) 100%);border:1px solid var(--border);border-radius:var(--radius-xl);padding:40px;width:100%;max-width:400px;box-shadow:var(--shadow-lg);position:relative;z-index:1;animation:modalIn .4s cubic-bezier(.16,1,.3,1)}
.login-logo{text-align:center;margin-bottom:32px}
.login-logo-icon{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,var(--accent) 0%,var(--accent3) 100%);display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;box-shadow:0 8px 24px var(--accentGlow)}
.login-logo h1{font-size:1.5rem;margin-bottom:4px}
.login-logo p{color:var(--text3);font-size:.88rem;font-weight:500}
.login-divider{text-align:center;color:var(--text3);font-size:.8rem;margin:18px 0;position:relative;font-weight:500}
.login-divider::before,.login-divider::after{content:'';position:absolute;top:50%;width:40%;height:1px;background:linear-gradient(90deg,transparent 0%,var(--border) 50%,transparent 100%)}
.login-divider::before{left:0}
.login-divider::after{right:0}
#login-error{background:var(--redBg);border:1px solid var(--red);color:var(--red);border-radius:var(--radius);padding:12px 16px;font-size:.85rem;margin-bottom:16px;display:none;font-weight:500}

/* LOADING */
#loading-screen{min-height:100dvh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;background:var(--bg)}
.spinner{width:40px;height:40px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--accent);animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* TOAST */
#toast{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px}
.toast-item{background:linear-gradient(145deg,var(--bg2) 0%,var(--surface) 100%);border:1px solid var(--border);border-radius:var(--radius);padding:14px 18px;font-size:.9rem;box-shadow:var(--shadow-md);display:flex;align-items:center;gap:12px;animation:slideIn .25s ease;max-width:340px;font-weight:500}
.toast-item.success{border-left:4px solid var(--green)}
.toast-item.error{border-left:4px solid var(--red)}
.toast-item.info{border-left:4px solid var(--blue)}
@keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}

/* STOCK BAR */
.stock-bar{height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-top:6px}
.stock-bar-fill{height:100%;border-radius:3px;transition:width .4s ease}

/* FILTERS */
.filter-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:18px}
.filter-chip{padding:6px 14px;border-radius:20px;background:var(--bg3);border:1.5px solid var(--border);color:var(--text2);cursor:pointer;font-size:.82rem;font-weight:600;transition:all var(--transition-fast)}
.filter-chip:hover{border-color:var(--border2);color:var(--text)}
.filter-chip.active{background:var(--accentBg);border-color:var(--accent);color:var(--accent);box-shadow:0 0 12px var(--accentGlow)}

/* EMPTY STATE */
.empty-state{text-align:center;padding:60px 20px;color:var(--text3)}
.empty-state .icon{font-size:3.5rem;margin-bottom:16px;display:block;opacity:.7}
.empty-state h3{color:var(--text2);margin-bottom:8px;font-weight:700}
.empty-state p{font-size:.9rem}

/* DIVIDER */
.divider{border:none;border-top:1px solid var(--border);margin:18px 0}

/* UTILITIES */
.text-right{text-align:right}
.text-muted{color:var(--text2)}
.text-small{font-size:.82rem}
.text-green{color:var(--green)}
.text-red{color:var(--red)}
.text-accent{color:var(--accent)}
.gap-8{gap:8px}
.gap-12{gap:12px}
.mt-4{margin-top:4px}
.mt-8{margin-top:8px}
.mt-16{margin-top:16px}
.mt-20{margin-top:20px}
.mb-16{margin-bottom:16px}
.flex{display:flex}
.flex-col{display:flex;flex-direction:column}
.items-center{align-items:center}
.justify-between{justify-content:space-between}
.w-full{width:100%}

/* MOBILE */
@media(max-width:768px){
  #sidebar{position:fixed;top:0;left:0;bottom:0;transform:translateX(-100%);z-index:200}
  #sidebar.open{transform:translateX(0);box-shadow:var(--shadow-lg)}
  #btn-menu{display:block}
  #content{padding:16px}
  .pos-layout{grid-template-columns:1fr;height:auto}
  .grid-4{grid-template-columns:repeat(2,1fr)}
  .grid-3{grid-template-columns:repeat(2,1fr)}
  .form-row-2,.form-row-3{grid-template-columns:1fr}
}
@media(max-width:480px){
  .grid-4,.grid-3,.grid-2{grid-template-columns:1fr}
  .product-grid{grid-template-columns:repeat(2,1fr)}
}
`;

fs.writeFileSync(path, css, 'utf8');
console.log('CSS written successfully!');
console.log('File size:', css.length, 'bytes');
console.log('Lines:', css.split('\n').length);
`;

// Run it
require('child_process').execSync
