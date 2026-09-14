/* =========================================================
   AUNG POS V1.0
   CORE APPLICATION ENGINE
   Mobile POS + Business Management
========================================================= */
"use strict";
/* =========================================================
   STORAGE
========================================================= */
const STORAGE_KEY = "aung_pos_v1_data";
const DEFAULT_DATA = {
  settings: {
    shopName: "Aung Shop",
    phone: "",
    address: "",
    footer: "Thank you for your business",
    currency: "Ks"
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
let db = loadData();
/* =========================================================
   DOM HELPERS
========================================================= */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
function el(id){
  return document.getElementById(id);
}
/* =========================================================
   DATA STORAGE
========================================================= */
function loadData(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    if(!saved){
      return structuredClone(DEFAULT_DATA);
    }
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(DEFAULT_DATA),
      ...parsed,
      settings:{
        ...DEFAULT_DATA.settings,
        ...(parsed.settings || {})
      },
      products:Array.isArray(parsed.products) ? parsed.products : [],
      sales:Array.isArray(parsed.sales) ? parsed.sales : [],
      purchases:Array.isArray(parsed.purchases) ? parsed.purchases : [],
      customers:Array.isArray(parsed.customers) ? parsed.customers : [],
      suppliers:Array.isArray(parsed.suppliers) ? parsed.suppliers : [],
      expenses:Array.isArray(parsed.expenses) ? parsed.expenses : [],
      employees:Array.isArray(parsed.employees) ? parsed.employees : [],
      cart:Array.isArray(parsed.cart) ? parsed.cart : []
    };
  }catch(error){
    console.error("Data loading error:", error);
    return structuredClone(DEFAULT_DATA);
  }
}
function saveData(){
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(db)
  );
}
/* =========================================================
   UTILITIES
========================================================= */
function uid(prefix = "ID"){
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2,8)
  ).toUpperCase();
}
function today(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function now(){
  return new Date().toISOString();
}
function money(value){
  const number = Number(value) || 0;
  return (
    new Intl.NumberFormat("en-US").format(
      Math.round(number)
    )
    +
    " "
    +
    db.settings.currency
  );
}
function number(value){
  return new Intl.NumberFormat("en-US").format(
    Number(value) || 0
  );
}
function escapeHTML(value){
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}
function sameDay(date){
  return String(date).slice(0,10) === today();
}
function sameMonth(date){
  const d = new Date(date);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth()
  );
}
function sameYear(date){
  const d = new Date(date);
  const t = new Date();
  return d.getFullYear() === t.getFullYear();
}
function showToast(message,type="success"){
  const container = el("toastContainer");
  if(!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : type === "error" ? "✕" : "⚠"}</span>
    <span>${escapeHTML(message)}</span>
  `;
  container.appendChild(toast);
  setTimeout(()=>{
    toast.remove();
  },3000);
}
/* =========================================================
   MODAL
========================================================= */
function openModal(title,subtitle="",html=""){
  el("modalTitle").textContent = title;
  el("modalSubtitle").textContent = subtitle;
  el("modalBody").innerHTML = html;
  el("modalOverlay").classList.add("show");
}
function closeModal(){
  el("modalOverlay").classList.remove("show");
  el("modalBody").innerHTML = "";
}
el("modalClose")?.addEventListener(
  "click",
  closeModal
);
el("modalOverlay")?.addEventListener(
  "click",
  (event)=>{
    if(event.target === el("modalOverlay")){
      closeModal();
    }
  }
);
/* =========================================================
   NAVIGATION
========================================================= */
const PAGE_TITLES = {
  dashboard:[
    "Dashboard",
    "သင့်ဆိုင်လုပ်ငန်းကို တစ်နေရာတည်းမှ စီမံပါ"
  ],
  sales:[
    "အရောင်း",
    "အရောင်းဘောက်ချာများကို စီမံပါ"
  ],
  products:[
    "ကုန်ပစ္စည်း",
    "ကုန်ပစ္စည်းနှင့် လက်ကျန်များကို စီမံပါ"
  ],
  purchases:[
    "အဝယ်စာရင်း",
    "Supplier ထံမှ ဝယ်ယူမှုများ"
  ],
  stock:[
    "ကုန်လက်ကျန်",
    "Stock Management"
  ],
  customers:[
    "Customer",
    "Customer နှင့် ရရန်ရှိငွေများ"
  ],
  suppliers:[
    "Supplier",
    "Supplier နှင့် ပေးရန်ရှိငွေများ"
  ],
  debts:[
    "အကြွေးစာရင်း",
    "ရရန်ရှိ / ပေးရန်ရှိ"
  ],
  expenses:[
    "ကုန်ကျစရိတ်",
    "လုပ်ငန်းကုန်ကျစရိတ်များ"
  ],
  employees:[
    "ဝန်ထမ်း",
    "ဝန်ထမ်းနှင့် လစာစီမံခန့်ခွဲမှု"
  ],
  reports:[
    "Reports",
    "လုပ်ငန်းစာရင်းချုပ်များ"
  ],
  settings:[
    "Settings",
    "Aung POS Settings"
  ]
};
function showPage(page){
  $$(".page").forEach(p=>{
    p.classList.remove("active");
  });
  const target = el(`page-${page}`);
  if(!target) return;
  target.classList.add("active");
  $$(".nav-item").forEach(btn=>{
    btn.classList.toggle(
      "active",
      btn.dataset.page === page
    );
  });
  const info = PAGE_TITLES[page] || ["Aung POS",""];
  el("pageTitle").textContent = info[0];
  el("pageSubtitle").textContent = info[1];
  if(window.innerWidth <= 768){
    el("sidebar")?.classList.remove("open");
  }
  refreshPage(page);
}
$$(".nav-item").forEach(btn=>{
  btn.addEventListener(
    "click",
    ()=>{
      showPage(btn.dataset.page);
    }
  );
});
$$("[data-page-go]").forEach(btn=>{
  btn.addEventListener(
    "click",
    ()=>{
      showPage(btn.dataset.pageGo);
    }
  );
});
/* =========================================================
   MOBILE MENU
========================================================= */
el("menuBtn")?.addEventListener(
  "click",
  ()=>{
    el("sidebar")?.classList.toggle("open");
  }
);
/* =========================================================
   DASHBOARD
========================================================= */
function calculateTodaySales(){
  return db.sales
    .filter(s=>sameDay(s.date))
    .reduce((sum,s)=>sum + Number(s.total || 0),0);
}
function calculateTodayProfit(){
  return db.sales
    .filter(s=>sameDay(s.date))
    .reduce((sum,s)=>sum + Number(s.profit || 0),0);
}
function calculateTodayPurchase(){
  return db.purchases
    .filter(p=>sameDay(p.date))
    .reduce((sum,p)=>sum + Number(p.total || 0),0);
}
function calculateTodayExpense(){
  return db.expenses
    .filter(e=>sameDay(e.date))
    .reduce((sum,e)=>sum + Number(e.amount || 0),0);
}
function updateDashboard(){
  const sales = calculateTodaySales();
  const profit = calculateTodayProfit();
  const purchase = calculateTodayPurchase();
  const expense = calculateTodayExpense();
  el("todaySales").textContent = money(sales);
  el("todayProfit").textContent = money(profit);
  el("todayPurchase").textContent = money(purchase);
  el("todayExpense").textContent = money(expense);
  el("todaySalesCount").textContent =
    `${db.sales.filter(s=>sameDay(s.date)).length} ဘောက်ချာ`;
  el("totalProducts").textContent =
    number(db.products.length);
  el("lowStockCount").textContent =
    number(
      db.products.filter(p =>
        Number(p.stock) <= Number(p.minStock)
      ).length
    );
  el("expiryCount").textContent =
    number(
      db.products.filter(isNearExpiry).length
    );
  el("totalCustomers").textContent =
    number(db.customers.length);
  el("welcomeShopName").textContent =
    db.settings.shopName;
  el("sideShopName").textContent =
    db.settings.shopName;
  renderRecentSales();
  renderDashboardAlerts();
}
function renderRecentSales(){
  const box = el("recentSales");
  if(!box) return;
  const sales = [...db.sales]
    .sort((a,b)=>new Date(b.date)-new Date(a.date))
    .slice(0,8);
  if(!sales.length){
    box.innerHTML = `
      <div class="empty-state">
        <div>🧾</div>
        <h4>အရောင်းစာရင်း မရှိသေးပါ</h4>
        <p>ပထမဆုံးအရောင်းကို စတင်လိုက်ပါ။</p>
      </div>
    `;
    return;
  }
  box.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Invoice</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Payment</th>
        </tr>
      </thead>
      <tbody>
        ${sales.map(s=>`
          <tr>
            <td>${escapeHTML(formatDate(s.date))}</td>
            <td>
              <strong>${escapeHTML(s.invoice)}</strong>
            </td>
            <td>
              ${escapeHTML(s.customerName || "Walk-in")}
            </td>
            <td>
              <strong>${money(s.total)}</strong>
            </td>
            <td>
              <span class="badge ${
                s.paymentMethod === "credit"
                ? "warning"
                : "success"
              }">
                ${
                  s.paymentMethod === "credit"
                  ? "Credit"
                  : "Cash"
                }
              </span>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
function renderDashboardAlerts(){
  const box = el("dashboardAlerts");
  if(!box) return;
  const low = db.products.filter(
    p => Number(p.stock) <= Number(p.minStock)
  );
  const expiry = db.products.filter(isNearExpiry);
  let html = "";
  if(low.length){
    html += `
      <div class="alert-item warning">
        <div class="alert-icon">⚠️</div>
        <div>
          <strong>Low Stock — ${low.length} items</strong>
          <p>
            ${low.slice(0,3)
              .map(p=>escapeHTML(p.name))
              .join(", ")}
          </p>
        </div>
      </div>
    `;
  }
  if(expiry.length){
    html += `
      <div class="alert-item warning">
        <div class="alert-icon">⏰</div>
        <div>
          <strong>Expiry Alert — ${expiry.length} items</strong>
          <p>
            ${expiry.slice(0,3)
              .map(p=>escapeHTML(p.name))
              .join(", ")}
          </p>
        </div>
      </div>
    `;
  }
  if(!html){
    html = `
      <div class="alert-item info">
        <div class="alert-icon">✓</div>
        <div>
          <strong>အခြေအနေကောင်းပါသည်</strong>
          <p>
            လက်ရှိအချိန်တွင် အရေးကြီးသော Alert မရှိပါ။
          </p>
        </div>
      </div>
    `;
  }
  box.innerHTML = html;
}
/* =========================================================
   PRODUCT MANAGEMENT
========================================================= */
function productForm(product=null){
  const editing = !!product;
  const categories = [
    ...new Set(
      db.products
        .map(p=>p.category)
        .filter(Boolean)
    )
  ];
  openModal(
    editing ? "ကုန်ပစ္စည်းပြင်မည်" : "ကုန်ပစ္စည်းအသစ်ထည့်မည်",
    "Product Information",
    `
      <form id="productForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>ကုန်ပစ္စည်းအမည် *</label>
            <input
              name="name"
              required
              value="${escapeHTML(product?.name || "")}"
              placeholder="ဥပမာ - Coca Cola"
            >
          </div>
          <div class="form-group">
            <label>Barcode</label>
            <input
              name="barcode"
              value="${escapeHTML(product?.barcode || "")}"
              placeholder="Barcode"
            >
          </div>
          <div class="form-group">
            <label>SKU</label>
            <input
              name="sku"
              value="${escapeHTML(product?.sku || "")}"
              placeholder="SKU"
            >
          </div>
          <div class="form-group">
            <label>Category</label>
            <input
              name="category"
              list="productCategories"
              value="${escapeHTML(product?.category || "")}"
              placeholder="Category"
            >
            <datalist id="productCategories">
              ${categories.map(c=>`
                <option value="${escapeHTML(c)}">
              `).join("")}
            </datalist>
          </div>
          <div class="form-group">
            <label>Unit</label>
            <input
              name="unit"
              value="${escapeHTML(product?.unit || "ခု")}"
              placeholder="ခု / ဘူး / အထုပ်"
            >
          </div>
          <div class="form-group">
            <label>Purchase Price *</label>
            <input
              name="purchasePrice"
              type="number"
              min="0"
              required
              value="${product?.purchasePrice || 0}"
            >
          </div>
          <div class="form-group">
            <label>Retail Price *</label>
            <input
              name="retailPrice"
              type="number"
              min="0"
              required
              value="${product?.retailPrice || 0}"
            >
          </div>
          <div class="form-group">
            <label>Wholesale Price</label>
            <input
              name="wholesalePrice"
              type="number"
              min="0"
              value="${product?.wholesalePrice || 0}"
            >
          </div>
          <div class="form-group">
            <label>လက်ကျန် *</label>
            <input
              name="stock"
              type="number"
              min="0"
              step="0.01"
              required
              value="${product?.stock ?? 0}"
              ${editing ? "" : ""}
            >
          </div>
          <div class="form-group">
            <label>Minimum Stock</label>
            <input
              name="minStock"
              type="number"
              min="0"
              value="${product?.minStock || 5}"
            >
          </div>
          <div class="form-group">
            <label>Expiry Date</label>
            <input
              name="expiry"
              type="date"
              value="${product?.expiry || ""}"
            >
          </div>
          <div class="form-group">
            <label>Supplier</label>
            <select name="supplierId">
              <option value="">မရွေးထားပါ</option>
              ${db.suppliers.map(s=>`
                <option
                  value="${s.id}"
                  ${product?.supplierId === s.id ? "selected" : ""}
                >
                  ${escapeHTML(s.name)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group full">
            <label>မှတ်ချက်</label>
            <textarea
              name="note"
              placeholder="Product note"
            >${escapeHTML(product?.note || "")}</textarea>
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelProduct"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            ${editing ? "ပြင်ဆင်မည်" : "သိမ်းမည်"}
          </button>
        </div>
      </form>
    `
  );
  el("cancelProduct")?.addEventListener(
    "click",
    closeModal
  );
  el("productForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form = new FormData(event.target);
      const data = {
        name:form.get("name").trim(),
        barcode:form.get("barcode").trim(),
        sku:form.get("sku").trim(),
        category:form.get("category").trim(),
        unit:form.get("unit").trim() || "ခု",
        purchasePrice:Number(form.get("purchasePrice")) || 0,
        retailPrice:Number(form.get("retailPrice")) || 0,
        wholesalePrice:Number(form.get("wholesalePrice")) || 0,
        stock:Number(form.get("stock")) || 0,
        minStock:Number(form.get("minStock")) || 0,
        expiry:form.get("expiry"),
        supplierId:form.get("supplierId"),
        note:form.get("note").trim()
      };
      if(!data.name){
        showToast(
          "ကုန်ပစ္စည်းအမည် ထည့်ပါ",
          "error"
        );
        return;
      }
      if(editing){
        const index = db.products.findIndex(
          p=>p.id === product.id
        );
        if(index !== -1){
          db.products[index] = {
            ...db.products[index],
            ...data,
            updatedAt:now()
          };
        }
        showToast("ကုန်ပစ္စည်းပြင်ဆင်ပြီးပါပြီ");
      }else{
        db.products.push({
          id:uid("PROD"),
          ...data,
          createdAt:now(),
          updatedAt:now()
        });
        showToast("ကုန်ပစ္စည်းထည့်ပြီးပါပြီ");
      }
      saveData();
      closeModal();
      renderProducts();
      renderSalesProducts();
      updateDashboard();
      renderStock();
    }
  );
}
el("addProductBtn")?.addEventListener(
  "click",
  ()=>productForm()
);
function renderProducts(){
  const tbody = el("productsTableBody");
  if(!tbody) return;
  const search =
    (el("productSearch")?.value || "")
      .toLowerCase()
      .trim();
  const category =
    el("productCategoryFilter")?.value || "";
  const stockFilter =
    el("stockFilter")?.value || "";
  let products = [...db.products];
  if(search){
    products = products.filter(p=>
      `${p.name} ${p.barcode} ${p.sku}`
        .toLowerCase()
        .includes(search)
    );
  }
  if(category){
    products = products.filter(
      p=>p.category === category
    );
  }
  if(stockFilter === "low"){
    products = products.filter(
      p=>Number(p.stock) <= Number(p.minStock)
    );
  }
  if(stockFilter === "out"){
    products = products.filter(
      p=>Number(p.stock) <= 0
    );
  }
  if(stockFilter === "available"){
    products = products.filter(
      p=>Number(p.stock) > 0
    );
  }
  if(!products.length){
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <div>📦</div>
            <h4>ကုန်ပစ္စည်း မတွေ့ပါ</h4>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = products.map(p=>`
    <tr>
      <td>
        <strong>${escapeHTML(p.name)}</strong>
        <small style="display:block;color:#94a3b8">
          ${escapeHTML(p.unit)}
        </small>
      </td>
      <td>${escapeHTML(p.barcode || "-")}</td>
      <td>${escapeHTML(p.category || "-")}</td>
      <td>${money(p.purchasePrice)}</td>
      <td>${money(p.retailPrice)}</td>
      <td>${money(p.wholesalePrice)}</td>
      <td>
        <span class="badge ${
          Number(p.stock) <= Number(p.minStock)
          ? "danger"
          : "success"
        }">
          ${number(p.stock)} ${escapeHTML(p.unit)}
        </span>
      </td>
      <td>
        ${
          p.expiry
          ? `
            <span class="badge ${
              isNearExpiry(p)
              ? "warning"
              : "info"
            }">
              ${escapeHTML(p.expiry)}
            </span>
          `
          : "-"
        }
      </td>
      <td>
        <button
          class="secondary-btn edit-product"
          data-id="${p.id}"
        >
          Edit
        </button>
        <button
          class="danger-btn delete-product"
          data-id="${p.id}"
        >
          Delete
        </button>
      </td>
    </tr>
  `).join("");
  $$(".edit-product").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        const p = db.products.find(
          x=>x.id === btn.dataset.id
        );
        if(p) productForm(p);
      }
    );
  });
  $$(".delete-product").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>deleteProduct(btn.dataset.id)
    );
  });
  updateProductCategoryFilters();
}
function updateProductCategoryFilters(){
  const selects = [
    el("productCategoryFilter"),
    el("salesCategory")
  ];
  const categories = [
    ...new Set(
      db.products
        .map(p=>p.category)
        .filter(Boolean)
    )
  ];
  selects.forEach(select=>{
    if(!select) return;
    const current = select.value;
    const first =
      select.id === "salesCategory"
      ? "ကုန်အုပ်စုအားလုံး"
      : "Category အားလုံး";
    select.innerHTML = `
      <option value="">${first}</option>
      ${categories.map(c=>`
        <option value="${escapeHTML(c)}">
          ${escapeHTML(c)}
        </option>
      `).join("")}
    `;
    select.value = current;
  });
}
function deleteProduct(id){
  const p = db.products.find(
    x=>x.id === id
  );
  if(!p) return;
  if(
    !confirm(
      `"${p.name}" ကို ဖျက်မည်မှာ သေချာပါသလား?`
    )
  ){
    return;
  }
  db.products =
    db.products.filter(
      x=>x.id !== id
    );
  saveData();
  renderProducts();
  renderSalesProducts();
  renderStock();
  updateDashboard();
  showToast("ကုန်ပစ္စည်းဖျက်ပြီးပါပြီ");
}
/* =========================================================
   SALES POS
========================================================= */
function renderSalesProducts(){
  const box = el("salesProducts");
  if(!box) return;
  const search =
    (el("salesSearch")?.value || "")
      .toLowerCase()
      .trim();
  const category =
    el("salesCategory")?.value || "";
  let products = db.products
    .filter(p=>Number(p.stock) > 0);
  if(search){
    products = products.filter(p=>
      `${p.name} ${p.barcode} ${p.sku}`
        .toLowerCase()
        .includes(search)
    );
  }
  if(category){
    products = products.filter(
      p=>p.category === category
    );
  }
  if(!products.length){
    box.innerHTML = `
      <div class="empty-state">
        <div>📦</div>
        <h4>ရောင်းရန် Product မရှိပါ</h4>
        <p>Product ထည့်ပါ သို့မဟုတ် Stock စစ်ပါ။</p>
      </div>
    `;
    return;
  }
  box.innerHTML = products.map(p=>`
    <button
      class="product-card"
      data-product-id="${p.id}"
    >
      <div class="product-image">
        ${
          p.image
          ? `<img src="${escapeHTML(p.image)}"
                 style="width:100%;height:100%;object-fit:cover;border-radius:9px">`
          : "📦"
        }
      </div>
      <strong>
        ${escapeHTML(p.name)}
      </strong>
      <small>
        ${escapeHTML(p.category || "General")}
      </small>
      <div class="product-price">
        <strong>
          ${money(p.retailPrice)}
        </strong>
        <span class="stock-badge">
          ${number(p.stock)} ${escapeHTML(p.unit)}
        </span>
      </div>
    </button>
  `).join("");
  $$(".product-card").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        addToCart(btn.dataset.productId);
      }
    );
  });
}
function addToCart(productId){
  const product =
    db.products.find(
      p=>p.id === productId
    );
  if(!product) return;
  const existing =
    db.cart.find(
      x=>x.productId === productId
    );
  if(existing){
    if(
      Number(existing.qty) >=
      Number(product.stock)
    ){
      showToast(
        "လက်ကျန်ထက်ပို၍ ရောင်း၍မရပါ",
        "warning"
      );
      return;
    }
    existing.qty++;
  }else{
    db.cart.push({
      productId:product.id,
      name:product.name,
      price:Number(product.retailPrice) || 0,
      cost:Number(product.purchasePrice) || 0,
      qty:1,
      unit:product.unit || "ခု"
    });
  }
  saveData();
  renderCart();
  showToast(
    `${product.name} ကို အရောင်းစာရင်းထဲ ထည့်ပြီးပါပြီ`
  );
}
function renderCart(){
  const box = el("cartItems");
  if(!box) return;
  if(!db.cart.length){
    box.innerHTML = `
      <div class="cart-empty">
        <div>🛒</div>
        <strong>အရောင်းပစ္စည်း မရှိသေးပါ</strong>
        <span>
          ဘယ်ဘက်မှ Product ကိုနှိပ်ပြီး ထည့်ပါ။
        </span>
      </div>
    `;
    updateCartSummary();
    return;
  }
  box.innerHTML = db.cart.map(item=>`
    <div class="cart-item">
      <div class="cart-item-top">
        <div class="cart-item-name">
          ${escapeHTML(item.name)}
        </div>
        <button
          class="cart-remove"
          data-remove="${item.productId}"
        >
          ×
        </button>
      </div>
      <div class="cart-item-bottom">
        <div class="qty-control">
          <button
            data-minus="${item.productId}"
          >
            −
          </button>
          <span>${number(item.qty)}</span>
          <button
            data-plus="${item.productId}"
          >
            +
          </button>
        </div>
        <div class="cart-item-price">
          ${money(item.price * item.qty)}
        </div>
      </div>
    </div>
  `).join("");
  $$("[data-remove]").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        removeFromCart(btn.dataset.remove);
      }
    );
  });
  $$("[data-minus]").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        changeCartQty(
          btn.dataset.minus,
          -1
        );
      }
    );
  });
  $$("[data-plus]").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        changeCartQty(
          btn.dataset.plus,
          1
        );
      }
    );
  });
  updateCartSummary();
}
function changeCartQty(productId,delta){
  const item =
    db.cart.find(
      x=>x.productId === productId
    );
  const product =
    db.products.find(
      x=>x.id === productId
    );
  if(!item || !product) return;
  const newQty =
    Number(item.qty) + delta;
  if(newQty <= 0){
    removeFromCart(productId);
    return;
  }
  if(newQty > Number(product.stock)){
    showToast(
      "လက်ကျန်ထက်ပို၍ ရောင်း၍မရပါ",
      "warning"
    );
    return;
  }
  item.qty = newQty;
  saveData();
  renderCart();
}
function removeFromCart(productId){
  db.cart =
    db.cart.filter(
      x=>x.productId !== productId
    );
  saveData();
  renderCart();
}
function clearCart(){
  db.cart = [];
  saveData();
  renderCart();
}
el("clearCartBtn")?.addEventListener(
  "click",
  clearCart
);
function updateCartSummary(){
  const subtotal =
    db.cart.reduce(
      (sum,item)=>
        sum +
        Number(item.price) *
        Number(item.qty),
      0
    );
  const discount =
    Number(el("saleDiscount")?.value) || 0;
  const total =
    Math.max(0,subtotal-discount);
  el("cartCount").textContent =
    `${db.cart.reduce((s,i)=>s+Number(i.qty),0)} items`;
  el("cartSubtotal").textContent =
    money(subtotal);
  el("cartTotal").textContent =
    money(total);
}
el("saleDiscount")?.addEventListener(
  "input",
  updateCartSummary
);
/* PAYMENT */
$$(".payment-btn").forEach(btn=>{
  btn.addEventListener(
    "click",
    ()=>{
      $$(".payment-btn").forEach(
        x=>x.classList.remove("active")
      );
      btn.classList.add("active");
      db.paymentMethod =
        btn.dataset.payment;
    }
  );
});
/* =========================================================
   CHECKOUT
========================================================= */
el("checkoutBtn")?.addEventListener(
  "click",
  checkout
);
function checkout(){
  if(!db.cart.length){
    showToast(
      "အရောင်းပစ္စည်း မရှိသေးပါ",
      "warning"
    );
    return;
  }
  const discount =
    Number(el("saleDiscount")?.value) || 0;
  const subtotal =
    db.cart.reduce(
      (sum,item)=>
        sum +
        Number(item.price) *
        Number(item.qty),
      0
    );
  const total =
    Math.max(0,subtotal-discount);
  const cost =
    db.cart.reduce(
      (sum,item)=>
        sum +
        Number(item.cost) *
        Number(item.qty),
      0
    );
  const profit =
    total-cost;
  openCheckoutCustomerModal({
    subtotal,
    discount,
    total,
    cost,
    profit
  });
}
function openCheckoutCustomerModal(summary){
  openModal(
    "အရောင်းအတည်ပြုမည်",
    "Customer / Payment Information",
    `
      <form id="checkoutForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>Customer</label>
            <select name="customerId">
              <option value="">
                Walk-in Customer
              </option>
              ${db.customers.map(c=>`
                <option value="${c.id}">
                  ${escapeHTML(c.name)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select name="paymentMethod">
              <option value="cash"
                ${db.paymentMethod==="cash" ? "selected":""}>
                Cash
              </option>
              <option value="credit"
                ${db.paymentMethod==="credit" ? "selected":""}>
                Credit
              </option>
              <option value="mobile"
                ${db.paymentMethod==="mobile" ? "selected":""}>
                Mobile Payment
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Received Amount</label>
            <input
              name="received"
              type="number"
              min="0"
              value="${summary.total}"
            >
          </div>
          <div class="form-group full">
            <label>Note</label>
            <textarea
              name="note"
              placeholder="Sale note"
            ></textarea>
          </div>
        </div>
        <div style="
          margin-top:15px;
          padding:15px;
          background:#f8fafc;
          border-radius:10px;
        ">
          <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:6px;
            font-size:11px;
          ">
            <span>Subtotal</span>
            <strong>${money(summary.subtotal)}</strong>
          </div>
          <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:6px;
            font-size:11px;
          ">
            <span>Discount</span>
            <strong>${money(summary.discount)}</strong>
          </div>
          <div style="
            display:flex;
            justify-content:space-between;
            font-size:16px;
          ">
            <strong>Total</strong>
            <strong style="color:#2563eb">
              ${money(summary.total)}
            </strong>
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelCheckout"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            ✓ အရောင်းအတည်ပြုမည်
          </button>
        </div>
      </form>
    `
  );
  el("cancelCheckout")?.addEventListener(
    "click",
    closeModal
  );
  el("checkoutForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form =
        new FormData(event.target);
      const customerId =
        form.get("customerId");
      const customer =
        db.customers.find(
          c=>c.id === customerId
        );
      const paymentMethod =
        form.get("paymentMethod");
      const received =
        Number(form.get("received")) || 0;
      const invoice =
        "INV-" +
        new Date()
          .getFullYear() +
        String(
          db.sales.length + 1
        ).padStart(5,"0");
      const saleItems =
        db.cart.map(item=>({
          productId:item.productId,
          name:item.name,
          qty:Number(item.qty),
          price:Number(item.price),
          cost:Number(item.cost),
          subtotal:
            Number(item.price) *
            Number(item.qty)
        }));
      /* STOCK DEDUCT */
      saleItems.forEach(item=>{
        const product =
          db.products.find(
            p=>p.id === item.productId
          );
        if(product){
          product.stock =
            Number(product.stock) -
            Number(item.qty);
          if(product.stock < 0){
            product.stock = 0;
          }
        }
      });
      const sale = {
        id:uid("SALE"),
        invoice,
        date:now(),
        customerId,
        customerName:
          customer?.name ||
          "Walk-in Customer",
        items:saleItems,
        subtotal:summaryFromItems(saleItems),
        discount:
          Number(form.get("discount")) ||
          Number(el("saleDiscount")?.value) ||
          0,
        total:calculateSaleTotal(saleItems),
        cost:saleItems.reduce(
          (sum,i)=>
            sum +
            i.cost *
            i.qty,
          0
        ),
        profit:
          calculateSaleTotal(saleItems) -
          saleItems.reduce(
            (sum,i)=>
              sum +
              i.cost *
              i.qty,
            0
          ),
        paymentMethod,
        received,
        change:
          Math.max(
            0,
            received -
            calculateSaleTotal(saleItems)
          ),
        note:form.get("note") || ""
      };
      db.sales.push(sale);
      /* CREDIT */
      if(
        paymentMethod === "credit" &&
        customer
      ){
        customer.receivable =
          Number(customer.receivable || 0) +
          Number(sale.total);
      }
      db.cart = [];
      saveData();
      closeModal();
      renderCart();
      renderSalesProducts();
      renderProducts();
      renderStock();
      renderCustomers();
      renderDebts();
      updateDashboard();
      showToast(
        `အရောင်းအောင်မြင်ပါသည် — ${invoice}`
      );
      setTimeout(
        ()=>showReceipt(sale),
        250
      );
    }
  );
}
function summaryFromItems(items){
  return items.reduce(
    (sum,item)=>
      sum +
      Number(item.price) *
      Number(item.qty),
    0
  );
}
function calculateSaleTotal(items){
  const subtotal =
    summaryFromItems(items);
  const discount =
    Number(el("saleDiscount")?.value) || 0;
  return Math.max(
    0,
    subtotal-discount
  );
}
/* =========================================================
   RECEIPT
========================================================= */
function showReceipt(sale){
  openModal(
    "အရောင်းဘောက်ချာ",
    sale.invoice,
    `
      <div id="receiptArea"
        style="
          background:#fff;
          color:#111;
          padding:10px;
          font-family:Arial,'Noto Sans Myanmar',sans-serif;
        "
      >
        <div style="
          text-align:center;
          padding-bottom:10px;
          border-bottom:1px dashed #999;
        ">
          <strong style="font-size:18px">
            ${escapeHTML(db.settings.shopName)}
          </strong>
          <div style="font-size:10px;margin-top:3px">
            ${escapeHTML(db.settings.address || "")}
          </div>
          <div style="font-size:10px">
            ${escapeHTML(db.settings.phone || "")}
          </div>
        </div>
        <div style="
          padding:8px 0;
          font-size:10px;
        ">
          <div>Invoice: ${escapeHTML(sale.invoice)}</div>
          <div>Date: ${escapeHTML(formatDateTime(sale.date))}</div>
          <div>
            Customer:
            ${escapeHTML(sale.customerName)}
          </div>
        </div>
        <table style="
          min-width:0;
          width:100%;
          font-size:10px;
        ">
          <thead>
            <tr>
              <th style="text-align:left">Item</th>
              <th>Qty</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item=>`
              <tr>
                <td>
                  ${escapeHTML(item.name)}
                </td>
                <td style="text-align:center">
                  ${number(item.qty)}
                </td>
                <td style="text-align:right">
                  ${number(item.subtotal)}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="
          margin-top:10px;
          padding-top:8px;
          border-top:1px dashed #999;
          font-size:11px;
        ">
          <div style="
            display:flex;
            justify-content:space-between;
          ">
            <span>Subtotal</span>
            <strong>${money(sale.subtotal)}</strong>
          </div>
          <div style="
            display:flex;
            justify-content:space-between;
          ">
            <span>Discount</span>
            <strong>${money(sale.discount)}</strong>
          </div>
          <div style="
            display:flex;
            justify-content:space-between;
            font-size:15px;
            margin-top:5px;
          ">
            <strong>Total</strong>
            <strong>${money(sale.total)}</strong>
          </div>
        </div>
        <div style="
          text-align:center;
          margin-top:15px;
          padding-top:8px;
          border-top:1px dashed #999;
          font-size:10px;
        ">
          ${escapeHTML(db.settings.footer)}
        </div>
      </div>
      <div class="form-actions">
        <button
          class="secondary-btn"
          id="closeReceipt"
        >
          Close
        </button>
        <button
          class="primary-btn"
          id="printReceipt"
        >
          🖨️ Print
        </button>
      </div>
    `
  );
  el("closeReceipt")?.addEventListener(
    "click",
    closeModal
  );
  el("printReceipt")?.addEventListener(
    "click",
    ()=>printReceipt(sale)
  );
}
function printReceipt(sale){
  const receipt =
    el("receiptArea")?.innerHTML;
  if(!receipt) return;
  const win =
    window.open(
      "",
      "_blank",
      "width=400,height=700"
    );
  if(!win){
    showToast(
      "Print window ဖွင့်၍မရပါ",
      "error"
    );
    return;
  }
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHTML(sale.invoice)}</title>
      <style>
        body{
          width:80mm;
          margin:0 auto;
          font-family:Arial,"Noto Sans Myanmar",sans-serif;
          font-size:11px;
        }
        table{
          width:100%;
          border-collapse:collapse;
        }
        th,td{
          padding:3px;
        }
        @media print{
          body{
            width:80mm;
          }
        }
      </style>
    </head>
    <body>
      ${receipt}
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(()=>{
    win.print();
    win.close();
  },300);
}
/* =========================================================
   PURCHASES
========================================================= */
function purchaseForm(){
  openModal(
    "အဝယ်အသစ်ထည့်မည်",
    "Purchase Information",
    `
      <form id="purchaseForm">
        <div class="form-grid">
          <div class="form-group">
            <label>Supplier *</label>
            <select name="supplierId" required>
              <option value="">
                Supplier ရွေးပါ
              </option>
              ${db.suppliers.map(s=>`
                <option value="${s.id}">
                  ${escapeHTML(s.name)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Product *</label>
            <select name="productId" required>
              <option value="">
                Product ရွေးပါ
              </option>
              ${db.products.map(p=>`
                <option value="${p.id}">
                  ${escapeHTML(p.name)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Quantity *</label>
            <input
              name="qty"
              type="number"
              min="1"
              step="0.01"
              required
              value="1"
            >
          </div>
          <div class="form-group">
            <label>Purchase Price *</label>
            <input
              name="price"
              type="number"
              min="0"
              required
            >
          </div>
          <div class="form-group">
            <label>Payment</label>
            <select name="payment">
              <option value="cash">Paid</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div class="form-group">
            <label>Note</label>
            <input
              name="note"
              placeholder="Note"
            >
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelPurchase"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            အဝယ်သိမ်းမည်
          </button>
        </div>
      </form>
    `
  );
  el("cancelPurchase")?.addEventListener(
    "click",
    closeModal
  );
  const productSelect =
    document.querySelector(
      '#purchaseForm select[name="productId"]'
    );
  const priceInput =
    document.querySelector(
      '#purchaseForm input[name="price"]'
    );
  productSelect?.addEventListener(
    "change",
    ()=>{
      const p =
        db.products.find(
          x=>x.id === productSelect.value
        );
      if(p){
        priceInput.value =
          p.purchasePrice || 0;
      }
    }
  );
  el("purchaseForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form =
        new FormData(event.target);
      const supplierId =
        form.get("supplierId");
      const productId =
        form.get("productId");
      const supplier =
        db.suppliers.find(
          s=>s.id === supplierId
        );
      const product =
        db.products.find(
          p=>p.id === productId
        );
      if(!supplier || !product){
        showToast(
          "Supplier နှင့် Product ရွေးပါ",
          "error"
        );
        return;
      }
      const qty =
        Number(form.get("qty")) || 0;
      const price =
        Number(form.get("price")) || 0;
      const total =
        qty * price;
      const purchase = {
        id:uid("PUR"),
        invoice:
          "PUR-" +
          String(
            db.purchases.length + 1
          ).padStart(5,"0"),
        date:now(),
        supplierId,
        supplierName:supplier.name,
        productId,
        productName:product.name,
        qty,
        price,
        total,
        payment:form.get("payment"),
        note:form.get("note") || ""
      };
      db.purchases.push(purchase);
      product.stock =
        Number(product.stock) +
        qty;
      if(form.get("payment") === "credit"){
        supplier.payable =
          Number(supplier.payable || 0) +
          total;
      }
      saveData();
      closeModal();
      renderPurchases();
      renderProducts();
      renderStock();
      renderSalesProducts();
      renderSuppliers();
      renderDebts();
      updateDashboard();
      showToast("အဝယ်စာရင်း သိမ်းပြီးပါပြီ");
    }
  );
}
el("newPurchaseBtn")?.addEventListener(
  "click",
  purchaseForm
);
function renderPurchases(){
  const tbody =
    el("purchaseTableBody");
  if(!tbody) return;
  const purchases =
    [...db.purchases]
      .sort(
        (a,b)=>
          new Date(b.date) -
          new Date(a.date)
      );
  if(!purchases.length){
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div>🧾</div>
            <h4>အဝယ်စာရင်း မရှိသေးပါ</h4>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML =
    purchases.map(p=>`
      <tr>
        <td>${formatDate(p.date)}</td>
        <td>
          <strong>${escapeHTML(p.invoice)}</strong>
        </td>
        <td>${escapeHTML(p.supplierName)}</td>
        <td>
          ${escapeHTML(p.productName)}
          × ${number(p.qty)}
        </td>
        <td>
          <strong>${money(p.total)}</strong>
        </td>
        <td>
          <span class="badge ${
            p.payment === "credit"
            ? "warning"
            : "success"
          }">
            ${
              p.payment === "credit"
              ? "Credit"
              : "Paid"
            }
          </span>
        </td>
      </tr>
    `).join("");
  const todayTotal =
    db.purchases
      .filter(p=>sameDay(p.date))
      .reduce(
        (s,p)=>s+Number(p.total),
        0
      );
  el("purchaseTodayTotal").textContent =
    money(todayTotal);
  el("purchaseInvoiceCount").textContent =
    db.purchases.filter(
      p=>sameDay(p.date)
    ).length;
  el("supplierPayable").textContent =
    money(
      db.suppliers.reduce(
        (s,x)=>
          s+Number(x.payable || 0),
        0
      )
    );
}
/* =========================================================
   STOCK
========================================================= */
function isNearExpiry(product){
  if(!product.expiry) return false;
  const expiry =
    new Date(product.expiry);
  const todayDate =
    new Date();
  todayDate.setHours(0,0,0,0);
  const diff =
    expiry - todayDate;
  const days =
    diff / (1000*60*60*24);
  return days <= 30;
}
function renderStock(){
  const tbody =
    el("stockTableBody");
  if(!tbody) return;
  const totalUnits =
    db.products.reduce(
      (s,p)=>s+Number(p.stock || 0),
      0
    );
  const costValue =
    db.products.reduce(
      (s,p)=>
        s +
        Number(p.stock || 0) *
        Number(p.purchasePrice || 0),
      0
    );
  const retailValue =
    db.products.reduce(
      (s,p)=>
        s +
        Number(p.stock || 0) *
        Number(p.retailPrice || 0),
      0
    );
  const low =
    db.products.filter(
      p=>Number(p.stock) <= Number(p.minStock)
    );
  el("stockProductCount").textContent =
    number(db.products.length);
  el("stockUnitCount").textContent =
    number(totalUnits);
  el("stockCostValue").textContent =
    money(costValue);
  el("stockLowCount").textContent =
    number(low.length);
  if(!db.products.length){
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div>📦</div>
            <h4>Stock မရှိသေးပါ</h4>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML =
    db.products.map(p=>`
      <tr>
        <td>
          <strong>${escapeHTML(p.name)}</strong>
        </td>
        <td>${escapeHTML(p.unit)}</td>
        <td>
          <span class="badge ${
            Number(p.stock) <= Number(p.minStock)
            ? "danger"
            : "success"
          }">
            ${number(p.stock)}
          </span>
        </td>
        <td>
          ${money(
            Number(p.stock) *
            Number(p.purchasePrice)
          )}
        </td>
        <td>
          ${money(
            Number(p.stock) *
            Number(p.retailPrice)
          )}
        </td>
        <td>
          ${
            Number(p.stock) <= 0
            ? `<span class="badge danger">Out</span>`
            : Number(p.stock) <= Number(p.minStock)
            ? `<span class="badge warning">Low</span>`
            : `<span class="badge success">OK</span>`
          }
        </td>
      </tr>
    `).join("");
}
el("stockAdjustmentBtn")?.addEventListener(
  "click",
  stockAdjustment
);
function stockAdjustment(){
  if(!db.products.length){
    showToast(
      "Product မရှိသေးပါ",
      "warning"
    );
    return;
  }
  openModal(
    "Stock Adjustment",
    "လက်ကျန်ပြင်ဆင်ခြင်း",
    `
      <form id="stockAdjustmentForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>Product</label>
            <select name="productId" required>
              ${db.products.map(p=>`
                <option value="${p.id}">
                  ${escapeHTML(p.name)}
                  — လက်ကျန် ${number(p.stock)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Adjustment</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="+10 or -5"
            >
          </div>
          <div class="form-group">
            <label>Reason</label>
            <input
              name="reason"
              placeholder="Damage / Count / Other"
            >
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelAdjustment"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            သိမ်းမည်
          </button>
        </div>
      </form>
    `
  );
  el("cancelAdjustment")?.addEventListener(
    "click",
    closeModal
  );
  el("stockAdjustmentForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form =
        new FormData(event.target);
      const product =
        db.products.find(
          p=>p.id === form.get("productId")
        );
      if(!product) return;
      const amount =
        Number(form.get("amount")) || 0;
      product.stock =
        Math.max(
          0,
          Number(product.stock) + amount
        );
      saveData();
      closeModal();
      renderStock();
      renderProducts();
      renderSalesProducts();
      updateDashboard();
      showToast("Stock ပြင်ဆင်ပြီးပါပြီ");
    }
  );
}
/* =========================================================
   CUSTOMERS
========================================================= */
function customerForm(customer=null){
  const editing = !!customer;
  openModal(
    editing
      ? "Customer ပြင်မည်"
      : "Customer အသစ်",
    "Customer Information",
    `
      <form id="customerForm">
        <div class="form-grid">
          <div class="form-group">
            <label>Name *</label>
            <input
              name="name"
              required
              value="${escapeHTML(customer?.name || "")}"
            >
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value="${escapeHTML(customer?.phone || "")}"
            >
          </div>
          <div class="form-group full">
            <label>Address</label>
            <textarea
              name="address"
            >${escapeHTML(customer?.address || "")}</textarea>
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelCustomer"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            ${editing ? "ပြင်မည်" : "သိမ်းမည်"}
          </button>
        </div>
      </form>
    `
  );
  el("cancelCustomer")?.addEventListener(
    "click",
    closeModal
  );
  el("customerForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form =
        new FormData(event.target);
      const data = {
        name:form.get("name").trim(),
        phone:form.get("phone").trim(),
        address:form.get("address").trim()
      };
      if(!data.name){
        showToast(
          "Customer Name ထည့်ပါ",
          "error"
        );
        return;
      }
      if(editing){
        const index =
          db.customers.findIndex(
            c=>c.id === customer.id
          );
        if(index !== -1){
          db.customers[index] = {
            ...db.customers[index],
            ...data
          };
        }
      }else{
        db.customers.push({
          id:uid("CUS"),
          ...data,
          totalPurchase:0,
          receivable:0,
          createdAt:now()
        });
      }
      saveData();
      closeModal();
      renderCustomers();
      renderDebts();
      updateDashboard();
      showToast(
        editing
        ? "Customer ပြင်ဆင်ပြီးပါပြီ"
        : "Customer ထည့်ပြီးပါပြီ"
      );
    }
  );
}
el("addCustomerBtn")?.addEventListener(
  "click",
  ()=>customerForm()
);
function renderCustomers(){
  const tbody =
    el("customerTableBody");
  if(!tbody) return;
  const search =
    (el("customerSearch")?.value || "")
      .toLowerCase()
      .trim();
  let customers =
    [...db.customers];
  if(search){
    customers =
      customers.filter(c=>
        `${c.name} ${c.phone}`
          .toLowerCase()
          .includes(search)
      );
  }
  el("customerCount").textContent =
    number(db.customers.length);
  el("customerReceivable").textContent =
    money(
      db.customers.reduce(
        (s,c)=>
          s+Number(c.receivable || 0),
        0
      )
    );
  if(!customers.length){
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div>👥</div>
            <h4>Customer မရှိသေးပါ</h4>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML =
    customers.map(c=>`
      <tr>
        <td>
          <strong>${escapeHTML(c.name)}</strong>
        </td>
        <td>${escapeHTML(c.phone || "-")}</td>
        <td>${escapeHTML(c.address || "-")}</td>
        <td>${money(c.totalPurchase || 0)}</td>
        <td>
          <span class="badge ${
            Number(c.receivable || 0) > 0
            ? "warning"
            : "success"
          }">
            ${money(c.receivable || 0)}
          </span>
        </td>
        <td>
          <button
            class="secondary-btn edit-customer"
            data-id="${c.id}"
          >
            Edit
          </button>
        </td>
      </tr>
    `).join("");
  $$(".edit-customer").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        const customer =
          db.customers.find(
            c=>c.id === btn.dataset.id
          );
        if(customer){
          customerForm(customer);
        }
      }
    );
  });
}
/* =========================================================
   SUPPLIERS
========================================================= */
function supplierForm(supplier=null){
  const editing = !!supplier;
  openModal(
    editing
      ? "Supplier ပြင်မည်"
      : "Supplier အသစ်",
    "Supplier Information",
    `
      <form id="supplierForm">
        <div class="form-grid">
          <div class="form-group">
            <label>Supplier Name *</label>
            <input
              name="name"
              required
              value="${escapeHTML(supplier?.name || "")}"
            >
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value="${escapeHTML(supplier?.phone || "")}"
            >
          </div>
          <div class="form-group full">
            <label>Address</label>
            <textarea
              name="address"
            >${escapeHTML(supplier?.address || "")}</textarea>
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelSupplier"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            ${editing ? "ပြင်မည်" : "သိမ်းမည်"}
          </button>
        </div>
      </form>
    `
  );
  el("cancelSupplier")?.addEventListener(
    "click",
    closeModal
  );
  el("supplierForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form =
        new FormData(event.target);
      const data = {
        name:form.get("name").trim(),
        phone:form.get("phone").trim(),
        address:form.get("address").trim()
      };
      if(!data.name){
        showToast(
          "Supplier Name ထည့်ပါ",
          "error"
        );
        return;
      }
      if(editing){
        const index =
          db.suppliers.findIndex(
            s=>s.id === supplier.id
          );
        if(index !== -1){
          db.suppliers[index] = {
            ...db.suppliers[index],
            ...data
          };
        }
      }else{
        db.suppliers.push({
          id:uid("SUP"),
          ...data,
          totalPurchase:0,
          payable:0,
          createdAt:now()
        });
      }
      saveData();
      closeModal();
      renderSuppliers();
      renderProducts();
      updateDashboard();
      showToast(
        editing
        ? "Supplier ပြင်ဆင်ပြီးပါပြီ"
        : "Supplier ထည့်ပြီးပါပြီ"
      );
    }
  );
}
el("addSupplierBtn")?.addEventListener(
  "click",
  ()=>supplierForm()
);
function renderSuppliers(){
  const tbody =
    el("supplierTableBody");
  if(!tbody) return;
  if(!db.suppliers.length){
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div>🚚</div>
            <h4>Supplier မရှိသေးပါ</h4>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML =
    db.suppliers.map(s=>`
      <tr>
        <td>
          <strong>${escapeHTML(s.name)}</strong>
        </td>
        <td>${escapeHTML(s.phone || "-")}</td>
        <td>${escapeHTML(s.address || "-")}</td>
        <td>${money(s.totalPurchase || 0)}</td>
        <td>
          <span class="badge ${
            Number(s.payable || 0) > 0
            ? "warning"
            : "success"
          }">
            ${money(s.payable || 0)}
          </span>
        </td>
        <td>
          <button
            class="secondary-btn edit-supplier"
            data-id="${s.id}"
          >
            Edit
          </button>
        </td>
      </tr>
    `).join("");
  $$(".edit-supplier").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        const supplier =
          db.suppliers.find(
            s=>s.id === btn.dataset.id
          );
        if(supplier){
          supplierForm(supplier);
        }
      }
    );
  });
}
/* =========================================================
   DEBTS
========================================================= */
function renderDebts(){
  const totalReceivable =
    db.customers.reduce(
      (s,c)=>
        s+Number(c.receivable || 0),
      0
    );
  const totalPayable =
    db.suppliers.reduce(
      (s,sup)=>
        s+Number(sup.payable || 0),
      0
    );
  el("totalReceivable").textContent =
    money(totalReceivable);
  el("totalPayable").textContent =
    money(totalPayable);
  const receivableList =
    el("receivableList");
  const payableList =
    el("payableList");
  if(receivableList){
    const customers =
      db.customers.filter(
        c=>Number(c.receivable || 0) > 0
      );
    receivableList.innerHTML =
      customers.length
      ? customers.map(c=>`
        <div class="alert-item warning">
          <div class="alert-icon">👤</div>
          <div style="flex:1">
            <strong>
              ${escapeHTML(c.name)}
            </strong>
            <p>
              ရရန်ရှိ
              ${money(c.receivable)}
            </p>
          </div>
        </div>
      `).join("")
      : `
        <div class="empty-state">
          <div>💰</div>
          <h4>ရရန်ရှိစာရင်း မရှိပါ</h4>
        </div>
      `;
  }
  if(payableList){
    const suppliers =
      db.suppliers.filter(
        s=>Number(s.payable || 0) > 0
      );
    payableList.innerHTML =
      suppliers.length
      ? suppliers.map(s=>`
        <div class="alert-item warning">
          <div class="alert-icon">🚚</div>
          <div style="flex:1">
            <strong>
              ${escapeHTML(s.name)}
            </strong>
            <p>
              ပေးရန်ရှိ
              ${money(s.payable)}
            </p>
          </div>
        </div>
      `).join("")
      : `
        <div class="empty-state">
          <div>💳</div>
          <h4>ပေးရန်ရှိစာရင်း မရှိပါ</h4>
        </div>
      `;
  }
}
/* =========================================================
   EXPENSES
========================================================= */
function expenseForm(){
  openModal(
    "ကုန်ကျစရိတ်ထည့်မည်",
    "Expense Information",
    `
      <form id="expenseForm">
        <div class="form-grid">
          <div class="form-group">
            <label>Category *</label>
            <select name="category" required>
              <option>Rent</option>
              <option>Electricity</option>
              <option>Transportation</option>
              <option>Internet</option>
              <option>Marketing</option>
              <option>Salary</option>
              <option>Maintenance</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Amount *</label>
            <input
              name="amount"
              type="number"
              min="0"
              required
            >
          </div>
          <div class="form-group full">
            <label>Description</label>
            <input
              name="description"
              placeholder="Expense description"
            >
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelExpense"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            သိမ်းမည်
          </button>
        </div>
      </form>
    `
  );
  el("cancelExpense")?.addEventListener(
    "click",
    closeModal
  );
  el("expenseForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form =
        new FormData(event.target);
      db.expenses.push({
        id:uid("EXP"),
        date:now(),
        category:form.get("category"),
        description:
          form.get("description") || "",
        amount:
          Number(form.get("amount")) || 0
      });
      saveData();
      closeModal();
      renderExpenses();
      updateDashboard();
      renderReports();
      showToast(
        "ကုန်ကျစရိတ် သိမ်းပြီးပါပြီ"
      );
    }
  );
}
el("addExpenseBtn")?.addEventListener(
  "click",
  expenseForm
);
function renderExpenses(){
  const tbody =
    el("expenseTableBody");
  if(!tbody) return;
  const expenses =
    [...db.expenses]
      .sort(
        (a,b)=>
          new Date(b.date) -
          new Date(a.date)
      );
  const todayTotal =
    db.expenses
      .filter(e=>sameDay(e.date))
      .reduce(
        (s,e)=>s+Number(e.amount),
        0
      );
  const monthTotal =
    db.expenses
      .filter(e=>sameMonth(e.date))
      .reduce(
        (s,e)=>s+Number(e.amount),
        0
      );
  const yearTotal =
    db.expenses
      .filter(e=>sameYear(e.date))
      .reduce(
        (s,e)=>s+Number(e.amount),
        0
      );
  el("expenseToday").textContent =
    money(todayTotal);
  el("expenseMonth").textContent =
    money(monthTotal);
  el("expenseYear").textContent =
    money(yearTotal);
  if(!expenses.length){
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <div>💸</div>
            <h4>ကုန်ကျစရိတ် မရှိသေးပါ</h4>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML =
    expenses.map(e=>`
      <tr>
        <td>${formatDate(e.date)}</td>
        <td>
          <span class="badge info">
            ${escapeHTML(e.category)}
          </span>
        </td>
        <td>${escapeHTML(e.description || "-")}</td>
        <td>
          <strong>${money(e.amount)}</strong>
        </td>
        <td>
          <button
            class="danger-btn delete-expense"
            data-id="${e.id}"
          >
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  $$(".delete-expense").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        if(
          !confirm("ဒီကုန်ကျစရိတ်ကို ဖျက်မည်မှာ သေချာပါသလား?")
        ) return;
        db.expenses =
          db.expenses.filter(
            e=>e.id !== btn.dataset.id
          );
        saveData();
        renderExpenses();
        updateDashboard();
        renderReports();
        showToast("ဖျက်ပြီးပါပြီ");
      }
    );
  });
}
/* =========================================================
   EMPLOYEES
========================================================= */
function employeeForm(){
  openModal(
    "ဝန်ထမ်းအသစ်",
    "Employee Information",
    `
      <form id="employeeForm">
        <div class="form-grid">
          <div class="form-group">
            <label>Name *</label>
            <input
              name="name"
              required
            >
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input
              name="phone"
            >
          </div>
          <div class="form-group">
            <label>Position</label>
            <input
              name="position"
              placeholder="Cashier / Sales / Manager"
            >
          </div>
          <div class="form-group">
            <label>Salary</label>
            <input
              name="salary"
              type="number"
              min="0"
            >
          </div>
          <div class="form-group">
            <label>Advance</label>
            <input
              name="advance"
              type="number"
              min="0"
            >
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelEmployee"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            သိမ်းမည်
          </button>
        </div>
      </form>
    `
  );
  el("cancelEmployee")?.addEventListener(
    "click",
    closeModal
  );
  el("employeeForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form =
        new FormData(event.target);
      db.employees.push({
        id:uid("EMP"),
        name:form.get("name"),
        phone:form.get("phone") || "",
        position:form.get("position") || "",
        salary:Number(form.get("salary")) || 0,
        advance:Number(form.get("advance")) || 0,
        createdAt:now()
      });
      saveData();
      closeModal();
      renderEmployees();
      showToast(
        "ဝန်ထမ်းထည့်ပြီးပါပြီ"
      );
    }
  );
}
el("addEmployeeBtn")?.addEventListener(
  "click",
  employeeForm
);
function renderEmployees(){
  const tbody =
    el("employeeTableBody");
  if(!tbody) return;
  if(!db.employees.length){
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div>👨‍💼</div>
            <h4>ဝန်ထမ်း မရှိသေးပါ</h4>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML =
    db.employees.map(e=>`
      <tr>
        <td>
          <strong>${escapeHTML(e.name)}</strong>
        </td>
        <td>${escapeHTML(e.phone || "-")}</td>
        <td>${escapeHTML(e.position || "-")}</td>
        <td>${money(e.salary)}</td>
        <td>${money(e.advance)}</td>
        <td>
          <button
            class="danger-btn delete-employee"
            data-id="${e.id}"
          >
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  $$(".delete-employee").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        if(
          !confirm("ဝန်ထမ်းကို ဖျက်မည်မှာ သေချာပါသလား?")
        ) return;
        db.employees =
          db.employees.filter(
            e=>e.id !== btn.dataset.id
          );
        saveData();
        renderEmployees();
        showToast(
          "ဝန်ထမ်းဖျက်ပြီးပါပြီ"
        );
      }
    );
  });
}
/* =========================================================
   REPORTS
========================================================= */
function getPeriodData(period){
  let sales =
    [...db.sales];
  let purchases =
    [...db.purchases];
  let expenses =
    [...db.expenses];
  if(period === "today"){
    sales =
      sales.filter(s=>sameDay(s.date));
    purchases =
      purchases.filter(p=>sameDay(p.date));
    expenses =
      expenses.filter(e=>sameDay(e.date));
  }
  if(period === "month"){
    sales =
      sales.filter(s=>sameMonth(s.date));
    purchases =
      purchases.filter(p=>sameMonth(p.date));
    expenses =
      expenses.filter(e=>sameMonth(e.date));
  }
  if(period === "year"){
    sales =
      sales.filter(s=>sameYear(s.date));
    purchases =
      purchases.filter(p=>sameYear(p.date));
    expenses =
      expenses.filter(e=>sameYear(e.date));
  }
  return {
    sales,
    purchases,
    expenses
  };
}
function renderReports(){
  const period =
    el("reportPeriod")?.value ||
    "today";
  const data =
    getPeriodData(period);
  const sales =
    data.sales.reduce(
      (s,x)=>s+Number(x.total || 0),
      0
    );
  const purchase =
    data.purchases.reduce(
      (s,x)=>s+Number(x.total || 0),
      0
    );
  const expenses =
    data.expenses.reduce(
      (s,x)=>s+Number(x.amount || 0),
      0
    );
  const grossProfit =
    data.sales.reduce(
      (s,x)=>s+Number(x.profit || 0),
      0
    );
  const netProfit =
    grossProfit -
    expenses;
  el("reportSales").textContent =
    money(sales);
  el("reportPurchase").textContent =
    money(purchase);
  el("reportExpenses").textContent =
    money(expenses);
  el("reportProfit").textContent =
    money(netProfit);
  el("salesReportSummary").innerHTML = `
    <div style="padding:17px">
      <div style="
        display:flex;
        justify-content:space-between;
        padding:10px 0;
        border-bottom:1px solid #f1f5f9;
        font-size:11px;
      ">
        <span>Sales Invoices</span>
        <strong>
          ${number(data.sales.length)}
        </strong>
      </div>
      <div style="
        display:flex;
        justify-content:space-between;
        padding:10px 0;
        border-bottom:1px solid #f1f5f9;
        font-size:11px;
      ">
        <span>Sales Revenue</span>
        <strong>
          ${money(sales)}
        </strong>
      </div>
      <div style="
        display:flex;
        justify-content:space-between;
        padding:10px 0;
        font-size:11px;
      ">
        <span>Gross Profit</span>
        <strong style="color:#16a34a">
          ${money(grossProfit)}
        </strong>
      </div>
    </div>
  `;
  el("profitReportSummary").innerHTML = `
    <div style="padding:17px">
      <div style="
        display:flex;
        justify-content:space-between;
        padding:10px 0;
        border-bottom:1px solid #f1f5f9;
        font-size:11px;
      ">
        <span>Gross Profit</span>
        <strong>
          ${money(grossProfit)}
        </strong>
      </div>
      <div style="
        display:flex;
        justify-content:space-between;
        padding:10px 0;
        border-bottom:1px solid #f1f5f9;
        font-size:11px;
      ">
        <span>Operating Expenses</span>
        <strong style="color:#dc2626">
          ${money(expenses)}
        </strong>
      </div>
      <div style="
        display:flex;
        justify-content:space-between;
        padding:12px 0;
        font-size:14px;
      ">
        <strong>Net Profit</strong>
        <strong style="
          color:${netProfit >= 0 ? "#16a34a" : "#dc2626"}
        ">
          ${money(netProfit)}
        </strong>
      </div>
    </div>
  `;
}
el("reportPeriod")?.addEventListener(
  "change",
  renderReports
);
/* =========================================================
   SETTINGS
========================================================= */
function shopSettings(){
  openModal(
    "ဆိုင်အချက်အလက်",
    "Shop Information",
    `
      <form id="shopForm">
        <div class="form-grid">
          <div class="form-group full">
            <label>ဆိုင်အမည် *</label>
            <input
              name="shopName"
              required
              value="${escapeHTML(db.settings.shopName)}"
            >
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value="${escapeHTML(db.settings.phone)}"
            >
          </div>
          <div class="form-group">
            <label>Currency</label>
            <input
              name="currency"
              value="${escapeHTML(db.settings.currency)}"
            >
          </div>
          <div class="form-group full">
            <label>Address</label>
            <textarea
              name="address"
            >${escapeHTML(db.settings.address)}</textarea>
          </div>
          <div class="form-group full">
            <label>Receipt Footer</label>
            <input
              name="footer"
              value="${escapeHTML(db.settings.footer)}"
            >
          </div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="secondary-btn"
            id="cancelShopSettings"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="primary-btn"
          >
            သိမ်းမည်
          </button>
        </div>
      </form>
    `
  );
  el("cancelShopSettings")?.addEventListener(
    "click",
    closeModal
  );
  el("shopForm")?.addEventListener(
    "submit",
    event=>{
      event.preventDefault();
      const form =
        new FormData(event.target);
      db.settings.shopName =
        form.get("shopName").trim() ||
        "Aung Shop";
      db.settings.phone =
        form.get("phone").trim();
      db.settings.address =
        form.get("address").trim();
      db.settings.currency =
        form.get("currency").trim() ||
        "Ks";
      db.settings.footer =
        form.get("footer").trim();
      saveData();
      closeModal();
      updateDashboard();
      showToast(
        "ဆိုင်အချက်အလက် သိမ်းပြီးပါပြီ"
      );
    }
  );
}
el("shopSettingsBtn")?.addEventListener(
  "click",
  shopSettings
);
/* =========================================================
   RECEIPT SETTINGS
========================================================= */
el("receiptSettingsBtn")?.addEventListener(
  "click",
  shopSettings
);
/* =========================================================
   USER SETTINGS
========================================================= */
el("userSettingsBtn")?.addEventListener(
  "click",
  ()=>{
    openModal(
      "User Management",
      "V1.0 Owner Account",
      `
        <div class="settings-card">
          <div class="settings-icon">👤</div>
          <div>
            <h3>Owner</h3>
            <p>
              Full Access
            </p>
          </div>
          <span class="badge success">
            Active
          </span>
        </div>
        <div style="
          margin-top:15px;
          padding:14px;
          background:#eff6ff;
          border-radius:10px;
          color:#1e40af;
          font-size:11px;
        ">
          V1.0 တွင် Owner Account တစ်ခုဖြင့်
          စတင်အသုံးပြုနိုင်ပါသည်။
          <br><br>
          နောက်ထပ် Upgrade တွင်
          Admin / Manager / Cashier /
          Stock Staff နှင့်
          Account 5 ခုအထိ ထည့်သွင်းနိုင်ပါမည်။
        </div>
      `
    );
  }
);
/* =========================================================
   BACKUP / RESTORE
========================================================= */
el("backupBtn")?.addEventListener(
  "click",
  backupData
);
function backupData(){
  const backup = {
    app:"Aung POS",
    version:"1.0",
    exportedAt:now(),
    data:db
  };
  const blob =
    new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        )
      ],
      {
        type:"application/json"
      }
    );
  const url =
    URL.createObjectURL(blob);
  const a =
    document.createElement("a");
  a.href = url;
  a.download =
    `aung-pos-backup-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(
    "Backup File ထုတ်ပြီးပါပြီ"
  );
}
/* =========================================================
   CLEAR DATA
========================================================= */
el("clearDataBtn")?.addEventListener(
  "click",
  ()=>{
    const answer =
      prompt(
        "Data အားလုံးဖျက်ရန် DELETE ဟု ရိုက်ပါ"
      );
    if(answer !== "DELETE"){
      showToast(
        "Data မဖျက်ပါ",
        "warning"
      );
      return;
    }
    db =
      structuredClone(DEFAULT_DATA);
    saveData();
    renderAll();
    showToast(
      "Data အားလုံးဖျက်ပြီးပါပြီ",
      "warning"
    );
  }
);
/* =========================================================
   SEARCH / FILTER EVENTS
========================================================= */
el("productSearch")?.addEventListener(
  "input",
  renderProducts
);
el("productCategoryFilter")?.addEventListener(
  "change",
  renderProducts
);
el("stockFilter")?.addEventListener(
  "change",
  renderProducts
);
el("salesSearch")?.addEventListener(
  "input",
  renderSalesProducts
);
el("salesCategory")?.addEventListener(
  "change",
  renderSalesProducts
);
el("customerSearch")?.addEventListener(
  "input",
  renderCustomers
);
/* =========================================================
   DATE FORMAT
========================================================= */
function formatDate(date){
  if(!date) return "-";
  const d = new Date(date);
  if(Number.isNaN(d.getTime())){
    return String(date).slice(0,10);
  }
  return [
    String(d.getDate()).padStart(2,"0"),
    String(d.getMonth()+1).padStart(2,"0"),
    d.getFullYear()
  ].join("/");
}
function formatDateTime(date){
  if(!date) return "-";
  const d = new Date(date);
  return (
    formatDate(date) +
    " " +
    String(d.getHours()).padStart(2,"0") +
    ":" +
    String(d.getMinutes()).padStart(2,"0")
  );
}
/* =========================================================
   REFRESH
========================================================= */
function refreshPage(page){
  switch(page){
    case "dashboard":
      updateDashboard();
      break;
    case "sales":
      renderSalesProducts();
      renderCart();
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
function renderAll(){
  updateProductCategoryFilters();
  updateDashboard();
  renderSalesProducts();
  renderCart();
  renderProducts();
  renderPurchases();
  renderStock();
  renderCustomers();
  renderSuppliers();
  renderDebts();
  renderExpenses();
  renderEmployees();
  renderReports();
}
/* =========================================================
   NEW SALE
========================================================= */
el("newSaleBtn")?.addEventListener(
  "click",
  ()=>{
    clearCart();
    showPage("sales");
    showToast(
      "အရောင်းအသစ် စတင်နိုင်ပါပြီ"
    );
  }
);
/* =========================================================
   INITIALIZE
========================================================= */
document.addEventListener(
  "DOMContentLoaded",
  ()=>{
    renderAll();
    showPage("dashboard");
  }
);
/* =========================================================
   GLOBAL ERROR SAFETY
========================================================= */
window.addEventListener(
  "error",
  event=>{
    console.error(
      "Aung POS Error:",
      event.error || event.message
    );
  }
);
/* =========================================================
   DEBUG
========================================================= */
window.AungPOS = {
  getData:()=>db,
  save:saveData,
  reset:()=>{
    db =
      structuredClone(DEFAULT_DATA);
    saveData();
    renderAll();
  },
  showPage,
  money
};
