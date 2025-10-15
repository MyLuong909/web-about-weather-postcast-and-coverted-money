// === MENU MOBILE ===
const menuIcon = document.getElementById("menu-icon");
const navLinks = document.querySelector(".nav-links");
if (menuIcon && navLinks) {
  menuIcon.addEventListener("click", () => navLinks.classList.toggle("active"));
}

// === DỰ BÁO THỜI TIẾT (TP.HCM) ===
const latitude = 10.7769;
const longitude = 106.7009;
const weatherContainer = document.querySelector(".weather-container");

async function loadWeather() {
  if (!weatherContainer) return;
  weatherContainer.innerHTML = "<p>⏳ Đang tải dữ liệu...</p>";

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=Asia%2FBangkok`
    );
    const data = await res.json();

    const hours = data?.hourly?.time?.slice(0, 24);
    const temps = data?.hourly?.temperature_2m?.slice(0, 24);
    const codes = data?.hourly?.weathercode?.slice(0, 24);

    if (!hours || !temps) throw new Error("Thiếu dữ liệu");

    const icons = {
      0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
      45: "🌫️", 48: "🌫️",
      51: "🌦️", 53: "🌦️", 55: "🌧️",
      56: "🌧️", 57: "🌧️",
      61: "🌧️", 63: "🌧️", 65: "🌧️",
      66: "🌧️", 67: "🌧️",
      71: "🌨️", 73: "🌨️", 75: "❄️", 77: "❄️",
      80: "🌦️", 81: "🌧️", 82: "🌧️",
      85: "🌨️", 86: "🌨️",
      95: "⛈️", 96: "⛈️", 99: "⛈️"
    };

    weatherContainer.innerHTML = hours
      .map((h, i) => {
        const time = new Date(h).getHours();
        const icon = icons[codes[i]] || "❓";
        return `
          <div class="weather-item">
            <h4>${time}h</h4>
            <p style="font-size:25px">${icon}</p>
            <p>${temps[i].toFixed(1)}°C</p>
          </div>`;
      })
      .join("");
  } catch (err) {
    console.error("❌ Lỗi thời tiết:", err);
    weatherContainer.innerHTML = "<p>⚠️ Không tải được dữ liệu thời tiết.</p>";
  }
}

// === WIDGET TỶ GIÁ USD/VND ===
async function loadUsdVndRate() {
  const elem = document.getElementById("usd-vnd-rate");
  if (!elem) return;
  elem.textContent = "⏳ Đang tải tỷ giá...";

  try {
    // API exchangerate.host (nếu lỗi -> fallback)
    const res = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent("https://api.exchangerate.host/latest?base=USD&symbols=VND"));

    const data = await res.json();

    const rate = data?.rates?.VND;
    if (rate) {
      elem.innerHTML = `💱 1 USD = <strong>${rate.toLocaleString("vi-VN")}</strong> VND`;
    } else {
      throw new Error("Không có dữ liệu hợp lệ");
    }
  } catch (err) {
    console.warn("⚠️ Lỗi tỷ giá, dùng fallback:", err);
    elem.innerHTML = `⚠️ Không lấy được dữ liệu thật.<br>💵 1 USD ≈ <strong>25,400 VND</strong>`;
  }
}

// === CHUYỂN ĐỔI TIỀN TỆ ===
function swapCurrencies() {
  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  if (from && to) {
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
  }
}

async function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = document.getElementById("fromCurrency").value.trim().toUpperCase();
  const to = document.getElementById("toCurrency").value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");

  if (isNaN(amount) || amount <= 0) {
    resultDiv.innerHTML = "⚠️ Vui lòng nhập số tiền hợp lệ!";
    return;
  }

  resultDiv.textContent = "⏳ Đang tính...";

  try {
    // Gọi API thật
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`
    );
    if (!res.ok) throw new Error("Kết nối API lỗi");
    const data = await res.json();

    const rate = data?.rates?.[to];
    if (!rate) throw new Error("Không có dữ liệu hợp lệ");

    const converted = amount * rate;
    resultDiv.innerHTML = `
      💱 ${amount.toLocaleString()} ${from} = 
      <strong>${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}</strong><br>
      <small>1 ${from} = ${rate.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}</small>
    `;
  } catch (err) {
    console.warn("⚠️ Lỗi khi convert:", err);
    // fallback ước lượng thủ công
    const fallbackRates = {
      USD: 1,
      VND: 25400,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 150,
      KRW: 1350,
      CNY: 7.25,
    };
    const rate = (fallbackRates[to] || 1) / (fallbackRates[from] || 1);
    const converted = amount * rate;
    resultDiv.innerHTML = `
      ⚠️ Không lấy được dữ liệu thật.<br>
      💱 Ước lượng: ${amount.toLocaleString()} ${from} ≈ 
      <strong>${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}</strong><br>
      <small>Dựa trên tỷ giá tạm: 1 ${from} ≈ ${rate.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}</small>
    `;
  }
}


// === KHỞI ĐỘNG ===
window.addEventListener("DOMContentLoaded", () => {
  loadWeather();
  loadUsdVndRate();
});
