async function loadLoans() {
  const res = await fetch("http://localhost:3002/api/loan");
  const loans = await res.json();

  const customerTbody = document.querySelector("#customerLoanTable tbody");
  const myTbody = document.querySelector("#myLoanTable tbody");
  customerTbody.innerHTML = "";
  myTbody.innerHTML = "";

  let customerTotal = 0;
  let myTotal = 0;

  loans.forEach(loan => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${loan.name}</td>
      <td contenteditable="true">${loan.amount}</td>
      <td contenteditable="true">${loan.received_by || '-'}</td>
      <td>${loan.date}</td>
      <td><button class="deleteBtn">Delete</button></td>
    `;

    // ✅ Delete button
    row.querySelector(".deleteBtn").addEventListener("click", async () => {
      await fetch(`http://localhost:3002/api/loan/${loan.id}`, { method: "DELETE" });
      loadLoans();
    });

    // ✅ Append to correct table
    if (loan.type === "customer") {
      customerTbody.appendChild(row);
      customerTotal += parseFloat(loan.amount);
    } else {
      myTbody.appendChild(row);
      myTotal += parseFloat(loan.amount);
    }
  });

  // ✅ Update totals
  document.getElementById("customerTotal").innerText = `Total Customers Owe Me: ${customerTotal}`;
  document.getElementById("myTotal").innerText = `Total I Owe: ${myTotal}`;

  // ✅ Update net status
  const net = customerTotal - myTotal;
  const statusEl = document.getElementById("loanStatus");

  if (net > 0) {
    statusEl.innerText = `Status: You are in Profit (Net ${net})`;
    statusEl.style.color = "green";
  } else if (net < 0) {
    statusEl.innerText = `Status: You are in Loss (Net ${net})`;
    statusEl.style.color = "red";
  } else {
    statusEl.innerText = `Status: Balanced`;
    statusEl.style.color = "blue";
  }
}

// ✅ Add customer loan
document.getElementById("customerLoanForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("customerName").value;
  const amount = parseFloat(document.getElementById("customerAmount").value);
  const received_by = document.getElementById("customerReceivedBy").value;
  const date = new Date().toISOString().split('T')[0];

  await fetch("http://localhost:3002/api/loan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "customer", name, amount, received_by, date })
  });

  document.getElementById("customerLoanForm").reset();
  loadLoans();
});

// ✅ Add my loan
document.getElementById("myLoanForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("myLoanName").value;
  const amount = parseFloat(document.getElementById("myLoanAmount").value);
  const received_by = document.getElementById("myLoanReceivedBy").value;
  const date = new Date().toISOString().split('T')[0];

  await fetch("http://localhost:3002/api/loan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "myloan", name, amount, received_by, date })
  });

  document.getElementById("myLoanForm").reset();
  loadLoans();
});

// ✅ Initial load
loadLoans();
