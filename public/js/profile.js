function userDetail() {
    $.ajax({
        url: url + "/profile/user",
        method: "GET",
        headers: {
            'x-access-token':window.localStorage.getItem("token")
        },
        crossDomain: true,
        success: function (res) {
            console.log(res);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

userDetail();