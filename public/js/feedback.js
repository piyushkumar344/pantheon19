const url = "http://localhost:4000/";

$("#feedbackForm").submit(function (e) {
    e.preventDefault();
    const name = $("#feedbackName").val();
    const email = $("#feedbackEmail").val();
    const message = $("#feedbackMessage").val();

    console.log("hiii");
    $.ajax({
        url: url + "sendFeedback",
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

