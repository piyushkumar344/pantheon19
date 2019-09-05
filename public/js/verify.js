let url = "http://192.168.158.230:4000/auth";

$("#sEmail").hide();
$("#sotp").hide();
$("#sotp1").hide();
$("#sname").hide();
$("#smobile").hide();
$("#smobile1").hide();
$("#smobile2").hide();
$("#sclgname").hide();
$("#sclgstate").hide();
$("#sclgcity").hide();
$("#sclgroll").hide();
$('#sgender').hide();
$('#scollege').hide();

function verifyForm() {
    $("#sEmail").hide();
    $("#sotp").hide();
    $("#sotp1").hide();
    $("#sname").hide();
    $("#smobile").hide();
    $("#smobile1").hide();
    $("#smobile2").hide();
    $("#sclgname").hide();
    $("#sclgstate").hide();
    $("#sclgcity").hide();
    $("#sclgroll").hide();
    $('#sgender').hide();
    $('#scollege').hide();

    let email = $('#email').val().trim();
    let otp= $('#eotp').val();
    let name= $('#name').val().trim();
    let mobile = $('#mobile').val().trim();
    let gender = $("input:radio[ name=gen]:checked").val();
    let college= $("input:radio[ name=college]:checked").val();
    let collegename= $('#clgname').val().trim();
    let collegecity= $('#clgcity').val().trim();
    let collegestate= $('#clgstate').val().trim();
    let collegeroll= $('#clgroll').val().trim();
    
    if (email === "") {
        $("#sEmail").show();
        return;
    }
    
    if(otp ===""){
        $("#sotp").show();
        return;
    }
    if(otp.length!=6)
    {
        $('#sotp1').show();
        return;
    }
    
    if(name ===""){
        $('#sname').show();
        return;
    }

    if(mobile ===""){
        $('#smobile').show();
        return;
    }
    if(mobile.length!=10)
    {
        $('#smobile1').show();
        return;
    }
    if(isNaN(mobile)){
        $('#smobile2').show();
        return;
    }


    if(gender===undefined)
    {
        $('#sgender').show();
        return;
    }
    if(college===undefined)
    {
        $('#scollege').show();
        return;
    }

    if(collegename===""){
        $('#sclgname').show();
         return;
    }

    if(collegecity===""){
        $('#sclgcity').show();
         return;
    }
    if(collegestate===""){
        $('#sclgstate').show();
        return;
    }

    if(collegeroll===""){
        $('#sclgroll').show();
        return;
    }



    
    $.ajax({
        url: url + "/verify",
        method: "POST",
        data: {
            email: email,
            otp : otp,
            name : name,
            mobile: mobile,
            gender: gender,
            collegename : collegename,
            collegecity: collegecity,
            collegestate: collegestate,
            collegeroll:collegeroll
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