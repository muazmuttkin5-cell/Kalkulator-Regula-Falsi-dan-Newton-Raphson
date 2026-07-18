/* ==========================================================
   TOGGLE SIDEBAR
========================================================== */
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  const isExpanded = sidebar.classList.contains("open");
  toggleBtn.setAttribute("aria-expanded", isExpanded);
});

closeSidebarBtn.addEventListener("click", () => {
  sidebar.classList.remove("open");
  toggleBtn.setAttribute("aria-expanded", "false");
});



/* ==========================================================
   MANUAL DARK / LIGHT TOGGLE (WITH AUTO-DETECT SUPPORT)
========================================================== */
const themeToggle = document.getElementById("themeToggle");

function updateThemeAppearance(mode) {
  const isDark = mode === "dark";
  themeToggle.setAttribute("aria-pressed", isDark);
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"
  );
  themeToggle.classList.toggle("dark-mode-active", isDark);
}

const savedTheme = localStorage.getItem("theme");
let initialTheme;

if (savedTheme) {
  initialTheme = savedTheme;
} else {
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

  // Perbarui warna grafik jika sudah ada
  if (nrChartInstance) {
    renderGrafik(lastIterasiData, lastAkar, lastEkspresi);
  }
});



/* ==========================================================
   TITLE FLOAT ANIMATION BASED ON MOUSE
========================================================== */
const titleEl = document.querySelector(".title");
const subtitles = document.querySelectorAll(".subtitle");

document.addEventListener("mousemove", (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 50;
  const y = (window.innerHeight / 2 - e.clientY) / 50;
  if (titleEl) titleEl.style.transform = `translate(${x}px, ${y}px)`;
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



/* ==========================================================
   HELPER: EVALUASI f(x) DARI STRING INPUT PENGGUNA
========================================================== */
function evalFungsi(ekspresi, x) {
  let fungsi = ekspresi
    .replace(/\^/g, "**")
    .replace(/\bsin\b/g, "Math.sin")
    .replace(/\bcos\b/g, "Math.cos")
    .replace(/\btan\b/g, "Math.tan")
    .replace(/\blog\b/g, "Math.log")
    .replace(/\bsqrt\b/g, "Math.sqrt")
    .replace(/\bexp\b/g, "Math.exp")
    .replace(/\bpi\b/gi, "Math.PI")
    .replace(/\be\b/g, "Math.E");
  return Function("x", "return " + fungsi)(x);
}



/* ==========================================================
   FITUR TAMBAHAN: AUTO CORRECT FUNGSI f(x)
   Memperbaiki penulisan fungsi yang lazim ditulis pengguna
   (perkalian implisit, huruf kapital, spasi berlebih, dsb)
   menjadi format yang dapat dihitung oleh math.js & evalFungsi,
   TANPA mengubah algoritma Newton-Raphson maupun input asli
   yang diketik pengguna pada kolom fungsiNR.
========================================================== */

// Daftar nama fungsi matematika yang dikenali sistem
const NR_DAFTAR_FUNGSI = "sin|cos|tan|log|sqrt|exp|ln";

/* ----------------------------------------------------------
   Mengubah digit superskrip unicode (x², x³, dst) menjadi
   notasi pangkat baku "^" agar dapat diproses math.js dan
   evalFungsi, tanpa mengubah tampilan yang dilihat pengguna.
---------------------------------------------------------- */
function nrNormalisasiSuperskrip(str) {
  const petaSuperskrip = {
    "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
    "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  };
  return str.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (cocok) => {
    const angka = cocok
      .split("")
      .map((ch) => petaSuperskrip[ch] || "")
      .join("");
    return "^" + angka;
  });
}

/* ----------------------------------------------------------
   Menyisipkan tanda perkalian "*" pada pola perkalian implisit
   yang lazim ditulis pengguna, contoh:
   2x -> 2*x | 3(x+2) -> 3*(x+2) | x(x+1) -> x*(x+1)
   )( -> )*( | )x -> )*x | 2sin(x) -> 2*sin(x)
   Dijalankan berulang sampai stabil agar pola bersarang
   (mis. "2x(x+1)") ikut terkoreksi dengan benar.
---------------------------------------------------------- */
function nrTerapkanPerkalianImplisit(str) {
  let hasil = str;
  let sebelumnya;
  let iterasi = 0;

  do {
    sebelumnya = hasil;
    hasil = hasil
      // angka langsung diikuti nama fungsi -> 2sin(x), 5cos(x)
      .replace(new RegExp(`(\\d)(${NR_DAFTAR_FUNGSI})`, "g"), "$1*$2")
      // angka langsung diikuti variabel x -> 2x, 7x
      .replace(/(\d)(x)/g, "$1*$2")
      // angka langsung diikuti tanda kurung buka -> 3(x+2)
      .replace(/(\d)\(/g, "$1*(")
      // variabel x langsung diikuti tanda kurung buka -> x(x+1)
      .replace(/x\(/g, "x*(")
      // tanda kurung tutup langsung diikuti tanda kurung buka -> )(
      .replace(/\)\(/g, ")*(")
      // tanda kurung tutup langsung diikuti variabel x -> )x
      .replace(/\)x/g, ")*x")
      // tanda kurung tutup langsung diikuti angka -> (x+1)2
      .replace(/\)(\d)/g, ")*$1")
      // tanda kurung tutup langsung diikuti nama fungsi -> (x+1)sin(x)
      .replace(new RegExp(`\\)(${NR_DAFTAR_FUNGSI})`, "g"), ")*$1");

    iterasi++;
  } while (hasil !== sebelumnya && iterasi < 6);

  return hasil;
}

/* ----------------------------------------------------------
   Menjelaskan letak kesalahan penulisan fungsi yang tidak
   dapat diperbaiki secara otomatis, agar pengguna tahu apa
   yang perlu diperbaiki.
---------------------------------------------------------- */
function nrDiagnosaKesalahanFungsi(strHitung, strTampil) {
  const bukaKurung = (strHitung.match(/\(/g) || []).length;
  const tutupKurung = (strHitung.match(/\)/g) || []).length;

  if (bukaKurung !== tutupKurung) {
    return `Tanda kurung pada fungsi "${strTampil}" tidak seimbang (jumlah "(" = ${bukaKurung}, jumlah ")" = ${tutupKurung}). Periksa kembali pasangan tanda kurungnya.`;
  }

  if (/[+\-*/^.,]$/.test(strHitung)) {
    return `Fungsi "${strTampil}" tidak boleh diakhiri dengan operator "${strHitung.slice(
      -1
    )}". Tambahkan angka atau variabel setelah operator tersebut.`;
  }

  if (/^[*/^]/.test(strHitung)) {
    return `Fungsi "${strTampil}" tidak boleh diawali dengan operator "${strHitung[0]}".`;
  }

  const karakterAsing = strHitung.match(/[^0-9a-zA-Z.^+\-*/(),]/g);
  if (karakterAsing) {
    const unik = [...new Set(karakterAsing)].join(" ");
    return `Fungsi "${strTampil}" mengandung karakter yang tidak dikenali: ${unik}. Gunakan hanya angka, huruf (x, sin, cos, tan, log, sqrt, exp), dan operator (+ - * / ^ ( )).`;
  }

  return `Fungsi "${strTampil}" belum dapat diproses. Periksa kembali penulisan operator, tanda kurung, atau nama fungsi (sin, cos, tan, log, sqrt, exp) yang digunakan.`;
}

/* ----------------------------------------------------------
   Fungsi utama Auto Correct.
   Mengembalikan:
   - asli    : teks asli yang diketik pengguna
   - tampil  : teks setelah dikoreksi, untuk ditampilkan ke user
   - hitung  : teks setelah dikoreksi + superskrip dinormalisasi,
               dipakai untuk perhitungan (math.js & evalFungsi)
   - berubah : true jika ada koreksi yang dilakukan
   - error   : pesan kesalahan jika masih tidak dapat diproses
---------------------------------------------------------- */
function autoCorrectFungsi(rawInput) {
  const asli = (rawInput || "").trim();

  if (!asli) {
    return { asli: "", tampil: "", hitung: "", berubah: false, error: null };
  }

  // Hapus spasi yang tidak diperlukan & samakan X menjadi x
  let tampil = asli.replace(/\s+/g, "").replace(/X/g, "x");

  // Perbaiki perkalian implisit (2x, x(x+1), )(, dsb)
  tampil = nrTerapkanPerkalianImplisit(tampil);

  // Versi untuk dihitung: superskrip (x²) -> pangkat baku (x^2)
  const hitung = nrNormalisasiSuperskrip(tampil);

  let error = null;
  try {
    math.parse(hitung);
  } catch (e) {
    error = nrDiagnosaKesalahanFungsi(hitung, tampil);
  }

  const berubah = tampil !== asli;

  return { asli, tampil, hitung, berubah, error };
}

/* ----------------------------------------------------------
   Menampilkan status Auto Correct di bawah kolom fungsi,
   tanpa mengubah nilai input asli yang diketik pengguna.
---------------------------------------------------------- */
function tampilkanInfoAutoCorrectNR(hasilAC) {
  const info = document.getElementById("autoCorrectInfoNR");
  if (!info) return;

  if (!hasilAC.asli) {
    info.innerHTML = "";
    info.className = "nr-autocorrect-info";
    info.style.display = "none";
    return;
  }

  if (hasilAC.error) {
    info.className = "nr-autocorrect-info nr-autocorrect-error";
    info.innerHTML = `<i class='bx bx-error-circle'></i> ${hasilAC.error}`;
    info.style.display = "block";
    return;
  }

  if (hasilAC.berubah) {
    info.className = "nr-autocorrect-info nr-autocorrect-sukses";
    info.innerHTML = `<i class='bx bx-check-circle'></i> <strong>Fungsi setelah Auto Correct:</strong> ${hasilAC.tampil}`;
    info.style.display = "block";
    return;
  }

  info.innerHTML = "";
  info.className = "nr-autocorrect-info";
  info.style.display = "none";
}



/* ==========================================================
   TURUNAN OTOMATIS via math.js
========================================================== */
function tampilkanTurunan() {
  const inputFungsi = document.getElementById("fungsiNR").value;
  const inputTurunan = document.getElementById("turunanNR");

  const hasilAC = autoCorrectFungsi(inputFungsi);
  tampilkanInfoAutoCorrectNR(hasilAC);

  if (!hasilAC.asli) {
    inputTurunan.value = "";
    return;
  }

  if (hasilAC.error) {
    inputTurunan.value = "Fungsi tidak valid";
    return;
  }

  try {
    const node = math.parse(hasilAC.hitung);
    const turunanNode = math.derivative(node, "x");
    inputTurunan.value = turunanNode.toString();
  } catch (e) {
    inputTurunan.value = "Fungsi tidak valid";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  tampilkanTurunan();
});



/* ==========================================================
   HELPER: EVALUASI f'(x) SECARA SIMBOLIK
========================================================== */
function evalTurunan(ekspresi, x) {
  try {
    const node = math.parse(ekspresi);
    const turunanNode = math.derivative(node, "x");
    return turunanNode.evaluate({ x: x });
  } catch (e) {
    return NaN;
  }
}



/* ==========================================================
   STATE GRAFIK (disimpan agar bisa di-refresh saat ganti tema)
========================================================== */
let nrChartInstance = null;
let lastIterasiData  = [];
let lastAkar         = null;
let lastEkspresi     = "";

/* ---- State BARU untuk Panel Informasi Iterasi (fitur tambahan) ---- */
let nrIdxDatasetIterasi = null; // indeks dataset titik iterasi di chart.js
let nrIdxDatasetAkar    = null; // indeks dataset titik akar di chart.js
let nrAktifIndex        = null; // index iterasi yang sedang disorot

/* ---- State BARU untuk fitur "Lihat Grafik" (modal full screen) ---- */
let nrModalChartInstance = null; // instance Chart.js khusus & independen untuk modal



/* ==========================================================
   RENDER GRAFIK NEWTON-RAPHSON (Chart.js)
   Diperhalus & dibuat lebih akurat: sampel kurva lebih rapat,
   rentang sumbu menyesuaikan data secara proporsional, sumbu
   x=0 & y=0 selalu tergambar, titik akar lebih menonjol, grid
   lebih rapi pada garis nol. Semua fitur lama (zoom, pan,
   tooltip, legend, Panel Informasi Iterasi, hover/klik) tetap
   dipertahankan seperti sebelumnya.
========================================================== */
function renderGrafik(iterasiData, akar, ekspresi) {
  // Simpan state untuk refresh tema & untuk fitur "Lihat Grafik" (modal)
  lastIterasiData = iterasiData;
  lastAkar        = akar;
  lastEkspresi    = ekspresi;

  const config = bangunKonfigurasiGrafikNR(iterasiData, akar, ekspresi);

  // Tampilkan wrapper
  const wrapper = document.getElementById("grafikNR");
  wrapper.style.display = "block";

  // Hancurkan chart lama jika ada
  if (nrChartInstance) {
    nrChartInstance.destroy();
    nrChartInstance = null;
  }

  const canvas = document.getElementById("canvasNR");
  const ctx    = canvas.getContext("2d");

  // Simpan indeks dataset iterasi & akar (untuk fitur Panel Informasi Iterasi)
  nrIdxDatasetIterasi = config.idxIterasi;
  nrIdxDatasetAkar    = config.idxAkar;
  nrAktifIndex        = null;

  nrChartInstance = new Chart(ctx, {
    type: "scatter",
    data: { datasets: config.datasets },
    plugins: config.plugins,
    options: config.options,
  });

  // Render Panel Informasi Iterasi (fitur tambahan, tidak mengubah grafik)
  renderPanelIterasi(iterasiData, akar, config.fAkar);
}



/* ==========================================================
   PEMBANGUN KONFIGURASI GRAFIK NEWTON-RAPHSON
   Diekstrak dari renderGrafik() agar dapat dipakai ulang untuk
   membangun instance Chart.js yang BENAR-BENAR BARU & independen
   (dataset & options miliknya sendiri, tidak berbagi referensi
   dengan chart lain) — dipakai oleh grafik utama (canvasNR) dan
   oleh fitur "Lihat Grafik" (canvasModalNR). Tidak ada logika,
   rumus, atau nilai yang berubah dari renderGrafik sebelumnya.
========================================================== */
function bangunKonfigurasiGrafikNR(iterasiData, akar, ekspresi) {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  // Warna adaptif tema
  const warnaTeks     = isDark ? "#e0e0e0" : "#1b263b";
  const warnaGrid     = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const warnaGridNol  = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.32)";

  // ---- Tentukan pusat & sebaran dasar dari titik-titik iterasi ----
  const xValues = iterasiData.map((d) => d.xi);
  xValues.push(akar);
  const xDataMin = Math.min(...xValues);
  const xDataMax = Math.max(...xValues);
  const pusatX   = (xDataMin + xDataMax) / 2;
  const sebaranX = Math.max(xDataMax - xDataMin, 1e-6);

  // Nilai f(x) di titik akar (dipakai sebagai acuan batas tampilan Y)
  let fAkar = 0;
  try { fAkar = evalFungsi(ekspresi, akar); } catch (_) {}

  // ---- Radius jendela tampilan yang cukup lebar agar bentuk kurva ----
  // (mis. lengkungan parabola) ikut terlihat, tidak hanya potongan
  // garis di sekitar titik-titik iterasi yang sudah konvergen.
  let radiusX = Math.max(sebaranX * 1.6, Math.abs(pusatX) * 0.6, 3);
  const radiusDasarX = radiusX;

  // Perluas jendela bila ditemukan titik ekstrem (turunan berganti
  // tanda) tidak jauh di luar jendela dasar, agar lekukan kurva
  // (naik/turunnya fungsi) ikut tercakup dalam tampilan.
  const cariPerluasanRadius = (arah) => {
    const langkahUji = Math.max(radiusDasarX / 15, 0.05);
    let tandaSebelumnya = null;
    for (let langkah = 1; langkah <= 15; langkah++) {
      const xUji = pusatX + arah * (radiusDasarX + langkah * langkahUji);
      const turunan = evalTurunan(ekspresi, xUji);
      if (!isFinite(turunan)) break;
      const tandaSekarang = turunan >= 0 ? 1 : -1;
      if (tandaSebelumnya !== null && tandaSekarang !== tandaSebelumnya) {
        return radiusDasarX + (langkah + 2) * langkahUji;
      }
      tandaSebelumnya = tandaSekarang;
    }
    return radiusDasarX;
  };
  radiusX = Math.max(radiusX, cariPerluasanRadius(-1), cariPerluasanRadius(1));

  const xMin = pusatX - radiusX;
  const xMax = pusatX + radiusX;

  // ---- Buat titik kurva f(x) dengan sampel lebih rapat agar lebih halus ----
  const jumlahSampel = 700;
  const langkah = (xMax - xMin) / jumlahSampel;
  const sampelMentah = [];

  for (let i = 0; i <= jumlahSampel; i++) {
    const x = xMin + i * langkah;
    try {
      const y = evalFungsi(ekspresi, x);
      if (isFinite(y)) sampelMentah.push({ x, y });
    } catch (_) {}
  }

  // Batas nilai Y yang wajar ditentukan dari skala nilai fungsi itu
  // sendiri (median sampel + acuan titik iterasi), sehingga lonjakan
  // asimtot (mis. tan(x)) tersaring tanpa memotong bentuk kurva yang
  // sebenarnya (mis. parabola) secara tidak semestinya.
  let batasYWajar = Infinity;
  if (sampelMentah.length > 0) {
    const absTerurut = sampelMentah
      .map((p) => Math.abs(p.y))
      .sort((a, b) => a - b);
    const median = absTerurut[Math.floor(absTerurut.length / 2)] || 1;
    const acuanY = Math.max(
      ...iterasiData.map((d) => Math.abs(d.fxi)),
      Math.abs(fAkar),
      median,
      1e-6
    );
    batasYWajar = acuanY * 15 + 10;
  }

  const kurvaX = [];
  const kurvaY = [];
  sampelMentah.forEach((p) => {
    if (Math.abs(p.y) <= batasYWajar) {
      kurvaX.push(p.x);
      kurvaY.push(p.y);
    }
  });

  // ---- Tentukan rentang Y otomatis (selalu menyertakan y = 0) ----
  let yDataMin = Math.min(0, ...(kurvaY.length ? kurvaY : [0]));
  let yDataMax = Math.max(0, ...(kurvaY.length ? kurvaY : [0]));
  if (!isFinite(yDataMin) || !isFinite(yDataMax) || yDataMin === yDataMax) {
    yDataMin = -1;
    yDataMax = 1;
  }
  const rentangYAsli = yDataMax - yDataMin;
  const paddingY = Math.max(rentangYAsli * 0.15, 0.5);
  const yMin = yDataMin - paddingY;
  const yMax = yDataMax + paddingY;

  // Dataset kurva f(x) — lebih halus (sampel rapat + interpolasi monotone)
  const datasetKurva = {
    label: "f(x)",
    data: kurvaX.map((x, i) => ({ x, y: kurvaY[i] })),
    type: "line",
    borderColor: "#60a5fa",
    backgroundColor: "transparent",
    borderWidth: 2.5,
    pointRadius: 0,
    tension: 0.15,
    cubicInterpolationMode: "monotone",
    order: 3,
  };

  // Garis sumbu X (y = 0) — selalu digambar sepanjang rentang X
  const datasetSumbuX = {
    label: "y = 0",
    data: [{ x: xMin, y: 0 }, { x: xMax, y: 0 }],
    type: "line",
    borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderDash: [4, 4],
    pointRadius: 0,
    order: 4,
  };

  // Garis sumbu Y (x = 0) — digambar bila x = 0 berada dalam rentang X
  const datasetSumbuY =
    xMin <= 0 && xMax >= 0
      ? {
          label: "x = 0",
          data: [{ x: 0, y: yMin }, { x: 0, y: yMax }],
          type: "line",
          borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
          backgroundColor: "transparent",
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          order: 4,
        }
      : null;

  // Titik-titik iterasi xi (tetap tepat di atas kurva karena memakai f(xi) asli)
  const datasetIterasi = {
    label: "Titik Iterasi xᵢ",
    data: iterasiData.map((d) => ({ x: d.xi, y: d.fxi })),
    type: "scatter",
    backgroundColor: iterasiData.map(() => "#facc15"),
    borderColor: "#f59e0b",
    borderWidth: 2,
    pointRadius: iterasiData.map(() => 7),
    pointHoverRadius: 9,
    order: 2,
  };

  // Garis tangent dari setiap xi ke akar berikutnya (garis iterasi)
  const segmenGaris = [];
  for (let i = 0; i < iterasiData.length; i++) {
    const { xi, fxi, fPrimeXi, xiPlus1 } = iterasiData[i];
    if (!isFinite(fPrimeXi) || fPrimeXi === 0) continue;

    // Titik pada kurva: (xi, f(xi))
    // Garis tangent menyentuh sumbu x di xiPlus1: (xiPlus1, 0)
    segmenGaris.push({
      label: i === 0 ? "Garis Iterasi" : "",
      data: [
        { x: xi, y: fxi },
        { x: xiPlus1, y: 0 },
      ],
      type: "line",
      borderColor: "rgba(251,146,60,0.75)",
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderDash: [5, 3],
      pointRadius: 0,
      showLine: true,
      order: 3,
    });
  }

  // Titik akar akhir — dibuat lebih menonjol (radius & border lebih besar)
  const datasetAkar = {
    label: "Akar ≈ " + akar.toFixed(6),
    data: [{ x: akar, y: 0 }],
    type: "scatter",
    backgroundColor: ["#4ade80"],
    borderColor: "#16a34a",
    borderWidth: 3,
    pointRadius: [11],
    pointHoverRadius: 15,
    pointStyle: "star",
    order: 1,
  };

  // Gabungkan semua dataset (sumbu Y hanya disertakan bila relevan)
  const semua = [
    datasetKurva,
    datasetSumbuX,
    ...(datasetSumbuY ? [datasetSumbuY] : []),
    ...segmenGaris,
    datasetIterasi,
    datasetAkar,
  ];

  const idxIterasi = semua.indexOf(datasetIterasi);
  const idxAkar    = semua.indexOf(datasetAkar);

  // Plugin ringan: menambah "glow" halus di belakang titik akar
  // agar lebih menonjol, tanpa mengubah data maupun interaksi chart.
  // Memakai idxAkar dari closure lokal (bukan variabel global) agar
  // setiap instance chart (utama maupun modal) selalu menyorot titik
  // akarnya sendiri dengan benar.
  const akarGlowPluginNR = {
    id: "akarGlowNR",
    beforeDatasetsDraw(chart) {
      const meta = chart.getDatasetMeta(idxAkar);
      if (!meta || !meta.data || !meta.data[0]) return;
      const titik = meta.data[0];
      const c = chart.ctx;
      c.save();
      c.beginPath();
      c.arc(titik.x, titik.y, 16, 0, Math.PI * 2);
      c.fillStyle = isDark ? "rgba(74,222,128,0.25)" : "rgba(34,197,94,0.20)";
      c.shadowColor = "rgba(34,197,94,0.6)";
      c.shadowBlur = 14;
      c.fill();
      c.restore();
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 600, easing: "easeInOutQuart" },
    /* Interaksi: hubungkan grafik dengan panel Informasi Iterasi */
    onHover: (event, elements) => {
      handleChartInteraksiNR(elements, false);
    },
    onClick: (event, elements) => {
      handleChartInteraksiNR(elements, true);
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: warnaTeks,
          font: { family: "Poppins", size: 12 },
          filter: (item) => item.text !== "",
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e1e2e" : "#ffffff",
        titleColor: warnaTeks,
        bodyColor: warnaTeks,
        borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const { x, y } = ctx.parsed;
            return ` x = ${x.toFixed(6)},  y = ${y.toFixed(6)}`;
          },
        },
      },
      /* Zoom & Pan pada grafik (chartjs-plugin-zoom) */
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "xy",
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: xMin,
        max: xMax,
        title: {
          display: true,
          text: "x",
          color: warnaTeks,
          font: { family: "Poppins", size: 13 },
        },
        ticks: { color: warnaTeks, font: { family: "Poppins", size: 11 } },
        grid: {
          color: (context) =>
            context.tick && context.tick.value === 0 ? warnaGridNol : warnaGrid,
          lineWidth: (context) =>
            context.tick && context.tick.value === 0 ? 1.5 : 1,
        },
      },
      y: {
        min: yMin,
        max: yMax,
        title: {
          display: true,
          text: "f(x)",
          color: warnaTeks,
          font: { family: "Poppins", size: 13 },
        },
        ticks: { color: warnaTeks, font: { family: "Poppins", size: 11 } },
        grid: {
          color: (context) =>
            context.tick && context.tick.value === 0 ? warnaGridNol : warnaGrid,
          lineWidth: (context) =>
            context.tick && context.tick.value === 0 ? 1.5 : 1,
        },
      },
    },
  };

  return {
    datasets: semua,
    options,
    plugins: [akarGlowPluginNR],
    idxIterasi,
    idxAkar,
    fAkar,
  };
}



/* ==========================================================
   PANEL INFORMASI ITERASI (FITUR TAMBAHAN)
   Menggunakan ulang data iterasiData & akar yang sudah
   dihasilkan algoritma Newton-Raphson, tanpa mengubah
   perhitungan sedikit pun.
========================================================== */
function renderPanelIterasi(iterasiData, akar, fAkar) {
  const listEl = document.getElementById("panelIterasiListNR");
  if (!listEl) return;

  let htmlPanel = "";

  // Iterasi 0 .. N-1 : diambil langsung dari titik-titik yang sudah
  // digambar di grafik (dataset "Titik Iterasi xᵢ")
  iterasiData.forEach((d, i) => {
    const errorTeks =
      i === 0 ? "-" : iterasiData[i - 1].error.toFixed(2) + "%";

    htmlPanel += `
      <div class="nr-info-card" data-idx="${i}">
        <div><strong>Iterasi ${i}</strong></div>
        <div>x = ${d.xi.toFixed(6)}</div>
        <div>f(x) = ${d.fxi.toFixed(6)}</div>
        <div>Error = ${errorTeks}</div>
      </div>`;
  });

  // Iterasi terakhir (Akar): sesuai titik bintang hijau pada grafik
  const indeksAkar = iterasiData.length;
  const errorAkarTeks =
    iterasiData.length > 0
      ? iterasiData[iterasiData.length - 1].error.toFixed(2) + "%"
      : "-";

  htmlPanel += `
    <div class="nr-info-card" data-idx="${indeksAkar}">
      <div><strong>Iterasi ${indeksAkar} (Akar)</strong></div>
      <div>x = ${akar.toFixed(6)}</div>
      <div>f(x) = ${fAkar.toFixed(6)}</div>
      <div>Error = ${errorAkarTeks}</div>
    </div>`;

  listEl.innerHTML = htmlPanel;

  // Klik kartu iterasi -> sorot titik yang sesuai di grafik
  listEl.querySelectorAll(".nr-info-card").forEach((card) => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.idx, 10);
      setAktifIterasiNR(idx, false);
    });
  });
}

/* ----------------------------------------------------------
   Menyorot iterasi ke-`index` pada panel DAN pada grafik.
   Dipanggil saat: klik/hover titik grafik, atau klik kartu panel.
---------------------------------------------------------- */
function setAktifIterasiNR(index, gulirKePanel = true) {
  nrAktifIndex = index;

  // Sorot kartu panel yang sesuai
  document.querySelectorAll(".nr-info-card").forEach((card) => {
    const cocok = parseInt(card.dataset.idx, 10) === index;
    card.classList.toggle("nr-info-card-aktif", cocok);
  });

  if (gulirKePanel) {
    const cardAktif = document.querySelector(
      `.nr-info-card[data-idx="${index}"]`
    );
    if (cardAktif) {
      cardAktif.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  perbaruiHighlightGrafikNR(index);
}

/* ----------------------------------------------------------
   Memperbesar/mengubah warna titik yang aktif pada grafik,
   tanpa mengubah data maupun bentuk kurva/grafik lainnya.
---------------------------------------------------------- */
function perbaruiHighlightGrafikNR(index) {
  if (!nrChartInstance) return;
  if (nrIdxDatasetIterasi === null) return;

  // Terapkan highlight pada dataset milik SATU instance chart tertentu.
  // Modal kini punya dataset independen sendiri (bukan berbagi referensi
  // dengan grafik utama), sehingga highlight harus diterapkan terpisah
  // ke masing-masing instance yang sedang aktif.
  const terapkanKeInstance = (chartInstance) => {
    if (!chartInstance) return;

    const dsIterasi = chartInstance.data.datasets[nrIdxDatasetIterasi];
    const dsAkar =
      nrIdxDatasetAkar !== null
        ? chartInstance.data.datasets[nrIdxDatasetAkar]
        : null;
    if (!dsIterasi) return;

    const jumlahIterasi = dsIterasi.data.length;

    dsIterasi.pointRadius = dsIterasi.data.map((_, i) =>
      i === index ? 10 : 7
    );
    dsIterasi.backgroundColor = dsIterasi.data.map((_, i) =>
      i === index ? "#f97316" : "#facc15"
    );

    if (dsAkar) {
      const akarAktif = index === jumlahIterasi;
      dsAkar.pointRadius = [akarAktif ? 15 : 11];
      dsAkar.backgroundColor = [akarAktif ? "#22c55e" : "#4ade80"];
    }

    chartInstance.update("none");
  };

  terapkanKeInstance(nrChartInstance);

  // FITUR BARU (Lihat Grafik): sinkronkan highlight ke grafik dalam modal
  // juga, jika modal sedang terbuka.
  terapkanKeInstance(nrModalChartInstance);
}

/* ----------------------------------------------------------
   Menangani hover/klik pada titik grafik lalu meneruskannya
   ke setAktifIterasiNR agar panel & grafik tetap sinkron.
---------------------------------------------------------- */
function handleChartInteraksiNR(elements) {
  if (!elements || elements.length === 0) return;

  const el = elements[0];
  let panelIndex = null;

  if (el.datasetIndex === nrIdxDatasetIterasi) {
    panelIndex = el.index;
  } else if (el.datasetIndex === nrIdxDatasetAkar) {
    panelIndex = lastIterasiData.length;
  }

  if (panelIndex !== null) {
    setAktifIterasiNR(panelIndex, true);
  }
}



/* ==========================================================
   KONTROL ZOOM GRAFIK (FITUR TAMBAHAN)
   Menggunakan API bawaan chartjs-plugin-zoom (chart.zoom /
   chart.resetZoom). Tidak mengubah data, algoritma, maupun
   dataset grafik — hanya mengubah tampilan (skala) chart.
========================================================== */
function zoomInNR() {
  if (nrChartInstance && typeof nrChartInstance.zoom === "function") {
    nrChartInstance.zoom(1.2);
  }
}

function zoomOutNR() {
  if (nrChartInstance && typeof nrChartInstance.zoom === "function") {
    nrChartInstance.zoom(0.8);
  }
}

function resetZoomNR() {
  if (nrChartInstance && typeof nrChartInstance.resetZoom === "function") {
    nrChartInstance.resetZoom();
  }
}



/* ==========================================================
   ALGORITMA UTAMA: NEWTON-RAPHSON
   x(i+1) = x(i) - f(xi) / f'(xi)
   (Algoritma tidak diubah — hanya string fungsi yang sudah
   melalui Auto Correct yang digunakan sebagai masukan)
========================================================== */
function hitungNewtonRaphson() {
  const inputFungsiMentah = document.getElementById("fungsiNR").value.trim();
  const x0Input      = document.getElementById("x0NR").value;
  const epsilon      = parseFloat(document.getElementById("epsilonNR").value);
  const maksIterasi  = parseInt(document.getElementById("maksIterasiNR").value);
  const hasilDiv     = document.getElementById("hasilNR");

  // Sembunyikan grafik lama saat mulai hitung baru
  document.getElementById("grafikNR").style.display = "none";
  if (nrChartInstance) {
    nrChartInstance.destroy();
    nrChartInstance = null;
  }

  // FITUR BARU (Lihat Grafik): tutup juga modal grafik jika sedang
  // terbuka, agar tidak menampilkan grafik dari hasil hitung sebelumnya.
  if (nrModalChartInstance) {
    nrModalChartInstance.destroy();
    nrModalChartInstance = null;
  }
  const modalGrafikReset = document.getElementById("grafikModalNR");
  if (modalGrafikReset) modalGrafikReset.style.display = "none";
  document.body.style.overflow = "";

  /* ---- VALIDASI ---- */
  if (!inputFungsiMentah) {
    hasilDiv.innerHTML =
      "<p class='nr-pesan-error'>&#9888; Fungsi f(x) tidak boleh kosong.</p>";
    return;
  }

  if (x0Input === "" || isNaN(parseFloat(x0Input))) {
    hasilDiv.innerHTML =
      "<p class='nr-pesan-error'>&#9888; Nilai awal x&#8320; harus berupa angka.</p>";
    return;
  }

  // ---- AUTO CORRECT: perbaiki penulisan fungsi sebelum dihitung ----
  const hasilAC = autoCorrectFungsi(inputFungsiMentah);
  tampilkanInfoAutoCorrectNR(hasilAC);

  if (hasilAC.error) {
    hasilDiv.innerHTML = `<p class='nr-pesan-error'>&#9888; ${hasilAC.error}</p>`;
    return;
  }

  const inputFungsi = hasilAC.hitung;

  try {
    math.parse(inputFungsi);
  } catch (e) {
    hasilDiv.innerHTML =
      "<p class='nr-pesan-error'>&#9888; Fungsi f(x) tidak valid. Periksa penulisan fungsi.</p>";
    return;
  }

  let xi = parseFloat(x0Input);

  /* ---- TABEL ITERASI ---- */
  let hasil = `
<h2>Tabel Iterasi Newton-Raphson</h2>
${
  hasilAC.berubah
    ? `<p class="nr-autocorrect-catatan"><i class='bx bx-check-circle'></i> <strong>Fungsi setelah Auto Correct:</strong> ${hasilAC.tampil}</p>`
    : ""
}
<table>
<tr>
<th>Iterasi</th>
<th>x<sub>i</sub></th>
<th>f(x<sub>i</sub>)</th>
<th>f'(x<sub>i</sub>)</th>
<th>x<sub>i+1</sub></th>
<th>Error (%)</th>
</tr>
`;

  let konvergen    = false;
  let iterasiAkhir = 0;
  let errorAkhir   = Infinity;
  let akar         = xi;

  // Kumpulkan data untuk grafik
  const iterasiData = [];

  for (let i = 1; i <= maksIterasi; i++) {
    let fxi, fPrimeXi, xiPlus1, error;

    try {
      fxi = evalFungsi(inputFungsi, xi);
    } catch (e) {
      hasilDiv.innerHTML =
        "<p class='nr-pesan-error'>&#9888; Gagal mengevaluasi f(x). Periksa ekspresi fungsi.</p>";
      return;
    }

    fPrimeXi = evalTurunan(inputFungsi, xi);

    if (fPrimeXi === 0 || isNaN(fPrimeXi)) {
      hasil += `</table>`;
      hasilDiv.innerHTML =
        hasil +
        `<p class='nr-pesan-error'>&#9888; Iterasi dihentikan pada iterasi ke-<b>${i}</b> karena f'(x<sub>i</sub>) = 0. Metode Newton-Raphson tidak dapat dilanjutkan.</p>`;
      return;
    }

    xiPlus1 = xi - fxi / fPrimeXi;

    if (xiPlus1 !== 0) {
      error = Math.abs((xiPlus1 - xi) / xiPlus1) * 100;
    } else {
      error = Math.abs(xiPlus1 - xi) * 100;
    }

    // Simpan data iterasi untuk grafik
    iterasiData.push({ xi, fxi, fPrimeXi, xiPlus1, error });

    hasil += `
<tr>
<td>${i}</td>
<td>${xi.toFixed(6)}</td>
<td>${fxi.toFixed(6)}</td>
<td>${fPrimeXi.toFixed(6)}</td>
<td>${xiPlus1.toFixed(6)}</td>
<td>${error.toFixed(6)}</td>
</tr>
`;

    iterasiAkhir = i;
    errorAkhir   = error;
    akar         = xiPlus1;

    if (error < epsilon * 100 || Math.abs(fxi) < epsilon) {
      konvergen = true;
      break;
    }

    xi = xiPlus1;
  }

  hasil += `</table>

<br>

<div class="hasil-akhir">

<h3>Kesimpulan</h3>

<p><b>Akar Persamaan &nbsp;:</b> ${akar.toFixed(6)}</p>

<p><b>Jumlah Iterasi &nbsp;&nbsp;:</b> ${iterasiAkhir}</p>

<p><b>Error Akhir &nbsp;&nbsp;&nbsp;&nbsp;:</b> ${errorAkhir.toFixed(6)} %</p>

<p><b>Status &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</b>
${
  konvergen
    ? "<span class='nr-status-konvergen'>&#10004; Konvergen</span>"
    : "<span class='nr-status-divergen'>&#10008; Tidak Konvergen (batas iterasi habis)</span>"
}
</p>

</div>
`;

  hasilDiv.innerHTML = hasil;

  // Render grafik setelah tabel selesai
  if (iterasiData.length > 0) {
    renderGrafik(iterasiData, akar, inputFungsi);
  }
}



/* ==========================================================
   GUIDE BOOK MODAL (FITUR BARU)
   Tidak menyentuh algoritma, grafik, panel, maupun tema.
========================================================== */
(function initGuideBookNR() {
  const tombolBuka   = document.getElementById("guideBookBtn");
  const overlay      = document.getElementById("guideBookModal");
  const tombolTutup1 = document.getElementById("guideBookCloseBtn");
  const tombolTutup2 = document.getElementById("guideBookCloseBtnBawah");

  if (!tombolBuka || !overlay) return;

  function bukaGuideBook() {
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function tutupGuideBook() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  tombolBuka.addEventListener("click", bukaGuideBook);
  if (tombolTutup1) tombolTutup1.addEventListener("click", tutupGuideBook);
  if (tombolTutup2) tombolTutup2.addEventListener("click", tutupGuideBook);

  // Klik di luar kotak modal (area overlay) -> tutup
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      tutupGuideBook();
    }
  });

  // Tombol ESC -> tutup (hanya jika modal sedang terbuka)
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.style.display === "flex") {
      tutupGuideBook();
    }
  });
})();



/* ==========================================================
   FITUR BARU: "LIHAT GRAFIK" (MODAL FULL SCREEN)
   Menampilkan grafik dalam ukuran besar di dalam modal, dengan
   membangun instance Chart.js yang BENAR-BENAR BARU & independen
   (lewat bangunKonfigurasiGrafikNR) dari data hasil perhitungan
   yang sudah ada (lastIterasiData/lastAkar/lastEkspresi) — TIDAK
   menghitung ulang algoritma Newton-Raphson, dan TIDAK memindahkan
   atau berbagi objek Chart.js dengan grafik utama (nrChartInstance
   tidak disentuh sama sekali).
========================================================== */
function bukaModalGrafikNR() {
  // Belum ada hasil perhitungan -> tidak ada yang bisa ditampilkan
  if (!lastIterasiData || lastIterasiData.length === 0 || lastAkar === null) {
    return;
  }

  const overlay = document.getElementById("grafikModalNR");
  if (!overlay) return;

  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Tunggu 2 frame (double requestAnimationFrame) agar layout modal
  // (display:flex) benar-benar sudah selesai dihitung browser dan
  // canvas modal sudah memiliki ukuran yang pasti, sebelum Chart.js
  // dibuat di atasnya — mencegah canvas kosong karena ukuran 0.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const canvas = document.getElementById("canvasModalNR");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      if (nrModalChartInstance) {
        nrModalChartInstance.destroy();
        nrModalChartInstance = null;
      }

      // Bangun konfigurasi grafik yang BENAR-BENAR BARU & independen
      // (dataset & options miliknya sendiri) dari data hasil perhitungan
      // yang sudah ada — TIDAK menghitung ulang Newton-Raphson, dan
      // TIDAK memindahkan/berbagi instance Chart.js grafik utama.
      const config = bangunKonfigurasiGrafikNR(
        lastIterasiData,
        lastAkar,
        lastEkspresi
      );

      nrModalChartInstance = new Chart(ctx, {
        type: "scatter",
        data: { datasets: config.datasets },
        plugins: config.plugins,
        options: config.options,
      });
    });
  });
}

function tutupModalGrafikNR() {
  const overlay = document.getElementById("grafikModalNR");
  if (overlay) overlay.style.display = "none";
  document.body.style.overflow = "";

  if (nrModalChartInstance) {
    nrModalChartInstance.destroy();
    nrModalChartInstance = null;
  }
}

/* ---- Kontrol Zoom khusus di dalam modal (tidak memengaruhi grafik utama) ---- */
function zoomInModalNR() {
  if (nrModalChartInstance && typeof nrModalChartInstance.zoom === "function") {
    nrModalChartInstance.zoom(1.2);
  }
}

function zoomOutModalNR() {
  if (nrModalChartInstance && typeof nrModalChartInstance.zoom === "function") {
    nrModalChartInstance.zoom(0.8);
  }
}

function resetZoomModalNR() {
  if (nrModalChartInstance && typeof nrModalChartInstance.resetZoom === "function") {
    nrModalChartInstance.resetZoom();
  }
}

/* ---- Wiring tombol buka/tutup, ESC, dan klik di luar modal ---- */
(function initModalGrafikNR() {
  const tombolBuka = document.getElementById("lihatGrafikBtnNR");
  const overlay    = document.getElementById("grafikModalNR");
  const tombolTutup = document.getElementById("tutupModalGrafikBtnNR");

  if (!tombolBuka || !overlay) return;

  tombolBuka.addEventListener("click", bukaModalGrafikNR);
  if (tombolTutup) tombolTutup.addEventListener("click", tutupModalGrafikNR);

  // Klik di luar kotak modal (area overlay) -> tutup
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      tutupModalGrafikNR();
    }
  });

  // Tombol ESC -> tutup (hanya jika modal grafik sedang terbuka)
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.style.display === "flex") {
      tutupModalGrafikNR();
    }
  });
})();