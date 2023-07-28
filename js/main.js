let interval;
const timer = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInerval: 4,
  sessions: 0,
};
const images = [
  "/image/short_break.jpg",
  "/image/work.jpg",
  "/image/long_break.jpg",
];
const imgEl = document.getElementById("bg-image");
const inputFile = document.getElementById("input-file");
const modeButton = document.getElementById("js-mode-buttons");
const mainButton = document.getElementById("js-btn");
const uploadButton = document.getElementById("js-btn-upload");
const buttonSound = new Audio("button-sound.mp3");
// Start timer
mainButton.addEventListener("click", () => {
  const { action } = mainButton.dataset;
  buttonSound.play();
  if (action === "start") {
    startTimer();
  } else {
    stopTimer();
  }
});
// Change mode
modeButton.addEventListener("click", handlerMode);
// Upload your IMG on background
inputFile.onchange = function () {
  imgEl.src = URL.createObjectURL(inputFile.files[0]);
  images.push(imgEl.src);
  localStorage.setItem("image", images);
};
function getRemainingTimer(endTime) {
  let nowDate = new Date();
  const currentTime = Date.parse(nowDate);
  const different = endTime - currentTime;

  const total = Number.parseInt(different / 1000, 10);
  const hours = Number.parseInt((total / 60 / 60) % 60, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  const progress = document.getElementById("js-progress");
  progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
  return {
    total,
    hours,
    minutes,
    seconds,
  };
}

function startTimer() {
  let { total } = timer.remainingTime;

  let nowDate = new Date();
  const endTime = Date.parse(nowDate) + total * 1000;

  if (timer.mode === "work") timer.sessions++;

  mainButton.dataset.action = "stop";
  mainButton.textContent = "Stop";
  mainButton.classList.add("active");

  interval = setInterval(() => {
    timer.remainingTime = getRemainingTimer(endTime);
    updateClock();

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);

      switch (timer.mode) {
        case "work":
          if (timer.sessions % timer.longBreakInerval === 0) {
            switchMode("longBreak");
          } else {
            switchMode("shortBreak");
          }
          break;
        default:
          switchMode("work");
      }
      if (Notification.permission === "granted") {
        const text =
          timer.mode === "work" ? "Get back to work!" : "Take a break!";
        new Notification(text);
      }

      document.querySelector(`[data-sound="${timer.mode}"]`).play();
      startTimer();
    }
  }, 1000);
}
function stopTimer() {
  clearInterval(interval);

  mainButton.dataset.action = "start";
  mainButton.textContent = "Start";
  mainButton.classList.remove("active");
}

function updateClock() {
  const { remainingTime } = timer;
  const hours = `${remainingTime.hours}`.padStart(2, "0");
  const minutes = `${remainingTime.minutes}`.padStart(2, "0");
  const seconds = `${remainingTime.seconds}`.padStart(2, "0");

  const h = document.getElementById("js-hours");
  const min = document.getElementById("js-minutes");
  const sec = document.getElementById("js-seconds");
  h.textContent = hours;
  min.textContent = minutes;
  sec.textContent = seconds;

  const text = timer.mode === "work" ? "Get back to work!" : "Take a break!";
  document.title = `${hours}:${minutes}:${seconds} - ${text}`;
}
function randomImage() {
  const randomIndex = Math.floor(Math.random() * images.length);
  if (randomIndex !== Number(localStorage.getItem("index"))) {
    imgEl.src = images[randomIndex];
    localStorage.setItem("index", randomIndex);
  } else {
    randomImage();
  }
}
function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    hours: 0,
    minutes: timer[mode],
    seconds: 0,
  };

  document
    .querySelectorAll("button[data-mode]")
    .forEach((el) => el.classList.remove("active"));
  document.querySelector(`[data-mode= "${mode}"]`).classList.add("active");
  document.body.style.backgroundColor = `var(--${mode})`;

  document
    .getElementById("js-progress")
    .setAttribute("max", timer.remainingTime.total);

  updateClock();
  randomImage();
  getRemainingTimer(0);
}

function handlerMode(event) {
  const { mode } = event.target.dataset;

  if (!mode) {
    return;
  }
  switchMode(mode);
  stopTimer();
}

document.addEventListener("DOMContentLoaded", () => {
  if ("Notification" in window) {
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          new Notification(
            "Awesome! You will be notified at the start of each session"
          );
        }
      });
    }
  }
  switchMode("work");
});
