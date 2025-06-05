// Функция начисления опыта и перехода на новый уровень
function gainXP(amount) {
  xp += amount;
  if (xp >= xpToNext) {
    xp -= xpToNext;
    level++;
    xpToNext = Math.floor(xpToNext * 1.2);
  }
  updateXPUI();
  saveProgress();
}
// 🎭 Данные по уровню театра
// 🎯 Общие данные по уровню
let level = parseInt(localStorage.getItem("level")) || 1;
let xp = parseInt(localStorage.getItem("xp")) || 0;
let xpToNext = parseInt(localStorage.getItem("xpToNext")) || 100;
let morale = parseInt(localStorage.getItem("morale")) || 100;

function saveProgress() {
  localStorage.setItem("level", level);
  localStorage.setItem("xp", xp);
  localStorage.setItem("xpToNext", xpToNext);
  localStorage.setItem("morale", morale);
}

function updateTopbar() {
  const coins = localStorage.getItem("coins") || "0";

  const coinsSpan = document.getElementById("topbar-coins");
  const levelEl = document.querySelector(".level");

if (coinsSpan) {
  coinsSpan.innerHTML = `
    <span style="display: inline-flex; align-items: center; gap: 4px; color: white;">
      <img src="img/icons/coin.png" style="width: 14px; height: 14px;"> ${coins}
    </span>
  `;
}
if (levelEl) {
  levelEl.textContent = `🎭 Уровень ${level}`;
  levelEl.style.color = "white";
}

  const xpBar = document.getElementById("topbar-xp-bar");
  if (xpBar) {
    const percent = Math.min(100, (xp / xpToNext) * 100);
    xpBar.style.width = percent + "%";
  }
}

function updateXPUI() {
  const levelEl = document.querySelector(".level");
  const xpBar = document.getElementById("topbar-xp-bar");

  if (levelEl) levelEl.textContent = `🎭 Уровень ${level}`;
  if (xpBar) {
    const percent = Math.min(100, (xp / xpToNext) * 100);
    xpBar.style.width = percent + "%";
  }
}

// 📦 Определим максимум активных спектаклей по уровню
function getMaxActivePlays(level) {
  if (level >= 90) return plays.length;
  if (level >= 70) return 5;
  if (level >= 50) return 4;
  if (level >= 25) return 3;
  if (level >= 10) return 2;
  return 1;
}

// 📦 Получить внешний вид театра по уровню
function getTheaterImage(level) {
  if (level >= 90) return "img/theater/theater_lvl6.png";
  if (level >= 70) return "img/theater/theater_lvl5.png";
  if (level >= 50) return "img/theater/theater_lvl4.png";
  if (level >= 25) return "img/theater/theater_lvl3.png";
  if (level >= 10) return "img/theater/theater_lvl2.png";
  return "img/theater/theater_lvl1.png";
}

// 👀 Проверить, открыт ли спектакль на текущем уровне
function isPlayUnlocked(play, level) {
  const unlockLevels = {
    "КОМЕДИЯ": 1,
    "ДРАМА": 1,
    "РОМАН": 3,
    "МЮЗИКЛ": 5,
    "БАЛЕТ": 7,
    "ИСТОРИЯ": 10,
    "ТРАГЕДИЯ": 15,
    "ТРИЛЛЕР": 20,
    "ОПЕРА": 25,
    "МИМ": 30,
    "ДЕТСКИЙ": 35
  };
  return level >= (unlockLevels[play.title] || 999);
}

// 📥 Добавить спектакль
window.addActivePlay = function(play) {
  const activePlays = JSON.parse(localStorage.getItem("activePlays") || "[]");
  const prepUntil = Date.now() + 2000; // 2 сек на подготовку
  const endAt = prepUntil + 5000;      // 5 сек на показ

  const newPlay = {
    id: Date.now(),
    title: play.title,
    image: play.image,
    prepUntil,
    endAt,
    income: play.income
  };

  activePlays.push(newPlay);
  localStorage.setItem("activePlays", JSON.stringify(activePlays));
  renderActivePlays();

  const wrapper = document.getElementById("active-plays");
  const lastCard = wrapper.lastElementChild;
  if (lastCard) {
    lastCard.classList.add("animate-in");
    setTimeout(() => lastCard.classList.remove("animate-in"), 500);
  }
}

// Удалена функция getPlayDuration(title) — больше не используется
// 💥 Множитель XP (временно увеличивает опыт, например для тестов)
const xpBoostMultiplier = 10; // ❗ можно поставить 1, чтобы отключить
function getXpForPlay(title) {
  const map = {
    "КОМЕДИЯ": 1,
    "ДРАМА": 1.2,
    "РОМАН": 1.5,
    "МЮЗИКЛ": 1.7,
    "БАЛЕТ": 1.6,
    "ИСТОРИЯ": 1.4,
    "ТРАГЕДИЯ": 1.8,
    "ТРИЛЛЕР": 2,
    "ОПЕРА": 2.2,
    "МИМ": 1.1,
    "ДЕТСКИЙ": 1.3
  };

  const baseXP = parseFloat(map[title]) || 1;
  return baseXP * xpBoostMultiplier;
}

window.collectPlayReward = function (playId) {
  console.log("КНОПКА СОБРАТЬ: ID =", playId);

  const data = JSON.parse(localStorage.getItem("activePlays") || "[]");
  if (!data.length) {
    console.warn("⛔ activePlays пуст или не найден");
    return;
  }

  const play = data.find(p => String(p.id) === String(playId));
  if (!play) {
    console.warn("⛔ Спектакль с таким ID не найден:", playId);
    console.warn("Содержимое activePlays:", data);
    return;
  }

  const updated = data.filter(p => String(p.id) !== String(playId));

  const coins = parseInt(localStorage.getItem("coins") || "0");
  const totalXp = getXpForPlay(play.title);
  const moraleBonus = morale / 50;
  const adjustedIncome = Math.floor(play.income * moraleBonus);
  localStorage.setItem("coins", String(coins + adjustedIncome));
  gainXP(totalXp);
  morale = Math.min(100, morale + 3);
  localStorage.setItem("lastShowTime", Date.now().toString());
  console.log(`✅ НАЧИСЛЯЕМ: +${adjustedIncome} монет (мораль: ${morale}), +${totalXp} XP`);
  localStorage.setItem("activePlays", JSON.stringify(updated));

  if (typeof updateTopbar === "function") updateTopbar();

  // Визуальный эффект награды
  const card = document.querySelector(`.active-play-card[data-id="${playId}"]`);
  if (card) {
    const overlay = card.querySelector(".reward-overlay");
    if (overlay) {
      overlay.querySelector(".reward-content").innerHTML = `+${adjustedIncome} 💰<br>+${totalXp} ✨`;
      overlay.classList.add("visible");

      setTimeout(() => {
        overlay.classList.remove("visible");
      }, 1500);
    }

    const imgWrapper = card.querySelector(".play-img-wrapper");
    if (imgWrapper) {
      imgWrapper.classList.add("dimmed"); // затемнение

      const msg = document.createElement("div");
      msg.className = "reward-float";
      msg.innerHTML = `
        +${adjustedIncome} <img src="img/coin.png" class="coin-icon"><br>
        +${totalXp} XP
      `;

      imgWrapper.appendChild(msg);

      setTimeout(() => {
        msg.remove();
        imgWrapper.classList.remove("dimmed");
      }, 1200);
    }

    const reward = document.createElement("div");
    reward.className = "reward-effect active";
    reward.textContent = "🪙 + 💥";
    reward.style.position = "absolute";
    reward.style.left = "50%";
    reward.style.top = "0";
    reward.style.transform = "translateX(-50%)";
    card.appendChild(reward);
    setTimeout(() => reward.remove(), 800);
  }

  renderActivePlays();
};

// 🧱 Отображение спектаклей на главной
function renderActivePlays() {
  
  const wrapper = document.getElementById("active-plays");
  const data = JSON.parse(localStorage.getItem("activePlays") || "[]");
  const now = Date.now();
  const maxVisiblePlays = 3;
  let showAllPlays = window.showAllPlays || false;

  // ⛔ Очищаем предыдущий интервал, если есть
  if (window.activePlaysTimer) {
    clearInterval(window.activePlaysTimer);
  }

  wrapper.innerHTML = "";

  const visiblePlays = showAllPlays ? data : data.slice(0, maxVisiblePlays);

  if (data.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "no-plays-message";
    emptyMessage.innerHTML = `
      <div class="no-plays-inner">
        <div class="no-plays-icon">🎭</div>
        <div class="no-plays-text">На сцене пока тишина...</div>
        <div class="no-plays-subtext">Нажми <b>PLAY</b>, чтобы начать спектакль!</div>
      </div>
    `;
    wrapper.appendChild(emptyMessage);
    return;
  }

  const updated = [];

  visiblePlays.forEach((item) => {
    const remaining = Math.max(0, Math.floor((item.endAt - now) / 1000));
    const isPreparing = now < item.prepUntil;

    const card = document.createElement("div");
    card.className = "active-play-card";
    card.setAttribute("data-id", item.id);

    if (remaining <= 0) {
      // 🎁 Спектакль завершён — кнопка сбора
      const imgWrapper = document.createElement("div");
      imgWrapper.className = "play-img-wrapper";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title;
      imgWrapper.appendChild(img);

      // Добавим затемнение и награду до нажатия кнопки "Собрать"
      imgWrapper.classList.add("dimmed");

      const moraleBonus = morale / 50;
      const adjustedIncome = Math.floor(item.income * moraleBonus);
      const totalXp = getXpForPlay(item.title);

      const rewardFloat = document.createElement("div");
      rewardFloat.className = "reward-float";
      rewardFloat.innerHTML = `+${adjustedIncome} 🪙<br>+${totalXp} XP`;

      imgWrapper.appendChild(rewardFloat);

      const overlay = document.createElement("div");
      overlay.className = "reward-overlay";

      const content = document.createElement("div");
      content.className = "reward-content";
      overlay.appendChild(content);

      imgWrapper.appendChild(overlay);

      const title = document.createElement("div");
      title.textContent = item.title;

      const button = document.createElement("button");
      button.className = "collect-btn";
      button.dataset.id = item.id; // 🟢 добавили data-id
      button.textContent = "💰 Собрать";

      const infoBox = document.createElement("div");
      infoBox.className = "info-box";
      infoBox.appendChild(title);
      infoBox.appendChild(button);

      const info = document.createElement("div");
      info.className = "info";
      info.appendChild(infoBox);

      card.appendChild(imgWrapper);
      card.appendChild(info);
    } else if (isPreparing) {
      // 🔧 Этап подготовки
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="info">
          <div class="info-box">
            <div>${item.title}</div>
            <div>🔧 Подготовка</div>
          </div>
        </div>
      `;
      updated.push(item);
    } else {
      // ⏳ Идёт спектакль — показываем таймер
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;

      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <div class="info">
          <div class="info-box">
            <div>${item.title}</div>
            <div>⏳ ${minutes}:${seconds.toString().padStart(2, "0")}</div>
          </div>
        </div>
      `;
      updated.push(item);
    }

    wrapper.appendChild(card);
  });

  if (data.length > maxVisiblePlays) {
    const controls = document.createElement("div");
    controls.className = "show-more-controls";

    if (!showAllPlays) {
      const showMoreBtn = document.createElement("button");
      showMoreBtn.className = "toggle-btn";
      showMoreBtn.textContent = "Показать все 🎭";
      showMoreBtn.onclick = () => {
        window.showAllPlays = true;
        renderActivePlays();
      };
      controls.appendChild(showMoreBtn);
    } else {
      const hideBtn = document.createElement("button");
      hideBtn.className = "toggle-btn";
      hideBtn.textContent = "Скрыть 📥";
      hideBtn.onclick = () => {
        window.showAllPlays = false;
        renderActivePlays();
      };
      controls.appendChild(hideBtn);
    }

    wrapper.appendChild(controls);
  }

  // НЕ удаляем спектакли заранее — только после "Собрать"

  // ⏱ Запускаем обновление каждую секунду, если есть активные
  if (updated.length > 0) {
    window.activePlaysTimer = setInterval(renderActivePlays, 1000);
  }
}

window.addEventListener("DOMContentLoaded", () => {

  const theaterImg = document.querySelector(".theater-img");
  if (theaterImg) {
    theaterImg.src = getTheaterImage(level);
  }

  renderActivePlays(); // ← ЭТО ОБЯЗАТЕЛЬНО
  updateTopbar();
  updateXPUI();
  updateMoraleUI();

  document.getElementById("active-plays").addEventListener("click", (e) => {
    const btn = e.target.closest(".collect-btn");
    if (btn) {
      const playId = parseInt(btn.dataset.id, 10);
      collectPlayReward(playId);
      updateMoraleUI();
    }
  });
});

function updateMoraleUI() {
  morale = Math.max(50, Math.min(100, morale));

  const moraleFace = document.getElementById("morale-face");
  const moraleText = document.getElementById("morale-text");
  const moraleMultiplierEl = document.getElementById("morale-multiplier");
  const multiplierValueEl = document.getElementById("morale-multiplier");
if (multiplierValueEl) {
  multiplierValueEl.textContent = "x" + (morale / 50).toFixed(2);
  multiplierValueEl.style.color = moraleText.style.color;
}

  if (!moraleFace || !moraleText) return;

  // 👉 1. Обновляем текст
  moraleText.textContent = `${morale}%`;

  // 👉 2. Обновляем цвет
  if (morale < 60) {
    moraleText.style.color = '#EB2525'; // красный
  } else if (morale < 80) {
    moraleText.style.color = '#FFA826'; // оранжевый
  } else {
    moraleText.style.color = '#1DFF00'; // зелёный
  }

  // 👉 3. Обновляем смайлик
  if (morale >= 95) {
    moraleFace.textContent = "😂";
  } else if (morale >= 80) {
    moraleFace.textContent = "😊";
  } else if (morale >= 60) {
    moraleFace.textContent = "😐";
  } else {
    moraleFace.textContent = "😟";
  }
}


setInterval(() => {
  const lastShowTime = parseInt(localStorage.getItem("lastShowTime")) || Date.now();
  const now = Date.now();
  const diffMinutes = Math.floor((now - lastShowTime) / 60000);
  const moraleLoss = Math.floor(diffMinutes / 5);

  if (moraleLoss > 0) {
    const newMorale = Math.max(50, 100 - moraleLoss);
    if (newMorale !== morale) {
      morale = newMorale;
      saveProgress();
      updateMoraleUI();
    }
  }
}, 3000); // каждые 30 секунд