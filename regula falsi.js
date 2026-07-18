/* ==========================================================
   TOGGLE SIDEBAR
========================================================== */
let semuaIterasi = [];
let chartRegula = null;

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const closeSidebarBtn = document.getElementById("closeSidebarBtn"); // Tambah

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  const isExpanded = sidebar.classList.contains("open");
  toggleBtn.setAttribute("aria-expanded", isExpanded);
});

// Tambah: Listener untuk tombol tutup sidebar
closeSidebarBtn.addEventListener("click", () => {
  sidebar.classList.remove("open");
  toggleBtn.setAttribute("aria-expanded", "false");
});



/* ==========================================================
   MANUAL DARK / LIGHT TOGGLE (WITH AUTO-DETECT SUPPORT) <!--Fitur Tambahan Theme -->
========================================================== */
const themeToggle = document.getElementById("themeToggle");

// Fungsi untuk memperbarui ARIA dan penampilan ikon SVG
function updateThemeAppearance(mode) {
  const isDark = mode === "dark";
  themeToggle.setAttribute("aria-pressed", isDark);
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"
  );
  // Tambah: Menambahkan kelas untuk mengontrol penampilan SVG (lihat CSS)
  themeToggle.classList.toggle("dark-mode-active", isDark);
}

// Apply saved theme
const savedTheme = localStorage.getItem("theme");
let initialTheme;

if (savedTheme) {
  initialTheme = savedTheme;
} else {
  // Detect OS theme (fallback)
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  initialTheme = prefersDark ? "dark" : "light";
}

document.documentElement.setAttribute("data-theme", initialTheme);
updateThemeAppearance(initialTheme);

themeToggle.addEventListener("click", () => {
  let current = document.documentElement.getAttribute("data-theme");
  let newTheme = current === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  updateThemeAppearance(newTheme);
});

/* ==========================================================
   TITLE FLOAT ANIMATION BASED ON MOUSE
========================================================== */
const title = document.querySelector(".title");
const subtitles = document.querySelectorAll(".subtitle");

document.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 50;
  const y = (window.innerHeight / 2 - e.clientY) / 50;

  title.style.transform = `translate(${x}px, ${y}px)`;
  subtitles.forEach(
    (sub) => (sub.style.transform = `translate(${x}px, ${y}px)`)
  );
});

/* ==========================================================
   FLOATING BUBBLES
========================================================== */
for (let i = 0; i < 10; i++) {
  let bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.style.left = Math.random() * 100 + "vw";
  bubble.style.animationDuration = 8 + Math.random() * 10 + "s";
  bubble.style.opacity = 0.2 + Math.random() * 0.4;
  document.body.appendChild(bubble);
}

/* ==========================================================
   PARTICLES
========================================================== */
for (let i = 0; i < 25; i++) {
  let p = document.createElement("div");
  p.classList.add("particle");
  p.style.top = Math.random() * 100 + "vh";
  p.style.left = Math.random() * 100 + "vw";
  p.style.animationDelay = Math.random() * 3 + "s";
  document.body.appendChild(p);
}



function f(x){

    let fungsi = document.getElementById("fungsi").value;

fungsi = fungsi
    .replace(/\^/g,"**")
    .replace(/sin/g,"Math.sin")
    .replace(/cos/g,"Math.cos")
    .replace(/tan/g,"Math.tan")
    .replace(/log/g,"Math.log")
    .replace(/sqrt/g,"Math.sqrt")
    .replace(/exp/g,"Math.exp")
    .replace(/\bpi\b/gi,"Math.PI")
    .replace(/\be\b/g,"Math.E");

return Function("x","return "+fungsi)(x);

}

function hitungRegulaFalsi() {

  let a = parseFloat(document.getElementById("a").value);
  let b = parseFloat(document.getElementById("b").value);

const epsilon = parseFloat(document.getElementById("epsilon").value);
const maxIterasi = parseInt(document.getElementById("maksIterasi").value);

  if (f(a) * f(b) > 0) {
    document.getElementById("hasilRegula").innerHTML =
      "<h3 style='color:red'>Interval tidak memenuhi syarat f(a) × f(b) < 0</h3>";
    return;
  }

let hasil = `
<h2>Tabel Iterasi Regula Falsi</h2>

<table>
<tr>
<th>Iterasi</th>
<th>Batas Bawah a</th>
<th>Nilai Tengah c (akar)</th>
<th>Batas Atas b</th>
<th>f(a)</th>
<th>f(c)</th>
<th>f(b)</th>
<th>Selang Baru</th>
<th>Lebar Selang |b-a|</th>
<th>Keterangan</th>
</tr>
`;

  let cLama = 0;
let dataIterasi = [];
  for (let i = 0; i <= maxIterasi; i++) {

    let fa = f(a);
    let fb = f(b);

    let c = b - ((fb * (b - a)) / (fb - fa));
    


let galat = Infinity;

if(i>0){
    galat=Math.abs(c-cLama);
}
    let fc = f(c);

    let lebarSelang = Math.abs(b - a);

let status = "FALSE";

if (lebarSelang < epsilon || galat < epsilon) {
    status = "TRUE";
}

    let selangBaru = "";

    dataIterasi.push({
    a: a,
    b: b,
    c: c,
    fa: fa,
    fb: fb,
    fc: fc
});

    if (fa * fc < 0) {
      selangBaru = "[a,c]";
    } else {
      selangBaru = "[c,b]";
    }

hasil += `
<tr>
<td>${i}</td>
<td>${a.toFixed(6)}</td>
<td>${c.toFixed(6)}</td>
<td>${b.toFixed(6)}</td>
<td>${fa.toFixed(6)}</td>
<td>${fc.toFixed(6)}</td>
<td>${fb.toFixed(6)}</td>
<td>${selangBaru}</td>
<td>${lebarSelang.toFixed(6)}</td>
<td>${status}</td>
</tr>
`;

if (i > 0 && (lebarSelang < epsilon || galat < epsilon)) {

hasil += `
</table>

<br>

<div class="hasil-akhir">

<h3>Kesimpulan</h3>

<p>

Iterasi berhenti pada iterasi <b>${i}</b>

</p>

`;

if (lebarSelang < epsilon) {
    hasil += `
    <p>
    Karena
    <b>|b-a| = ${lebarSelang.toExponential(3)}</b>
    &lt;
    <b>${epsilon}</b>
    </p>
    `;
}

if (galat < epsilon) {
    hasil += `
    <p>
    Karena
    <b>|c baru - c lama| =${galat.toFixed(10)}</b>
    &lt;
    <b>${epsilon}</b>
    </p>
    `;
}

hasil += `
<p>

Akar Hampiran

<b>${c.toFixed(6)}</b>

</p>

</div>
`;
semuaIterasi = dataIterasi;
   document.getElementById("hasilRegula").innerHTML = hasil;

buatTombolIterasi();

tampilIterasi(0);
      return;
    }

    if (fa * fc < 0) {
      b = c;
    } else {
      a = c;
    }

    cLama = c;
  }

  hasil += "</table>";
  semuaIterasi = dataIterasi;
  document.getElementById("hasilRegula").innerHTML = hasil;

gambarGrafik(index)
}


function gambarGrafik(index){

    const it = semuaIterasi[index];

    //-------------------------------------------------
    // Membuat kurva fungsi
    //-------------------------------------------------

    let kurva = [];

    let xmin = Math.min(it.a,it.c) - 0.3;
    let xmax = Math.max(it.b,it.c) + 0.3;

    for(let x=xmin;x<=xmax;x+=0.01){

        kurva.push({

            x:x,
            y:f(x)

        });

    }

    //-------------------------------------------------
    // Kurva fungsi
    //-------------------------------------------------

    const traceKurva={

        x:kurva.map(p=>p.x),
        y:kurva.map(p=>p.y),

        mode:"lines",

        name:"Kurva f(x)",

        line:{
            color:"#2E86DE",
            width:3
        }

    };

    //-------------------------------------------------
    // Garis secant
    //-------------------------------------------------

    const traceSecant={

        x:[it.a,it.b],

        y:[it.fa,it.fb],

        mode:"lines",

        name:"Garis Secant",

        line:{

            color:"red",

            dash:"dash",

            width:2

        }

    };

    //-------------------------------------------------
    // Titik a dan b
    //-------------------------------------------------

    const traceAB={

        x:[it.a,it.b],

        y:[it.fa,it.fb],

        mode:"markers",

        name:"Titik a,b",

        marker:{

            color:"#1f77b4",

            size:10

        }

    };

    //-------------------------------------------------
    // Titik c
    //-------------------------------------------------

    const traceC={

        x:[it.c],

        y:[it.fc],

        mode:"markers",

        name:"Titik c",

        marker:{

            color:"orange",

            size:14

        }

    };

    //-------------------------------------------------
    // Garis vertikal c
    //-------------------------------------------------

    const traceVertikal={

        x:[it.c,it.c],

        y:[0,it.fc],

        mode:"lines",

        showlegend:false,

        line:{

            color:"orange",

            width:2

        }

    };

    //-------------------------------------------------
    // Layout
    //-------------------------------------------------

    const layout={

        title:"Visualisasi Regula Falsi",

        paper_bgcolor:"rgba(0,0,0,0)",

        plot_bgcolor:"white",

        hovermode:"closest",

        xaxis:{

            title:"x",

            zeroline:true,

            gridcolor:"#ddd"

        },

        yaxis:{

            title:"f(x)",

            zeroline:true,

            gridcolor:"#ddd"

        }

    };

    Plotly.newPlot(

        "grafikRegula",

        [

            traceKurva,

            traceSecant,

            traceVertikal,

            traceAB,

            traceC

        ],

        layout,

        {

            responsive:true,

            displaylogo:false

        }

    );

}
function buatTombolIterasi(){

    let html="";

    semuaIterasi.forEach((it,index)=>{

        html+=`

        <button
        class="iterBtn"
        onclick="tampilIterasi(${index})">

        Iter ${index}

        </button>

        `;

    });

    document.getElementById("iterasiButtons").innerHTML=html;

}
function tampilIterasi(index){

    const it=semuaIterasi[index];

    document.querySelectorAll(".iterBtn").forEach(btn=>{

        btn.classList.remove("active");

    });

    document.querySelectorAll(".iterBtn")[index].classList.add("active");

    document.getElementById("infoIterasi").innerHTML=`

    <div class="infoCard">

        <h4>a (batas bawah)</h4>

        <p>${it.a.toFixed(6)}</p>

    </div>

    <div class="infoCard">

        <h4>c (akar)</h4>

        <p>${it.c.toFixed(6)}</p>

    </div>

    <div class="infoCard">

        <h4>b (batas atas)</h4>

        <p>${it.b.toFixed(6)}</p>

    </div>

    <div class="infoCard">

        <h4>f(a)</h4>

        <p>${it.fa.toFixed(6)}</p>

    </div>

    <div class="infoCard">

        <h4>f(c)</h4>

        <p>${it.fc.toFixed(6)}</p>

    </div>

    <div class="infoCard">

        <h4>f(b)</h4>

        <p>${it.fb.toFixed(6)}</p>

    </div>

    `;

    gambarGrafik(index);

}


/*=================================
GUIDE BOOK
=================================*/

const guideBtn = document.getElementById("guideBtn");

const guidePanel = document.getElementById("guidePanel");

const closeGuide = document.getElementById("closeGuide");

guideBtn.addEventListener("click",()=>{

    guidePanel.classList.add("open");

});

closeGuide.addEventListener("click",()=>{

    guidePanel.classList.remove("open");

});