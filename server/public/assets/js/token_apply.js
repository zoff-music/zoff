$(document).ready(function() {
    $("#about").modal();
    $(".help-button-footer").hide();
    $("#contact").modal();

    $("#contact-container").empty();
    $("#contact-container").html("Send a mail to us: <a title='Open in client' href='mailto:contact@zoff.me?Subject=Contact%20Zoff'>contact@zoff.me</a>");
    $("#submit-contact-form").hide();

    ga('send', 'pageview');

    if(!Helper.mobilecheck()) {
        $("#iframe-container").append('<iframe id="iframe" src="https://zoff.me/_embed#celebrate&808080" width="600px" height="300px"></iframe>');
    }

    $(".token-form").on("submit", function(e) {
        e.preventDefault();
        var email = $("#email_address").val();
        var origin = $("#origin").val();
        $("#origin").attr("readonly", true);
        $("#email_address").attr("readonly", true);
        $(".submit").toggleClass("disabled");
        $(".full-form-token").removeClass("hide");
        var captcha_response = grecaptcha.getResponse();
        $.ajax({
            type: "POST",
            url: "/api/apply",
            data: {
                origin: origin,
                email: email,
                "g-recaptcha-response": captcha_response,
            },
            success: function(response) {
                $(".full-form-token").addClass("hide");
                if(response == "success") {
                    Materialize.toast("Email sent!", 3000, "green lighten");
                } else {
                    $("#email_address").attr("readonly", false);
                    $(".submit").toggleClass("disabled");
                    $("#origin").attr("readonly", false);
                    grecaptcha.reset();
                    Materialize.toast("Something went wrong. Sure that email hasn't been used for another token?", 3000, "red lighten");
                }
            },
            error: function(response) {
                $(".full-form-token").addClass("hide");
                $("#email_address").attr("readonly", false);
                $(".submit").toggleClass("disabled");
            }
        });
    });

    $('#submit-contact-form').on('click', function(e) {
        e.preventDefault();
        $("#contact-form").submit();
    });
});
