const url = "http://localhost:4000/";

function userDetail() {
    $("#teamDetails").hide();
    $("#noTeam").hide();
    $("#teamRegistrationForm").hide();
    $("#noEvents").hide();
    $("#eventsDetails").hide();

    $.ajax({
        url: url + "profile/user",
        method: "GET",
        headers: {
            //access token from local storage
            'x-access-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVkNzE0NWVlOTdlYzc2MzZjMDI2NzllZSIsImlhdCI6MTU2Nzg5NTMwNiwiZXhwIjoxNTY3OTgxNzA2fQ.Z1wowe_VpH0v83fuBgltiAceNe6S325-eZuQpLM5gz0"
        },
        cors: true,
        success: function (res) {
            console.log(res);

            //show user details accordingly
            $("#userName").val(res.user.name);
            $("#userPanId").val(res.user.pantheonId);
            $("#userEmail").val(res.user.email);
            $("#userPhone").val(res.user.phoneNo);
            $("#userClgId").val(res.user.clgId);
            $("#userClgName").val(res.user.clgName);
            $("#userClgCity").val(res.user.clgCity);
            $("#userClgState").val(res.user.clgState);

            //if a team is reistered then show team details
            if (res.user.teamName) {
                $("#teamName").val(res.user.teamName);
                $("#teamId").val(res.user.teamId);
                $("#teamSize").val(res.user.teamSize);

                let trHTML = '';
                $.each(res.user.teamMembers, function (i, item) {
                    trHTML += '<tr><td>' + item.pantheonId + '</td><td>' + item.email + '</td></tr>';
                });
                $('#teamDetails table').append(trHTML);

                $("#teamDetails").show();
            }
            //if there is no team then show the form for team registration
            else {
                $("#noTeam").show();

                $("#teamRegistrationButton").click(function () {
                    console.log("clicked!");
                    $("#teamRegistrationForm").toggle("slow");
                });
            }


            //show events details accordingly
            if (res.user.eventsRegistered) {

                let trHTML = '';
                $.each(res.user.eventsRegistered, function (i, item) {
                    trHTML += '<tr><td>' + "Event" + (i+1) + '</td><td>' + item.eventId + '</td></tr>';
                });
                $('#eventsDetails table').append(trHTML);

                $("#eventsDetails").show();
            }
            //if no events are there show it
            else{
                $("#noEvents").show();
            }

        },
        error: function (err) {
            console.log(err);
        }
    });
}

userDetail();