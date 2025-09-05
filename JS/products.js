// ====== CONFIG ======
const API_BASE = "http://localhost:3002/api/products";

// ====== DOM ======
const productForm = document.getElementById("productForm");
const productIdEl = document.getElementById("productId"); // hidden
const nameEl = document.getElementById("name");
const qtyEl = document.getElementById("quantity");
const purchaseEl = document.getElementById("purchase_price");
const saleEl = document.getElementById("sale_price");

const productsTbody = document.querySelector("#productsTable tbody");
const totalPurchaseEl = document.getElementById("totalPurchase");
const totalSaleEl = document.getElementById("totalSale");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

// 🔍 Search box
const searchInput = document.getElementById("searchInput");

// ====== HELPERS ======
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clearForm() {
  productIdEl.value = "";
  nameEl.value = "";
  qtyEl.value = "";
  purchaseEl.value = "";
  saleEl.value = "";
  formTitle.textContent = "➕ Add Product";
  if (cancelBtn) cancelBtn.style.display = "none";
}

function fillForm(product) {
  productIdEl.value = product.id;
  nameEl.value = product.name || "";
  qtyEl.value = product.quantity ?? 0;
  purchaseEl.value = product.purchase_price ?? "";
  saleEl.value = product.sale_price ?? "";
  formTitle.textContent = `✏️ Edit Product — ${product.name}`;
  if (cancelBtn) cancelBtn.style.display = "inline-block";
}

function showError(msg) {
  alert(msg);
}

// ====== RENDER ======
let allProducts = []; // store full list for searching

function renderProducts(list) {
  productsTbody.innerHTML = "";
  let totalPurchase = 0;
  let totalSale = 0;

  if (!Array.isArray(list)) list = [];

  list.forEach(p => {
    const tr = document.createElement("tr");

    const pid = p.id ?? "";
    const pname = p.name ?? "";
    const pqty = toNumber(p.quantity);
    const ppurchase = toNumber(p.purchase_price);
    const psale = toNumber(p.sale_price);

    totalPurchase += ppurchase * pqty;
    totalSale += psale * pqty;

    tr.innerHTML = `
      <td>${pid}</td>
      <td>${escapeHtml(pname)}</td>
      <td>${pqty}</td>
      <td>${ppurchase.toFixed(2)}</td>
      <td>${psale.toFixed(2)}</td>
      <td class="actions">
        <button data-action="edit" data-id="${pid}" class="edit-btn">Edit</button>
        <button data-action="delete" data-id="${pid}" class="delete-btn">Delete</button>
      </td>
    `;

    tr.querySelector('[data-action="edit"]').addEventListener("click", () => {
      fillForm(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    tr.querySelector('[data-action="delete"]').addEventListener("click", async () => {
      const ok = confirm(`Delete product "${pname}" (ID ${pid})?`);
      if (!ok) return;
      try {
        const res = await fetch(`${API_BASE}/${pid}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(()=>({error:"Delete failed"}));
          showError(err.error || "Delete failed");
        } else {
          await loadProducts();
          clearForm();
        }
      } catch (err) {
        console.error(err);
        showError("Delete request failed.");
      }
    });

    productsTbody.appendChild(tr);
  });

  totalPurchaseEl.textContent = totalPurchase.toFixed(2);
  totalSaleEl.textContent = totalSale.toFixed(2);
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
    })[s];
  });
}

// ====== API ======
async function loadProducts() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    allProducts = data; // save full list
    renderProducts(allProducts);
  } catch (err) {
    console.error(err);
    showError("Could not load products. Check server.");
  }
}

async function createProduct(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res;
}

async function editProduct(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res;
}

// ====== EVENTS ======
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = productIdEl.value;
  const payload = {
    name: String(nameEl.value || "").trim(),
    quantity: Math.max(0, toNumber(qtyEl.value)),
    purchase_price: toNumber(purchaseEl.value),
    sale_price: toNumber(saleEl.value)
  };

  if (!payload.name) {
    showError("Product name required.");
    return;
  }

  try {
    if (id) {
      const res = await editProduct(id, payload);
      const body = await res.json().catch(()=>null);
      if (!res.ok) {
        showError(body?.error || "Update failed");
        return;
      }
    } else {
      const res = await createProduct(payload);
      const body = await res.json().catch(()=>null);
      if (!res.ok) {
        showError(body?.error || "Create failed");
        return;
      }
    }

    await loadProducts();
    clearForm();
  } catch (err) {
    console.error(err);
    showError("Request failed. See console.");
  }
});

if (cancelBtn) {
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearForm();
  });
}

// ====== SEARCH FEATURE ======
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase().trim();
    if (!term) {
      renderProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p =>
        String(p.name).toLowerCase().includes(term)
      );
      renderProducts(filtered);
    }
  });
}

// initial load
loadProducts();
