let testList
let listContainer


document.addEventListener("DOMContentLoaded", function(event) {
  if (localStorage.getItem("userData") != null) {
    console.log(localStorage.getItem("userData"));
    hideSignup();
    showTestList();
  }
});


function getFormData(formId) {
    let data = {};
    for (const element of document.querySelector(`#${formId}`).elements) {
      if (element.name.length > 0) {
        data[element.name] = element.value;
      }
    }
    return data;
  };

function submitFormSignup() {
    // TODO check input
    localStorage.setItem("userData", JSON.stringify(getFormData("formSignup")));
    hideSignup();
    showTestList();
}

function hideSignup() {
  document.getElementById("formSignup").parentElement.hidden=true;
}

function showTestList() {
  let testListRequest = new XMLHttpRequest();
  testListRequest.onload = function() {
    testList = JSON.parse(this.responseText);
    listContainer = document.querySelector("#listContainer");
    listContainer.hidden = false;
    for (let test of testList) {
      let item = document.createElement("a");
      item.textContent = test.name;
      item.href = `test.html?id=${test.id}`;
      listContainer.appendChild(item);
      listContainer.appendChild(document.createElement("br"))
    }
  };
  testListRequest.open("GET", "resources/test-list.json");
  testListRequest.send();
}

