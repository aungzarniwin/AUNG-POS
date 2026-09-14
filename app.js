/* =========================================================
   AUNG POS
   Professional Mobile POS & Business Management System
   Full app.js replacement
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "aung_pos_v2_data";

const DEFAULT_DATA = {
  settings: {
    shopName: "Aung POS Shop",
    address: "",
    phone: "",
    footer: "Thank you for your business",
    currency: "Ks",
    receiptFontSize: 14,
    lowStockLimit: 5,
    expiryWarningDays: 30
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
  try {
    return Array.from(document.querySelectorAll(selector));
  } catch (e) {
    return [];
  }
}

function el(id) {
  return $(id);
}

function uid(prefix) {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function today() {
  const d = new Date();

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

function now() {
  return new Date().toISOString();
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function money(value) {
  const n = number(value);

  return n.toLocaleString("en-US", {
    maximumFractionDigits: 0
  }) + " Ks";
}

function moneyPlain(value) {
  return number(value).toLocaleString("en-US", {
    maximumFractionDigits: 0
  });
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
  const d = String(date || "").slice(0, 7);
  return d === today().slice(0, 7);
}

function sameYear(date) {
  const d = String(date || "").slice(0, 4);
  return d === today().slice(0, 4);
}

function setText(id, value) {
  const node = $(id);

  if (node) {
    node.textContent = value;
  }
}

function setHTML(id, value) {
  const node = $(id);

  if (node) {
    node.innerHTML = value;
  }
}

function valueOf(id, fallback = "") {
  const node = $(id);

  if (!node) {
    return fallback;
  }

  return node.value;
}

function setValue(id, value) {
  const node = $(id);

  if (node) {
    node.value = value ?? "";
  }
}


/* =========================================================
   DATA
   ========================================================= */

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return structuredClone(DEFAULT_DATA);
    }

    const saved = JSON.parse(raw);

    return {
      ...structuredClone(DEFAULT_DATA),
      ...saved,

      settings: {
        ...DEFAULT_DATA.settings,
        ...(saved.settings || {})
      },

      products: Array.isArray(saved.products)
        ? saved.products
        : [],

      sales: Array.isArray(saved.sales)
        ? saved.sales
        : [],

      purchases: Array.isArray(saved.purchases)
        ? saved.purchases
        : [],

      customers: Array.isArray(saved.customers)
        ? saved.customers
        : [],

      suppliers: Array.isArray(saved.suppliers)
        ? saved.suppliers
        : [],

      expenses: Array.isArray(saved.expenses)
        ? saved.expenses
        : [],

      employees: Array.isArray(saved.employees)
        ? saved.employees
        : [],

      cart: Array.isArray(saved.cart)
        ? saved.cart
        : [],

      paymentMethod: saved.paymentMethod || "cash"
    };
  } catch (error) {
    console.error("Load Data Error:", error);

    return structuredClone(DEFAULT_DATA);
  }
}

let DATA = loadData();

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DATA)
    );

    return true;
  } catch (error) {
    console.error("Save Data Error:", error);

    showToast(
      "Data သိမ်းရာတွင် Error ဖြစ်နေပါသည်",
      "error"
    );

    return false;
  }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "success") {
  let container = $("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";

    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.zIndex = "99999";

    document.body.appendChild(container);
  }

  const toast = document.createElement("div");

  toast.textContent = message;

  toast.style.padding = "13px 18px";
  toast.style.marginTop = "8px";
  toast.style.borderRadius = "12px";
  toast.style.background =
    type === "error"
      ? "#dc2626"
      : type === "warning"
        ? "#d97706"
        : "#16a34a";

  toast.style.color = "#fff";
  toast.style.fontSize = "14px";
  toast.style.fontWeight = "600";
  toast.style.boxShadow =
    "0 8px 30px rgba(0,0,0,.2)";

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(title, body, subtitle = "") {
  setText("modalTitle", title);
  setText("modalSubtitle", subtitle);
  setHTML("modalBody", body);

  const overlay = $("modalOverlay");

  if (overlay) {
    overlay.classList.add("active");
    overlay.style.display = "flex";
  }
}

function closeModal() {
  const overlay = $("modalOverlay");

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
    "Business Overview"
  ],

  sales: [
    "Sales",
    "Create sales and manage POS transactions"
  ],

  products: [
    "Products",
    "Manage products, prices and inventory"
  ],

  purchases: [
    "Purchases",
    "Manage supplier purchases"
  ],

  stock: [
    "Stock",
    "Inventory and stock control"
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
    "Receivables and payables"
  ],

  expenses: [
    "Expenses",
    "Business expenses"
  ],

  employees: [
    "Employees",
    "Employee and salary management"
  ],

  reports: [
    "Reports",
    "Business performance reports"
  ],

  settings: [
    "Settings",
    "Shop and system settings"
  ]
};

let CURRENT_PAGE = "dashboard";


function findPageElement(page) {
  const possibilities = [
    page,
    "page-" + page
  ];

  for (const id of possibilities) {
    const node = $(id);

    if (node) {
      return node;
    }
  }

  return null;
}


function showPage(page) {
  try {
    const target = findPageElement(page);

    if (!target) {
      console.warn(
        "Page not found:",
        page
      );

      return;
    }

    CURRENT_PAGE = page;

    /* Hide all pages */
    $$(".page").forEach(node => {
      node.classList.remove("active");
      node.style.display = "none";
    });

    /* Show target */
    target.classList.add("active");
    target.style.display = "block";

    /* Navigation active */
    $$(
      ".nav-item, .menu-item, .nav-btn, [data-page]"
    ).forEach(button => {
      const btnPage =
        button.getAttribute("data-page");

      if (btnPage === page) {
        button.classList.add("active");
      } else if (
        button.matches(
          ".nav-item, .menu-item, .nav-btn"
        )
      ) {
        button.classList.remove("active");
      }
    });

    const title = PAGE_TITLES[page];

    if (title) {
      setText("pageTitle", title[0]);
      setText("pageSubtitle", title[1]);
    }

    /* Close mobile sidebar */
    const sidebar = $("sidebar");

    if (sidebar) {
      sidebar.classList.remove("open");
    }

    refreshPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (error) {
    console.error(
      "Navigation Error:",
      error
    );

    showToast(
      "Page ဖွင့်ရာတွင် Error ဖြစ်နေပါသည်",
      "error"
    );
  }
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMobileMenu() {
  const sidebar = $("sidebar");

  if (sidebar) {
    sidebar.classList.toggle("open");
  }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function getTodaySales() {
  return DATA.sales.filter(s =>
    sameDay(s.date)
  );
}

function getTodayPurchases() {
  return DATA.purchases.filter(p =>
    sameDay(p.date)
  );
}

function getTodayExpenses() {
  return DATA.expenses.filter(e =>
    sameDay(e.date)
  );
}

function calculateSaleTotal(sale) {
  if (
    sale.total !== undefined &&
    sale.total !== null
  ) {
    return number(sale.total);
  }

  return number(sale.subtotal)
    - number(sale.discount);
}

function calculateSaleProfit(sale) {
  if (
    sale.profit !== undefined &&
    sale.profit !== null
  ) {
    return number(sale.profit);
  }

  if (Array.isArray(sale.items)) {
    return sale.items.reduce(
      (sum, item) => {
        const qty = number(item.qty);
        const price = number(item.price);
        const cost = number(item.cost);

        return sum + ((price - cost) * qty);
      },
      0
    ) - number(sale.discount);
  }

  return 0;
}

function updateDashboard() {
  try {
    const sales = getTodaySales();
    const purchases = getTodayPurchases();
    const expenses = getTodayExpenses();

    const salesTotal = sales.reduce(
      (sum, sale) =>
        sum + calculateSaleTotal(sale),
      0
    );

    const profitTotal = sales.reduce(
      (sum, sale) =>
        sum + calculateSaleProfit(sale),
      0
    );

    const purchaseTotal = purchases.reduce(
      (sum, purchase) =>
        sum + number(purchase.total),
      0
    );

    const expenseTotal = expenses.reduce(
      (sum, expense) =>
        sum + number(expense.amount),
      0
    );

    const lowStockProducts =
      DATA.products.filter(product =>
        number(product.stock) <=
        number(
          product.lowStock ??
          DATA.settings.lowStockLimit
        )
      );

    const expiryProducts =
      DATA.products.filter(product =>
        isExpiring(product)
      );

    setText(
      "todaySales",
      money(salesTotal)
    );

    setText(
      "todayProfit",
      money(profitTotal)
    );

    setText(
      "todayPurchase",
      money(purchaseTotal)
    );

    setText(
      "todayExpense",
      money(expenseTotal)
    );

    setText(
      "todaySalesCount",
      sales.length
    );

    setText(
      "totalProducts",
      DATA.products.length
    );

    setText(
      "lowStockCount",
      lowStockProducts.length
    );

    setText(
      "expiryCount",
      expiryProducts.length
    );

    setText(
      "totalCustomers",
      DATA.customers.length
    );

    setText(
      "welcomeShopName",
      DATA.settings.shopName
    );

    setText(
      "sideShopName",
      DATA.settings.shopName
    );

    renderRecentSales();
    renderDashboardAlerts();

  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );
  }
}


function renderRecentSales() {
  const node = $("recentSales");

  if (!node) {
    return;
  }

  const sales = [...DATA.sales]
    .sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    )
    .slice(0, 8);

  if (!sales.length) {
    node.innerHTML =
      '<div class="empty-state">No sales yet</div>';

    return;
  }

  node.innerHTML = sales.map(sale => `
    <div class="recent-sale-item">
      <div>
        <strong>
          ${escapeHTML(
            sale.invoice ||
            sale.id ||
            "Sale"
          )}
        </strong>

        <small>
          ${escapeHTML(
            sale.customerName ||
            "Walk-in Customer"
          )}
        </small>
      </div>

      <strong>
        ${money(
          calculateSaleTotal(sale)
        )}
      </strong>
    </div>
  `).join("");
}


function renderDashboardAlerts() {
  const node = $("dashboardAlerts");

  if (!node) {
    return;
  }

  const lowStock =
    DATA.products.filter(product =>
      number(product.stock) <=
      number(
        product.lowStock ??
        DATA.settings.lowStockLimit
      )
    );

  const expiry =
    DATA.products.filter(product =>
      isExpiring(product)
    );

  let html = "";

  lowStock.slice(0, 5).forEach(product => {
    html += `
      <div class="alert-item warning">
        <strong>Low Stock</strong>
        <span>
          ${escapeHTML(product.name)}
          — ${number(product.stock)}
        </span>
      </div>
    `;
  });

  expiry.slice(0, 5).forEach(product => {
    html += `
      <div class="alert-item danger">
        <strong>Expiry Alert</strong>
        <span>
          ${escapeHTML(product.name)}
          — ${escapeHTML(product.expiry)}
        </span>
      </div>
    `;
  });

  if (!html) {
    html = `
      <div class="empty-state">
        No alerts
      </div>
    `;
  }

  node.innerHTML = html;
}


/* =========================================================
   EXPIRY
   ========================================================= */

function isExpiring(product) {
  if (!product.expiry) {
    return false;
  }

  const expiryDate =
    new Date(product.expiry);

  if (Number.isNaN(expiryDate.getTime())) {
    return false;
  }

  const todayDate = new Date();

  todayDate.setHours(0, 0, 0, 0);

  const warningDays =
    number(
      DATA.settings.expiryWarningDays
    );

  const warningDate =
    new Date(todayDate);

  warningDate.setDate(
    warningDate.getDate() +
    warningDays
  );

  return expiryDate <= warningDate;
}


/* =========================================================
   PRODUCTS
   ========================================================= */

function openProductForm(productId = null) {
  const product = productId
    ? DATA.products.find(
        p => p.id === productId
      )
    : null;

  openModal(
    product
      ? "Edit Product"
      : "Add Product",

    `
      <form id="productForm">

        <div class="form-grid">

          <div class="form-group">
            <label>Product Name</label>
            <input
              id="formProductName"
              required
              value="${escapeHTML(
                product?.name || ""
              )}"
            >
          </div>

          <div class="form-group">
            <label>Barcode</label>
            <input
              id="formProductBarcode"
              value="${escapeHTML(
                product?.barcode || ""
              )}"
            >
          </div>

          <div class="form-group">
            <label>Category</label>
            <input
              id="formProductCategory"
              value="${escapeHTML(
                product?.category || ""
              )}"
            >
          </div>

          <div class="form-group">
            <label>Sub Category</label>
            <input
              id="formProductSubcategory"
              value="${escapeHTML(
                product?.subcategory || ""
              )}"
            >
          </div>

          <div class="form-group">
            <label>Unit</label>
            <input
              id="formProductUnit"
              placeholder="pcs / pack / box"
              value="${escapeHTML(
                product?.unit || "pcs"
              )}"
            >
          </div>

          <div class="form-group">
            <label>Purchase Price</label>
            <input
              id="formProductCost"
              type="number"
              min="0"
              value="${number(
                product?.cost
              )}"
            >
          </div>

          <div class="form-group">
            <label>Retail Price</label>
            <input
              id="formProductRetail"
              type="number"
              min="0"
              value="${number(
                product?.retail
              )}"
            >
          </div>

          <div class="form-group">
            <label>Wholesale Price</label>
            <input
              id="formProductWholesale"
              type="number"
              min="0"
              value="${number(
                product?.wholesale
              )}"
            >
          </div>

          <div class="form-group">
            <label>Stock</label>
            <input
              id="formProductStock"
              type="number"
              min="0"
              value="${number(
                product?.stock
              )}"
            >
          </div>

          <div class="form-group">
            <label>Low Stock Alert</label>
            <input
              id="formProductLowStock"
              type="number"
              min="0"
              value="${number(
                product?.lowStock ??
                DATA.settings.lowStockLimit
              )}"
            >
          </div>

          <div class="form-group">
            <label>Expiry Date</label>
            <input
              id="formProductExpiry"
              type="date"
              value="${escapeHTML(
                product?.expiry || ""
              )}"
            >
          </div>

          <div class="form-group">
            <label>Color / Variant</label>
            <input
              id="formProductVariant"
              value="${escapeHTML(
                product?.variant || ""
              )}"
            >
          </div>

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn btn-secondary"
            id="productCancelBtn"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            ${product ? "Update" : "Save"} Product
          </button>

        </div>

      </form>
    `
  );

  const form = $("productForm");

  if (form) {
    form.addEventListener(
      "submit",
      function(event) {
        event.preventDefault();

        saveProduct(productId);
      }
    );
  }

  const cancel =
    $("productCancelBtn");

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeModal
    );
  }
}


function saveProduct(productId) {
  const name =
    valueOf("formProductName").trim();

  if (!name) {
    showToast(
      "Product Name ထည့်ပါ",
      "warning"
    );

    return;
  }

  const data = {
    name,

    barcode:
      valueOf(
        "formProductBarcode"
      ).trim(),

    category:
      valueOf(
        "formProductCategory"
      ).trim(),

    subcategory:
      valueOf(
        "formProductSubcategory"
      ).trim(),

    unit:
      valueOf(
        "formProductUnit",
        "pcs"
      ).trim() || "pcs",

    cost:
      number(
        valueOf("formProductCost")
      ),

    retail:
      number(
        valueOf("formProductRetail")
      ),

    wholesale:
      number(
        valueOf("formProductWholesale")
      ),

    stock:
      number(
        valueOf("formProductStock")
      ),

    lowStock:
      number(
        valueOf("formProductLowStock")
      ),

    expiry:
      valueOf("formProductExpiry"),

    variant:
      valueOf("formProductVariant")
        .trim()
  };

  if (productId) {
    const product =
      DATA.products.find(
        p => p.id === productId
      );

    if (product) {
      Object.assign(product, data);
    }

    showToast(
      "Product updated"
    );
  } else {
    DATA.products.push({
      id: uid("prd"),
      createdAt: now(),
      ...data
    });

    showToast(
      "Product added"
    );
  }

  saveData();
  closeModal();
  renderProducts();
  renderStock();
  updateDashboard();
}


function deleteProduct(productId) {
  const product =
    DATA.products.find(
      p => p.id === productId
    );

  if (!product) {
    return;
  }

  if (
    !confirm(
      `Delete "${product.name}"?`
    )
  ) {
    return;
  }

  DATA.products =
    DATA.products.filter(
      p => p.id !== productId
    );

  saveData();

  renderProducts();
  renderStock();
  updateDashboard();

  showToast(
    "Product deleted"
  );
}


function renderProducts() {
  const body =
    $("productsTableBody");

  if (!body) {
    return;
  }

  const search =
    valueOf("productSearch")
      .trim()
      .toLowerCase();

  const category =
    valueOf("productCategoryFilter");

  const stockFilter =
    valueOf("stockFilter");

  let products =
    [...DATA.products];

  if (search) {
    products =
      products.filter(product =>
        [
          product.name,
          product.barcode,
          product.category,
          product.subcategory,
          product.variant
        ]
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
  }

  if (category) {
    products =
      products.filter(
        p => p.category === category
      );
  }

  if (stockFilter === "low") {
    products =
      products.filter(
        p =>
          number(p.stock) <=
          number(
            p.lowStock ??
            DATA.settings.lowStockLimit
          )
      );
  }

  if (stockFilter === "out") {
    products =
      products.filter(
        p => number(p.stock) <= 0
      );
  }

  if (!products.length) {
    body.innerHTML = `
      <tr>
        <td colspan="10">
          <div class="empty-state">
            No products found
          </div>
        </td>
      </tr>
    `;

    updateProductCategories();

    return;
  }

  body.innerHTML =
    products.map(product => {

      const stock =
        number(product.stock);

      const low =
        stock <=
        number(
          product.lowStock ??
          DATA.settings.lowStockLimit
        );

      return `
        <tr>

          <td>
            <strong>
              ${escapeHTML(
                product.name
              )}
            </strong>

            ${
              product.variant
                ? `<small>${escapeHTML(
                    product.variant
                  )}</small>`
                : ""
            }
          </td>

          <td>
            ${escapeHTML(
              product.barcode || "-"
            )}
          </td>

          <td>
            ${escapeHTML(
              product.category || "-"
            )}
          </td>

          <td>
            ${escapeHTML(
              product.unit || "pcs"
            )}
          </td>

          <td>
            ${money(product.cost)}
          </td>

          <td>
            ${money(product.retail)}
          </td>

          <td>
            ${money(product.wholesale)}
          </td>

          <td>
            <span class="${
              low
                ? "status-danger"
                : "status-success"
            }">
              ${stock}
            </span>
          </td>

          <td>
            ${
              product.expiry
                ? escapeHTML(
                    product.expiry
                  )
                : "-"
            }
          </td>

          <td>

            <div class="table-actions">

              <button
                class="btn btn-sm btn-secondary"
                data-edit-product="${product.id}"
              >
                Edit
              </button>

              <button
                class="btn btn-sm btn-danger"
                data-delete-product="${product.id}"
              >
                Delete
              </button>

            </div>

          </td>

        </tr>
      `;
    }).join("");

  updateProductCategories();
}


function updateProductCategories() {
  const select =
    $("productCategoryFilter");

  if (!select) {
    return;
  }

  const current =
    select.value;

  const categories =
    [...new Set(
      DATA.products
        .map(p => p.category)
        .filter(Boolean)
    )].sort();

  select.innerHTML =
    `<option value="">All Categories</option>` +
    categories.map(category =>
      `<option value="${escapeHTML(
        category
      )}">
        ${escapeHTML(category)}
      </option>`
    ).join("");

  select.value = current;
}


/* =========================================================
   POS SALES
   ========================================================= */

function renderPOSProducts() {
  const node =
    $("salesProducts");

  if (!node) {
    return;
  }

  const search =
    valueOf("salesSearch")
      .trim()
      .toLowerCase();

  const category =
    valueOf("salesCategory");

  let products =
    DATA.products.filter(
      p => number(p.stock) > 0
    );

  if (search) {
    products =
      products.filter(product =>
        [
          product.name,
          product.barcode,
          product.category,
          product.variant
        ]
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
  }

  if (category) {
    products =
      products.filter(
        p => p.category === category
      );
  }

  if (!products.length) {
    node.innerHTML =
      `<div class="empty-state">
        No products available
      </div>`;

    return;
  }

  node.innerHTML =
    products.map(product => `
      <button
        class="pos-product-card"
        data-add-to-cart="${product.id}"
        type="button"
      >

        <div class="pos-product-name">
          ${escapeHTML(
            product.name
          )}
        </div>

        <div class="pos-product-category">
          ${escapeHTML(
            product.category || ""
          )}
        </div>

        <div class="pos-product-price">
          ${money(product.retail)}
        </div>

        <div class="pos-product-stock">
          Stock: ${number(product.stock)}
        </div>

      </button>
    `).join("");

  updateSalesCategories();
}


function updateSalesCategories() {
  const select =
    $("salesCategory");

  if (!select) {
    return;
  }

  const current =
    select.value;

  const categories =
    [...new Set(
      DATA.products
        .map(p => p.category)
        .filter(Boolean)
    )].sort();

  select.innerHTML =
    `<option value="">All Categories</option>` +
    categories.map(category =>
      `<option value="${escapeHTML(
        category
      )}">
        ${escapeHTML(category)}
      </option>`
    ).join("");

  select.value = current;
}


function addToCart(productId) {
  const product =
    DATA.products.find(
      p => p.id === productId
    );

  if (!product) {
    return;
  }

  const existing =
    DATA.cart.find(
      item =>
        item.productId === productId
    );

  if (existing) {
    if (
      number(existing.qty) >=
      number(product.stock)
    ) {
      showToast(
        "Stock မလုံလောက်ပါ",
        "warning"
      );

      return;
    }

    existing.qty =
      number(existing.qty) + 1;

  } else {
    DATA.cart.push({
      id: uid("cart"),
      productId: product.id,
      name: product.name,
      qty: 1,
      price: number(product.retail),
      cost: number(product.cost),
      unit: product.unit || "pcs"
    });
  }

  saveData();
  renderCart();

  showToast(
    `${product.name} added`
  );
}


function changeCartQty(
  cartId,
  amount
) {
  const item =
    DATA.cart.find(
      c => c.id === cartId
    );

  if (!item) {
    return;
  }

  const product =
    DATA.products.find(
      p => p.id === item.productId
    );

  item.qty =
    number(item.qty) + number(amount);

  if (
    product &&
    item.qty > number(product.stock)
  ) {
    item.qty =
      number(product.stock);

    showToast(
      "Stock မလုံလောက်ပါ",
      "warning"
    );
  }

  if (item.qty <= 0) {
    DATA.cart =
      DATA.cart.filter(
        c => c.id !== cartId
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


function getCartSubtotal() {
  return DATA.cart.reduce(
    (sum, item) =>
      sum +
      number(item.price) *
      number(item.qty),
    0
  );
}


function getCartTotal() {
  return Math.max(
    0,
    getCartSubtotal() -
    number(
      valueOf("saleDiscount")
    )
  );
}


function renderCart() {
  const node =
    $("cartItems");

  if (!node) {
    return;
  }

  if (!DATA.cart.length) {
    node.innerHTML =
      `<div class="empty-state">
        Cart is empty
      </div>`;

    setText(
      "cartCount",
      "0"
    );

    setText(
      "cartSubtotal",
      money(0)
    );

    setText(
      "cartTotal",
      money(0)
    );

    return;
  }

  node.innerHTML =
    DATA.cart.map(item => `
      <div class="cart-item">

        <div class="cart-item-info">

          <strong>
            ${escapeHTML(
              item.name
            )}
          </strong>

          <small>
            ${money(item.price)}
            / ${escapeHTML(
              item.unit || "pcs"
            )}
          </small>

        </div>

        <div class="cart-item-controls">

          <button
            type="button"
            data-cart-minus="${item.id}"
          >
            −
          </button>

          <span>
            ${number(item.qty)}
          </span>

          <button
            type="button"
            data-cart-plus="${item.id}"
          >
            +
          </button>

          <button
            type="button"
            data-cart-remove="${item.id}"
          >
            ×
          </button>

        </div>

        <strong>
          ${money(
            number(item.price) *
            number(item.qty)
          )}
        </strong>

      </div>
    `).join("");

  setText(
    "cartCount",
    DATA.cart.reduce(
      (sum, item) =>
        sum + number(item.qty),
      0
    )
  );

  setText(
    "cartSubtotal",
    money(
      getCartSubtotal()
    )
  );

  setText(
    "cartTotal",
    money(
      getCartTotal()
    )
  );
}


function setPaymentMethod(method) {
  DATA.paymentMethod = method;

  saveData();

  $$("[data-payment]").forEach(
    button => {
      button.classList.toggle(
        "active",
        button.getAttribute(
          "data-payment"
        ) === method
      );
    }
  );
}


function checkout() {
  if (!DATA.cart.length) {
    showToast(
      "Cart ထဲမှာ Product မရှိပါ",
      "warning"
    );

    return;
  }

  const customerId =
    valueOf("saleCustomer");

  const customer =
    customerId
      ? DATA.customers.find(
          c => c.id === customerId
        )
      : null;

  const discount =
    number(
      valueOf("saleDiscount")
    );

  const subtotal =
    getCartSubtotal();

  const total =
    Math.max(
      0,
      subtotal - discount
    );

  let profit =
    DATA.cart.reduce(
      (sum, item) =>
        sum +
        (
          number(item.price) -
          number(item.cost)
        ) *
        number(item.qty),
      0
    );

  profit -= discount;

  const invoice =
    "INV-" +
    Date.now()
      .toString()
      .slice(-8);

  const sale = {
    id: uid("sale"),

    invoice,

    date: now(),

    customerId:
      customer?.id || "",

    customerName:
      customer?.name ||
      "Walk-in Customer",

    items:
      DATA.cart.map(item => ({
        productId:
          item.productId,

        name:
          item.name,

        qty:
          number(item.qty),

        price:
          number(item.price),

        cost:
          number(item.cost),

        unit:
          item.unit || "pcs"
      })),

    subtotal,

    discount,

    total,

    profit,

    paymentMethod:
      DATA.paymentMethod,

    status:
      "completed"
  };

  /* Deduct stock */
  DATA.cart.forEach(item => {
    const product =
      DATA.products.find(
        p =>
          p.id ===
          item.productId
      );

    if (product) {
      product.stock =
        Math.max(
          0,
          number(product.stock) -
          number(item.qty)
        );
    }
  });

  /* Customer credit */
  if (
    customer &&
    DATA.paymentMethod === "credit"
  ) {
    customer.balance =
      number(customer.balance) +
      total;
  }

  DATA.sales.push(sale);

  DATA.cart = [];

  saveData();

  renderCart();
  renderPOSProducts();
  renderProducts();
  renderStock();
  updateDashboard();

  showToast(
    `Sale completed: ${invoice}`
  );

  showReceipt(sale);
}


function clearCart() {
  if (!DATA.cart.length) {
    return;
  }

  if (
    !confirm(
      "Clear current cart?"
    )
  ) {
    return;
  }

  DATA.cart = [];

  saveData();
  renderCart();

  showToast(
    "Cart cleared"
  );
}


/* =========================================================
   RECEIPT
   ========================================================= */

function showReceipt(sale) {
  const items =
    Array.isArray(sale.items)
      ? sale.items
      : [];

  const receiptHTML = `
    <div
      id="printReceipt"
      style="
        max-width:380px;
        margin:auto;
        padding:20px;
        font-family:Arial,sans-serif;
        color:#111;
      "
    >

      <div style="text-align:center">

        <h2>
          ${escapeHTML(
            DATA.settings.shopName
          )}
        </h2>

        ${
          DATA.settings.address
            ? `<div>
                ${escapeHTML(
                  DATA.settings.address
                )}
              </div>`
            : ""
        }

        ${
          DATA.settings.phone
            ? `<div>
                ${escapeHTML(
                  DATA.settings.phone
                )}
              </div>`
            : ""
        }

      </div>

      <hr>

      <div>
        Invoice:
        ${escapeHTML(
          sale.invoice
        )}
      </div>

      <div>
        Date:
        ${escapeHTML(
          sale.date
        )}
      </div>

      <div>
        Customer:
        ${escapeHTML(
          sale.customerName
        )}
      </div>

      <hr>

      ${items.map(item => `
        <div
          style="
            display:flex;
            justify-content:space-between;
            margin:7px 0;
          "
        >

          <span>
            ${escapeHTML(
              item.name
            )}
            × ${number(item.qty)}
          </span>

          <strong>
            ${money(
              number(item.price) *
              number(item.qty)
            )}
          </strong>

        </div>
      `).join("")}

      <hr>

      <div
        style="
          display:flex;
          justify-content:space-between;
        "
      >
        <span>Subtotal</span>
        <strong>
          ${money(
            sale.subtotal
          )}
        </strong>
      </div>

      <div
        style="
          display:flex;
          justify-content:space-between;
        "
      >
        <span>Discount</span>
        <strong>
          ${money(
            sale.discount
          )}
        </strong>
      </div>

      <div
        style="
          display:flex;
          justify-content:space-between;
          font-size:18px;
          margin-top:8px;
        "
      >
        <strong>Total</strong>

        <strong>
          ${money(
            sale.total
          )}
        </strong>
      </div>

      <div
        style="
          text-align:center;
          margin-top:20px;
        "
      >
        ${escapeHTML(
          DATA.settings.footer
        )}
      </div>

    </div>
  `;

  openModal(
    "Receipt",
    `
      ${receiptHTML}

      <div
        class="modal-actions"
      >
        <button
          class="btn btn-primary"
          id="printReceiptBtn"
        >
          Print Receipt
        </button>
      </div>
    `
  );

  const printBtn =
    $("printReceiptBtn");

  if (printBtn) {
    printBtn.addEventListener(
      "click",
      function() {
        printReceipt(
          receiptHTML
        );
      }
    );
  }
}


function printReceipt(html) {
  const printWindow =
    window.open(
      "",
      "_blank",
      "width=450,height=700"
    );

  if (!printWindow) {
    showToast(
      "Popup blocked. Browser setting စစ်ပါ",
      "warning"
    );

    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>

    <html>

    <head>

      <title>Receipt</title>

      <style>
        body{
          margin:0;
          padding:0;
          font-family:Arial,sans-serif;
        }

        @media print{
          body{
            width:100%;
          }
        }
      </style>

    </head>

    <body>

      ${html}

    </body>

    </html>
  `);

  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 300);
}


/* =========================================================
   PURCHASES
   ========================================================= */

function openPurchaseForm() {
  const productOptions =
    DATA.products.map(product => `
      <option value="${product.id}">
        ${escapeHTML(
          product.name
        )}
      </option>
    `).join("");

  const supplierOptions =
    DATA.suppliers.map(supplier => `
      <option value="${supplier.id}">
        ${escapeHTML(
          supplier.name
        )}
      </option>
    `).join("");

  openModal(
    "New Purchase",
    `
      <form id="purchaseForm">

        <div class="form-grid">

          <div class="form-group">

            <label>Product</label>

            <select
              id="purchaseProduct"
              required
            >
              <option value="">
                Select Product
              </option>

              ${productOptions}
            </select>

          </div>

          <div class="form-group">

            <label>Supplier</label>

            <select id="purchaseSupplier">

              <option value="">
                Select Supplier
              </option>

              ${supplierOptions}

            </select>

          </div>

          <div class="form-group">

            <label>Quantity</label>

            <input
              id="purchaseQty"
              type="number"
              min="1"
              value="1"
              required
            >

          </div>

          <div class="form-group">

            <label>Purchase Price</label>

            <input
              id="purchaseCost"
              type="number"
              min="0"
              required
            >

          </div>

          <div class="form-group">

            <label>Payment Status</label>

            <select
              id="purchasePaymentStatus"
            >
              <option value="paid">
                Paid
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
            class="btn btn-secondary"
            id="purchaseCancelBtn"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            Save Purchase
          </button>

        </div>

      </form>
    `
  );

  const form =
    $("purchaseForm");

  if (form) {
    form.addEventListener(
      "submit",
      function(event) {
        event.preventDefault();

        savePurchase();
      }
    );
  }

  const cancel =
    $("purchaseCancelBtn");

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeModal
    );
  }
}


function savePurchase() {
  const productId =
    valueOf("purchaseProduct");

  const product =
    DATA.products.find(
      p => p.id === productId
    );

  if (!product) {
    showToast(
      "Product ရွေးပါ",
      "warning"
    );

    return;
  }

  const qty =
    number(
      valueOf("purchaseQty")
    );

  const cost =
    number(
      valueOf("purchaseCost")
    );

  if (qty <= 0) {
    showToast(
      "Quantity မှန်အောင်ထည့်ပါ",
      "warning"
    );

    return;
  }

  const supplierId =
    valueOf("purchaseSupplier");

  const supplier =
    DATA.suppliers.find(
      s => s.id === supplierId
    );

  const total =
    qty * cost;

  product.stock =
    number(product.stock) + qty;

  product.cost = cost;

  const purchase = {
    id: uid("pur"),

    invoice:
      "PUR-" +
      Date.now()
        .toString()
        .slice(-8),

    date: now(),

    productId,

    productName:
      product.name,

    supplierId:
      supplier?.id || "",

    supplierName:
      supplier?.name || "",

    qty,

    cost,

    total,

    paymentStatus:
      valueOf(
        "purchasePaymentStatus"
      )
  };

  DATA.purchases.push(
    purchase
  );

  if (
    supplier &&
    purchase.paymentStatus ===
      "credit"
  ) {
    supplier.balance =
      number(supplier.balance) +
      total;
  }

  saveData();

  closeModal();

  renderProducts();
  renderStock();
  renderPurchases();
  renderSuppliers();
  renderDebts();
  updateDashboard();

  showToast(
    "Purchase saved"
  );
}


function renderPurchases() {
  const body =
    $("purchaseTableBody");

  if (!body) {
    return;
  }

  const todayPurchases =
    DATA.purchases.filter(
      p => sameDay(p.date)
    );

  const todayTotal =
    todayPurchases.reduce(
      (sum, p) =>
        sum + number(p.total),
      0
    );

  setText(
    "purchaseTodayTotal",
    money(todayTotal)
  );

  setText(
    "purchaseInvoiceCount",
    todayPurchases.length
  );

  const payable =
    DATA.suppliers.reduce(
      (sum, s) =>
        sum + number(s.balance),
      0
    );

  setText(
    "supplierPayable",
    money(payable)
  );

  const purchases =
    [...DATA.purchases]
      .sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      );

  if (!purchases.length) {
    body.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            No purchases yet
          </div>
        </td>
      </tr>
    `;

    return;
  }

  body.innerHTML =
    purchases.map(purchase => `
      <tr>

        <td>
          ${escapeHTML(
            purchase.invoice
          )}
        </td>

        <td>
          ${escapeHTML(
            purchase.date
          )}
        </td>

        <td>
          ${escapeHTML(
            purchase.productName
          )}
        </td>

        <td>
          ${escapeHTML(
            purchase.supplierName ||
            "-"
          )}
        </td>

        <td>
          ${number(
            purchase.qty
          )}
        </td>

        <td>
          ${money(
            purchase.cost
          )}
        </td>

        <td>
          ${money(
            purchase.total
          )}
        </td>

        <td>
          ${escapeHTML(
            purchase.paymentStatus ||
            "paid"
          )}
        </td>

      </tr>
    `).join("");
}


/* =========================================================
   STOCK
   ========================================================= */

function renderStock() {
  const body =
    $("stockTableBody");

  if (!body) {
    return;
  }

  const totalProducts =
    DATA.products.length;

  const totalUnits =
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
        number(p.cost),
      0
    );

  const lowStock =
    DATA.products.filter(
      p =>
        number(p.stock) <=
        number(
          p.lowStock ??
          DATA.settings.lowStockLimit
        )
    ).length;

  setText(
    "stockProductCount",
    totalProducts
  );

  setText(
    "stockUnitCount",
    totalUnits
  );

  setText(
    "stockCostValue",
    money(costValue)
  );

  setText(
    "stockLowCount",
    lowStock
  );

  if (!DATA.products.length) {
    body.innerHTML = `
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

  body.innerHTML =
    DATA.products.map(product => {

      const qty =
        number(product.stock);

      const costValue =
        qty * number(product.cost);

      const retailValue =
        qty * number(product.retail);

      const wholesaleValue =
        qty *
        number(product.wholesale);

      const low =
        qty <=
        number(
          product.lowStock ??
          DATA.settings.lowStockLimit
        );

      return `
        <tr>

          <td>
            ${escapeHTML(
              product.name
            )}
          </td>

          <td>
            ${escapeHTML(
              product.unit || "pcs"
            )}
          </td>

          <td>
            <strong>
              ${qty}
            </strong>
          </td>

          <td>
            ${money(costValue)}
          </td>

          <td>
            ${money(retailValue)}
          </td>

          <td>
            ${money(wholesaleValue)}
          </td>

          <td>
            ${
              low
                ? `<span class="status-danger">
                    Low
                  </span>`
                : `<span class="status-success">
                    OK
                  </span>`
            }
          </td>

          <td>

            <button
              class="btn btn-sm btn-secondary"
              data-stock-adjust="${product.id}"
            >
              Adjust
            </button>

          </td>

        </tr>
      `;
    }).join("");
}


function openStockAdjustment(productId) {
  const product =
    DATA.products.find(
      p => p.id === productId
    );

  if (!product) {
    return;
  }

  openModal(
    "Stock Adjustment",

    `
      <form id="stockAdjustmentForm">

        <p>
          <strong>
            ${escapeHTML(
              product.name
            )}
          </strong>
        </p>

        <p>
          Current Stock:
          ${number(product.stock)}
        </p>

        <div class="form-group">

          <label>New Stock</label>

          <input
            id="newStockValue"
            type="number"
            min="0"
            value="${number(
              product.stock
            )}"
            required
          >

        </div>

        <div class="form-group">

          <label>Reason</label>

          <input
            id="stockAdjustmentReason"
            placeholder="Damage / Count correction / etc."
          >

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn btn-secondary"
            id="stockCancelBtn"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            Save
          </button>

        </div>

      </form>
    `
  );

  const form =
    $("stockAdjustmentForm");

  if (form) {
    form.addEventListener(
      "submit",
      function(event) {
        event.preventDefault();

        product.stock =
          number(
            valueOf(
              "newStockValue"
            )
          );

        saveData();

        closeModal();

        renderStock();
        renderProducts();
        renderPOSProducts();
        updateDashboard();

        showToast(
          "Stock updated"
        );
      }
    );
  }

  const cancel =
    $("stockCancelBtn");

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeModal
    );
  }
}


/* =========================================================
   CUSTOMERS
   ========================================================= */

function openCustomerForm(customerId = null) {
  const customer =
    customerId
      ? DATA.customers.find(
          c => c.id === customerId
        )
      : null;

  openModal(
    customer
      ? "Edit Customer"
      : "Add Customer",

    `
      <form id="customerForm">

        <div class="form-grid">

          <div class="form-group">

            <label>Name</label>

            <input
              id="customerName"
              required
              value="${escapeHTML(
                customer?.name || ""
              )}"
            >

          </div>

          <div class="form-group">

            <label>Phone</label>

            <input
              id="customerPhone"
              value="${escapeHTML(
                customer?.phone || ""
              )}"
            >

          </div>

          <div class="form-group">

            <label>Address</label>

            <input
              id="customerAddress"
              value="${escapeHTML(
                customer?.address || ""
              )}"
            >

          </div>

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn btn-secondary"
            id="customerCancelBtn"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            Save Customer
          </button>

        </div>

      </form>
    `
  );

  const form =
    $("customerForm");

  if (form) {
    form.addEventListener(
      "submit",
      function(event) {
        event.preventDefault();

        saveCustomer(customerId);
      }
    );
  }

  const cancel =
    $("customerCancelBtn");

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeModal
    );
  }
}


function saveCustomer(customerId) {
  const name =
    valueOf("customerName")
      .trim();

  if (!name) {
    showToast(
      "Customer name ထည့်ပါ",
      "warning"
    );

    return;
  }

  const data = {
    name,

    phone:
      valueOf(
        "customerPhone"
      ).trim(),

    address:
      valueOf(
        "customerAddress"
      ).trim()
  };

  if (customerId) {
    const customer =
      DATA.customers.find(
        c => c.id === customerId
      );

    if (customer) {
      Object.assign(
        customer,
        data
      );
    }

    showToast(
      "Customer updated"
    );
  } else {
    DATA.customers.push({
      id: uid("cus"),
      balance: 0,
      createdAt: now(),
      ...data
    });

    showToast(
      "Customer added"
    );
  }

  saveData();

  closeModal();

  renderCustomers();
  updateCustomerSelect();
  renderDebts();
}


function deleteCustomer(customerId) {
  if (
    !confirm(
      "Delete customer?"
    )
  ) {
    return;
  }

  DATA.customers =
    DATA.customers.filter(
      c => c.id !== customerId
    );

  saveData();

  renderCustomers();
  updateCustomerSelect();
  renderDebts();

  showToast(
    "Customer deleted"
  );
}


function renderCustomers() {
  const body =
    $("customerTableBody");

  if (!body) {
    return;
  }

  const search =
    valueOf("customerSearch")
      .trim()
      .toLowerCase();

  let customers =
    [...DATA.customers];

  if (search) {
    customers =
      customers.filter(
        customer =>
          [
            customer.name,
            customer.phone,
            customer.address
          ]
            .join(" ")
            .toLowerCase()
            .includes(search)
      );
  }

  setText(
    "customerCount",
    DATA.customers.length
  );

  const receivable =
    DATA.customers.reduce(
      (sum, c) =>
        sum + number(c.balance),
      0
    );

  setText(
    "customerReceivable",
    money(receivable)
  );

  if (!customers.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            No customers
          </div>
        </td>
      </tr>
    `;

    return;
  }

  body.innerHTML =
    customers.map(customer => `
      <tr>

        <td>
          <strong>
            ${escapeHTML(
              customer.name
            )}
          </strong>
        </td>

        <td>
          ${escapeHTML(
            customer.phone || "-"
          )}
        </td>

        <td>
          ${escapeHTML(
            customer.address || "-"
          )}
        </td>

        <td>
          ${money(
            customer.balance
          )}
        </td>

        <td>
          ${escapeHTML(
            customer.createdAt || ""
          )}
        </td>

        <td>

          <div class="table-actions">

            <button
              class="btn btn-sm btn-secondary"
              data-edit-customer="${customer.id}"
            >
              Edit
            </button>

            <button
              class="btn btn-sm btn-danger"
              data-delete-customer="${customer.id}"
            >
              Delete
            </button>

          </div>

        </td>

      </tr>
    `).join("");

  updateCustomerSelect();
}


function updateCustomerSelect() {
  const select =
    $("saleCustomer");

  if (!select) {
    return;
  }

  const current =
    select.value;

  select.innerHTML =
    `<option value="">
      Walk-in Customer
    </option>` +
    DATA.customers.map(customer =>
      `<option value="${customer.id}">
        ${escapeHTML(
          customer.name
        )}
      </option>`
    ).join("");

  select.value = current;
}


/* =========================================================
   SUPPLIERS
   ========================================================= */

function openSupplierForm(supplierId = null) {
  const supplier =
    supplierId
      ? DATA.suppliers.find(
          s => s.id === supplierId
        )
      : null;

  openModal(
    supplier
      ? "Edit Supplier"
      : "Add Supplier",

    `
      <form id="supplierForm">

        <div class="form-grid">

          <div class="form-group">

            <label>Supplier Name</label>

            <input
              id="supplierName"
              required
              value="${escapeHTML(
                supplier?.name || ""
              )}"
            >

          </div>

          <div class="form-group">

            <label>Phone</label>

            <input
              id="supplierPhone"
              value="${escapeHTML(
                supplier?.phone || ""
              )}"
            >

          </div>

          <div class="form-group">

            <label>Address</label>

            <input
              id="supplierAddress"
              value="${escapeHTML(
                supplier?.address || ""
              )}"
            >

          </div>

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn btn-secondary"
            id="supplierCancelBtn"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            Save Supplier
          </button>

        </div>

      </form>
    `
  );

  const form =
    $("supplierForm");

  if (form) {
    form.addEventListener(
      "submit",
      function(event) {
        event.preventDefault();

        saveSupplier(supplierId);
      }
    );
  }

  const cancel =
    $("supplierCancelBtn");

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeModal
    );
  }
}


function saveSupplier(supplierId) {
  const name =
    valueOf("supplierName")
      .trim();

  if (!name) {
    showToast(
      "Supplier name ထည့်ပါ",
      "warning"
    );

    return;
  }

  const data = {
    name,

    phone:
      valueOf(
        "supplierPhone"
      ).trim(),

    address:
      valueOf(
        "supplierAddress"
      ).trim()
  };

  if (supplierId) {
    const supplier =
      DATA.suppliers.find(
        s => s.id === supplierId
      );

    if (supplier) {
      Object.assign(
        supplier,
        data
      );
    }

    showToast(
      "Supplier updated"
    );
  } else {
    DATA.suppliers.push({
      id: uid("sup"),
      balance: 0,
      createdAt: now(),
      ...data
    });

    showToast(
      "Supplier added"
    );
  }

  saveData();

  closeModal();

  renderSuppliers();
  renderPurchases();
  renderDebts();
}


function deleteSupplier(supplierId) {
  if (
    !confirm(
      "Delete supplier?"
    )
  ) {
    return;
  }

  DATA.suppliers =
    DATA.suppliers.filter(
      s => s.id !== supplierId
    );

  saveData();

  renderSuppliers();
  renderDebts();

  showToast(
    "Supplier deleted"
  );
}


function renderSuppliers() {
  const body =
    $("supplierTableBody");

  if (!body) {
    return;
  }

  if (!DATA.suppliers.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            No suppliers
          </div>
        </td>
      </tr>
    `;

    return;
  }

  body.innerHTML =
    DATA.suppliers.map(
      supplier => `
        <tr>

          <td>
            <strong>
              ${escapeHTML(
                supplier.name
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              supplier.phone || "-"
            )}
          </td>

          <td>
            ${escapeHTML(
              supplier.address || "-"
            )}
          </td>

          <td>
            ${money(
              supplier.balance
            )}
          </td>

          <td>
            ${escapeHTML(
              supplier.createdAt || ""
            )}
          </td>

          <td>

            <div class="table-actions">

              <button
                class="btn btn-sm btn-secondary"
                data-edit-supplier="${supplier.id}"
              >
                Edit
              </button>

              <button
                class="btn btn-sm btn-danger"
                data-delete-supplier="${supplier.id}"
              >
                Delete
              </button>

            </div>

          </td>

        </tr>
      `
    ).join("");
}


/* =========================================================
   DEBTS
   ========================================================= */

function renderDebts() {
  const receivable =
    DATA.customers.reduce(
      (sum, customer) =>
        sum +
        Math.max(
          0,
          number(customer.balance)
        ),
      0
    );

  const payable =
    DATA.suppliers.reduce(
      (sum, supplier) =>
        sum +
        Math.max(
          0,
          number(supplier.balance)
        ),
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
    $("receivableList");

  if (receivableNode) {
    const customers =
      DATA.customers.filter(
        c =>
          number(c.balance) > 0
      );

    receivableNode.innerHTML =
      customers.length
        ? customers.map(
            customer => `
              <div class="debt-item">

                <span>
                  ${escapeHTML(
                    customer.name
                  )}
                </span>

                <strong>
                  ${money(
                    customer.balance
                  )}
                </strong>

              </div>
            `
          ).join("")
        : `
          <div class="empty-state">
            No receivable
          </div>
        `;
  }

  const payableNode =
    $("payableList");

  if (payableNode) {
    const suppliers =
      DATA.suppliers.filter(
        s =>
          number(s.balance) > 0
      );

    payableNode.innerHTML =
      suppliers.length
        ? suppliers.map(
            supplier => `
              <div class="debt-item">

                <span>
                  ${escapeHTML(
                    supplier.name
                  )}
                </span>

                <strong>
                  ${money(
                    supplier.balance
                  )}
                </strong>

              </div>
            `
          ).join("")
        : `
          <div class="empty-state">
            No payable
          </div>
        `;
  }
}


/* =========================================================
   EXPENSES
   ========================================================= */

function openExpenseForm() {
  openModal(
    "Add Expense",

    `
      <form id="expenseForm">

        <div class="form-grid">

          <div class="form-group">

            <label>Expense Name</label>

            <input
              id="expenseName"
              required
              placeholder="Rent / Transport / Utility"
            >

          </div>

          <div class="form-group">

            <label>Amount</label>

            <input
              id="expenseAmount"
              type="number"
              min="0"
              required
            >

          </div>

          <div class="form-group">

            <label>Category</label>

            <input
              id="expenseCategory"
              placeholder="Operating Expense"
            >

          </div>

          <div class="form-group">

            <label>Note</label>

            <input
              id="expenseNote"
            >

          </div>

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn btn-secondary"
            id="expenseCancelBtn"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            Save Expense
          </button>

        </div>

      </form>
    `
  );

  const form =
    $("expenseForm");

  if (form) {
    form.addEventListener(
      "submit",
      function(event) {
        event.preventDefault();

        saveExpense();
      }
    );
  }

  const cancel =
    $("expenseCancelBtn");

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeModal
    );
  }
}


function saveExpense() {
  const name =
    valueOf("expenseName")
      .trim();

  const amount =
    number(
      valueOf("expenseAmount")
    );

  if (!name || amount <= 0) {
    showToast(
      "Expense information ပြည့်စုံအောင်ထည့်ပါ",
      "warning"
    );

    return;
  }

  DATA.expenses.push({
    id: uid("exp"),

    date: now(),

    name,

    amount,

    category:
      valueOf(
        "expenseCategory"
      ).trim(),

    note:
      valueOf(
        "expenseNote"
      ).trim()
  });

  saveData();

  closeModal();

  renderExpenses();
  updateDashboard();
  renderReports();

  showToast(
    "Expense saved"
  );
}


function deleteExpense(id) {
  if (
    !confirm(
      "Delete expense?"
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
    "Expense deleted"
  );
}


function renderExpenses() {
  const body =
    $("expenseTableBody");

  if (!body) {
    return;
  }

  const todayExpense =
    DATA.expenses
      .filter(e => sameDay(e.date))
      .reduce(
        (sum, e) =>
          sum + number(e.amount),
        0
      );

  const monthExpense =
    DATA.expenses
      .filter(e => sameMonth(e.date))
      .reduce(
        (sum, e) =>
          sum + number(e.amount),
        0
      );

  const yearExpense =
    DATA.expenses
      .filter(e => sameYear(e.date))
      .reduce(
        (sum, e) =>
          sum + number(e.amount),
        0
      );

  setText(
    "expenseToday",
    money(todayExpense)
  );

  setText(
    "expenseMonth",
    money(monthExpense)
  );

  setText(
    "expenseYear",
    money(yearExpense)
  );

  const expenses =
    [...DATA.expenses]
      .sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      );

  if (!expenses.length) {
    body.innerHTML = `
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

  body.innerHTML =
    expenses.map(expense => `
      <tr>

        <td>
          ${escapeHTML(
            expense.date
          )}
        </td>

        <td>
          ${escapeHTML(
            expense.name
          )}
        </td>

        <td>
          ${escapeHTML(
            expense.category ||
            "-"
          )}
        </td>

        <td>
          ${money(
            expense.amount
          )}
        </td>

        <td>
          ${escapeHTML(
            expense.note ||
            "-"
          )}
        </td>

        <td>

          <button
            class="btn btn-sm btn-danger"
            data-delete-expense="${expense.id}"
          >
            Delete
          </button>

        </td>

      </tr>
    `).join("");
}


/* =========================================================
   EMPLOYEES
   ========================================================= */

function openEmployeeForm(employeeId = null) {
  const employee =
    employeeId
      ? DATA.employees.find(
          e => e.id === employeeId
        )
      : null;

  openModal(
    employee
      ? "Edit Employee"
      : "Add Employee",

    `
      <form id="employeeForm">

        <div class="form-grid">

          <div class="form-group">

            <label>Name</label>

            <input
              id="employeeName"
              required
              value="${escapeHTML(
                employee?.name || ""
              )}"
            >

          </div>

          <div class="form-group">

            <label>Position</label>

            <input
              id="employeePosition"
              value="${escapeHTML(
                employee?.position || ""
              )}"
            >

          </div>

          <div class="form-group">

            <label>Salary</label>

            <input
              id="employeeSalary"
              type="number"
              min="0"
              value="${number(
                employee?.salary
              )}"
            >

          </div>

          <div class="form-group">

            <label>Phone</label>

            <input
              id="employeePhone"
              value="${escapeHTML(
                employee?.phone || ""
              )}"
            >

          </div>

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn btn-secondary"
            id="employeeCancelBtn"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            Save Employee
          </button>

        </div>

      </form>
    `
  );

  const form =
    $("employeeForm");

  if (form) {
    form.addEventListener(
      "submit",
      function(event) {
        event.preventDefault();

        saveEmployee(employeeId);
      }
    );
  }

  const cancel =
    $("employeeCancelBtn");

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeModal
    );
  }
}


function saveEmployee(employeeId) {
  const name =
    valueOf("employeeName")
      .trim();

  if (!name) {
    showToast(
      "Employee name ထည့်ပါ",
      "warning"
    );

    return;
  }

  const data = {
    name,

    position:
      valueOf(
        "employeePosition"
      ).trim(),

    salary:
      number(
        valueOf("employeeSalary")
      ),

    phone:
      valueOf(
        "employeePhone"
      ).trim()
  };

  if (employeeId) {
    const employee =
      DATA.employees.find(
        e => e.id === employeeId
      );

    if (employee) {
      Object.assign(
        employee,
        data
      );
    }

    showToast(
      "Employee updated"
    );
  } else {
    DATA.employees.push({
      id: uid("emp"),
      createdAt: now(),
      payments: [],
      ...data
    });

    showToast(
      "Employee added"
    );
  }

  saveData();

  closeModal();

  renderEmployees();
  renderExpenses();
  updateDashboard();
}


function deleteEmployee(id) {
  if (
    !confirm(
      "Delete employee?"
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
    "Employee deleted"
  );
}


function renderEmployees() {
  const body =
    $("employeeTableBody");

  if (!body) {
    return;
  }

  if (!DATA.employees.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            No employees
          </div>
        </td>
      </tr>
    `;

    return;
  }

  body.innerHTML =
    DATA.employees.map(
      employee => `
        <tr>

          <td>
            <strong>
              ${escapeHTML(
                employee.name
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              employee.position ||
              "-"
            )}
          </td>

          <td>
            ${money(
              employee.salary
            )}
          </td>

          <td>
            ${escapeHTML(
              employee.phone ||
              "-"
            )}
          </td>

          <td>
            ${escapeHTML(
              employee.createdAt ||
              ""
            )}
          </td>

          <td>

            <div class="table-actions">

              <button
                class="btn btn-sm btn-secondary"
                data-edit-employee="${employee.id}"
              >
                Edit
              </button>

              <button
                class="btn btn-sm btn-danger"
                data-delete-employee="${employee.id}"
              >
                Delete
              </button>

            </div>

          </td>

        </tr>
      `
    ).join("");
}


/* =========================================================
   REPORTS
   ========================================================= */

function getReportRange(period) {
  const todayDate =
    new Date();

  const start =
    new Date(todayDate);

  if (period === "month") {
    start.setDate(1);
  }

  if (period === "year") {
    start.setMonth(0);
    start.setDate(1);
  }

  start.setHours(
    0, 0, 0, 0
  );

  return {
    start,
    end: todayDate
  };
}


function renderReports() {
  const period =
    valueOf(
      "reportPeriod",
      "today"
    );

  const range =
    getReportRange(period);

  const sales =
    DATA.sales.filter(
      sale => {
        const date =
          new Date(
            sale.date
          );

        return (
          date >= range.start &&
          date <= range.end
        );
      }
    );

  const purchases =
    DATA.purchases.filter(
      purchase => {
        const date =
          new Date(
            purchase.date
          );

        return (
          date >= range.start &&
          date <= range.end
        );
      }
    );

  const expenses =
    DATA.expenses.filter(
      expense => {
        const date =
          new Date(
            expense.date
          );

        return (
          date >= range.start &&
          date <= range.end
        );
      }
    );

  const salesTotal =
    sales.reduce(
      (sum, sale) =>
        sum +
        calculateSaleTotal(sale),
      0
    );

  const purchaseTotal =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        number(purchase.total),
      0
    );

  const expenseTotal =
    expenses.reduce(
      (sum, expense) =>
        sum +
        number(expense.amount),
      0
    );

  const grossProfit =
    sales.reduce(
      (sum, sale) =>
        sum +
        calculateSaleProfit(sale),
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

  const salesSummary =
    $("salesReportSummary");

  if (salesSummary) {
    salesSummary.innerHTML = `
      <div class="report-row">
        <span>Transactions</span>
        <strong>
          ${sales.length}
        </strong>
      </div>

      <div class="report-row">
        <span>Sales</span>
        <strong>
          ${money(salesTotal)}
        </strong>
      </div>

      <div class="report-row">
        <span>Gross Profit</span>
        <strong>
          ${money(grossProfit)}
        </strong>
      </div>
    `;
  }

  const profitSummary =
    $("profitReportSummary");

  if (profitSummary) {
    profitSummary.innerHTML = `
      <div class="report-row">
        <span>Gross Profit</span>
        <strong>
          ${money(grossProfit)}
        </strong>
      </div>

      <div class="report-row">
        <span>Operating Expenses</span>
        <strong>
          ${money(expenseTotal)}
        </strong>
      </div>

      <div class="report-row">
        <span>Net Profit</span>
        <strong>
          ${money(netProfit)}
        </strong>
      </div>
    `;
  }
}


/* =========================================================
   SETTINGS
   ========================================================= */

function openShopSettings() {
  openModal(
    "Shop Settings",

    `
      <form id="shopSettingsForm">

        <div class="form-grid">

          <div class="form-group">

            <label>Shop Name</label>

            <input
              id="shopNameSetting"
              value="${escapeHTML(
                DATA.settings.shopName
              )}"
              required
            >

          </div>

          <div class="form-group">

            <label>Phone</label>

            <input
              id="shopPhoneSetting"
              value="${escapeHTML(
                DATA.settings.phone
              )}"
            >

          </div>

          <div class="form-group">

            <label>Address</label>

            <input
              id="shopAddressSetting"
              value="${escapeHTML(
                DATA.settings.address
              )}"
            >

          </div>

          <div class="form-group">

            <label>Receipt Footer</label>

            <input
              id="shopFooterSetting"
              value="${escapeHTML(
                DATA.settings.footer
              )}"
            >

          </div>

          <div class="form-group">

            <label>Low Stock Alert</label>

            <input
              id="lowStockSetting"
              type="number"
              min="0"
              value="${number(
                DATA.settings.lowStockLimit
              )}"
            >

          </div>

          <div class="form-group">

            <label>Expiry Warning Days</label>

            <input
              id="expiryWarningSetting"
              type="number"
              min="0"
              value="${number(
                DATA.settings.expiryWarningDays
              )}"
            >

          </div>

        </div>

        <div class="modal-actions">

          <button
            type="button"
            class="btn btn-secondary"
            id="shopSettingsCancel"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            Save Settings
          </button>

        </div>

      </form>
    `
  );

  const form =
    $("shopSettingsForm");

  if (form) {
    form.addEventListener(
      "submit",
      function(event) {
        event.preventDefault();

        DATA.settings.shopName =
          valueOf(
            "shopNameSetting"
          ).trim() ||
          "Aung POS Shop";

        DATA.settings.phone =
          valueOf(
            "shopPhoneSetting"
          ).trim();

        DATA.settings.address =
          valueOf(
            "shopAddressSetting"
          ).trim();

        DATA.settings.footer =
          valueOf(
            "shopFooterSetting"
          ).trim();

        DATA.settings.lowStockLimit =
          number(
            valueOf(
              "lowStockSetting"
            )
          );

        DATA.settings.expiryWarningDays =
          number(
            valueOf(
              "expiryWarningSetting"
            )
          );

        saveData();

        closeModal();

        updateDashboard();
        renderProducts();
        renderStock();

        showToast(
          "Shop settings saved"
        );
      }
    );
  }

  const cancel =
    $("shopSettingsCancel");

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeModal
    );
  }
}


function openReceiptSettings() {
  openModal(
    "Receipt Settings",

    `
      <div class="form-group">

        <label>
          Receipt Font Size
        </label>

        <input
          id="receiptFontSize"
          type="number"
          min="8"
          max="30"
          value="${number(
            DATA.settings.receiptFontSize
          )}"
        >

      </div>

      <div class="modal-actions">

        <button
          class="btn btn-primary"
          id="saveReceiptSettings"
        >
          Save
        </button>

      </div>
    `
  );

  const button =
    $("saveReceiptSettings");

  if (button) {
    button.addEventListener(
      "click",
      function() {

        DATA.settings.receiptFontSize =
          number(
            valueOf(
              "receiptFontSize"
            )
          ) || 14;

        saveData();

        closeModal();

        showToast(
          "Receipt settings saved"
        );
      }
    );
  }
}


function openUserSettings() {
  openModal(
    "User Settings",

    `
      <div class="empty-state">

        <h3>
          Aung POS User
        </h3>

        <p>
          User account management
          will be connected in the
          next version.
        </p>

      </div>
    `
  );
}


/* =========================================================
   BACKUP
   ========================================================= */

function backupData() {
  try {
    const json =
      JSON.stringify(
        DATA,
        null,
        2
      );

    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `aung-pos-backup-${today()}.json`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );

    showToast(
      "Backup downloaded"
    );

  } catch (error) {
    console.error(
      "Backup Error:",
      error
    );

    showToast(
      "Backup Error",
      "error"
    );
  }
}


/* =========================================================
   CLEAR DATA
   ========================================================= */

function clearAllData() {
  if (
    !confirm(
      "WARNING!\n\nAll POS data will be deleted.\n\nContinue?"
    )
  ) {
    return;
  }

  if (
    !confirm(
      "Are you REALLY sure?"
    )
  ) {
    return;
  }

  DATA =
    structuredClone(
      DEFAULT_DATA
    );

  saveData();

  renderAll();

  showPage(
    "dashboard"
  );

  showToast(
    "All data cleared"
  );
}


/* =========================================================
   NEW SALE
   ========================================================= */

function newSale() {
  DATA.cart = [];

  DATA.paymentMethod =
    "cash";

  saveData();

  renderCart();

  setValue(
    "saleDiscount",
    "0"
  );

  updateCustomerSelect();

  renderPOSProducts();

  setPaymentMethod(
    "cash"
  );

  showPage(
    "sales"
  );
}


/* =========================================================
   EVENT DELEGATION
   ========================================================= */

document.addEventListener(
  "click",
  function(event) {

    const target =
      event.target.closest(
        "[data-page]"
      );

    if (
      target &&
      target.hasAttribute(
        "data-page"
      )
    ) {
      event.preventDefault();

      const page =
        target.getAttribute(
          "data-page"
        );

      if (page) {
        showPage(page);
      }

      return;
    }

    const addCart =
      event.target.closest(
        "[data-add-to-cart]"
      );

    if (addCart) {
      event.preventDefault();

      addToCart(
        addCart.getAttribute(
          "data-add-to-cart"
        )
      );

      return;
    }

    const cartMinus =
      event.target.closest(
        "[data-cart-minus]"
      );

    if (cartMinus) {
      event.preventDefault();

      changeCartQty(
        cartMinus.getAttribute(
          "data-cart-minus"
        ),
        -1
      );

      return;
    }

    const cartPlus =
      event.target.closest(
        "[data-cart-plus]"
      );

    if (cartPlus) {
      event.preventDefault();

      changeCartQty(
        cartPlus.getAttribute(
          "data-cart-plus"
        ),
        1
      );

      return;
    }

    const cartRemove =
      event.target.closest(
        "[data-cart-remove]"
      );

    if (cartRemove) {
      event.preventDefault();

      removeFromCart(
        cartRemove.getAttribute(
          "data-cart-remove"
        )
      );

      return;
    }

    const editProduct =
      event.target.closest(
        "[data-edit-product]"
      );

    if (editProduct) {
      openProductForm(
        editProduct.getAttribute(
          "data-edit-product"
        )
      );

      return;
    }

    const deleteProductBtn =
      event.target.closest(
        "[data-delete-product]"
      );

    if (deleteProductBtn) {
      deleteProduct(
        deleteProductBtn.getAttribute(
          "data-delete-product"
        )
      );

      return;
    }

    const stockAdjust =
      event.target.closest(
        "[data-stock-adjust]"
      );

    if (stockAdjust) {
      openStockAdjustment(
        stockAdjust.getAttribute(
          "data-stock-adjust"
        )
      );

      return;
    }

    const editCustomer =
      event.target.closest(
        "[data-edit-customer]"
      );

    if (editCustomer) {
      openCustomerForm(
        editCustomer.getAttribute(
          "data-edit-customer"
        )
      );

      return;
    }

    const deleteCustomerBtn =
      event.target.closest(
        "[data-delete-customer]"
      );

    if (deleteCustomerBtn) {
      deleteCustomer(
        deleteCustomerBtn.getAttribute(
          "data-delete-customer"
        )
      );

      return;
    }

    const editSupplier =
      event.target.closest(
        "[data-edit-supplier]"
      );

    if (editSupplier) {
      openSupplierForm(
        editSupplier.getAttribute(
          "data-edit-supplier"
        )
      );

      return;
    }

    const deleteSupplierBtn =
      event.target.closest(
        "[data-delete-supplier]"
      );

    if (deleteSupplierBtn) {
      deleteSupplier(
        deleteSupplierBtn.getAttribute(
          "data-delete-supplier"
        )
      );

      return;
    }

    const deleteExpenseBtn =
      event.target.closest(
        "[data-delete-expense]"
      );

    if (deleteExpenseBtn) {
      deleteExpense(
        deleteExpenseBtn.getAttribute(
          "data-delete-expense"
        )
      );

      return;
    }

    const editEmployee =
      event.target.closest(
        "[data-edit-employee]"
      );

    if (editEmployee) {
      openEmployeeForm(
        editEmployee.getAttribute(
          "data-edit-employee"
        )
      );

      return;
    }

    const deleteEmployeeBtn =
      event.target.closest(
        "[data-delete-employee]"
      );

    if (deleteEmployeeBtn) {
      deleteEmployee(
        deleteEmployeeBtn.getAttribute(
          "data-delete-employee"
        )
      );

      return;
    }

    const payment =
      event.target.closest(
        "[data-payment]"
      );

    if (payment) {
      event.preventDefault();

      setPaymentMethod(
        payment.getAttribute(
          "data-payment"
        )
      );

      return;
    }

  }
);


/* =========================================================
   BUTTON LISTENERS
   ========================================================= */

function setupButton(id, callback) {
  const button = $(id);

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    function(event) {
      event.preventDefault();

      try {
        callback();
      } catch (error) {
        console.error(
          `${id} Error:`,
          error
        );

        showToast(
          "Action Error",
          "error"
        );
      }
    }
  );
}


/* =========================================================
   SEARCH / FILTER LISTENERS
   ========================================================= */

function setupInput(id, callback) {
  const node = $(id);

  if (!node) {
    return;
  }

  node.addEventListener(
    "input",
    callback
  );

  node.addEventListener(
    "change",
    callback
  );
}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {
  updateDashboard();

  renderProducts();

  renderPOSProducts();

  renderCart();

  renderPurchases();

  renderStock();

  renderCustomers();

  renderSuppliers();

  renderDebts();

  renderExpenses();

  renderEmployees();

  renderReports();

  updateCustomerSelect();

  updateProductCategories();

  updateSalesCategories();
}


function refreshPage(page) {
  switch (page) {

    case "dashboard":
      updateDashboard();
      break;

    case "sales":
      renderPOSProducts();
      renderCart();
      updateCustomerSelect();
      break;

    case "products":
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

  }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeAungPOS() {

  console.log(
    "Aung POS starting..."
  );

  /* Modal close */
  setupButton(
    "modalClose",
    closeModal
  );

  const overlay =
    $("modalOverlay");

  if (overlay) {
    overlay.addEventListener(
      "click",
      function(event) {
        if (
          event.target === overlay
        ) {
          closeModal();
        }
      }
    );
  }

  /* Mobile menu */
  setupButton(
    "mobileMenu",
    toggleMobileMenu
  );

  setupButton(
    "menuToggle",
    toggleMobileMenu
  );

  /* Product */
  setupButton(
    "addProductBtn",
    () =>
      openProductForm()
  );

  /* Purchase */
  setupButton(
    "newPurchaseBtn",
    openPurchaseForm
  );

  /* Stock */
  setupButton(
    "stockAdjustmentBtn",
    function() {

      if (!DATA.products.length) {
        showToast(
          "Product မရှိသေးပါ",
          "warning"
        );

        return;
      }

      openStockAdjustment(
        DATA.products[0].id
      );
    }
  );

  /* Customer */
  setupButton(
    "addCustomerBtn",
    () =>
      openCustomerForm()
  );

  /* Supplier */
  setupButton(
    "addSupplierBtn",
    () =>
      openSupplierForm()
  );

  /* Expense */
  setupButton(
    "addExpenseBtn",
    openExpenseForm
  );

  /* Employee */
  setupButton(
    "addEmployeeBtn",
    () =>
      openEmployeeForm()
  );

  /* Shop settings */
  setupButton(
    "shopSettingsBtn",
    openShopSettings
  );

  setupButton(
    "receiptSettingsBtn",
    openReceiptSettings
  );

  setupButton(
    "userSettingsBtn",
    openUserSettings
  );

  setupButton(
    "backupBtn",
    backupData
  );

  setupButton(
    "clearDataBtn",
    clearAllData
  );

  /* Sales */
  setupButton(
    "checkoutBtn",
    checkout
  );

  setupButton(
    "clearCartBtn",
    clearCart
  );

  setupButton(
    "newSaleBtn",
    newSale
  );

  /* Search */
  setupInput(
    "productSearch",
    renderProducts
  );

  setupInput(
    "productCategoryFilter",
    renderProducts
  );

  setupInput(
    "stockFilter",
    renderProducts
  );

  setupInput(
    "salesSearch",
    renderPOSProducts
  );

  setupInput(
    "salesCategory",
    renderPOSProducts
  );

  setupInput(
    "customerSearch",
    renderCustomers
  );

  setupInput(
    "saleDiscount",
    renderCart
  );

  setupInput(
    "reportPeriod",
    renderReports
  );

  /* Initial rendering */
  renderAll();

  /* Default page */
  showPage(
    "dashboard"
  );

  console.log(
    "Aung POS ready."
  );
}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    function() {

      try {
        initializeAungPOS();

      } catch (error) {

        console.error(
          "Aung POS Startup Error:",
          error
        );

        showToast(
          "Aung POS စတင်ရာတွင် Error ဖြစ်နေပါသည်",
          "error"
        );
      }

    }
  );

} else {

  try {
    initializeAungPOS();

  } catch (error) {

    console.error(
      "Aung POS Startup Error:",
      error
    );

    showToast(
      "Aung POS စတင်ရာတွင် Error ဖြစ်နေပါသည်",
      "error"
    );
  }
}


/* =========================================================
   DEBUG / GLOBAL API
   ========================================================= */

window.AungPOS = {

  data: DATA,

  save: saveData,

  reload: function() {
    DATA = loadData();
    renderAll();
  },

  reset: function() {
    DATA =
      structuredClone(
        DEFAULT_DATA
      );

    saveData();

    renderAll();

    showPage(
      "dashboard"
    );
  },

  showPage,

  addProduct:
    openProductForm,

  addCustomer:
    openCustomerForm,

  addSupplier:
    openSupplierForm,

  addExpense:
    openExpenseForm,

  addEmployee:
    openEmployeeForm

};

console.log(
  "Aung POS app.js loaded successfully."
);
