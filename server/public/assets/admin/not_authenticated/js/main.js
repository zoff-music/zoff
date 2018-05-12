$(document).on("click", "#login_button", function(e){
  e.preventDefault();
  $("#login_form").submit();
})

$(document).ready(function(){
  if(window.location.pathname == "/signup/" || window.location.pathname == "/signup"){
    $("#login_form").prepend("<input type='text' name='token' placeholder='Token' required autocomplete='off' />");
    $("#login_form").attr("action", "/signup");
  }
  if(window.location.hash == "#failed") {
      window.location.hash = "";
      Materialize.toast("Couldn't find a user with that username or password..", 4000, "red lighten");
  }
});


$(document).on("submit", "#login_form", function(e){
  if(this.password.value == "" || this.username.value == ""){
    e.preventDefault();
  }
})
