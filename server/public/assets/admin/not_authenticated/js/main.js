$(document).on("click", "#login_button", function(e){
  e.preventDefault();
  $("#login_form").submit();
})

$(document).ready(function(){
  if(window.location.pathname == "/signup/" || window.location.pathname == "/signup"){
    $("#login_form").prepend("<input type='text' name='token' placeholder='Token' required autocomplete='off' />");
    $("#login_form").attr("action", "/signup");
  }
});


$(document).on("submit", "#login_form", function(e){
  if(this.password.value == "" || this.username.value == ""){
    e.preventDefault();
  }
})
