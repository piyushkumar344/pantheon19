const url = "http://localhost:4000/";



$("#signOutLink").click(function () {
    localStorage.setItem("token", "");
    window.location.href = "login2.html";
});

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
                for(let i=0;i<res.user.teamMembers.length;i++){
                    trHTML +=`<tr><th scope="row">${i+1}</th><td>PA-${res.user.teamMembers[i].pantheonId}</td><td>${res.user.teamMembers[i].email}</td></tr>`;
                }
                $('#teamTable').append(trHTML);
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
                for(let i=0;i<res.user.eventsRegistered.length;i++)
                {
                    trHTML+=`<tr><th scope="row">${res.user.eventsRegistered[i].eventId}</th><td>${res.user.eventsRegistered[i].eventName}</td><td><button class="btn btn-success">Register</button></td><td><button class="btn btn-danger">Deregister</button></td></tr>`
                }
                $('#eventTable').append(trHTML);

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

