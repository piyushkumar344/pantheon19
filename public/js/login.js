let url = "http://localhost:4000/auth";

$("#lEmail").hide();
$("#lPassword").hide();
$("#lCaptcha").hide();

function loginForm() {
    let email = $('#email').val().trim();
    let password = $('#password').val();
    let captchaToken = grecaptcha.getResponse();

    $("#lEmail").hide();
    $("#lPassword").hide();
    $("#lCaptcha").hide();
    $("#email").css({ "border": "" });
    $("#password").css({ "border": "" });

    if (email === "") {
        $("#lEmail").show();
        return;
    }

    if (password === "") {
        $("#lPassword").show();
        return;
    }

    if (captchaToken === "") {
        $("#lCaptcha").show();
        return;
    }

    $("#btnSignIn").attr("disabled", true);

    $.ajax({
        url: url + "/login",
        method: "POST",
        data: {
            email: email,
            password: password,
            captchaToken: captchaToken
        },
        crossDomain: true,
        success: function (res) {
            console.log(res);
            if (res.status !== 200) {
                $("#btnSignIn").attr("disabled", false);
                $("#errMsg").text(res.message);
            }
            else if (res.status === 200) {
                if (res.isVerfied === false) {
                    localStorage.setItem("token", res.token);
                    window.location = "verify.html";
                }
                else {
                    localStorage.setItem("token", res.token);
                    window.location = "profile.html";
                }
            }
        },
        error: function (err) {
            $("#btnSignIn").attr("disabled", false);
            $("#errMsg").text(err);
        }
    });
}