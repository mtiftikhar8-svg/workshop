let products = [];
let cart = [];

const API_PRODUCTS = "http://localhost:3000/api/products";
const API_SALES = "http://localhost:3000/api/sales";

// Load products from backend
async function loadBillProducts() {
  try {
    const res = await fetch(API_PRODUCTS);
    products = await res.json();
    renderProducts();
  } catch (err) {
    console.error(err);
    alert("Failed to load products from backend.");
  }
}

// Render products table
function renderProducts() {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  products.forEach(p => {
    // Calculate available stock
    const cartItem = cart.find(c => c.id === p.id);
    const availableStock = p.quantity - (cartItem?.quantity || 0);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td id="stock-${p.id}">${availableStock}</td>
      <td>${p.sale_price}</td>
      <td><button class="addBtn" ${availableStock <= 0 ? 'disabled' : ''}>Add</button></td>
    `;
    container.appendChild(tr);

    tr.querySelector(".addBtn")?.addEventListener("click", () => addToCart(p));
  });
}

// Add product to cart
async function addToCart(product) {
  const cartItem = cart.find(c => c.id === product.id);
  const availableStock = product.quantity - (cartItem?.quantity || 0);

  if (availableStock <= 0) {
    alert("Out of stock!");
    return;
  }

  // Update backend stock
  const res = await fetch(`${API_PRODUCTS}/${product.id}/decrease`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: 1 })
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Failed to update stock in backend!");
    return;
  }

  // Update cart array
  if (cartItem) cartItem.quantity++;
  else cart.push({ ...product, quantity: 1 });

  renderCart();
  renderProducts();
}

// Render cart table
function renderCart() {
  const tbody = document.getElementById("cartBody");
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const row = document.createElement("tr");
    const rowTotal = item.quantity * item.sale_price;
    total += rowTotal;

    row.innerHTML = `
      <td>${item.name}</td>
      <td contenteditable="true" data-field="quantity">${item.quantity}</td>
      <td contenteditable="true" data-field="sale_price">${item.sale_price}</td>
      <td>${rowTotal}</td>
      <td><button class="removeBtn">❌</button></td>
    `;

    // Remove button
    row.querySelector(".removeBtn").addEventListener("click", async () => {
      // Restore stock in backend
      await fetch(`${API_PRODUCTS}/${item.id}/increase`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.quantity })
      });

      cart = cart.filter(c => c.id !== item.id);
      renderCart();
      renderProducts();
    });

    // Editable cells
    row.querySelectorAll("[contenteditable]").forEach(cell => {
      cell.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          const field = cell.dataset.field;
          const newVal = parseFloat(cell.innerText);
          if (isNaN(newVal) || newVal <= 0) {
            cell.innerText = item[field];
            return;
          }

          if (field === "quantity") {
            const diff = newVal - item.quantity;
            if (diff > 0) {
              // Increase quantity => decrease stock
              fetch(`${API_PRODUCTS}/${item.id}/decrease`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: diff })
              }).then(async res => {
                if (res.ok) {
                  item.quantity = newVal;
                  renderCart();
                  renderProducts();
                } else {
                  const err = await res.json();
                  alert(err.error || "Not enough stock!");
                  renderCart();
                }
              });
            } else if (diff < 0) {
              // Decrease quantity => increase stock
              fetch(`${API_PRODUCTS}/${item.id}/increase`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: -diff })
              }).then(() => {
                item.quantity = newVal;
                renderCart();
                renderProducts();
              });
            }
          } else if (field === "sale_price") {
            item.sale_price = newVal;
            renderCart();
          }
        }
      });
    });

    tbody.appendChild(row);
  });

  document.getElementById("cartTotal").innerText = total.toFixed(2);
}

// Search products
document.getElementById("searchProduct").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(term));
  renderProducts(filtered);
});

// Print bill & checkout
document.getElementById("printBill").addEventListener("click", async () => {
  if (!cart.length) return alert("Cart is empty!");

  const customerName = document.getElementById("customerName").value || "Unknown";
  const date = new Date().toLocaleDateString();

  // Print HTML
  let html = `<h3>Customer: ${customerName}</h3><p>Date: ${date}</p>
              <table border="1" width="100%" cellspacing="0">
              <tr><th>Name</th><th>Qty</th><th>Price</th><th>Total</th></tr>`;

  cart.forEach(item => {
    html += `<tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.sale_price}</td>
      <td>${item.quantity * item.sale_price}</td>
    </tr>`;
  });

  html += `</table><p>Subtotal: Rs. ${cart.reduce((acc,i)=>acc+i.quantity*i.sale_price,0)}</p>`;

  const win = window.open("", "", "width=600,height=800");
  win.document.write(`<html><head><title>Bill</title></head><body>${html}</body></html>`);
  win.document.close();
  win.print();

  // Record sales
  for (const item of cart) {
    await fetch(API_SALES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: item.id,
        quantity: item.quantity,
        sale_price: item.sale_price,
        date: date
      })
    });
  }

  // Clear cart after print
  cart = [];
  renderCart();
  renderProducts();
});

// Initial load
loadBillProducts();
