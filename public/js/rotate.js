var c = document.getElementById('starfield');
var n = c.getContext('2d');
c.width = $(window).width();
c.height = $(window).height();

// View matrix, defines where you're looking
var viewMtx = mat4.create();

// Projection matrix, defines how the view maps onto the screen
var projMtx = mat4.create();

// Adapted from http://stackoverflow.com/questions/18404890/how-to-build-perspective-projection-matrix-no-api
function ComputeProjMtx(field_of_view, aspect_ratio, near_dist, far_dist, left_handed) {
    // We'll assume input parameters are sane.
    field_of_view = field_of_view * Math.PI / 180.0; // Convert degrees to radians
    var frustum_depth = far_dist - near_dist;
    var one_over_depth = 1 / frustum_depth;
    var e11 = 1.0 / Math.tan(0.5 * field_of_view);
    var e00 = (left_handed ? 1 : -1) * e11 / aspect_ratio;
    var e22 = far_dist * one_over_depth;
    var e32 = (-far_dist * near_dist) * one_over_depth;
    return [
        e00, 0, 0, 0,
        0, e11, 0, 0,
        0, 0, e22, e32,
        0, 0, 1, 0
    ];
}

// Make a view matrix with a simple rotation about the Y axis (up-down axis)
function ComputeViewMtx(angle) {
    angle = angle * Math.PI / 180.0; // Convert degrees to radians
    return [
        Math.cos(angle), 0, Math.sin(angle), 0,
        0, 1, 0, 0,
        -Math.sin(angle), 0, Math.cos(angle), 0,
        0, 0, 0, 1
    ];
}


projMtx = ComputeProjMtx(70, c.width / c.height, 1, 200, true);

var angle = 0;

var viewProjMtx = mat4.create();

var minDist = 100;
var maxDist = 1000;

function Star() {
    var d = 0;
    do {
        // Create random points in a cube.. but not too close.
        this.x = Math.random() * maxDist - (maxDist / 2);
        this.y = Math.random() * maxDist - (maxDist / 2);
        this.z = Math.random() * maxDist - (maxDist / 2);
        var d = this.x * this.x +
            this.y * this.y +
            this.z * this.z;
    } while (
        d > maxDist * maxDist / 4 || d < minDist * minDist
    );
    this.dist = Math.sqrt(d);
}

Star.prototype.AsVector = function () {
    return [this.x, this.y, this.z, 1];
}

var stars = [];
for (var i = 0; i < 5000; i++) stars.push(new Star());

var lastLoop = Date.now();

function loop() {

    var now = Date.now();
    var dt = (now - lastLoop) / 1000.0;
    lastLoop = now;

    angle += 3.0 * dt;

    viewMtx = ComputeViewMtx(angle);

    //console.log('---');
    //console.log(projMtx);
    //console.log(viewMtx);

    mat4.multiply(viewProjMtx, projMtx, viewMtx);
    //console.log(viewProjMtx);

    n.beginPath();
    n.rect(0, 0, c.width, c.height);
    n.closePath();
    n.fillStyle = '#14161E';
    n.fill();

    n.fillStyle = '#fff';

    var v = vec4.create();
    for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        vec4.transformMat4(v, star.AsVector(), viewProjMtx);
        v[0] /= v[3];
        v[1] /= v[3];
        v[2] /= v[3];
        //v[3] /= v[3];

        if (v[3] < 0) continue;

        var x = (v[0] * 0.5 + 0.5) * c.width;
        var y = (v[1] * 0.5 + 0.5) * c.height;

        // Compute a visual size...
        // This assumes all stars are the same size.
        // It also doesn't scale with canvas size well -- we'd have to take more into account.
        var s = 200 / star.dist;


        n.beginPath();
        n.arc(x, y, s, 0, Math.PI * 2);
        //n.rect(x, y, s, s);
        n.closePath();
        n.fill();
    }

    window.requestAnimationFrame(loop);
}

loop();