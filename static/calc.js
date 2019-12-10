var crankpoint;
var padPoint;

$(document).ready(function() {
    $('#bike_form').validate();
    $('#save').click(function(){
        $.ajax({
           type: "POST",
           url:  "/save",
           contentType:"application/json; charset=utf-8",

            data: JSON.stringify({
                id: $('#id').val(),
                name: $('#name').val(),
                type: $('#type').val(),
                data:{
                    bike:{
                        stack: $('#stack').val(),
                        reach: $('#reach').val(),
                        st_length: $('#st_length').val(),
                        st_angle: $('#st_angle').val(),
                        ht_length: $('#ht_length').val(),
                        ht_angle: $('#ht_angle').val(),
                        ft_center: $('#ft_center').val(),
                        wheelbase: $('#wheelbase').val(),
                        bb_drop: $('#bb_drop').val(),

                        crank_length: $('#crank_length').val(),
                        crank_angle: $('#crank_angle').val(),
                        bb_rail: $('#bb_rail').val(),
                        saddle_offset: $('#saddle_offset').val(),
                        spacer_height: $('#spacer_height').val(),
                        stem_length: $('#stem_length').val(),
                        stem_angle: $('#stem_angle').val(),
                        pad_stack: $('#pad_stack').val(),
                        pad_offset: $('#pad_offset').val(),
                        ext_length: $('#ext_length').val(),
                        ext_angle: $('#ext_angle').val(),
                    },
                    fit:{
                        ft_length: $('#ft_length').val(),
                        low_leglength: $('#low_leglength').val(),
                        up_leglength: $('#up_leglength').val(),
                        torso_length: $('#torso_length').val(),
                        up_armlength: $('#up_armlength').val(),
                        low_armlength: $('#low_armlength').val()
                    }
                }
             })
         }).done(function(data, status){
            if(data.redirect){
                alert("Bike created");
                window.location.replace(data.redirect);
            }else{
                $('#id').val(data.id);
                alert("Bike data saved");
            }
         })
     });

    $('input').on('keyup blur', function() {
        if ($('#bike_form').valid() == true) {
            paper.project.activeLayer.removeChildren();
            drawFrame();
            drawRider();
        }
        paper.view.draw();
    });

    var canvas = document.getElementById('canvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    paper.settings.listenEvents = false;
    paper.view.onResize = function(event) {
        center = new paper.Point(canvas.width / 2, canvas.height /2)
        paper.view.center = center
        paper.view.translate(paper.view.center.x, canvas.height + 200)
        if ($('#bike_form').valid() == true) {
            paper.project.activeLayer.removeChildren();
            drawFrame();
            drawRider();
        }
        paper.view.draw();
    }
    paper.project.currentStyle = {
        strokeColor: 'black',
        strokeWidth: 3
    };
    center = new paper.Point(canvas.width / 2, canvas.height / 2)
    paper.view.center = center
    paper.view.translate(paper.view.center.x, canvas.height + 200)

    paper.view.scale(.3)

    if ($('#bike_form').valid()) {
        drawFrame();
        drawRider();
    }else{
        var raster = new paper.Raster({source: '/static/sample-lg-min.png', position: paper.view.center});
    }
    paper.view.draw();
});

function drawFrame() {
    crankpoint = initPoint($('#crank_length').val(), $('#crank_angle').val());
    var baseStyle = {
        strokeJoin: 'bevel',
        strokeWidth: 5
    };
    var frameStyle = {
        strokeWidth: 20,
        strokeJoin: 'bevel'
    };
        var textStyle = {
        fillColor: 'black',
        fontSize: 50
    };

    // Create a Paper.js Path to draw a line into it:
    var circle = new paper.Path.Circle(0, 0, 100);
    circle.style = baseStyle;
    var crankarm = new paper.Path.Line(0, 0, crankpoint.x, crankpoint.y);
    crankarm.style = baseStyle;

    var stAngle = parseFloat($('#st_angle').val());
    var seattube = initPoint($('#st_length').val(), 180 + stAngle);
    var frame = new paper.Path.Line(0, 0, seattube);
    frame.style = frameStyle;
    frame.closed = true;
    var stackpoint = new paper.Point(parseFloat($('#reach').val()), parseFloat(-$('#stack').val()));
    frame.add(stackpoint);
    var lowerstack = new paper.Point(0, parseFloat($('#ht_length').val()));
    var htAngle = parseFloat($('#ht_angle').val());
    lowerstack.angle = htAngle;
    var lowerpoint = new paper.Point(stackpoint.x + lowerstack.x, stackpoint.y + lowerstack.y);
    frame.add(lowerpoint);

    var bbRail = parseFloat($('#bb_rail').val());
    var postPoint = initPoint(bbRail, 180 + stAngle);
    var seatpost = new paper.Path.Line(0, 0, postPoint);
    seatpost.style = baseStyle;
    var saddlePoint = new paper.Point(postPoint.x + getVal('#saddle_offset'), postPoint.y);
    var saddle = new paper.Path.Line(postPoint, saddlePoint);
    saddle.style = frameStyle;

    var stempoint = initPoint(parseFloat($('#spacer_height').val()), -180 + htAngle);
    var stemtop = new paper.Point(stackpoint.x + stempoint.x, stackpoint.y + stempoint.y)
    var stemLine = new paper.Path.Line(stackpoint, stemtop);
    stemLine.style = baseStyle;
    var stemAngle = parseFloat($('#stem_angle').val());
    var tmpAngle = parseFloat(-90 + htAngle - stemAngle);
    var stem = initPoint(parseFloat($('#stem_length').val()), tmpAngle);
    var stemend = new paper.Point(stemtop.x + stem.x, stemtop.y + stem.y);
    stemLine.add(stemend);

    var barPoint = initPoint(parseFloat($('#ext_length').val()), parseFloat(-$('#ext_angle').val()));
    var barEnd = new paper.Point(stemend.x + barPoint.x, stemend.y + barPoint.y);
    stemLine.add(barEnd);

    var riserPoint = new paper.Point(stemend.x, stemend.y - parseFloat($('#pad_stack').val()));
    var riserLine = new paper.Path.Line(stemend, riserPoint);
    riserLine.style = baseStyle;

    padPoint = new paper.Point(riserPoint.x + parseFloat($('#pad_offset').val()), riserPoint.y);
    var padLine = new paper.Path.Line(riserPoint, padPoint);
    riserLine.style = baseStyle;

    var padXY = new paper.PointText(padPoint.x, padPoint.y + 100);
    padXY.content = ('X:' + round(padPoint.x) + '\nY: ' + Math.abs(round(padPoint.y)));
    padXY.style = textStyle;

    $('#padx').val(Math.round(padPoint.x));
    $('#pady').val(Math.round(Math.abs(padPoint.y)));

    var r = parseFloat($('#wheelbase').val()) - parseFloat($('#ft_center').val());
    var rTriangle = new paper.Path.Line(0, 0, -r, parseFloat(-$('#bb_drop').val()));
    rTriangle.style = baseStyle;
    var tPoint = initPoint(400, 180 + stAngle);
    rTriangle.add(tPoint);
    var rWheel = new paper.Path.Circle(-r, -$('#bb_drop').val(), 330);
    rWheel.style = baseStyle;
    var r = parseFloat($('#ft_center').val());
    var s = parseFloat(-$('#bb_drop').val());
    var fWheel = new paper.Path.Circle(r, s, 330);
    fWheel.style = baseStyle;
    var fork = new paper.Path.Line(lowerpoint, parseFloat($('#ft_center').val()), parseFloat(-$('#bb_drop').val()));
    fork.style = baseStyle;

    var road = new paper.Path.Line(new paper.Point(-800, s + 330), new paper.Point(1000, s + 330))
    road.style = baseStyle;

}

function drawRider() {
    var bodyStyle = {
        strokeWidth: 10,
        strokeColor: 'blue',
        strokeJoin: 'round',
    };
    var pointStyle = {
        fillColor: 'blue',
    };
    var textStyle = {
        fillColor: 'black',
        fontSize: 50
    }

    var crankpointend = new paper.Point(crankpoint.x - parseFloat($('#ft_length').val()), crankpoint.y - 10);
    var rider = new paper.Path.Line(crankpoint.x, crankpoint.y - 10, crankpointend.x, crankpointend.y);
    rider.style = bodyStyle;
    var ankle = new paper.Path.Circle(crankpointend, 20);
    ankle.style = pointStyle;
    var r = parseFloat($('#bb_rail').val());
    var stAngle = parseFloat($('#st_angle').val());
    var postPoint = initPoint(r, 180 + stAngle, getVal('#saddle_offset'), -80);
    var result = findTriangle(crankpointend, postPoint, parseFloat($('#low_leglength').val()), parseFloat($('#up_leglength').val()));
    $('#kangle').val(round(180 - result.midAngle));
    var kneePoint = result.midPoint;
    var knee = new paper.Path.Circle(kneePoint, 20);
    knee.style = pointStyle;
    var hip = new paper.Path.Circle(postPoint, 60);
    hip.style = pointStyle;

    var kneeAngle = new paper.PointText(kneePoint.x + 50, kneePoint.y + 10);
    kneeAngle.content = (round(180 - result.midAngle)) + ' ' + String.fromCharCode(176);
    kneeAngle.style = textStyle;

    rider.add(kneePoint.x, kneePoint.y);
    rider.add(postPoint.x, postPoint.y);

    var result = findTriangle(padPoint, postPoint, parseFloat($('#up_armlength').val()), parseFloat($('#torso_length').val()));
    var shoulderPoint = result.midPoint;
    var shoulderAngle = result.midAngle;

    var shoulderAngle = new paper.PointText(shoulderPoint.x - 100, shoulderPoint.y + 100);
    shoulderAngle.content = round(result.midAngle) + ' ' + String.fromCharCode(176);
    shoulderAngle.style = textStyle;

    rider.add(shoulderPoint);
    rider.add(padPoint);
    var handPoint = initPoint($('#low_armlength').val(), -$('#ext_angle').val(), padPoint.x, padPoint.y);
    rider.add(handPoint);
    $('#shAngle').val(round(shoulderAngle));
    var shoulder = new paper.Path.Circle(shoulderPoint, 20);
    shoulder.style = pointStyle;
    var elbow = new paper.Path.Circle(padPoint.x, padPoint.y - 10, 20);
    elbow.style = pointStyle;

    var neckPoint = initPoint(150, shoulderPoint.subtract(postPoint).angle, shoulderPoint.x, shoulderPoint.y);
    var neckLine = new paper.Path.Line(shoulderPoint, neckPoint);
    neckLine.style = bodyStyle;
    var head = new paper.Path.Circle(neckPoint, 50);
    head.style = pointStyle;

    var kneeToShoulder = shoulderPoint.subtract(kneePoint);
    var result = findTriangle(kneePoint, shoulderPoint, $('#up_leglength').val(), $('#torso_length').val());
    $('#hangle').val(round(result.midAngle));

    var hipAngle = new paper.PointText(postPoint.x + 100, postPoint.y + 10);
    hipAngle.content = round(result.midAngle) + ' ' + String.fromCharCode(176);
    hipAngle.style = textStyle;
}

function findTriangle(startPoint, endPoint, lengthA, lengthB) {
    var hyp = endPoint.subtract(startPoint);
    var angle = solveAngle(hyp.length, lengthA, lengthB);
    var midAngle = solveAngle(lengthA, lengthB, hyp.length);
    var pointA = initPoint(lengthA, 0);
    pointA.angle = hyp.angle + angle;
    var midPoint = new paper.Point(startPoint);
    midPoint.x += pointA.x;
    midPoint.y += pointA.y;

    return {
        midPoint: midPoint,
        midAngle: midAngle
    };
}

function initPoint(length, angle, offsetX, offsetY) {
    var p = new paper.Point(0, 0);
    p.length = length;
    p.angle = angle;
    if (offsetX && offsetY) {
        p.x += offsetX;
        p.y += offsetY;
    }
    return p;
}

function solveAngle(a, b, c) {
    var temp = (a * a + b * b - c * c) / (2 * a * b);
    if (-1 <= temp && temp <= 0.9999999)
        return radToDeg(Math.acos(temp));
    else if (temp <= 1)
        return radToDeg(Math.sqrt((c * c - (a - b) * (a - b)) / (a * b)));
    else
        throw "No solution";
}

function round(angle) {
    return Math.round(angle * 10) / 10;
}

function radToDeg(x) {
    return x / Math.PI * 180;
}

function getVal(sel){
    return parseFloat($(sel).val() == 0 ? 1 : $(sel).val());
}