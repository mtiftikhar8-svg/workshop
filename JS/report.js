async function loadDailyReport(date) {
  const url = date ? `http://localhost:3000/api/report/daily?date=${date}` : "http://localhost:3000/api/report/daily";
  const res = await fetch(url);
  const data = await res.json();

  document.getElementById("dailyRevenue").innerText = `Revenue: ${data.revenue}`;
  document.getElementById("dailyProfit").innerText = `Profit: ${data.profit}`;
  document.getElementById("reportDate").innerText = `Date: ${data.date}`;
}

async function loadMonthlyReport(month, year) {
  const res = await fetch(`http://localhost:3000/api/report/monthly?month=${month}&year=${year}`);
  const data = await res.json();

  document.getElementById("monthlyRevenue").innerText = `Revenue: ${data.revenue}`;
  document.getElementById("monthlyProfit").innerText = `Profit: ${data.profit}`;
  document.getElementById("reportMonth").innerText = `Month: ${month}/${year}`;
}

async function loadTotalReport() {
  const res = await fetch("http://localhost:3000/api/report/total");
  const data = await res.json();

  document.getElementById("totalRevenue").innerText = `Total Revenue: ${data.revenue}`;
  document.getElementById("totalProfit").innerText = `Total Profit: ${data.profit}`;
}

// Event listeners for daily/monthly search
document.getElementById("dailySearchBtn").addEventListener("click", () => {
  const date = document.getElementById("dailyDate").value;
  loadDailyReport(date);
});

document.getElementById("monthlySearchBtn").addEventListener("click", () => {
  const month = document.getElementById("monthlyMonth").value;
  const year = document.getElementById("monthlyYear").value;
  loadMonthlyReport(month, year);
});

// Initial load
loadDailyReport();
loadMonthlyReport(new Date().getMonth()+1, new Date().getFullYear());
loadTotalReport();
