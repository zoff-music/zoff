$(document).ready(function() {
    $("#about").modal();
    $(".help-button-footer").hide();
    $("#contact").modal();

    Helper.setHtml("#contact-container", "");
    Helper.setHtml("#contact-container", "Send a mail to us: <a title='Open in client' href='mailto:contact@zoff.me?Subject=Contact%20Zoff'>contact@zoff.me</a>");
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
        Helper.removeClass(".full-form-token", "hide");
        var captcha_response = grecaptcha.getResponse();
        Helper.ajax({
            type: "POST",
            url: "/api/apply",
            data: {
                origin: origin,
                email: email,
                "g-recaptcha-response": captcha_response,
            },
            success: function(response) {
                Helper.addClass(".full-form-token", "hide");
                if(response == "success") {
                    M.toast({html: "Email sent!", displayLength: 3000, classes: "green lighten"});
                } else {
                    $("#email_address").attr("readonly", false);
                    $(".submit").toggleClass("disabled");
                    $("#origin").attr("readonly", false);
                    grecaptcha.reset();
                    M.toast({html: "Something went wrong. Sure that email hasn't been used for another token?",displayLength: 3000, classes: "red lighten"});
                }
            },
            error: function(response) {
                Helper.addClass(".full-form-token", "hide");
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
