let url = "https://pantheonbit.com/api/auth"; //please change 

$("#lEmail").hide();
$("#lCaptcha").hide();
$('#lConfPassword').hide();
$('#lOTP').hide();
$('#lPassword').hide();

function changePassword() {
    let email = $('#email').val().trim();
    let captchaToken = grecaptcha.getResponse();
    let password = $('#password').val();
    let confPassword = $('#confPassword').val();
    let emailOTP = $('#OTP').val();

    $("#lEmail").hide();
    $("#lCaptcha").hide();
    $('#lConfPassword').hide();
    $('#lOTP').hide();
    $('#lPassword').hide();

    $("#email").css({ "border": "" });
    $("#password").css({ "border": "" });
    $("#confPassword").css({ "border": "" });
    $("#OTP").css({ "border": "" });

    if (email === "") {
        $("#lEmail").show();
        return;
    }

    if (captchaToken === "") {
        $("#lCaptcha").show();
        return;
    }

    if (password === "") {
        $('#lpassword').show();
        return;
    }

    if (confPassword === "") {
        $('#lConfPassword').show();
        return;
    }

    if (emailOTP === "") {
        $('#lOTP').show();
        return;
    }

    $("#btnChangePassword").attr("disabled", true);

    $.ajax({
        url: url + "/changePassword",
        method: "POST",
        data: {
            email: email,
            password: password,
            confPassword: confPassword,
            emailOTP: emailOTP,
            captchaToken: captchaToken
        },
        crossDomain: true,
        success: function (res) {
            if (res.status !== 200) {
                $("#errMsg").text(res.message);
                $("#btnChangePassword").attr("disabled", false);
                grecaptcha.reset();
            }
            else if (res.status === 200) {
                $("#errMsg").css({ "color": "green" });
                $("#errMsg").text("*Password changed Successfully");
                localStorage.setItem("token", res.token);

                setTimeout(() => {
                    window.location = "changePassword.html";
                }, 1500);
            }
        },
        error: function (err) {
            $("#errMsg").text(res.message);
            $("#btnChangePassword").attr("disabled", true);
            grecaptcha.reset();
        }
    });
}