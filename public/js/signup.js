let url = "http://192.168.158.230:8000/auth";

$("#sEmail").hide();
$("#sPassword").hide();
$("#sCnfPassword").hide();
$("#sPasswordMatch").hide();
$("#sCaptcha").hide();

function signupForm() {
    let email = $('#email').val().trim();
    let password = $('#password').val();
    let confirmPassword = $('#confirmPassword').val();
    let captchaToken = grecaptcha.getResponse();

    $("#sEmail").hide();
    $("#sPassword").hide();
    $("#sCnfPassword").hide();
    $("#sPasswordMatch").hide();
    $("#sCaptcha").hide();
    $("#email").css({ "border": "" });
    $("#password").css({ "border": "" });
    $("#confirmPassword").css({ "border": "" });

    if (email === "") {
        $("#email").css({ "border": "2px solid red" });
        $("#sEmail").show();
        return;
    }

    if (password === "") {
        $("#password").css({ "border": "2px solid red" });
        $("#sPassword").show();
        return;
    }

    if (confirmPassword === "") {
        $("#confirmPassword").css({ "border": "2px solid red" });
        $("#sCnfPassword").show();
        return;
    }

    if (confirmPassword !== password) {
        $("#confirmPassword").css({ "border": "2px solid red" });
        $("#sPasswordMatch").show();
        return;
    }

    if (captchaToken === "") {
        $("#sCaptcha").show();
        return;
    }

    $("#btnSignUp").attr("disabled", true);

    $.ajax({
        url: url + "/register",
        method: "POST",
        data: {
            email: email,
            password: password,
            confPassword: confirmPassword,
            captchaToken: captchaToken
        },
        crossDomain: true,
        success: function (res) {
            console.log(res);
        },
        error: function (xhr, status) {
            alert("error");
        }
    });
}