let url1 = "https://pantheonbit.com/api";

$.ajax({
    url: url1 + "/event/getFormalEvents",
    method: "GET",
    crossDomain: true,
    success: function(res) {
        for (i = 0; i < res.length; i++) {
            $(".main1").append(eventsTemplate(res[i], i));
        }
    },
    error: function(err) {
        alert("Some Error Occured, while fetching Events");
    }


});

// ----------------------------------------------------------------------

function eventsTemplate(events, i) {
    return (`
        <div class="col-md-6 col-lg-3 mb-4 events-container">

        <img class="img-fluid" src="./images/events/${events.eventName}.png" data-toggle="modal"
        data-target="#event${i}Modal" alt="event ${i+1} poster">

        <div class="modal fade" id="event${i}Modal" tabindex="-1" role="dialog"
        aria-labelledby="event${i}ModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="event${i}ModalTitle">${events.eventName}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-6">
                                <h4 class="oganisingClubs"> <span class="text-underline">Organising Club:</span> &nbsp ${events.club} </h4>
                                <br>
                                <h4> <span class="text-underline">Venue:</span> &nbsp ${events.venue} </h4>
                                <br>
                                <h4> <span class="text-underline">Timing:</span> &nbsp ${events.timing} </h4>
                                <br>
                                <h4> <span class="text-underline">Team Size:</span> &nbsp ${events.teamSize} </h4>
                                <br>
                            </div>

                            <div class="col-md-6">
                                <img class="img-fluid modal-image zoom" src="./images/events/${events.eventName}.png"
                                    alt="${events.eventName}">
                            </div>
                        </div>
                    </div>
                    <br>
                    <h4 class="text-center modal-description">Description</h4>
                    <p>${events.description}</p>
                    <h4 class="text-underline text-center">Event coodinator</h4>
                    <h6 class="text-center">${events.coordinators}</h6>

                </div>
            </div>
        </div>
     </div>
    </div>`);
}