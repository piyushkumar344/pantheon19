//side navbar

function openNav() {
    $("#mySidenav").show("slide", {direction: "right"});
    // document.getElementById("mySidenav").style.display = "block";

    // document.getElementById("mySidenav").style.width = "210px";
    // document.getElementById("main").style.marginRight = "210px";
}

function closeNav() {
    $("#mySidenav").hide("slide", {direction: "right"});
    // document.getElementById("mySidenav").style.display = "none";

    // document.getElementById("mySidenav").style.width = "0";
    // document.getElementById("main").style.marginRight = "0";
}

//scroll to id

$(document).ready(function () {
    $("a").on("click", function (event) {
        $("#mySidenav").hide("slide", {direction: "right"});
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $("html, body").animate(
                {
                    scrollTop: $(hash).offset().top
                },
                400,
                function () {
                    window.location.hash = hash;
                }
            );
        }
    });
});

//back to top

// function scrollFunction() {
//     if (
//         document.body.scrollTop > 1000 ||
//         document.documentElement.scrollTop > 1000
//     ) {
//         document.getElementById("myBtn").style.display = "block";
//     } else {
//         document.getElementById("myBtn").style.display = "none";
//     }
// }

// window.onscroll = function () {
//     scrollFunction();
// };