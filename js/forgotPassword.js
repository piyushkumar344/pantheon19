let url = "https://pantheonbit.com/api/auth"; //please change

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
    $('.rotator').addClass('spinner');
    
    $.ajax({
        url: url + "/forgotPassword",
        method: "POST",
        data: {
            email: email,
            captchaToken: captchaToken
        },
        crossDomain: true,
        success: function (res) {
            $('.rotator').removeClass('spinner');
            if (res.status !== 200) {
                $("#errMsg").text(res.message);
                $("#btnForgotPassword").attr("disabled", false);
                grecaptcha.reset();
            }
            else if (res.status === 200) {
                $("#errMsg").css({ "color": "green" });
                $("#errMsg").text("An OTP has been sent to your registered email id");
                localStorage.setItem("token", res.token);

                setTimeout(() => {
                    window.location = "changePassword.html";
                }, 1500);
            }
        },
        error: function (err) {
            $('.rotator').removeClass('spinner');
            $("#errMsg").text(res.message);
            $("#btnForgotPassword").attr("disabled", false);
            grecaptcha.reset();
        }
    });
}