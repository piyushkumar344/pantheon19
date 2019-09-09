let url = "http://localhost:4000/auth"; //please change 

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
            console.log(res);
            if (res.status !== 200) {
                $("#errMsg").text(res.message);
                setTimeout(function () {
                    window.location.reload(true);
                }, 600);
            }
            else if (res.status === 200) {
                if (res.isVerfied === false) {
                    localStorage.setItem("token", res.token);
                    window.location = "login.html";
                }
                else {
                    localStorage.setItem("token", res.token);
                    window.location = "login.html";
                }
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