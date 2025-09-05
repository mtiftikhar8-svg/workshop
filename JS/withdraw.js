async function loadWithdraws() {
  const res = await fetch("http://localhost:3002/api/withdraw");
  const withdraws = await res.json();

  const tbody = document.querySelector("#withdrawTable tbody");
  tbody.innerHTML = "";

  let totalWithdrawn = 0;
  withdraws.forEach(w => {
    totalWithdrawn += parseFloat(w.amount);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td contenteditable="true">${w.name}</td>
      <td contenteditable="true">${w.amount}</td>
      <td><input type="date" value="${w.date}"></td>
      <td><button class="deleteBtn">Delete</button></td>
    `;

    row.querySelector(".deleteBtn").addEventListener("click", async () => {
      await fetch(`http://localhost:3002/api/withdraw/${w.id}`, { method: "DELETE" });
      loadWithdraws();
    });

    tbody.appendChild(row);
  });

  // ✅ Step 1: Show total withdrawn
  document.getElementById("totalWithdrawn").innerText = `Total Withdrawn: ${totalWithdrawn}`;

  // ✅ Step 2: Fetch total revenue from sales
  const salesRes = await fetch("http://localhost:3002/api/sales");
  const sales = await salesRes.json();
  let totalRevenue = 0;
  sales.forEach(s => {
    totalRevenue += parseFloat(s.revenue || 0);
  });

  // ✅ Step 3: Calculate cash balance
  const cashBalance = totalRevenue - totalWithdrawn;
  document.getElementById("cashBalance").innerText = `Cash Balance: ${cashBalance}`;
}

document.getElementById("withdrawForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("withdrawName").value;
  const amount = parseFloat(document.getElementById("withdrawAmount").value);
  const date = document.getElementById("withdrawDate").value;

  await fetch("http://localhost:3002/api/withdraw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, amount, date })
  });

  document.getElementById("withdrawForm").reset();
  loadWithdraws();
});

// Initial load
loadWithdraws();
