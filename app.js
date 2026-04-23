let data = {};
let currentData = [];
let originalData = [];
let chart, waterfallChart;

function login(){
  if(document.getElementById("user").value==="admin" &&
     document.getElementById("pass").value==="1234"){
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    init();
  }
}

async function init(){
  const res = await fetch('data.json');
  data = await res.json();
  loadView('channel');
}

function loadView(type){
  currentData = data[type];
  originalData = [...currentData];
  document.getElementById("title").innerText = "Sales by " + type;
  populateFilter();
  renderAll();
}

function populateFilter(){
  let d = document.getElementById("filterDropdown");
  d.innerHTML = '<option value="all">All</option>';
  originalData.forEach(x=> d.innerHTML += `<option>${x.name}</option>`);
}

function applyFilter(){
  let val = document.getElementById("filterDropdown").value;
  currentData = val==="all" ? [...originalData] : originalData.filter(d=>d.name===val);
  renderAll();
}

function resetFilter(){
  currentData = [...originalData];
  renderAll();
}

function renderTable(){
  let html = "<tr><th>Name</th><th>Sales</th><th>Cost</th><th>GM%</th></tr>";
  currentData.forEach(d=>{
    html += `<tr><td>${d.name}</td><td>${d.sales}</td><td>${d.cost}</td><td>${d.gm}</td></tr>`;
  });
  document.getElementById("table").innerHTML = html;
}

function renderKPIs(){
  let sales = currentData.reduce((a,b)=>a+b.sales,0);
  let cost = currentData.reduce((a,b)=>a+b.cost,0);
  let gm = ((sales-cost)/sales*100).toFixed(2);

  document.getElementById("kpis").innerHTML = `
    <div class="card"><b>${sales}</b><br>Sales</div>
    <div class="card"><b>${cost}</b><br>Cost</div>
    <div class="card"><b>${(sales-cost)}</b><br>Margin</div>
    <div class="card"><b>${gm}%</b><br>GM%</div>
  `;
}

function renderChart(){
  if(chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"),{
    type:'bar',
    data:{
      labels: currentData.map(d=>d.name),
      datasets:[{ data: currentData.map(d=>d.sales) }]
    }
  });
}

function renderWaterfall(){
  let s = currentData.reduce((a,b)=>a+b.sales,0);
  let c = currentData.reduce((a,b)=>a+b.cost,0);

  let trade = s*0.2;
  let cogs = c*0.6;
  let log = c*0.2;
  let mkt = c*0.2;

  let vals = [s, -trade, s-trade, -cogs, -log, -mkt, s-trade-cogs-log-mkt];

  if(waterfallChart) waterfallChart.destroy();
  waterfallChart = new Chart(document.getElementById("waterfallChart"),{
    type:'bar',
    data:{ labels:["Gross","Trade","Net","COGS","Log","Mkt","Margin"], datasets:[{data:vals}] }
  });
}

function generateInsights(){
  let best = currentData.reduce((a,b)=>a.sales>b.sales?a:b);
  document.getElementById("insights").innerHTML = `<li>Top performer: ${best.name}</li>`;
}

function askAI(){
  let q = document.getElementById("userInput").value;
  let box = document.getElementById("chatBox");
  box.innerHTML += `<div>You: ${q}</div>`;
  box.innerHTML += `<div><b>AI:</b> Focus on high-margin segments.</div>`;
}

function renderAll(){
  renderTable();
  renderKPIs();
  renderChart();
  renderWaterfall();
  generateInsights();
}
