let data = {};
let currentData = [];
let chart;

function login(){
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if(u==="admin" && p==="1234"){
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    init();
  } else {
    alert("Wrong credentials");
  }
}

async function init(){
  const res = await fetch('data.json');
  data = await res.json();
  loadView('channel');

  document.getElementById("fileUpload").addEventListener("change", handleFile);
}

function loadView(type){
  currentData = data[type];
  document.getElementById("title").innerText = "Sales by " + type;

  renderTable();
  renderKPIs();
  renderChart();
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
    <div class="card">Sales<br>${sales}</div>
    <div class="card">Cost<br>${cost}</div>
    <div class="card">GM%<br>${gm}%</div>
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

function filterTable(){
  let input = document.getElementById("search").value.toLowerCase();
  let rows = document.querySelectorAll("#table tr");

  rows.forEach((r,i)=>{
    if(i===0) return;
    r.style.display = r.innerText.toLowerCase().includes(input) ? "" : "none";
  });
}

function handleFile(e){
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(evt){
    const wb = XLSX.read(evt.target.result, {type:'binary'});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    currentData = json.map(r=>({
      name:r.Name,
      sales:+r.Sales,
      cost:+r.Cost,
      gm:+r.GM
    }));

    renderTable();
    renderKPIs();
    renderChart();
  };

  reader.readAsBinaryString(file);
}
