// 📦 Постраничное отображение спектаклей
let currentPage = 0;
const perPage = 2; // по 2 спектакля на страницу

// 👇 Рендер текущей страницы спектаклей
function renderPlays() {
  
  const container = document.getElementById("play-container");
  const pageIndicator = document.querySelector("#repertoire-popup #page-indicator");
  container.innerHTML = "";

  const start = currentPage * perPage;
  const selectedPlays = plays.slice(start, start + perPage);

selectedPlays.forEach(play => {
  const card = document.createElement("div");
  card.className = "play-card";
  card.innerHTML = `
    <div class="play-title">${play.title}</div>
    <img src="${play.image}" alt="${play.title}">
    <div class="play-meta">
      <span>💰 ${play.income}/мин</span>
      <div class="stars">${"⭐".repeat(play.stars)}</div>
      <button class="play-btn">ПОСТАВИТЬ</button>
    </div>
  `;

  // ✅ Навешиваем обработчик на кнопку
  const button = card.querySelector(".play-btn");
button.addEventListener("click", () => {
  addActivePlay(play);
  togglePopup(); // закрываем попап
  document.querySelector(".scroll-area").scrollTo({ top: 0, behavior: "smooth" }); // ⬆️ прокрутка к театру
});

  container.appendChild(card);
});

  const totalPages = Math.ceil(plays.length / perPage);
  pageIndicator.textContent = `${currentPage + 1} / ${totalPages}`;
}


// ➡ Вперёд
function nextPage() {
  const totalPages = Math.ceil(plays.length / perPage);
  if (currentPage < totalPages - 1) {
    currentPage++;
    renderPlays();
  }
}

// ⬅ Назад
function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderPlays();
  }
}
// Окно выбора постановки

function togglePopup() {
  const popup = document.getElementById("repertoire-popup");
  popup.classList.toggle("hidden");

  // 👇 Добавим/удалим класс на body или на .mobile-frame
  const frame = document.querySelector(".mobile-frame");
  frame.classList.toggle("popup-visible");

  if (!popup.classList.contains("hidden")) {
    renderPlays(); // Обновить спектакли при открытии

    document.querySelector(".scroll-area").scrollTo({ top: 0, behavior: "smooth" });
  }
}