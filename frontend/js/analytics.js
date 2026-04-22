let weeklyChart, monthlyChart;

document.addEventListener('DOMContentLoaded', loadAnalytics);

async function loadAnalytics() {
  try {
    const data = await api.get('/analytics', {
      merchant_id: api.getMerchantId()
    });

    console.log("ANALYTICS DATA:", data);

    // 🔥 SAFE VALUES (NO toFixed ERRORS)
    const todayRevenue = Number(data?.todayRevenue || 0);
    const weeklyRevenue = Number(data?.weeklyRevenue || 0);
    const monthlyRevenue = Number(data?.monthlyRevenue || 0);

    setText('today-revenue', `₹${todayRevenue.toFixed(2)}`);
    setText('weekly-revenue', `₹${weeklyRevenue.toFixed(2)}`);
    setText('monthly-revenue', `₹${monthlyRevenue.toFixed(2)}`);

    // ================= WEEKLY =================
    const weeklyRows = Array.isArray(data?.weeklyRows)
      ? data.weeklyRows
      : [];

    const wLabels = weeklyRows.map(r => r.day || '-');
    const wValues = weeklyRows.map(r => Number(r.revenue || 0));

    if (weeklyChart) weeklyChart.destroy();

    weeklyChart = new Chart(
      document.getElementById('weekly-chart'),
      {
        type: 'bar',
        data: {
          labels: wLabels.length ? wLabels : ['No Data'],
          datasets: [{
            label: 'Daily Revenue (₹)',
            data: wValues.length ? wValues : [0],
            backgroundColor: '#4f46e5',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      }
    );

    // ================= MONTHLY =================
    const monthlyRows = Array.isArray(data?.monthlyRows)
      ? data.monthlyRows
      : [];

    const mLabels = monthlyRows.map(r => r.month || '-');
    const mValues = monthlyRows.map(r => Number(r.revenue || 0));

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(
      document.getElementById('monthly-chart'),
      {
        type: 'line',
        data: {
          labels: mLabels.length ? mLabels : ['No Data'],
          datasets: [{
            label: 'Monthly Revenue (₹)',
            data: mValues.length ? mValues : [0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.15)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      }
    );

  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    setText('analytics-error', err.message);
  }
}


/* ================= SAFE TEXT ================= */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}