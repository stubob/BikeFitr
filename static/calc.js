var crankpoint;
var padPoint;
var stemEnd;
var dropPoint;

var textStyle = {
    fillColor: 'black',
    fontSize: 50
};

$(document).ready(function() {
    $('#bike_form').submit(function(e) {
        e.preventDefault();
        if($('#bike_form').valid()){
            $.ajax({
               type: "POST",
               url:  "/save",
               contentType:"application/json; charset=utf-8",

                data: JSON.stringify({
                    id: $('#id').val(),
                    name: $('#name').val(),
                    type: $('#type').val(),
                    position: $('#position').val(),
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
                            hood_reach: $('#hood_reach').val(),
                            bar_drop: $('#bar_drop').val()
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
        }
    })
    .validate({
        ignore: [],
        rules: {
            stack: {min: 0, required: true},
            reach: {min: 0, required: true},
            st_length: {min: 0, required: true},
            st_angle: {min: 0, required: true},
            ht_length: {min: 0, required: true},
            ht_angle: {min: 0, required: true},
            spacer_height: {min: 0, required: true},
            stem_length: {min: 0, required: true},
            ft_center: {min: 0, required: true},
            wheelbase: {min: 0, required: true},
            bb_drop: {min: 0, required: true},
            crank_length: {min: 0, required: true},
            bb_rail: {min: 0, required: true},
            saddle_offset: {required: true},
            ft_length: {min: 0, required: true},
            low_leglength: {min: 0, required: true},
            up_leglength: {min: 0, required: true},
            torso_length: {min: 0, required: true},
            up_armlength: {min: 0, required: true},
            low_armlength: {min: 0, required: true}
        },
        debug: true,
        onfocusout: function(){
            drawScene();
        },
        onkeyup: function(){
            drawScene();
        },
        onclick: function(){
            updateBars();
            drawScene();
        }
    });

    updateBars();
    var canvas = document.getElementById('canvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    paper.settings.listenEvents = false;
    paper.view.onResize = function(event) {
        recenter();
        drawScene();
    }
    paper.project.currentStyle = {
        strokeColor: 'black',
        strokeWidth: 3
    };
    recenter();

    paper.view.scale(.3)

    if ($('#bike_form').valid()) {
        drawFrame();
        drawRider();
        $('#submit').prop('disabled', false);
    }else{
        $('#submit').prop('disabled', 'disabled');
        var raster = new paper.Raster({source: '/static/sample-lg-min.png', position: paper.view.center});
    }
    paper.view.draw();
});

function drawScene(){
    var v = $('#bike_form');
    if ($('#bike_form').valid() == true) {
        paper.project.activeLayer.removeChildren();
        drawFrame();
        drawRider();
        $('#submit').prop('disabled', false);
    }else{
        $('#submit').prop('disabled', 'disabled');
    }
    paper.view.draw();
}

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
    // Create a Paper.js Path to draw a line into it:
    var circle = drawCircle(0,0, 100, baseStyle);
    var crankarm = drawLineTo(0, 0, crankpoint, baseStyle);

    var stAngle = parseFloat($('#st_angle').val());
    var seattube = initPoint($('#st_length').val(), 180 + stAngle);
    var frame = drawLineTo(0, 0, seattube, frameStyle);
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
    var seatpost = drawLineTo(0, 0, postPoint, baseStyle);
    var saddlePoint = new paper.Point(postPoint.x + getVal('#saddle_offset'), postPoint.y);
    var saddle = drawLineFromTo(postPoint, saddlePoint, frameStyle);

    var stempoint = initPoint(parseFloat($('#spacer_height').val()), -180 + htAngle);
    var stemtop = new paper.Point(stackpoint.x + stempoint.x, stackpoint.y + stempoint.y)
    var stemLine = drawLineFromTo(stackpoint, stemtop, baseStyle);
    var stemAngle = parseFloat($('#stem_angle').val());
    var tmpAngle = parseFloat(-90 + htAngle - stemAngle);
    var stem = initPoint(parseFloat($('#stem_length').val()), tmpAngle);
    stemEnd = new paper.Point(stemtop.x + stem.x, stemtop.y + stem.y);
    stemLine.add(stemEnd);

    var r = parseFloat($('#wheelbase').val()) - parseFloat($('#ft_center').val());
    var rTriangle = new paper.Path.Line(0, 0, -r, parseFloat(-$('#bb_drop').val()));
    rTriangle.style = baseStyle;
    if($('#type').val() == 'tt'){
        var tPoint = initPoint(400, 180 + stAngle);
    }else if($('#type').val() == 'road'){
        var tmpPt = seattube.length - 50;
        var tPoint = initPoint(tmpPt, 180 + stAngle);
    }
    rTriangle.add(tPoint);
    var rWheel = new paper.Path.Circle(-r, -$('#bb_drop').val(), 330);
    rWheel.style = baseStyle;
    var r = parseFloat($('#ft_center').val());
    var s = parseFloat(-$('#bb_drop').val());
    var fWheel = drawCircle(r, s, 330, baseStyle);
    var fork = new paper.Path.Line(lowerpoint, parseFloat($('#ft_center').val()), parseFloat(-$('#bb_drop').val()));
    fork.style = baseStyle;

    var road = new paper.Path.Line(new paper.Point(-800, s + 330), new paper.Point(1000, s + 330))
    road.style = baseStyle;

    if($('#type').val() == 'tt'){
        var barPoint = initPoint(parseFloat($('#ext_length').val()), parseFloat(-$('#ext_angle').val()));
        var barEnd = new paper.Point(stemEnd.x + barPoint.x, stemEnd.y + barPoint.y);
        stemLine.add(barEnd);

        var riserPoint = new paper.Point(stemEnd.x, stemEnd.y - parseFloat($('#pad_stack').val()));
        var riserLine = drawLineFromTo(stemEnd, riserPoint, baseStyle);

        padPoint = new paper.Point(riserPoint.x + parseFloat($('#pad_offset').val()), riserPoint.y);
        var padLine = drawLineFromTo(riserPoint, padPoint, baseStyle);

        var padXY = new paper.PointText(padPoint.x, padPoint.y + 100);
        padXY.content = ('X:' + round(padPoint.x) + '\nY: ' + Math.abs(round(padPoint.y)));
        padXY.style = textStyle;
    }else if($('#type').val() == 'road'){
        var drop = parseFloat($('#bar_drop').val());
        var curvePoint = new paper.Point(stemEnd.x + parseFloat($('#hood_reach').val()), stemEnd.y + (drop / 2));
        var dropPoint = new paper.Point(stemEnd.x, stemEnd.y + drop);
        var barLine = new paper.Path.Arc(stemEnd, curvePoint, dropPoint);
        barLine.style - baseStyle;
    }
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
    var crankpointend = new paper.Point(crankpoint.x - parseFloat($('#ft_length').val()), crankpoint.y - 10);
    var rider = new paper.Path.Line(crankpoint.x, crankpoint.y - 10, crankpointend.x, crankpointend.y);
    rider.style = bodyStyle;
    var ankle = new paper.Path.Circle(crankpointend, 20);
    ankle.style = pointStyle;
    var bbRail = parseFloat($('#bb_rail').val());
    var stAngle = parseFloat($('#st_angle').val());
    var postPoint = initPoint(bbRail, 180 + stAngle, getVal('#saddle_offset'), -80);
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

    if($('#type').val() == 'tt' && $('#position').is(':checked') == false){
        var result = findTriangle(padPoint, postPoint, parseFloat($('#up_armlength').val()), parseFloat($('#torso_length').val()));
    }else if($('#type').val() == 'tt' && $('#position').is(':checked') == true){
        var result = findTriangle(stemEnd, postPoint, parseFloat($('#up_armlength').val()) + parseFloat($('#low_armlength').val()),
            parseFloat($('#torso_length').val()));
    }else if($('#type').val() == 'road' && $('#position').is(':checked') == false){//drops
        var drop = parseFloat($('#bar_drop').val());
        var dropPoint = new paper.Point(stemEnd.x, stemEnd.y + drop);
        var result = findTriangle(dropPoint, postPoint, parseFloat($('#up_armlength').val()) + parseFloat($('#low_armlength').val()),
            parseFloat($('#torso_length').val()));

    }else if($('#type').val() == 'road' && $('#position').is(':checked') == true){
        var hoodPoint = new paper.Point(stemEnd.x + parseFloat($('#hood_reach').val()), stemEnd.y);
        var result = findTriangle(hoodPoint, postPoint, parseFloat($('#up_armlength').val()) + parseFloat($('#low_armlength').val()),
            parseFloat($('#torso_length').val()));
    }
    var shoulderPoint = result.midPoint;
    var shoulderAngle = result.midAngle;

    var shoulderAngleText = new paper.PointText(shoulderPoint.x - 100, shoulderPoint.y + 100);
    shoulderAngleText.content = round(result.midAngle) + ' ' + String.fromCharCode(176);
    shoulderAngleText.style = textStyle;

    rider.add(shoulderPoint);
    if($('#type').val() == 'tt' && $('#position').is(':checked') == false){
        rider.add(padPoint);
        var handPoint = initPoint($('#low_armlength').val(), -$('#ext_angle').val(), padPoint.x, padPoint.y);
        rider.add(handPoint);
        var hand = new paper.Path.Circle(handPoint, 10);
        hand.style = pointStyle;
        var elbowPoint = initPoint(parseFloat($('#up_armlength').val()), padPoint.subtract(shoulderPoint).angle, shoulderPoint.x, shoulderPoint.y);
    }else if($('#type').val() == 'tt' && $('#position').is(':checked') == true){
        rider.add(stemEnd);
        var hand = new paper.Path.Circle(stemEnd, 10);
        var handPoint = stemEnd;
        hand.style = pointStyle;
        var elbowPoint = initPoint(parseFloat($('#up_armlength').val()), handPoint.subtract(shoulderPoint).angle, shoulderPoint.x, shoulderPoint.y);
   }else if($('#type').val() == 'road' && $('#position').is(':checked') == false){//drops
        var drop = parseFloat($('#bar_drop').val());
        var dropPoint = new paper.Point(stemEnd.x, stemEnd.y + drop);
        var handPoint = dropPoint;
        rider.add(dropPoint);
        var hand = new paper.Path.Circle(dropPoint, 10);
        hand.style = pointStyle;
        var elbowPoint = initPoint(parseFloat($('#up_armlength').val()), handPoint.subtract(shoulderPoint).angle, shoulderPoint.x, shoulderPoint.y);
    }else if($('#type').val() == 'road' && $('#position').is(':checked') == true){//hoods
        var hoodPoint = new paper.Point(stemEnd.x + parseFloat($('#hood_reach').val()), stemEnd.y);
        var handPoint = hoodPoint;
        rider.add(hoodPoint);
        var hand = new paper.Path.Circle(hoodPoint, 10);
        hand.style = pointStyle;
        var elbowPoint = initPoint(parseFloat($('#up_armlength').val()), handPoint.subtract(shoulderPoint).angle, shoulderPoint.x, shoulderPoint.y);
    }
    $('#shAngle').val(round(shoulderAngle));
    var shoulder = new paper.Path.Circle(shoulderPoint, 20);
    shoulder.style = pointStyle;
    var elbow = new paper.Path.Circle(elbowPoint, 10);
    elbow.style = pointStyle;
    var elbow = drawLineFromTo(shoulderPoint, elbowPoint, bodyStyle);

    var neckPoint = initPoint(150, shoulderPoint.subtract(postPoint).angle, shoulderPoint.x, shoulderPoint.y);
    var neckLine = new paper.Path.Line(shoulderPoint, neckPoint);
    neckLine.style = bodyStyle;
    var head = new paper.Path.Circle(neckPoint, 50);
    head.style = pointStyle;

    var kneeToShoulder = shoulderPoint.subtract(kneePoint);
    var result = findTriangle(kneePoint, shoulderPoint, $('#up_leglength').val(), $('#torso_length').val());

    var hipAngle = new paper.PointText(postPoint.x + 100, postPoint.y + 10);
    hipAngle.content = round(result.midAngle) + ' ' + String.fromCharCode(176);
    hipAngle.style = textStyle;

    var hipToShoulder = shoulderPoint.subtract(postPoint);
    var backAngle = new paper.PointText(postPoint.x - 100, postPoint.y - 100);
    backAngle.content = round(hipToShoulder.angle * -1) + ' ' + String.fromCharCode(176);
    backAngle.style = textStyle;
}
