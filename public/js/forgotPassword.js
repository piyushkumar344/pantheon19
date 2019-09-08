let url = "http://localhost:4000/auth"; //please change

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
            console.log(res);
            if (res.status !== 200) {
                $("#btnForgotPassword").attr("disabled", false);
                $("#errMsg").text(res.message);
            }
            else if (res.status === 200) {
                if (res.isVerfied === false) {
                    localStorage.setItem("token", res.token);
                    window.location = "login2.html";
                }
                else {
                    $("#errMsg").css({"color":"green"});
                    $("#errMsg").text("An OTP has been sent to your registered email id");

                    setTimeout(() => {
                        localStorage.setItem("token", res.token);
                        window.location = "changePassword.html";
                    }, 2000);
                    
                }
            }
        },
        error: function (err) {
            $("#btnForgotPassword").attr("disabled", false);
            $("#errMsg").text(err);
        }
    });
}