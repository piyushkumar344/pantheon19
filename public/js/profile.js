const url = "http://localhost:4000/";

var teamName = $("#teamNameFill").val().toString().trim().toLowerCase();
var teamSize = Number($("#teamSizeFill").val());
for (var i = teamSize; i < 8; i++) {
    $(`#teamMember${i}Pan`).prop('disabled', true);
    $(`#teamMember${i}Email`).prop('disabled', true);
}

$("#teamSizeFill").change(function () {
    for (var i = 1; i < 8; i++) {
        $(`#teamMember${i}Pan`).prop('disabled', false);
        $(`#teamMember${i}Email`).prop('disabled', false);
    }
    teamSize = Number($("#teamSizeFill").val());
    for (var i = teamSize; i < 8; i++) {
        $(`#teamMember${i}Pan`).prop('disabled', true);
        $(`#teamMember${i}Email`).prop('disabled', true);
    }
});

function userDetail() {
    $("#teamDetails").hide();
    $("#noTeam").hide();
    $("#noEvents").hide();
    $("#eventsDetails").hide();

    $.ajax({
        url: url + "profile/user",
        method: "GET",
        headers: {
            'x-access-token': localStorage.getItem("token")
        },
        cors: true,
        success: function (res) {
            console.log(res);

            //show user details accordingly
            $("#userName").val(res.user.name);
            $("#userPanId").val("PA-"+res.user.pantheonId);
            $("#userEmail").val(res.user.email);
            $("#userPhone").val(res.user.phoneNo);
            $("#userClgId").val(res.user.clgId);
            $("#userClgName").val(res.user.clgName);
            $("#userClgCity").val(res.user.clgCity);
            $("#userClgState").val(res.user.clgState);

            //if a team is registered then show team details
            if (res.user.teamName) {
                $("#teamName").val(res.user.teamName);
                $("#teamId").val("TA-"+res.user.teamId);
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
                $("#teamMember0Pan").val(res.user.pantheonId);
                $("#teamMember0Email").val(res.user.email);
                $("#teamMember0Pan").prop('disabled', true);
                $("#teamMember0Email").prop('disabled', true);
            }

            //show events details accordingly
            if (res.user.eventsRegistered) {

                let trHTML = '';
                $.each(res.user.eventsRegistered, function (i, item) {
                    trHTML += '<tr><td>' + "Event" + (i + 1) + '</td><td>' + item.eventId + '</td></tr>';
                });
                $('#eventsDetails table').append(trHTML);

                $("#eventsDetails").show();
            }
            //if no events are there show it
            else {
                $("#noEvents").show();
            }

        },
        error: function (err) {
            console.log(err);
        }
    });
}

userDetail();