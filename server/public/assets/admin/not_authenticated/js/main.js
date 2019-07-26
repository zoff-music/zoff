window.addEventListener("DOMContentLoaded", function() {
  document
    .getElementById("login_button")
    .addEventListener("click", function(event) {
      event.preventDefault();
      document.querySelector("#login_form").submit();
    });

  document
    .getElementById("login_form")
    .addEventListener("submit", function(event) {
      if (this.password.value == "" || this.username.value == "") {
        e.preventDefault();
      }
    });

  if (
    window.location.pathname == "/signup/" ||
    window.location.pathname == "/signup"
  ) {
    document
      .querySelector("#login_form")
      .insertAdjacentHTML(
        "afterbegin",
        "<input type='text' name='token' placeholder='Token' required autocomplete='off' />"
      );
    document.querySelector("#login_form").setAttribute("action", "/signup");
  }
  if (window.location.hash == "#failed") {
    window.location.hash = "";
    M.toast({
      html: "Couldn't find a user with that username or password..",
      displayLength: 4000,
      classes: "red lighten"
    });
  }
});
