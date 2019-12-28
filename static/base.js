function updateBars(){
    if($('#type').val() == 'tt'){
        $('.tt').show();
        $('.road').hide();
    }else if($('#type').val() == 'road'){
        $('.tt').hide();
        $('.road').show();
    }
}
function recenter(){
    center = new paper.Point(canvas.width / 2, canvas.height /2)
    paper.view.center = center
    paper.view.translate(paper.view.center.x, canvas.height + 200)
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

function drawCircle(x, y, radius, style){
    c = new paper.Path.Circle(x, y, radius);
    c.style = style;
    return c;
}

function drawLineFromTo(startPoint, endPoint, style){
    line = new paper.Path.Line(startPoint, endPoint);
    line.style = style;
    return line;
}

function drawLineTo(x0, y0, endPoint, style){
    line = new paper.Path.Line(x0, y0, endPoint);
    line.style = style;
    return line;
}