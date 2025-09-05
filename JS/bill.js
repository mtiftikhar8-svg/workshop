let products = [];
let cart = [];

const API_PRODUCTS = "http://localhost:3002/api/products";
const API_SALES = "http://localhost:3002/api/sales";

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
function renderProducts(productsToRender = products) {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  productsToRender.forEach((p) => {
    // Calculate available stock
    const cartItem = cart.find((c) => c.id === p.id);
    const originalProduct = products.find((prod) => prod.id === p.id);
    const availableStock = originalProduct.quantity - (cartItem?.quantity || 0);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td id="stock-${p.id}">${availableStock}</td>
      <td>${p.sale_price}</td>
      <td><button class="addBtn" ${
        availableStock <= 0 ? "disabled" : ""
      }>Add</button></td>
    `;
    container.appendChild(tr);

    tr.querySelector(".addBtn")?.addEventListener("click", () => addToCart(p));
  });
}

// Add product to cart
async function addToCart(product) {
  const cartItem = cart.find((c) => c.id === product.id);
  const cartQuantity = cartItem?.quantity || 0;
  const availableStock = product.quantity - cartQuantity;

  if (availableStock <= 0) {
    alert("Out of stock!");
    return;
  }

  // Don't update backend stock here - only update when bill is printed
  // Just update the cart array
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

  cart.forEach((item) => {
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
      // Don't restore stock in backend since we didn't decrease it when adding
      cart = cart.filter((c) => c.id !== item.id);
      renderCart();
      renderProducts();
    });

    // Editable cells
    row.querySelectorAll("[contenteditable]").forEach((cell) => {
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const field = cell.dataset.field;
          const newVal = parseFloat(cell.innerText);
          if (isNaN(newVal) || newVal <= 0) {
            cell.innerText = item[field];
            return;
          }

          if (field === "quantity") {
            const cartQuantity = newVal;
            const availableStock = products.find(
              (p) => p.id === item.id
            ).quantity;

            if (cartQuantity > availableStock) {
              alert("Not enough stock available!");
              cell.innerText = item.quantity;
              return;
            }

            // Don't update backend stock - just update cart quantity
            item.quantity = newVal;
            renderCart();
            renderProducts();
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
document.getElementById("searchProduct").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = products.filter((p) => p.name.toLowerCase().includes(term));
  renderProducts(filtered);
});

// Print bill & checkout
document.getElementById("printBill").addEventListener("click", async () => {
  if (!cart.length) return alert("Cart is empty!");

  const customerName =
    document.getElementById("customerName").value || "Unknown";
  // const date = new Date().toLocaleDateString();
  const date = new Date().toISOString().split('T')[0];  // YYYY-MM-DD format


  // Print HTML
  let html = `<h3>Customer: ${customerName}</h3><p>Date: ${date}</p>
              <table border="1" width="100%" cellspacing="0">
              <tr><th>Name</th><th>Qty</th><th>Price</th><th>Total</th></tr>`;

  cart.forEach((item) => {
    html += `<tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.sale_price}</td>
      <td>${item.quantity * item.sale_price}</td>
    </tr>`;
  });

  html += `</table><p>Subtotal: Rs. ${cart.reduce(
    (acc, i) => acc + i.quantity * i.sale_price,
    0
  )}</p>`;

  const win = window.open("", "", "width=600,height=800");
    win.document.write(`
      <html><head><title>Bill</title></head><body>${html}</body></html>
    `);
  win.document.close();
  win.print();

  // Record sales and update stock with error handling
  let allSuccess = true;
  for (const item of cart) {
    try {
      // Decrease stock in backend when sale is finalized
      const stockRes = await fetch(`${API_PRODUCTS}/${item.id}/decrease`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.quantity }),
      });
      if (!stockRes.ok) throw new Error("Failed to update stock for " + item.name);

      // Record the sale
      const saleRes = await fetch(API_SALES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: item.id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          date: date,
        }),
      });
      if (!saleRes.ok) throw new Error("Failed to record sale for " + item.name);
    } catch (err) {
      allSuccess = false;
      console.error(err);
      alert("Error: " + err.message);
    }
  }

  if (allSuccess) {
    cart = [];
    renderCart();
    await loadBillProducts();
  } else {
    alert("Some sales or stock updates failed. Please check and retry.");
  }
});

// Initial load
loadBillProducts();