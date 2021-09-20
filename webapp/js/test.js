const params = new URLSearchParams(document.location.search)
const testId = params.get("id");
const userData = JSON.parse(localStorage.getItem("userData"));
let test = JSON.parse(localStorage.getItem("test"));
let targetTime = JSON.parse(localStorage.getItem("targetTime"));
let timerIntervId;
let pattern;
let showResult = localStorage.getItem("showResult");


if (testId != null && userData != null) {
  if (test === null) {
    loadTest(testId);
  }
  if (test.id != testId) {
    alert("Другой тест в процессе");
    location.replace(`test.html?id=${test.id}`);
  }
}
else {
  location.replace("main.html");
}

document.addEventListener("DOMContentLoaded", function(event) {

  if (timerIntervId === undefined && showResult != "1") {
    timerIntervId = setInterval(countDown, 1000);
  }

  buildPattern();
});

window.addEventListener("beforeunload", function(event) {
  if (showResult != "1") {
    localStorage.setItem("test", JSON.stringify(test));
    localStorage.setItem("targetTime", JSON.stringify(targetTime));
  }
  else {
    localStorage.removeItem("test");
    localStorage.removeItem("targetTime");
    localStorage.removeItem("showResult");
  }
});

window.addEventListener("click", function (event) {
  for (let control of document.querySelectorAll("control")) {
      if (!control.contains(event.target)) {
        control.classList.remove('open');
      }
  }
});

function buildPattern() {
  pattern = document.getElementById("pattern");
  pattern.innerHTML = test.pattern;

  for (let control of document.querySelectorAll("control")) {
    control.id = control.innerHTML;
    control.innerHTML = "";

    let controlText = document.createElement("span");
    controlText.className = "controlText";
    control.appendChild(controlText);

    updateControlText(control.id);
    
    control.addEventListener("click", function (event) {
      control.classList.toggle("open");
    });

    let controlOptions = document.createElement("div");
    controlOptions.className = "controlOptions";

    for (let optionText of test.controls[control.id].answers) {
      let controlOption = document.createElement("div");
      controlOption.className = "controlOption";
      controlOption.textContent = optionText;

      controlOption.addEventListener("click", function(event) {
        let controlId = this.closest("control").id;
        test.controls[controlId].current = this.textContent;
        updateControlText(controlId);
      });

      controlOptions.appendChild(controlOption);
    }

    control.appendChild(controlOptions);
  }
}

function updateControlText(controlId){
  let control = document.getElementById(controlId);
  let controlText = control.querySelector(".controlText");
  let currentAnswer = test.controls[controlId].current;

  if (currentAnswer === "") {
    controlText.textContent = "____";
  }
  else {
    controlText.textContent = currentAnswer;
    control.classList.add("changed")
  }
}

function loadTest(testId) {
  let testRequest = new XMLHttpRequest();
  testRequest.onload = function() {
    test = JSON.parse(this.responseText);
    localStorage.setItem("test", this.responseText);
    targetTime = new Date().getTime() + test.time * 60000;
    localStorage.setItem("targetTime", JSON.stringify(targetTime));
    timerIntervId = setInterval(countDown, 1000);
  };
  testRequest.open("GET", `resources/tests/${testId}.json`, false);
  testRequest.send();
}

function countDown() {
  let currentTime = new Date().getTime();
  let timeLeft = targetTime - currentTime;

  let minutes = Math.floor((timeLeft % (3600000)) / (60000));
  let seconds = Math.floor((timeLeft % (60000)) / 1000);

  document.getElementById("timer").textContent = minutes + "м " + seconds + "с ";

  if (timeLeft <= 0) {
    endTest();
  }
}

function endTest() {
  clearInterval(timerIntervId);
  showResult = "1";
  localStorage.setItem("showResult", showResult);
  let maxRating = test.contolsCount;
  let rating = maxRating;
  for (let control of document.querySelectorAll("control")) {
    control.classList.add("locked");
    if (control.querySelector(".controlText").textContent != test.controls[control.id].correct){
      control.classList.add("wrong");
      rating--;
    }
  }
  let btn = document.getElementById("endTestButton");
  btn.hidden = true;
  let row = document.querySelector(".row3");
  let ratingPar = document.createElement("p");
  ratingPar.textContent = `Ваш результат: ${rating} из ${maxRating} баллов!`;
  row.appendChild(ratingPar);
}

