/* =========================================================
   AUNG POS
   Professional Mobile POS & Business Management System
   Version 2.0
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "aung_pos_v2_data";

const DEFAULT_DATA = {
  settings: {
    shopName: "Aung POS",
    address: "",
    phone: "",
    footer: "Thank You",
    currency: "Ks",
    receiptFontSize: 14
  },

  products: [],

  sales: [],

  purchases: [],

  customers: [],

  suppliers: [],

  expenses: [],

  employees: [],

  cart: [],

  paymentMethod: "cash"
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function el(id) {
  return $(id);
}

function uid(prefix = "id") {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).substring(2, 8)
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function money(value) {
  return number(value).toLocaleString("en-US") + " Ks";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sameDay(date) {
  return String(date || "").slice(0, 10) === today();
}

function sameMonth(date) {
  const d = new Date(date);
  const t = new Date();

  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth()
  );
}

function sameYear(date) {
  const d = new Date(date);
  const t = new Date();

  return d.getFullYear() === t.getFullYear();
}


/* =========================================================
   SAFE DOM
   ========================================================= */

function setText(id, value) {
  const node = el(id);

  if (node) {
    node.textContent = value;
  }
}

function setHTML(id, value) {
  const node = el(id);

  if (node) {
    node.innerHTML = value;
  }
}

function setValue(id, value) {
  const node = el(id);

  if (node) {
    node.value = value ?? "";
  }
}

function getValue(id) {
  const node = el(id);

  return node ? node.value : "";
}

function show(id) {
  const node = el(id);

  if (node) {
    node.style.display = "";
  }
}

function hide(id) {
  const node = el(id);

  if (node) {
    node.style.display = "none";
  }
}


/* =========================================================
   DATA
   ========================================================= */

let DATA = loadData();

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_DATA);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(DEFAULT_DATA),
      ...parsed,
      settings: {
        ...DEFAULT_DATA.settings,
        ...(parsed.settings || {})
      },
      products: Array.isArray(parsed.products) ? parsed.products : [],
      sales: Array.isArray(parsed.sales) ? parsed.sales : [],
      purchases: Array.isArray(parsed.purchases)
        ? parsed.purchases
        : [],
      customers: Array.isArray(parsed.customers)
        ? parsed.customers
        : [],
      suppliers: Array.isArray(parsed.suppliers)
        ? parsed.suppliers
        : [],
      expenses: Array.isArray(parsed.expenses)
        ? parsed.expenses
        : [],
      employees: Array.isArray(parsed.employees)
        ? parsed.employees
        : [],
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      paymentMethod: parsed.paymentMethod || "cash"
    };
  } catch (error) {
    console.error("Load data error:", error);

    return structuredClone(DEFAULT_DATA);
  }
}

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DATA)
    );
  } catch (error) {
    console.error("Save data error:", error);
    showToast("Data သိမ်းရာတွင် Error ဖြစ်နေပါသည်", "error");
  }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "success") {
  let container = el("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";

    document.body.appendChild(container);
  }

  const toast = document.createElement("div");

  toast.className = "toast " + type;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(title, subtitle, body) {
  setText("modalTitle", title);
  setText("modalSubtitle", subtitle || "");
  setHTML("modalBody", body);

  const overlay = el("modalOverlay");

  if (overlay) {
    overlay.classList.add("active");
    overlay.style.display = "flex";
  }
}

function closeModal() {
  const overlay = el("modalOverlay");

  if (overlay) {
    overlay.classList.remove("active");
    overlay.style.display = "none";
  }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

const PAGE_TITLES = {
  dashboard: [
    "Dashboard",
    "Business overview"
  ],

  sales: [
    "Sales",
    "Create and manage sales"
  ],

  products: [
    "Products",
    "Product management"
  ],

  purchases: [
    "Purchases",
    "Purchase management"
  ],

  stock: [
    "Stock",
    "Inventory management"
  ],

  customers: [
    "Customers",
    "Customer management"
  ],

  suppliers: [
    "Suppliers",
    "Supplier management"
  ],

  debts: [
    "Debts",
    "Receivables & payables"
  ],

  expenses: [
    "Expenses",
    "Business expenses"
  ],

  employees: [
    "Employees",
    "Employee management"
  ],

  reports: [
    "Reports",
    "Business reports"
  ],

  settings: [
    "Settings",
    "POS settings"
  ]
};


function showPage(pageName) {
  try {
    const pages = $$(".page");

    pages.forEach(page => {
      page.classList.remove("active");

      page.style.display = "none";
    });

    let target =
      el("page-" + pageName) ||
      el(pageName);

    if (target) {
      target.classList.add("active");
      target.style.display = "block";
    }

    const buttons = $(
      ".nav-item, .menu-item, .nav-btn, [data-page]"
    );

    buttons.forEach(button => {
      const buttonPage = button.dataset.page;

      button.classList.toggle(
        "active",
        buttonPage === pageName
      );
    });

    const title =
      PAGE_TITLES[pageName] ||
      [pageName, ""];

    setText("pageTitle", title[0]);
    setText("pageSubtitle", title[1]);

    const sidebar = el("sidebar");

    if (sidebar) {
      sidebar.classList.remove("open");
    }

    refreshPage(pageName);

  } catch (error) {
    console.error("Navigation error:", error);
  }
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {
  const menuButtons = $(
    "#mobileMenu, #menuToggle, .menu-toggle"
  );

  menuButtons.forEach(button => {
    button.addEventListener("click", function () {
      const sidebar = el("sidebar");

      if (sidebar) {
        sidebar.classList.toggle("open");
      }
    });
  });
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function calculateTotals() {
  const todaySales = DATA.sales.filter(s =>
    sameDay(s.date)
  );

  const todayPurchases = DATA.purchases.filter(p =>
    sameDay(p.date)
  );

  const todayExpenses = DATA.expenses.filter(e =>
    sameDay(e.date)
  );

  const salesAmount = todaySales.reduce(
    (sum, s) => sum + number(s.total),
    0
  );

  const purchaseAmount = todayPurchases.reduce(
    (sum, p) => sum + number(p.total),
    0
  );

  const expenseAmount = todayExpenses.reduce(
    (sum, e) => sum + number(e.amount),
    0
  );

  const profit = todaySales.reduce(
    (sum, s) => sum + number(s.profit),
    0
  ) - expenseAmount;

  return {
    salesAmount,
    purchaseAmount,
    expenseAmount,
    profit,
    salesCount: todaySales.length
  };
}


function updateDashboard() {
  const totals = calculateTotals();

  setText(
    "todaySales",
    money(totals.salesAmount)
  );

  setText(
    "todayProfit",
    money(totals.profit)
  );

  setText(
    "todayPurchase",
    money(totals.purchaseAmount)
  );

  setText(
    "todayExpense",
    money(totals.expenseAmount)
  );

  setText(
    "todaySalesCount",
    totals.salesCount
  );

  setText(
    "totalProducts",
    DATA.products.length
  );

  const lowStock = DATA.products.filter(p =>
    number(p.stock) <= number(p.lowStock || 5)
  );

  setText(
    "lowStockCount",
    lowStock.length
  );

  const expiry = DATA.products.filter(p => {
    if (!p.expiry) return false;

    const exp = new Date(p.expiry);
    const current = new Date();

    const diff =
      (exp - current) /
      (1000 * 60 * 60 * 24);

    return diff <= 30;
  });

  setText(
    "expiryCount",
    expiry.length
  );

  setText(
    "totalCustomers",
    DATA.customers.length
  );

  setText(
    "welcomeShopName",
    DATA.settings.shopName || "Aung POS"
  );

  setText(
    "sideShopName",
    DATA.settings.shopName || "Aung POS"
  );

  renderRecentSales();
  renderDashboardAlerts();
}


function renderRecentSales() {
  const node = el("recentSales");

  if (!node) return;

  const sales = DATA.sales
    .slice()
    .sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    )
    .slice(0, 8);

  if (!sales.length) {
    node.innerHTML =
      '<div class="empty-state">No sales yet</div>';

    return;
  }

  node.innerHTML = sales.map(sale => `
    <div class="recent-sale">
      <div>
        <strong>
          ${escapeHTML(sale.invoice || "-")}
        </strong>
        <small>
          ${escapeHTML(sale.customerName || "Walk-in Customer")}
        </small>
      </div>

      <strong>
        ${money(sale.total)}
      </strong>
    </div>
  `).join("");
}


function renderDashboardAlerts() {
  const node = el("dashboardAlerts");

  if (!node) return;

  const lowStock = DATA.products.filter(
    p => number(p.stock) <= number(p.lowStock || 5)
  );

  const expiry = DATA.products.filter(p => {
    if (!p.expiry) return false;

    const exp = new Date(p.expiry);
    const current = new Date();

    const days =
      (exp - current) /
      (1000 * 60 * 60 * 24);

    return days <= 30;
  });

  let html = "";

  if (lowStock.length) {
    html += `
      <div class="alert-item warning">
        <strong>Low Stock</strong>
        <span>
          ${lowStock.length} product(s) need attention
        </span>
      </div>
    `;
  }

  if (expiry.length) {
    html += `
      <div class="alert-item danger">
        <strong>Expiry Alert</strong>
        <span>
          ${expiry.length} product(s) near expiry
        </span>
      </div>
    `;
  }

  if (!html) {
    html = `
      <div class="alert-item success">
        <strong>All Good</strong>
        <span>No urgent inventory alerts</span>
      </div>
    `;
  }

  node.innerHTML = html;
}


/* =========================================================
   PRODUCTS
   ========================================================= */

function renderProducts() {
  const node = el("productsTableBody");

  if (!node) return;

  const search =
    getValue("productSearch")
      .trim()
      .toLowerCase();

  const category =
    getValue("productCategoryFilter");

  const stockFilter =
    getValue("stockFilter");

  let products = DATA.products.filter(product => {

    const matchesSearch =
      !search ||
      String(product.name || "")
        .toLowerCase()
        .includes(search) ||
      String(product.barcode || "")
        .toLowerCase()
        .includes(search);

    const matchesCategory =
      !category ||
      product.category === category;

    let matchesStock = true;

    if (stockFilter === "low") {
      matchesStock =
        number(product.stock) <=
        number(product.lowStock || 5);
    }

    if (stockFilter === "out") {
      matchesStock =
        number(product.stock) <= 0;
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStock
    );
  });

  if (!products.length) {
    node.innerHTML = `
      <tr>
        <td colspan="10">
          <div class="empty-state">
            No products found
          </div>
        </td>
      </tr>
    `;

    return;
  }

  node.innerHTML = products.map(product => `
    <tr>
      <td>
        ${escapeHTML(product.name)}
      </td>

      <td>
        ${escapeHTML(product.barcode || "-")}
      </td>

      <td>
        ${escapeHTML(product.category || "-")}
      </td>

      <td>
        ${escapeHTML(product.unit || "pcs")}
      </td>

      <td>
        ${number(product.stock)}
      </td>

      <td>
        ${money(product.buyPrice)}
      </td>

      <td>
        ${money(product.retailPrice)}
      </td>

      <td>
        ${money(product.wholesalePrice)}
      </td>

      <td>
        ${product.expiry || "-"}
      </td>

      <td>
        <button
          class="btn small"
          onclick="editProduct('${product.id}')">
          Edit
        </button>

        <button
          class="btn small danger"
          onclick="deleteProduct('${product.id}')">
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}


function productForm(product = {}) {
  return `
    <form id="productForm">

      <div class="form-grid">

        <div class="form-group">
          <label>Product Name *</label>
          <input
            id="f_productName"
            value="${escapeHTML(product.name || "")}"
            required>
        </div>

        <div class="form-group">
          <label>Barcode</label>
          <input
            id="f_barcode"
            value="${escapeHTML(product.barcode || "")}">
        </div>

        <div class="form-group">
          <label>Category</label>
          <input
            id="f_category"
            value="${escapeHTML(product.category || "")}">
        </div>

        <div class="form-group">
          <label>Subcategory</label>
          <input
            id="f_subcategory"
            value="${escapeHTML(product.subcategory || "")}">
        </div>

        <div class="form-group">
          <label>Unit</label>
          <input
            id="f_unit"
            value="${escapeHTML(product.unit || "pcs")}"
            placeholder="pcs / box / pack">
        </div>

        <div class="form-group">
          <label>Stock</label>
          <input
            id="f_stock"
            type="number"
            min="0"
            value="${number(product.stock)}">
        </div>

        <div class="form-group">
          <label>Low Stock Alert</label>
          <input
            id="f_lowStock"
            type="number"
            min="0"
            value="${number(product.lowStock || 5)}">
        </div>

        <div class="form-group">
          <label>Buy Price</label>
          <input
            id="f_buyPrice"
            type="number"
            min="0"
            value="${number(product.buyPrice)}">
        </div>

        <div class="form-group">
          <label>Retail Price</label>
          <input
            id="f_retailPrice"
            type="number"
            min="0"
            value="${number(product.retailPrice)}">
        </div>

        <div class="form-group">
          <label>Wholesale Price</label>
          <input
            id="f_wholesalePrice"
            type="number"
            min="0"
            value="${number(product.wholesalePrice)}">
        </div>

        <div class="form-group">
          <label>Expiry Date</label>
          <input
            id="f_expiry"
            type="date"
            value="${escapeHTML(product.expiry || "")}">
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary">
          Save Product
        </button>

      </div>

    </form>
  `;
}


function addProduct() {
  openModal(
    "Add Product",
    "Create a new product",
    productForm()
  );

  const form = el("productForm");

  if (!form) return;

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name =
      getValue("f_productName").trim();

    if (!name) {
      showToast(
        "Product Name ထည့်ပါ",
        "error"
      );

      return;
    }

    DATA.products.push({
      id: uid("product"),
      name,
      barcode: getValue("f_barcode").trim(),
      category: getValue("f_category").trim(),
      subcategory: getValue("f_subcategory").trim(),
      unit: getValue("f_unit").trim() || "pcs",
      stock: number(getValue("f_stock")),
      lowStock: number(getValue("f_lowStock")) || 5,
      buyPrice: number(getValue("f_buyPrice")),
      retailPrice: number(getValue("f_retailPrice")),
      wholesalePrice: number(
        getValue("f_wholesalePrice")
      ),
      expiry: getValue("f_expiry")
    });

    saveData();
    closeModal();
    renderProducts();
    updateDashboard();
    renderStock();

    showToast(
      "Product ထည့်ပြီးပါပြီ"
    );
  });
}


function editProduct(id) {
  const product =
    DATA.products.find(p => p.id === id);

  if (!product) return;

  openModal(
    "Edit Product",
    "Update product information",
    productForm(product)
  );

  const form = el("productForm");

  if (!form) return;

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    product.name =
      getValue("f_productName").trim();

    product.barcode =
      getValue("f_barcode").trim();

    product.category =
      getValue("f_category").trim();

    product.subcategory =
      getValue("f_subcategory").trim();

    product.unit =
      getValue("f_unit").trim() || "pcs";

    product.stock =
      number(getValue("f_stock"));

    product.lowStock =
      number(getValue("f_lowStock")) || 5;

    product.buyPrice =
      number(getValue("f_buyPrice"));

    product.retailPrice =
      number(getValue("f_retailPrice"));

    product.wholesalePrice =
      number(getValue("f_wholesalePrice"));

    product.expiry =
      getValue("f_expiry");

    saveData();

    closeModal();

    renderProducts();
    renderStock();
    renderSalesProducts();
    updateDashboard();

    showToast(
      "Product ပြင်ပြီးပါပြီ"
    );
  });
}


function deleteProduct(id) {
  const product =
    DATA.products.find(p => p.id === id);

  if (!product) return;

  if (
    !confirm(
      `"${product.name}" ကို ဖျက်မလား?`
    )
  ) {
    return;
  }

  DATA.products =
    DATA.products.filter(
      p => p.id !== id
    );

  saveData();

  renderProducts();
  renderStock();
  renderSalesProducts();
  updateDashboard();

  showToast(
    "Product ဖျက်ပြီးပါပြီ"
  );
}


/* =========================================================
   SALES / POS
   ========================================================= */

function renderSalesProducts() {
  const node = el("salesProducts");

  if (!node) return;

  const search =
    getValue("salesSearch")
      .trim()
      .toLowerCase();

  const category =
    getValue("salesCategory");

  const products =
    DATA.products.filter(product => {

      const searchMatch =
        !search ||
        String(product.name || "")
          .toLowerCase()
          .includes(search) ||
        String(product.barcode || "")
          .toLowerCase()
          .includes(search);

      const categoryMatch =
        !category ||
        product.category === category;

      return searchMatch && categoryMatch;
    });

  if (!products.length) {
    node.innerHTML = `
      <div class="empty-state">
        Product မတွေ့ပါ
      </div>
    `;

    return;
  }

  node.innerHTML = products.map(product => `
    <button
      class="product-card"
      onclick="addToCart('${product.id}')">

      <strong>
        ${escapeHTML(product.name)}
      </strong>

      <span>
        Stock: ${number(product.stock)}
      </span>

      <b>
        ${money(product.retailPrice)}
      </b>

    </button>
  `).join("");
}


function addToCart(productId) {
  const product =
    DATA.products.find(
      p => p.id === productId
    );

  if (!product) return;

  if (number(product.stock) <= 0) {
    showToast(
      "Stock မရှိတော့ပါ",
      "error"
    );

    return;
  }

  const existing =
    DATA.cart.find(
      item => item.productId === productId
    );

  if (existing) {

    if (
      number(existing.qty) + 1 >
      number(product.stock)
    ) {
      showToast(
        "Stock မလုံလောက်ပါ",
        "error"
      );

      return;
    }

    existing.qty += 1;

  } else {

    DATA.cart.push({
      id: uid("cart"),
      productId,
      qty: 1,
      price: number(product.retailPrice)
    });

  }

  saveData();
  renderCart();
}


function renderCart() {
  const node = el("cartItems");

  if (!node) return;

  if (!DATA.cart.length) {
    node.innerHTML = `
      <div class="empty-state">
        Cart empty
      </div>
    `;

    setText("cartCount", "0");
    setText("cartSubtotal", money(0));
    setText("cartTotal", money(0));

    return;
  }

  let subtotal = 0;
  let count = 0;

  node.innerHTML = DATA.cart.map(item => {

    const product =
      DATA.products.find(
        p => p.id === item.productId
      );

    if (!product) return "";

    const amount =
      number(item.qty) *
      number(item.price);

    subtotal += amount;
    count += number(item.qty);

    return `
      <div class="cart-item">

        <div class="cart-item-info">
          <strong>
            ${escapeHTML(product.name)}
          </strong>

          <small>
            ${money(item.price)}
          </small>
        </div>

        <div class="cart-controls">

          <button
            onclick="changeCartQty('${item.id}', -1)">
            −
          </button>

          <span>
            ${number(item.qty)}
          </span>

          <button
            onclick="changeCartQty('${item.id}', 1)">
            +
          </button>

        </div>

        <strong>
          ${money(amount)}
        </strong>

        <button
          class="cart-remove"
          onclick="removeFromCart('${item.id}')">
          ×
        </button>

      </div>
    `;
  }).join("");

  const discount =
    number(getValue("saleDiscount"));

  const total =
    Math.max(
      0,
      subtotal - discount
    );

  setText(
    "cartCount",
    count
  );

  setText(
    "cartSubtotal",
    money(subtotal)
  );

  setText(
    "cartTotal",
    money(total)
  );
}


function changeCartQty(cartId, change) {
  const item =
    DATA.cart.find(
      x => x.id === cartId
    );

  if (!item) return;

  const product =
    DATA.products.find(
      p => p.id === item.productId
    );

  if (!product) return;

  item.qty =
    number(item.qty) + change;

  if (item.qty <= 0) {
    DATA.cart =
      DATA.cart.filter(
        x => x.id !== cartId
      );
  }

  if (
    item.qty > number(product.stock)
  ) {
    item.qty =
      number(product.stock);

    showToast(
      "Stock မလုံလောက်ပါ",
      "error"
    );
  }

  saveData();
  renderCart();
}


function removeFromCart(cartId) {
  DATA.cart =
    DATA.cart.filter(
      item => item.id !== cartId
    );

  saveData();
  renderCart();
}


function clearCart() {
  DATA.cart = [];

  saveData();

  renderCart();
}


function calculateCartTotal() {
  const subtotal =
    DATA.cart.reduce(
      (sum, item) =>
        sum +
        number(item.qty) *
        number(item.price),
      0
    );

  const discount =
    number(getValue("saleDiscount"));

  return {
    subtotal,
    discount,
    total: Math.max(
      0,
      subtotal - discount
    )
  };
}


function checkout() {
  if (!DATA.cart.length) {
    showToast(
      "Cart ထဲမှာ Product ထည့်ပါ",
      "error"
    );

    return;
  }

  for (const item of DATA.cart) {
    const product =
      DATA.products.find(
        p => p.id === item.productId
      );

    if (
      !product ||
      number(product.stock) <
      number(item.qty)
    ) {
      showToast(
        "Stock မလုံလောက်ပါ",
        "error"
      );

      return;
    }
  }

  const totals =
    calculateCartTotal();

  const payment =
    DATA.paymentMethod || "cash";

  let customerName =
    getValue("saleCustomer");

  if (!customerName) {
    customerName = "Walk-in Customer";
  }

  let customerId =
    getValue("saleCustomerId") || "";

  const saleItems =
    DATA.cart.map(item => {

      const product =
        DATA.products.find(
          p => p.id === item.productId
        );

      const qty =
        number(item.qty);

      const price =
        number(item.price);

      const cost =
        number(product.buyPrice);

      return {
        productId: product.id,
        productName: product.name,
        qty,
        price,
        cost,
        amount: qty * price,
        profit:
          qty * (price - cost)
      };
    });

  const profit =
    saleItems.reduce(
      (sum, item) =>
        sum + number(item.profit),
      0
    ) - totals.discount;

  const invoice =
    "INV-" +
    new Date()
      .toISOString()
      .replace(/\D/g, "")
      .slice(0, 14);

  const sale = {
    id: uid("sale"),
    invoice,
    date: now(),
    customerId,
    customerName,
    items: saleItems,
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    profit,
    paymentMethod: payment
  };

  DATA.sales.push(sale);

  DATA.cart.forEach(item => {

    const product =
      DATA.products.find(
        p => p.id === item.productId
      );

    if (product) {
      product.stock =
        number(product.stock) -
        number(item.qty);
    }

  });

  if (
    payment === "credit" &&
    customerId
  ) {

    const customer =
      DATA.customers.find(
        c => c.id === customerId
      );

    if (customer) {
      customer.receivable =
        number(customer.receivable) +
        totals.total;
    }
  }

  DATA.cart = [];

  saveData();

  renderCart();
  renderProducts();
  renderStock();
  renderSalesProducts();
  updateDashboard();
  renderDebts();

  showToast(
    "Sale completed successfully"
  );

  printReceipt(sale);
}


/* =========================================================
   RECEIPT
   ========================================================= */

function printReceipt(sale) {
  const shop =
    DATA.settings;

  const itemsHTML =
    sale.items.map(item => `
      <tr>
        <td>
          ${escapeHTML(item.productName)}
        </td>

        <td>
          ${item.qty}
        </td>

        <td>
          ${money(item.price)}
        </td>

        <td>
          ${money(item.amount)}
        </td>
      </tr>
    `).join("");

  const receipt = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<title>${escapeHTML(sale.invoice)}</title>

<style>

body{
  font-family:Arial,sans-serif;
  width:300px;
  margin:0 auto;
  font-size:${number(shop.receiptFontSize) || 14}px;
}

h2{
  text-align:center;
  margin-bottom:4px;
}

.center{
  text-align:center;
}

hr{
  border:0;
  border-top:1px dashed #000;
}

table{
  width:100%;
  border-collapse:collapse;
}

td{
  padding:4px 0;
}

.right{
  text-align:right;
}

.total{
  font-weight:bold;
  font-size:18px;
}

</style>

</head>

<body>

<h2>
${escapeHTML(shop.shopName || "Aung POS")}
</h2>

<div class="center">
${escapeHTML(shop.address || "")}
</div>

<div class="center">
${escapeHTML(shop.phone || "")}
</div>

<hr>

<div>
Invoice: ${escapeHTML(sale.invoice)}
</div>

<div>
Date: ${new Date(sale.date).toLocaleString()}
</div>

<hr>

<table>
${itemsHTML}
</table>

<hr>

<div class="right">
Subtotal:
${money(sale.subtotal)}
</div>

<div class="right">
Discount:
${money(sale.discount)}
</div>

<div class="right total">
TOTAL:
${money(sale.total)}
</div>

<div class="center">
Payment:
${escapeHTML(sale.paymentMethod)}
</div>

<hr>

<div class="center">
${escapeHTML(shop.footer || "Thank You")}
</div>

<script>
window.onload=function(){
  window.print();
};
<\/script>

</body>
</html>
`;

  const popup =
    window.open(
      "",
      "_blank",
      "width=400,height=700"
    );

  if (!popup) {
    showToast(
      "Print window ဖွင့်မရပါ",
      "error"
    );

    return;
  }

  popup.document.open();
  popup.document.write(receipt);
  popup.document.close();
}


/* =========================================================
   PURCHASES
   ========================================================= */

function renderPurchases() {
  const node =
    el("purchaseTableBody");

  if (!node) return;

  const todayPurchases =
    DATA.purchases.filter(
      p => sameDay(p.date)
    );

  const total =
    todayPurchases.reduce(
      (sum, p) =>
        sum + number(p.total),
      0
    );

  setText(
    "purchaseTodayTotal",
    money(total)
  );

  setText(
    "purchaseInvoiceCount",
    todayPurchases.length
  );

  const payable =
    DATA.suppliers.reduce(
      (sum, s) =>
        sum + number(s.payable),
      0
    );

  setText(
    "supplierPayable",
    money(payable)
  );

  if (!DATA.purchases.length) {
    node.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            No purchases
          </div>
        </td>
      </tr>
    `;

    return;
  }

  const purchases =
    DATA.purchases
      .slice()
      .sort(
        (a,b) =>
          new Date(b.date) -
          new Date(a.date)
      );

  node.innerHTML =
    purchases.map(p => `
      <tr>

        <td>
          ${escapeHTML(p.invoice || "-")}
        </td>

        <td>
          ${escapeHTML(p.supplierName || "-")}
        </td>

        <td>
          ${p.date
            ? new Date(p.date)
                .toLocaleDateString()
            : "-"}
        </td>

        <td>
          ${escapeHTML(
            p.productName || "-"
          )}
        </td>

        <td>
          ${number(p.qty)}
        </td>

        <td>
          ${money(p.unitCost)}
        </td>

        <td>
          ${money(p.total)}
        </td>

        <td>
          ${escapeHTML(
            p.paymentMethod || "cash"
          )}
        </td>

      </tr>
    `).join("");
}


function purchaseForm() {
  const productOptions =
    DATA.products.map(
      p => `
        <option value="${p.id}">
          ${escapeHTML(p.name)}
        </option>
      `
    ).join("");

  const supplierOptions =
    DATA.suppliers.map(
      s => `
        <option value="${s.id}">
          ${escapeHTML(s.name)}
        </option>
      `
    ).join("");

  return `
    <form id="purchaseForm">

      <div class="form-grid">

        <div class="form-group">
          <label>Product</label>

          <select id="f_purchaseProduct">
            ${productOptions}
          </select>
        </div>

        <div class="form-group">
          <label>Supplier</label>

          <select id="f_purchaseSupplier">

            <option value="">
              Select Supplier
            </option>

            ${supplierOptions}

          </select>
        </div>

        <div class="form-group">
          <label>Quantity</label>

          <input
            id="f_purchaseQty"
            type="number"
            min="1"
            value="1">
        </div>

        <div class="form-group">
          <label>Buy Cost / Unit</label>

          <input
            id="f_purchaseCost"
            type="number"
            min="0">
        </div>

        <div class="form-group">
          <label>Payment</label>

          <select id="f_purchasePayment">

            <option value="cash">
              Cash
            </option>

            <option value="credit">
              Credit
            </option>

          </select>
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary">
          Save Purchase
        </button>

      </div>

    </form>
  `;
}


function addPurchase() {
  if (!DATA.products.length) {
    showToast(
      "အရင် Product ထည့်ပါ",
      "error"
    );

    return;
  }

  openModal(
    "New Purchase",
    "Record inventory purchase",
    purchaseForm()
  );

  const form =
    el("purchaseForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      const product =
        DATA.products.find(
          p =>
            p.id ===
            getValue("f_purchaseProduct")
        );

      if (!product) {
        showToast(
          "Product ရွေးပါ",
          "error"
        );

        return;
      }

      const qty =
        number(
          getValue("f_purchaseQty")
        );

      const cost =
        number(
          getValue("f_purchaseCost")
        );

      if (qty <= 0) {
        showToast(
          "Quantity မှန်ကန်စွာထည့်ပါ",
          "error"
        );

        return;
      }

      const supplier =
        DATA.suppliers.find(
          s =>
            s.id ===
            getValue("f_purchaseSupplier")
        );

      const total =
        qty * cost;

      DATA.purchases.push({
        id: uid("purchase"),
        invoice:
          "PUR-" +
          Date.now(),
        date: now(),
        productId: product.id,
        productName: product.name,
        supplierId:
          supplier?.id || "",
        supplierName:
          supplier?.name || "",
        qty,
        unitCost: cost,
        total,
        paymentMethod:
          getValue("f_purchasePayment")
      });

      product.stock =
        number(product.stock) + qty;

      product.buyPrice = cost;

      if (
        getValue("f_purchasePayment") ===
          "credit" &&
        supplier
      ) {
        supplier.payable =
          number(supplier.payable) +
          total;
      }

      saveData();

      closeModal();

      renderPurchases();
      renderProducts();
      renderStock();
      renderSalesProducts();
      updateDashboard();
      renderDebts();

      showToast(
        "Purchase သိမ်းပြီးပါပြီ"
      );
    }
  );
}


/* =========================================================
   STOCK
   ========================================================= */

function renderStock() {
  const node =
    el("stockTableBody");

  if (!node) return;

  const low =
    DATA.products.filter(
      p =>
        number(p.stock) <=
        number(p.lowStock || 5)
    );

  const stockUnits =
    DATA.products.reduce(
      (sum, p) =>
        sum + number(p.stock),
      0
    );

  const costValue =
    DATA.products.reduce(
      (sum, p) =>
        sum +
        number(p.stock) *
        number(p.buyPrice),
      0
    );

  setText(
    "stockProductCount",
    DATA.products.length
  );

  setText(
    "stockUnitCount",
    stockUnits
  );

  setText(
    "stockCostValue",
    money(costValue)
  );

  setText(
    "stockLowCount",
    low.length
  );

  if (!DATA.products.length) {
    node.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            No stock
          </div>
        </td>
      </tr>
    `;

    return;
  }

  node.innerHTML =
    DATA.products.map(p => `
      <tr>

        <td>
          ${escapeHTML(p.name)}
        </td>

        <td>
          ${number(p.stock)}
        </td>

        <td>
          ${escapeHTML(p.unit || "pcs")}
        </td>

        <td>
          ${money(
            number(p.stock) *
            number(p.buyPrice)
          )}
        </td>

        <td>
          ${money(
            number(p.stock) *
            number(p.retailPrice)
          )}
        </td>

        <td>
          ${money(
            number(p.stock) *
            number(p.wholesalePrice)
          )}
        </td>

        <td>
          ${
            number(p.stock) <=
            number(p.lowStock || 5)
            ? "LOW"
            : "OK"
          }
        </td>

        <td>

          <button
            class="btn small"
            onclick="adjustStock('${p.id}')">
            Adjust
          </button>

        </td>

      </tr>
    `).join("");
}


function adjustStock(id) {
  const product =
    DATA.products.find(
      p => p.id === id
    );

  if (!product) return;

  openModal(
    "Stock Adjustment",
    product.name,
    `
      <form id="stockForm">

        <div class="form-group">

          <label>
            Current Stock
          </label>

          <input
            value="${number(product.stock)}"
            disabled>

        </div>

        <div class="form-group">

          <label>
            New Stock
          </label>

          <input
            id="newStock"
            type="number"
            min="0"
            value="${number(product.stock)}">

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()">
            Cancel
          </button>

          <button
            type="submit"
            class="btn primary">
            Save
          </button>

        </div>

      </form>
    `
  );

  const form =
    el("stockForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      product.stock =
        number(getValue("newStock"));

      saveData();

      closeModal();

      renderStock();
      renderProducts();
      renderSalesProducts();
      updateDashboard();

      showToast(
        "Stock updated"
      );
    }
  );
}


/* =========================================================
   CUSTOMERS
   ========================================================= */

function renderCustomers() {
  const node =
    el("customerTableBody");

  if (!node) return;

  setText(
    "customerCount",
    DATA.customers.length
  );

  const receivable =
    DATA.customers.reduce(
      (sum, c) =>
        sum + number(c.receivable),
      0
    );

  setText(
    "customerReceivable",
    money(receivable)
  );

  const search =
    getValue("customerSearch")
      .trim()
      .toLowerCase();

  const customers =
    DATA.customers.filter(c =>
      !search ||
      String(c.name || "")
        .toLowerCase()
        .includes(search) ||
      String(c.phone || "")
        .toLowerCase()
        .includes(search)
    );

  if (!customers.length) {
    node.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            No customers
          </div>
        </td>
      </tr>
    `;

    return;
  }

  node.innerHTML =
    customers.map(c => `
      <tr>

        <td>
          ${escapeHTML(c.name)}
        </td>

        <td>
          ${escapeHTML(c.phone || "-")}
        </td>

        <td>
          ${escapeHTML(c.address || "-")}
        </td>

        <td>
          ${money(c.receivable)}
        </td>

        <td>
          ${c.createdAt
            ? new Date(c.createdAt)
                .toLocaleDateString()
            : "-"}
        </td>

        <td>

          <button
            class="btn small"
            onclick="editCustomer('${c.id}')">
            Edit
          </button>

          <button
            class="btn small danger"
            onclick="deleteCustomer('${c.id}')">
            Delete
          </button>

        </td>

      </tr>
    `).join("");
}


function customerForm(customer = {}) {
  return `
    <form id="customerForm">

      <div class="form-grid">

        <div class="form-group">
          <label>Name *</label>

          <input
            id="f_customerName"
            value="${escapeHTML(customer.name || "")}"
            required>
        </div>

        <div class="form-group">
          <label>Phone</label>

          <input
            id="f_customerPhone"
            value="${escapeHTML(customer.phone || "")}">
        </div>

        <div class="form-group">
          <label>Address</label>

          <textarea id="f_customerAddress">${escapeHTML(
            customer.address || ""
          )}</textarea>
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary">
          Save
        </button>

      </div>

    </form>
  `;
}


function addCustomer() {
  openModal(
    "Add Customer",
    "Customer information",
    customerForm()
  );

  const form =
    el("customerForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      const name =
        getValue("f_customerName")
          .trim();

      if (!name) {
        showToast(
          "Customer Name ထည့်ပါ",
          "error"
        );

        return;
      }

      DATA.customers.push({
        id: uid("customer"),
        name,
        phone:
          getValue("f_customerPhone"),
        address:
          getValue("f_customerAddress"),
        receivable: 0,
        createdAt: now()
      });

      saveData();

      closeModal();

      renderCustomers();
      renderDebts();

      showToast(
        "Customer ထည့်ပြီးပါပြီ"
      );
    }
  );
}


function editCustomer(id) {
  const customer =
    DATA.customers.find(
      c => c.id === id
    );

  if (!customer) return;

  openModal(
    "Edit Customer",
    "Update customer",
    customerForm(customer)
  );

  const form =
    el("customerForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      customer.name =
        getValue("f_customerName")
          .trim();

      customer.phone =
        getValue("f_customerPhone");

      customer.address =
        getValue("f_customerAddress");

      saveData();

      closeModal();

      renderCustomers();
      renderDebts();

      showToast(
        "Customer ပြင်ပြီးပါပြီ"
      );
    }
  );
}


function deleteCustomer(id) {
  const customer =
    DATA.customers.find(
      c => c.id === id
    );

  if (!customer) return;

  if (
    !confirm(
      `"${customer.name}" ကို ဖျက်မလား?`
    )
  ) {
    return;
  }

  DATA.customers =
    DATA.customers.filter(
      c => c.id !== id
    );

  saveData();

  renderCustomers();
  renderDebts();

  showToast(
    "Customer ဖျက်ပြီးပါပြီ"
  );
}


/* =========================================================
   SUPPLIERS
   ========================================================= */

function renderSuppliers() {
  const node =
    el("supplierTableBody");

  if (!node) return;

  if (!DATA.suppliers.length) {
    node.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            No suppliers
          </div>
        </td>
      </tr>
    `;

    return;
  }

  node.innerHTML =
    DATA.suppliers.map(s => `
      <tr>

        <td>
          ${escapeHTML(s.name)}
        </td>

        <td>
          ${escapeHTML(s.phone || "-")}
        </td>

        <td>
          ${escapeHTML(s.address || "-")}
        </td>

        <td>
          ${money(s.payable)}
        </td>

        <td>
          ${s.createdAt
            ? new Date(s.createdAt)
                .toLocaleDateString()
            : "-"}
        </td>

        <td>

          <button
            class="btn small"
            onclick="editSupplier('${s.id}')">
            Edit
          </button>

          <button
            class="btn small danger"
            onclick="deleteSupplier('${s.id}')">
            Delete
          </button>

        </td>

      </tr>
    `).join("");
}


function supplierForm(supplier = {}) {
  return `
    <form id="supplierForm">

      <div class="form-grid">

        <div class="form-group">
          <label>Supplier Name *</label>

          <input
            id="f_supplierName"
            value="${escapeHTML(supplier.name || "")}"
            required>
        </div>

        <div class="form-group">
          <label>Phone</label>

          <input
            id="f_supplierPhone"
            value="${escapeHTML(supplier.phone || "")}">
        </div>

        <div class="form-group">
          <label>Address</label>

          <textarea id="f_supplierAddress">${escapeHTML(
            supplier.address || ""
          )}</textarea>
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary">
          Save
        </button>

      </div>

    </form>
  `;
}


function addSupplier() {
  openModal(
    "Add Supplier",
    "Supplier information",
    supplierForm()
  );

  const form =
    el("supplierForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      const name =
        getValue("f_supplierName")
          .trim();

      if (!name) {
        showToast(
          "Supplier Name ထည့်ပါ",
          "error"
        );

        return;
      }

      DATA.suppliers.push({
        id: uid("supplier"),
        name,
        phone:
          getValue("f_supplierPhone"),
        address:
          getValue("f_supplierAddress"),
        payable: 0,
        createdAt: now()
      });

      saveData();

      closeModal();

      renderSuppliers();
      renderPurchases();
      renderDebts();

      showToast(
        "Supplier ထည့်ပြီးပါပြီ"
      );
    }
  );
}


function editSupplier(id) {
  const supplier =
    DATA.suppliers.find(
      s => s.id === id
    );

  if (!supplier) return;

  openModal(
    "Edit Supplier",
    "Update supplier",
    supplierForm(supplier)
  );

  const form =
    el("supplierForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      supplier.name =
        getValue("f_supplierName")
          .trim();

      supplier.phone =
        getValue("f_supplierPhone");

      supplier.address =
        getValue("f_supplierAddress");

      saveData();

      closeModal();

      renderSuppliers();
      renderPurchases();
      renderDebts();

      showToast(
        "Supplier ပြင်ပြီးပါပြီ"
      );
    }
  );
}


function deleteSupplier(id) {
  const supplier =
    DATA.suppliers.find(
      s => s.id === id
    );

  if (!supplier) return;

  if (
    !confirm(
      `"${supplier.name}" ကို ဖျက်မလား?`
    )
  ) {
    return;
  }

  DATA.suppliers =
    DATA.suppliers.filter(
      s => s.id !== id
    );

  saveData();

  renderSuppliers();
  renderPurchases();
  renderDebts();

  showToast(
    "Supplier ဖျက်ပြီးပါပြီ"
  );
}


/* =========================================================
   DEBTS
   ========================================================= */

function renderDebts() {
  const receivable =
    DATA.customers.reduce(
      (sum, c) =>
        sum + number(c.receivable),
      0
    );

  const payable =
    DATA.suppliers.reduce(
      (sum, s) =>
        sum + number(s.payable),
      0
    );

  setText(
    "totalReceivable",
    money(receivable)
  );

  setText(
    "totalPayable",
    money(payable)
  );

  const receivableNode =
    el("receivableList");

  if (receivableNode) {

    const customers =
      DATA.customers.filter(
        c => number(c.receivable) > 0
      );

    receivableNode.innerHTML =
      customers.length
        ? customers.map(c => `
          <div class="debt-item">
            <strong>
              ${escapeHTML(c.name)}
            </strong>

            <span>
              ${money(c.receivable)}
            </span>
          </div>
        `).join("")
        : `<div class="empty-state">
            No receivables
           </div>`;
  }

  const payableNode =
    el("payableList");

  if (payableNode) {

    const suppliers =
      DATA.suppliers.filter(
        s => number(s.payable) > 0
      );

    payableNode.innerHTML =
      suppliers.length
        ? suppliers.map(s => `
          <div class="debt-item">
            <strong>
              ${escapeHTML(s.name)}
            </strong>

            <span>
              ${money(s.payable)}
            </span>
          </div>
        `).join("")
        : `<div class="empty-state">
            No payables
           </div>`;
  }
}


/* =========================================================
   EXPENSES
   ========================================================= */

function renderExpenses() {
  const node =
    el("expenseTableBody");

  const todayExpenses =
    DATA.expenses.filter(
      e => sameDay(e.date)
    );

  const monthExpenses =
    DATA.expenses.filter(
      e => sameMonth(e.date)
    );

  const yearExpenses =
    DATA.expenses.filter(
      e => sameYear(e.date)
    );

  setText(
    "expenseToday",
    money(
      todayExpenses.reduce(
        (sum, e) =>
          sum + number(e.amount),
        0
      )
    )
  );

  setText(
    "expenseMonth",
    money(
      monthExpenses.reduce(
        (sum, e) =>
          sum + number(e.amount),
        0
      )
    )
  );

  setText(
    "expenseYear",
    money(
      yearExpenses.reduce(
        (sum, e) =>
          sum + number(e.amount),
        0
      )
    )
  );

  if (!node) return;

  if (!DATA.expenses.length) {
    node.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            No expenses
          </div>
        </td>
      </tr>
    `;

    return;
  }

  node.innerHTML =
    DATA.expenses
      .slice()
      .sort(
        (a,b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .map(e => `
        <tr>

          <td>
            ${e.date
              ? new Date(e.date)
                  .toLocaleDateString()
              : "-"}
          </td>

          <td>
            ${escapeHTML(e.category || "-")}
          </td>

          <td>
            ${escapeHTML(e.description || "-")}
          </td>

          <td>
            ${money(e.amount)}
          </td>

          <td>
            ${escapeHTML(e.employee || "-")}
          </td>

          <td>

            <button
              class="btn small danger"
              onclick="deleteExpense('${e.id}')">
              Delete
            </button>

          </td>

        </tr>
      `).join("");
}


function expenseForm() {
  return `
    <form id="expenseForm">

      <div class="form-grid">

        <div class="form-group">
          <label>Category</label>

          <input
            id="f_expenseCategory"
            placeholder="Rent / Transport / Salary">
        </div>

        <div class="form-group">
          <label>Amount *</label>

          <input
            id="f_expenseAmount"
            type="number"
            min="0"
            required>
        </div>

        <div class="form-group">
          <label>Description</label>

          <textarea
            id="f_expenseDescription"></textarea>
        </div>

        <div class="form-group">
          <label>Employee</label>

          <input
            id="f_expenseEmployee">
        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary">
          Save Expense
        </button>

      </div>

    </form>
  `;
}


function addExpense() {
  openModal(
    "Add Expense",
    "Record business expense",
    expenseForm()
  );

  const form =
    el("expenseForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      const amount =
        number(
          getValue("f_expenseAmount")
        );

      if (amount <= 0) {
        showToast(
          "Amount ထည့်ပါ",
          "error"
        );

        return;
      }

      DATA.expenses.push({
        id: uid("expense"),
        date: now(),
        category:
          getValue("f_expenseCategory"),
        amount,
        description:
          getValue("f_expenseDescription"),
        employee:
          getValue("f_expenseEmployee")
      });

      saveData();

      closeModal();

      renderExpenses();
      updateDashboard();
      renderReports();

      showToast(
        "Expense သိမ်းပြီးပါပြီ"
      );
    }
  );
}


function deleteExpense(id) {
  if (
    !confirm(
      "ဒီ Expense ကို ဖျက်မလား?"
    )
  ) {
    return;
  }

  DATA.expenses =
    DATA.expenses.filter(
      e => e.id !== id
    );

  saveData();

  renderExpenses();
  updateDashboard();
  renderReports();

  showToast(
    "Expense ဖျက်ပြီးပါပြီ"
  );
}


/* =========================================================
   EMPLOYEES
   ========================================================= */

function renderEmployees() {
  const node =
    el("employeeTableBody");

  if (!node) return;

  if (!DATA.employees.length) {
    node.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            No employees
          </div>
        </td>
      </tr>
    `;

    return;
  }

  node.innerHTML =
    DATA.employees.map(e => `
      <tr>

        <td>
          ${escapeHTML(e.name)}
        </td>

        <td>
          ${escapeHTML(e.position || "-")}
        </td>

        <td>
          ${escapeHTML(e.phone || "-")}
        </td>

        <td>
          ${money(e.salary)}
        </td>

        <td>
          ${escapeHTML(e.status || "Active")}
        </td>

        <td>

          <button
            class="btn small"
            onclick="editEmployee('${e.id}')">
            Edit
          </button>

          <button
            class="btn small danger"
            onclick="deleteEmployee('${e.id}')">
            Delete
          </button>

        </td>

      </tr>
    `).join("");
}


function employeeForm(employee = {}) {
  return `
    <form id="employeeForm">

      <div class="form-grid">

        <div class="form-group">
          <label>Name *</label>

          <input
            id="f_employeeName"
            value="${escapeHTML(employee.name || "")}"
            required>
        </div>

        <div class="form-group">
          <label>Position</label>

          <input
            id="f_employeePosition"
            value="${escapeHTML(employee.position || "")}">
        </div>

        <div class="form-group">
          <label>Phone</label>

          <input
            id="f_employeePhone"
            value="${escapeHTML(employee.phone || "")}">
        </div>

        <div class="form-group">
          <label>Monthly Salary</label>

          <input
            id="f_employeeSalary"
            type="number"
            value="${number(employee.salary)}">
        </div>

        <div class="form-group">
          <label>Status</label>

          <select id="f_employeeStatus">

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>

        </div>

      </div>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()">
          Cancel
        </button>

        <button
          type="submit"
          class="btn primary">
          Save
        </button>

      </div>

    </form>
  `;
}


function addEmployee() {
  openModal(
    "Add Employee",
    "Employee information",
    employeeForm()
  );

  const form =
    el("employeeForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      const name =
        getValue("f_employeeName")
          .trim();

      if (!name) {
        showToast(
          "Employee Name ထည့်ပါ",
          "error"
        );

        return;
      }

      DATA.employees.push({
        id: uid("employee"),
        name,
        position:
          getValue("f_employeePosition"),
        phone:
          getValue("f_employeePhone"),
        salary:
          number(
            getValue("f_employeeSalary")
          ),
        status:
          getValue("f_employeeStatus"),
        createdAt: now()
      });

      saveData();

      closeModal();

      renderEmployees();

      showToast(
        "Employee ထည့်ပြီးပါပြီ"
      );
    }
  );
}


function editEmployee(id) {
  const employee =
    DATA.employees.find(
      e => e.id === id
    );

  if (!employee) return;

  openModal(
    "Edit Employee",
    "Update employee",
    employeeForm(employee)
  );

  setValue(
    "f_employeeStatus",
    employee.status || "Active"
  );

  const form =
    el("employeeForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      employee.name =
        getValue("f_employeeName")
          .trim();

      employee.position =
        getValue("f_employeePosition");

      employee.phone =
        getValue("f_employeePhone");

      employee.salary =
        number(
          getValue("f_employeeSalary")
        );

      employee.status =
        getValue("f_employeeStatus");

      saveData();

      closeModal();

      renderEmployees();

      showToast(
        "Employee ပြင်ပြီးပါပြီ"
      );
    }
  );
}


function deleteEmployee(id) {
  if (
    !confirm(
      "Employee ကို ဖျက်မလား?"
    )
  ) {
    return;
  }

  DATA.employees =
    DATA.employees.filter(
      e => e.id !== id
    );

  saveData();

  renderEmployees();

  showToast(
    "Employee ဖျက်ပြီးပါပြီ"
  );
}


/* =========================================================
   REPORTS
   ========================================================= */

function renderReports() {
  const period =
    getValue("reportPeriod") ||
    "month";

  let sales =
    DATA.sales;

  let purchases =
    DATA.purchases;

  let expenses =
    DATA.expenses;

  if (period === "today") {

    sales =
      sales.filter(
        s => sameDay(s.date)
      );

    purchases =
      purchases.filter(
        p => sameDay(p.date)
      );

    expenses =
      expenses.filter(
        e => sameDay(e.date)
      );

  }

  if (period === "month") {

    sales =
      sales.filter(
        s => sameMonth(s.date)
      );

    purchases =
      purchases.filter(
        p => sameMonth(p.date)
      );

    expenses =
      expenses.filter(
        e => sameMonth(e.date)
      );

  }

  if (period === "year") {

    sales =
      sales.filter(
        s => sameYear(s.date)
      );

    purchases =
      purchases.filter(
        p => sameYear(p.date)
      );

    expenses =
      expenses.filter(
        e => sameYear(e.date)
      );
  }

  const salesTotal =
    sales.reduce(
      (sum, s) =>
        sum + number(s.total),
      0
    );

  const purchaseTotal =
    purchases.reduce(
      (sum, p) =>
        sum + number(p.total),
      0
    );

  const expenseTotal =
    expenses.reduce(
      (sum, e) =>
        sum + number(e.amount),
      0
    );

  const grossProfit =
    sales.reduce(
      (sum, s) =>
        sum + number(s.profit),
      0
    );

  const netProfit =
    grossProfit -
    expenseTotal;

  setText(
    "reportSales",
    money(salesTotal)
  );

  setText(
    "reportPurchase",
    money(purchaseTotal)
  );

  setText(
    "reportExpenses",
    money(expenseTotal)
  );

  setText(
    "reportProfit",
    money(netProfit)
  );

  setHTML(
    "salesReportSummary",
    `
      <div class="report-line">
        <span>Total Sales</span>
        <strong>
          ${money(salesTotal)}
        </strong>
      </div>

      <div class="report-line">
        <span>Transactions</span>
        <strong>
          ${sales.length}
        </strong>
      </div>
    `
  );

  setHTML(
    "profitReportSummary",
    `
      <div class="report-line">
        <span>Gross Profit</span>
        <strong>
          ${money(grossProfit)}
        </strong>
      </div>

      <div class="report-line">
        <span>Expenses</span>
        <strong>
          ${money(expenseTotal)}
        </strong>
      </div>

      <div class="report-line">
        <span>Net Profit</span>
        <strong>
          ${money(netProfit)}
        </strong>
      </div>
    `
  );
}


/* =========================================================
   SETTINGS
   ========================================================= */

function shopSettings() {
  openModal(
    "Shop Settings",
    "Business information",
    `
      <form id="shopSettingsForm">

        <div class="form-grid">

          <div class="form-group">
            <label>Shop Name</label>

            <input
              id="f_shopName"
              value="${escapeHTML(
                DATA.settings.shopName
              )}">
          </div>

          <div class="form-group">
            <label>Phone</label>

            <input
              id="f_shopPhone"
              value="${escapeHTML(
                DATA.settings.phone
              )}">
          </div>

          <div class="form-group">
            <label>Address</label>

            <textarea
              id="f_shopAddress">${escapeHTML(
                DATA.settings.address
              )}</textarea>
          </div>

          <div class="form-group">
            <label>Receipt Footer</label>

            <input
              id="f_shopFooter"
              value="${escapeHTML(
                DATA.settings.footer
              )}">
          </div>

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()">
            Cancel
          </button>

          <button
            type="submit"
            class="btn primary">
            Save Settings
          </button>

        </div>

      </form>
    `
  );

  const form =
    el("shopSettingsForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      DATA.settings.shopName =
        getValue("f_shopName")
          .trim() ||
        "Aung POS";

      DATA.settings.phone =
        getValue("f_shopPhone");

      DATA.settings.address =
        getValue("f_shopAddress");

      DATA.settings.footer =
        getValue("f_shopFooter");

      saveData();

      closeModal();

      updateDashboard();

      showToast(
        "Shop Settings သိမ်းပြီးပါပြီ"
      );
    }
  );
}


function receiptSettings() {
  openModal(
    "Receipt Settings",
    "Customize receipt",
    `
      <form id="receiptSettingsForm">

        <div class="form-group">

          <label>
            Receipt Font Size
          </label>

          <input
            id="f_receiptFont"
            type="number"
            min="8"
            max="30"
            value="${number(
              DATA.settings.receiptFontSize
            ) || 14}">

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()">
            Cancel
          </button>

          <button
            type="submit"
            class="btn primary">
            Save
          </button>

        </div>

      </form>
    `
  );

  const form =
    el("receiptSettingsForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      DATA.settings.receiptFontSize =
        number(
          getValue("f_receiptFont")
        ) || 14;

      saveData();

      closeModal();

      showToast(
        "Receipt Settings သိမ်းပြီးပါပြီ"
      );
    }
  );
}


function userSettings() {
  openModal(
    "User Settings",
    "POS account settings",
    `
      <div class="settings-info">

        <h3>
          Aung POS
        </h3>

        <p>
          Current local user
        </p>

        <p>
          Data is stored securely
          in this device browser.
        </p>

      </div>

      <div class="modal-actions">

        <button
          class="btn primary"
          onclick="closeModal()">
          Close
        </button>

      </div>
    `
  );
}


/* =========================================================
   BACKUP
   ========================================================= */

function backupData() {
  try {

    const backup =
      JSON.stringify(
        DATA,
        null,
        2
      );

    const blob =
      new Blob(
        [backup],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "aung-pos-backup-" +
      today() +
      ".json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast(
      "Backup file ထုတ်ပြီးပါပြီ"
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Backup မလုပ်နိုင်ပါ",
      "error"
    );
  }
}


/* =========================================================
   CLEAR DATA
   ========================================================= */

function clearAllData() {

  const answer =
    prompt(
      "Data အားလုံးဖျက်ရန် DELETE ဟုရေးပါ"
    );

  if (
    answer !== "DELETE"
  ) {
    return;
  }

  localStorage.removeItem(
    STORAGE_KEY
  );

  DATA =
    structuredClone(
      DEFAULT_DATA
    );

  saveData();

  refreshAll();

  showToast(
    "Data အားလုံး reset လုပ်ပြီးပါပြီ"
  );
}


/* =========================================================
   NEW SALE
   ========================================================= */

function newSale() {
  DATA.cart = [];

  DATA.paymentMethod = "cash";

  saveData();

  setValue(
    "saleDiscount",
    ""
  );

  setValue(
    "saleCustomer",
    ""
  );

  setValue(
    "saleCustomerId",
    ""
  );

  renderCart();

  showPage("sales");
}


/* =========================================================
   PAYMENT
   ========================================================= */

function setupPaymentButtons() {

  const buttons =
    $$("[data-payment]");

  buttons.forEach(button => {

    button.addEventListener(
      "click",
      function() {

        buttons.forEach(b =>
          b.classList.remove(
            "active"
          )
        );

        button.classList.add(
          "active"
        );

        DATA.paymentMethod =
          button.dataset.payment;

        saveData();
      }
    );

  });
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEvents() {

  /* Navigation */

  $$(
    ".nav-item, .menu-item, .nav-btn, [data-page]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      function(event) {

        event.preventDefault();

        const page =
          button.dataset.page;

        if (page) {
          showPage(page);
        }
      }
    );

  });


  /* Modal */

  const closeButton =
    el("modalClose");

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeModal
    );
  }

  const overlay =
    el("modalOverlay");

  if (overlay) {

    overlay.addEventListener(
      "click",
      function(event) {

        if (
          event.target ===
          overlay
        ) {
          closeModal();
        }

      }
    );

  }


  /* Add buttons */

  const addProductBtn =
    el("addProductBtn");

  if (addProductBtn) {
    addProductBtn.addEventListener(
      "click",
      addProduct
    );
  }


  const addCustomerBtn =
    el("addCustomerBtn");

  if (addCustomerBtn) {
    addCustomerBtn.addEventListener(
      "click",
      addCustomer
    );
  }


  const addSupplierBtn =
    el("addSupplierBtn");

  if (addSupplierBtn) {
    addSupplierBtn.addEventListener(
      "click",
      addSupplier
    );
  }


  const addExpenseBtn =
    el("addExpenseBtn");

  if (addExpenseBtn) {
    addExpenseBtn.addEventListener(
      "click",
      addExpense
    );
  }


  const addEmployeeBtn =
    el("addEmployeeBtn");

  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener(
      "click",
      addEmployee
    );
  }


  const newPurchaseBtn =
    el("newPurchaseBtn");

  if (newPurchaseBtn) {
    newPurchaseBtn.addEventListener(
      "click",
      addPurchase
    );
  }


  const stockAdjustmentBtn =
    el("stockAdjustmentBtn");

  if (stockAdjustmentBtn) {
    stockAdjustmentBtn.addEventListener(
      "click",
      function() {

        if (!DATA.products.length) {
          showToast(
            "Product မရှိသေးပါ",
            "error"
          );

          return;
        }

        adjustStock(
          DATA.products[0].id
        );
      }
    );
  }


  /* Settings */

  const shopSettingsBtn =
    el("shopSettingsBtn");

  if (shopSettingsBtn) {
    shopSettingsBtn.addEventListener(
      "click",
      shopSettings
    );
  }


  const receiptSettingsBtn =
    el("receiptSettingsBtn");

  if (receiptSettingsBtn) {
    receiptSettingsBtn.addEventListener(
      "click",
      receiptSettings
    );
  }


  const userSettingsBtn =
    el("userSettingsBtn");

  if (userSettingsBtn) {
    userSettingsBtn.addEventListener(
      "click",
      userSettings
    );
  }


  const backupBtn =
    el("backupBtn");

  if (backupBtn) {
    backupBtn.addEventListener(
      "click",
      backupData
    );
  }


  const clearDataBtn =
    el("clearDataBtn");

  if (clearDataBtn) {
    clearDataBtn.addEventListener(
      "click",
      clearAllData
    );
  }


  /* New Sale */

  const newSaleBtn =
    el("newSaleBtn");

  if (newSaleBtn) {
    newSaleBtn.addEventListener(
      "click",
      newSale
    );
  }


  /* Clear Cart */

  const clearCartBtn =
    el("clearCartBtn");

  if (clearCartBtn) {
    clearCartBtn.addEventListener(
      "click",
      clearCart
    );
  }


  /* Checkout */

  const checkoutBtn =
    el("checkoutBtn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener(
      "click",
      checkout
    );
  }


  /* Search */

  const productSearch =
    el("productSearch");

  if (productSearch) {

    productSearch.addEventListener(
      "input",
      renderProducts
    );

  }


  const productCategoryFilter =
    el("productCategoryFilter");

  if (productCategoryFilter) {

    productCategoryFilter.addEventListener(
      "change",
      renderProducts
    );

  }


  const stockFilter =
    el("stockFilter");

  if (stockFilter) {

    stockFilter.addEventListener(
      "change",
      renderProducts
    );

  }


  const salesSearch =
    el("salesSearch");

  if (salesSearch) {

    salesSearch.addEventListener(
      "input",
      renderSalesProducts
    );

  }


  const salesCategory =
    el("salesCategory");

  if (salesCategory) {

    salesCategory.addEventListener(
      "change",
      renderSalesProducts
    );

  }


  const customerSearch =
    el("customerSearch");

  if (customerSearch) {

    customerSearch.addEventListener(
      "input",
      renderCustomers
    );

  }


  const saleDiscount =
    el("saleDiscount");

  if (saleDiscount) {

    saleDiscount.addEventListener(
      "input",
      renderCart
    );

  }


  /* Reports */

  const reportPeriod =
    el("reportPeriod");

  if (reportPeriod) {

    reportPeriod.addEventListener(
      "change",
      renderReports
    );

  }


  setupPaymentButtons();

  setupMobileMenu();
}


/* =========================================================
   CATEGORY OPTIONS
   ========================================================= */

function populateCategories() {

  const categories =
    [
      ...new Set(
        DATA.products
          .map(p => p.category)
          .filter(Boolean)
      )
    ];

  const selects =
    [
      el("productCategoryFilter"),
      el("salesCategory")
    ];

  selects.forEach(select => {

    if (!select) return;

    const current =
      select.value;

    select.innerHTML =
      `<option value="">
        All Categories
       </option>` +
      categories.map(
        category =>
          `<option value="${escapeHTML(
            category
          )}">
            ${escapeHTML(category)}
           </option>`
      ).join("");

    select.value =
      current;
  });
}


/* =========================================================
   CUSTOMER SALES SELECT
   ========================================================= */

function populateSalesCustomers() {

  const select =
    el("saleCustomer");

  if (!select) return;

  if (
    select.tagName !==
    "SELECT"
  ) {
    return;
  }

  select.innerHTML =
    `
      <option value="">
        Walk-in Customer
      </option>
    ` +
    DATA.customers.map(
      customer =>
        `
        <option
          value="${customer.id}">
          ${escapeHTML(customer.name)}
        </option>
        `
    ).join("");
}


/* =========================================================
   REFRESH
   ========================================================= */

function refreshAll() {

  try {

    populateCategories();

    populateSalesCustomers();

    updateDashboard();

    renderProducts();

    renderSalesProducts();

    renderCart();

    renderPurchases();

    renderStock();

    renderCustomers();

    renderSuppliers();

    renderDebts();

    renderExpenses();

    renderEmployees();

    renderReports();

  } catch (error) {

    console.error(
      "Refresh error:",
      error
    );

  }
}


function refreshPage(pageName) {

  switch (pageName) {

    case "dashboard":
      updateDashboard();
      break;

    case "sales":
      populateCategories();
      populateSalesCustomers();
      renderSalesProducts();
      renderCart();
      break;

    case "products":
      populateCategories();
      renderProducts();
      break;

    case "purchases":
      renderPurchases();
      break;

    case "stock":
      renderStock();
      break;

    case "customers":
      renderCustomers();
      break;

    case "suppliers":
      renderSuppliers();
      break;

    case "debts":
      renderDebts();
      break;

    case "expenses":
      renderExpenses();
      break;

    case "employees":
      renderEmployees();
      break;

    case "reports":
      renderReports();
      break;

    case "settings":
      updateDashboard();
      break;

    default:
      refreshAll();
  }
}


/* =========================================================
   START APP
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "Aung POS V2.0 Loaded"
    );

    try {

      setupEvents();

      refreshAll();

      showPage("dashboard");

      console.log(
        "Aung POS Ready"
      );

    } catch (error) {

      console.error(
        "Aung POS Startup Error:",
        error
      );

      showToast(
        "App စတင်ရာတွင် Error ဖြစ်နေပါသည်",
        "error"
      );
    }

  }
);


/* =========================================================
   GLOBAL API
   ========================================================= */

window.AungPOS = {

  data: () => DATA,

  save: saveData,

  refresh: refreshAll,

  page: showPage,

  addProduct,

  editProduct,

  deleteProduct,

  addCustomer,

  editCustomer,

  deleteCustomer,

  addSupplier,

  editSupplier,

  deleteSupplier,

  addExpense,

  deleteExpense,

  addEmployee,

  editEmployee,

  deleteEmployee,

  addPurchase,

  adjustStock,

  newSale,

  clearCart,

  checkout,

  backupData,

  clearAllData

};
