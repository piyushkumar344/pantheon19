(function ($) {
    'use strict';
    $(window).on('load', function () {
        setTimeout(function () {
            var preLoder = $("#preloader");
            preLoder.delay(200).fadeOut(500);
        }, 100);
    });
})(jQuery)
