// Load today's revenue & profit
async function loadTodayReport() {
  try {
    const res = await fetch("http://localhost:3002/api/report/daily");
    const data = await res.json();

    document.getElementById("todayRevenue").innerText = (data.revenue || 0).toFixed(2);
    document.getElementById("todayProfit").innerText = (data.profit || 0).toFixed(2);
  } catch (err) {
    console.error("Error loading today report:", err);
    alert("Failed to load today's report.");
  }
}

// Search report by date
async function searchByDate() {
  const date = document.getElementById("date").value;
  if (!date) return alert("Please select a date");

  try {
    const res = await fetch(`http://localhost:3002/api/report/daily?date=${date}`);
    const data = await res.json();

    if (!data || !data.date) {
      renderReportTable([]);
      return;
    }

    renderReportTable([{ date: data.date, revenue: data.revenue, profit: data.profit }]);
  } catch (err) {
    console.error("Error searching by date:", err);
    alert("Failed to fetch report for the selected date.");
  }
}

// Search report by month
async function searchByMonth() {
  const month = document.getElementById("month").value;
  const year = document.getElementById("year").value;
  if (!month || !year) return alert("Please select month and year");

  try {
    const res = await fetch(`http://localhost:3002/api/report/monthly?month=${month}&year=${year}`);
    const data = await res.json();

    renderReportTable(data); // ✅ ab hamesha array milega
  } catch (err) {
    console.error("Error searching by month:", err);
    alert("Failed to fetch report for the selected month.");
  }
}

// Render data inside table
function renderReportTable(rows) {
  const tbody = document.getElementById("reportBody");
  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3">No data found</td></tr>`;
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.date}</td>
      <td>${Number(row.revenue || 0).toFixed(2)}</td>
      <td>${Number(row.profit || 0).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Initial load
loadTodayReport();
