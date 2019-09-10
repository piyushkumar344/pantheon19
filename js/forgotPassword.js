let url = "http://pantheonbit.com/api/auth"; //please change

$("#lEmail").hide();
$("#lCaptcha").hide();

function forgotPassword() {
    let email = $('#email').val().trim();
    let captchaToken = grecaptcha.getResponse();

    $("#lEmail").hide();
    $("#lCaptcha").hide();
    $("#email").css({ "border": "" });

    if (email === "") {
        $("#lEmail").show();
        return;
    }

    if (captchaToken === "") {
        $("#lCaptcha").show();
        return;
    }

    $("#btnForgotPassword").attr("disabled", true);

    $.ajax({
        url: url + "/forgotPassword",
        method: "POST",
        data: {
            email: email,
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
                $("#errMsg").css({ "color": "green" });
                $("#errMsg").text("An OTP has been sent to your registered email id");

                setTimeout(() => {
                    localStorage.setItem("token", res.token);
                    window.location = "changePassword.html";
                }, 1500);
            }
        },
        error: function (err) {
            $("#errMsg").text(res.message);
            setTimeout(function () {
                window.location.reload(true);
            }, 600);
        }
    });
}