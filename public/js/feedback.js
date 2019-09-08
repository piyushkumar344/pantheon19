const url = "http://localhost:4000";

$("#feedbackForm").submit(function (e) {
    e.preventDefault();
    const name = $("#feedbackName").val().toString().trim();
    const email = $("#feedbackEmail").val().toString().trim();
    const message = $("#feedbackMessage").val().toString().trim();
    const captchaToken = grecaptcha.getResponse();

    if (name === "" || email === "" || message === "" || captchaToken === "") {
        $("#feedbackErrMsg").text("Missing Fields");
        return false;
    }

    $.ajax({
        url: url + "/sendFeedback",
        method: "POST",
        data: {
            name: name,
            email: email,
            message: message
        },
        crossDomain: true,
        success: function (res) {
            console.log(res);
            if (res.status !== 200) {
                $("#feedbackErrMsg").text(res.message);
            }
            else if (res.status === 200) {
                $("#feedbackErrMsg").text(res.message);
                setTimeout(function () {
                    $("#feedbackErrMsg").text("");
                }, 6000);
                $("#feedbackName").val("");
                $("#feedbackEmail").val("");
                $("#feedbackMessage").val("");
            }
        },
        error: function (err) {
            $("#feedbackErrMsg").text(err);
            $("#feedbackErrMsg").fadeOut(3000);
        }
    });

    return false;

});

$("#feedbackResetButton").on("click", () => {
    $("#feedbackErrMsg").hide();
});

