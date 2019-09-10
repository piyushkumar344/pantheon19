let url = "http://pantheonbit.com/api/auth";

$.ajax({
    url: url + "/getUserState",
    method: "GET",
    headers: {
        'x-access-token': localStorage.getItem("token")
    },
    crossDomain: true,
    success: function (res) {
        console.log(res);
        if (res.status !== 200) {
            // window.location = "login2.html";
        }
        else if (res.status === 200) {
            console.log(res);
            window.location = "profile.html";
        }
    },
    error: function (err) {
        console.log(err);
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
            if (res.status !== 200) {
                $("#errMsg").text(res.message);
                setTimeout(function() {
                    window.location.reload(true);
                }, 600);
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
            $("#errMsg").text(err);
            setTimeout(function() {
                window.location.reload(true);
            }, 600);
        }
    });
}