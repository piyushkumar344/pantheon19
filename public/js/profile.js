const url = "http://localhost:4000/";
$("#errMsg").hide();

$("#signOutLink").click(function () {
  localStorage.setItem("token", "");
  window.location.href = "login.html";
});

var teamName = $("#teamNameFill")
  .val()
  .toString()
  .trim()
  .toLowerCase();
var teamSize = Number($("#teamSizeFill").val());
for (var i = teamSize; i < 8; i++) {
  $(`#teamMember${i}Pan`).prop("disabled", true);
  $(`#teamMember${i}Email`).prop("disabled", true);
}

$("#teamSizeFill").change(function () {
  for (var i = 1; i < 8; i++) {
    $(`#teamMember${i}Pan`).prop("disabled", false);
    $(`#teamMember${i}Email`).prop("disabled", false);
  }
  teamSize = Number($("#teamSizeFill").val());
  for (var i = teamSize; i < 8; i++) {
    $(`#teamMember${i}Pan`).prop("disabled", true);
    $(`#teamMember${i}Email`).prop("disabled", true);
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
      "x-access-token": localStorage.getItem("token")
    },
    cors: true,
    success: function (res) {

      //show user details accordingly
      $("#userName").val(res.user.name);
      $("#userPanId").val("PA-" + res.user.pantheonId);
      $("#userEmail").val(res.user.email);
      $("#userPhone").val(res.user.phoneNo);
      $("#userClgId").val(res.user.clgId);
      $("#userClgName").val(res.user.clgName);
      $("#userClgCity").val(res.user.clgCity);
      $("#userClgState").val(res.user.clgState);

      //if a team is registered then show team details
      if (res.user.teamName) {
        $("#teamName").val(res.user.teamName);
        $("#teamId").val("TA-" + res.user.teamId);
        $("#teamSize").val(res.user.teamSize);

        let trHTML = "";
        for (let i = 0; i < res.user.teamMembers.length; i++) {
          trHTML += `<tr><th scope="row">${i + 1}</th><td>PA-${
            res.user.teamMembers[i].pantheonId
            }</td><td>${res.user.teamMembers[i].email}</td></tr>`;
        }
        $("#teamTable").append(trHTML);
        $("#teamDetails").show();
      }
      //if there is no team then show the form for team registration
      else {
        $("#noTeam").show();
        $("#teamMember0Pan").val(res.user.pantheonId);
        $("#teamMember0Email").val(res.user.email);
        $("#teamMember0Pan").prop("disabled", true);
        $("#teamMember0Email").prop("disabled", true);
      }

      //show events details accordingly
      if (res.user.teamId) {
        let trHTML = "";
        let eventArr = [
          "ILLUMINATI",
          "DROID TROOPER",
          "CUBE-DE-CEMENTO",
          "CODEZILLA",
          "EUREKA"
        ];
        let flagshipLinks = [
          "illuminati.html",
          "droid_trooper.html",
          "cube_de_cemento.html",
          "codezilla.html",
          "eureka.html"
        ];
        for (let i = 0; i < 5; i++) {
          if (res.user.isTeamLeader === true) {
            let check = false;
            for (let j = 0; j < res.user.eventsRegistered.length; j++) {
              if (i + 1 === res.user.eventsRegistered[j].eventId) {
                trHTML += `<tr><th scope="row">${i + 1}</th><td><a class="flagshipLink" target="_blank" href="${flagshipLinks[i]}">${
                  eventArr[i]
                  }</a></td><td><button value=${i +
                  1} disabled onclick="registerEvent(event)" class="btn">Register</button></td><td><button value=${i +
                  1} onclick="deregisterEvent(event)" class="btn btn-danger">Withdraw</button></td></tr>`;
                check = true;
                break;
              }
            }

            if (!check) {
              trHTML += `<tr><th scope="row">${i + 1}</th><td><a class="flagshipLink" target="_blank" href="${flagshipLinks[i]}">${
                eventArr[i]
                }</a></td><td><button value=${i +
                1} onclick="registerEvent(event)" class="btn btn-success">Register</button></td><td><button value=${i +
                1} onclick="deregisterEvent(event)" disabled class="btn">Withdraw</button></td></tr>`;
            }
          } else {
            trHTML += `<tr><th scope="row">${i + 1}</th><td><a class="flagshipLink" target="_blank" href="${flagshipLinks[i]}">${
              eventArr[i]
              }</a></td><td><button value=${i +
              1} class="btn" onclick="registerEvent(event)" disabled>Register</button></td><td><button value=${i +
              1} onclick="deregisterEvent(event)" disabled class="btn">Withdraw</button></td></tr>`;
          }
        }
        $("#eventTable").append(trHTML);

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

function registerEvent(event) {
  $.confirm({
    title: "Confirm!",
    content: "Are you sure you want register for this event?",
    theme: "supervan",
    buttons: {
      Confirm: function () {
        let eventId = Number(event.target.value);
        $.ajax({
          url: url + "profile/eventRegister",
          method: "POST",
          headers: {
            "x-access-token": localStorage.getItem("token")
          },
          data: {
            eventId: eventId
          },
          crossDomain: true,
          success: function (res) {
            if (res.status !== 200) {
              $("#errMsg").text(res.message);
            } else if (res.status === 200) {
              $("#errMsg").show();
              $("#errMsg").css({ color: "green" });
              $("#errMsg").text("Event succesfully registered");
              event.target.disabled = true;
              event.target.classList.remove("btn-success");
              event.path[2].childNodes[3].childNodes[0].classList.add(
                "btn-danger"
              );
              event.path[2].childNodes[3].childNodes[0].disabled = false;
              setTimeout(() => {
                $("#errMsg").hide();
              }, 3000);
            }
          },
          error: function (err) {
            $("#errMsg").text(err);
          }
        });
      },
      Cancel: function () {
        //do nothing
      }
    }
  });
}

function deregisterEvent(event) {
  $.confirm({
    title: "Confirm!",
    content: "Are you sure you want to withdraw from this event?",
    theme: "supervan",
    buttons: {
      Confirm: function () {
        let eventId = Number(event.target.value);
        $.ajax({
          url: url + "profile/eventDeregister",
          method: "POST",
          headers: {
            "x-access-token": localStorage.getItem("token")
          },
          data: {
            eventId: eventId
          },
          crossDomain: true,
          success: function (res) {
            if (res.status !== 200) {
              $("#errMsg").text(res.message);
            } else if (res.status === 200) {
              $("#errMsg").show();
              $("#errMsg").css({ color: "green" });
              $("#errMsg").text("Event succesfully withdrawn");
              event.target.disabled = true;
              event.target.classList.remove("btn-danger");
              event.path[2].childNodes[2].childNodes[0].classList.add(
                "btn-success"
              );
              event.path[2].childNodes[2].childNodes[0].disabled = false;
              setTimeout(() => {
                $("#errMsg").hide();
              }, 3000);
            }
          },
          error: function (err) {
            $("#errMsg").text(err);
          }
        });
      },
      Cancel: function () {
        //do nothing
      }
    }
  });
}
