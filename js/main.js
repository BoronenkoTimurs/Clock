const timer = {
  work: 0.1,
  shortBreak: 0.1,
  longBreak: 15,
  longBreakInerval: 4,
  sessions: 0,
};
let interval;

const buttonSound = new Audio("button-sound.mp3");
const mainButtron = document.getElementById("js-btn");
mainButtron.addEventListener("click", () => {
  const { action } = mainButtron.dataset;
  buttonSound.play();
  if (action === "start") {
    startTimer();
  } else {
    stopTimer();
  }
});

const modeButton = document.querySelector("#js-mode-buttons");
modeButton.addEventListener("click", handlerMode);

function getRemainingTimer(endTime) {
  let nowDate = new Date();
  const currentTime = Date.parse(nowDate);
  const differenct = endTime - currentTime;

  const total = Number.parseInt(differenct / 1000, 10);
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

  mainButtron.dataset.action = "stop";
  mainButtron.textContent = "Stop";
  mainButtron.classList.add("active");

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

  mainButtron.dataset.action = "start";
  mainButtron.textContent = "Start";
  mainButtron.classList.remove("active");
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
