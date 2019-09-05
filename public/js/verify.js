let url = "http://192.168.158.230:4000/auth";

function verifyForm() {
    let email = $('#email').val().trim();
    let password = $('#password').val();
    let captchaToken = grecaptcha.getResponse();

    if (email === "") {
        return;
    }

    if (password === "") {
        return;
    }

    if (captchaToken === "") {
        return;
    }

    $.ajax({
        url: url + "/verify",
        method: "POST",
        data: {
            email: email,
            password: password,
            captchaToken: captchaToken
        },
        crossDomain: true,
        success: function (res) {
            console.log(res);
            if (res.status != 200) {
                alert(res.message);
            }
            else if (res.status == 200) {
                if (res.isVerfied == false) {
                    console.log("user not verified");
                    var id = res.id;
                    var token = res.token;
                    localStorage.id = id;
                    localStorage.token = token;
                    window.location = "notverified.html";
                }
                else {
                    console.log("user verified");
                    window.location = "verified.html";
                }
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}


function autoFill() {
    $('#clgname').val("Birla Institute of Technology") ;
    $('#clgcity').val("Ranchi") ;
    $('#clgstate').val("Jharkhand") ;

    $( "#clgname" ).prop( "disabled", true );
    $( "#clgcity" ).prop( "disabled", true );
    $( "#clgstate" ).prop( "disabled", true );
}

function erase() {
    $( "#clgname" ).prop( "disabled", false );
    $( "#clgcity" ).prop( "disabled", false );
    $( "#clgstate" ).prop( "disabled", false );

    $('#clgname').val("") ;
    $('#clgcity').val("") ;
    $('#clgstate').val("") ;
}