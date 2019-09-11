let url = "https://pantheonbit.com/api/auth";

$.ajax({
    url: url + "/getUserState",
    method: "GET",
    headers: {
        'x-access-token': localStorage.getItem("token")
    },
    crossDomain: true,
    success: function (res) {
        if (res.status !== 200) {
            // window.location = "login2.html";
        }
        else if (res.status === 200) {
            window.location = "profile.html";
        }
    },
    error: function (err) {
    }
});




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
    $('.rotator').addClass('spinner');

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
            $('.rotator').removeClass('spinner');
            if (res.status !== 200) {
                $("#errMsg").text(res.message);
                $("#btnSignIn").attr("disabled", false);
                grecaptcha.reset();
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
            $('.rotator').removeClass('spinner');
            $("#errMsg").text(err);
            $("#btnSignIn").attr("disabled", false);
            grecaptcha.reset();
        }
    });
}