window.addEventListener("DOMContentLoaded", function(e) {
    M.Modal.init(document.getElementById("about"));
    M.Modal.init(document.getElementById("contact"));
    Helper.addClass(".help-button-footer", "hide");

    Helper.setHtml("#contact-container", "");
    Helper.setHtml("#contact-container", "Send a mail to us: <a title='Open in client' href='mailto:contact@zoff.me?Subject=Contact%20Zoff'>contact@zoff.me</a>");
    Helper.css("#submit-contact-form", "display", "none");

    var page = window.location.pathname;
    if(page.substring(page.length - 1) != "/") page += "/";
    ga('send', 'pageview', page);

    if(!Helper.mobilecheck()) {
        if(document.querySelector("#iframe-container")) {
            document.getElementById("iframe-container").insertAdjacentHTML("beforeend", '<iframe id="iframe" src="https://zoff.me/_embed#celebrate&808080&autoplay" width="600px" height="300px" allow="autoplay"></iframe>');
        }
    }

    document.getElementsByClassName("token-form")[0].addEventListener("submit", function(e) {
        e.preventDefault();
        var email = document.getElementById("email_address").value;
        var origin = document.getElementById("origin").value;
        document.getElementById("origin").setAttribute("readonly", true);
        document.getElementById("email_address").setAttribute("readonly", true);
        Helper.toggleClass(".submit", "disabled");
        Helper.removeClass(".full-form-token", "hide");
        var captcha_response = grecaptcha.getResponse();
        Helper.ajax({
            type: "POST",
            url: "/api/apply",
            headers: {"Content-Type": "application/json;charset=UTF-8"},
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
                    document.getElementById("email_address").setAttribute("readonly", false);
                    Helper.toggleClass(".submit", "disabled");
                    document.getElementById("origin").setAttribute("readonly", false);
                    grecaptcha.reset();
                    M.toast({html: "Something went wrong. Sure that email hasn't been used for another token?",displayLength: 3000, classes: "red lighten"});
                }
            },
            error: function(response) {
                Helper.addClass(".full-form-token", "hide");
                document.getElementById("email_address").setAttribute("readonly", false);
                Helper.toggleClass(".submit", "disabled");
            }
        });
    });

    document.getElementById('submit-contact-form').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById("contact-form").submit();
    });
});
