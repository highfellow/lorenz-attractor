// node script to test quaternion.js

requirejs(["quaternion"], function(Quaternion) {
    var u = new Quaternion(1, 0, 0, 0);
    var i = new Quaternion(0, 1, 0, 0);
    var j = new Quaternion(0, 0, 1, 0);
    var k = new Quaternion(0, 0, 0, 1);

    var elts = [u, i, j ,k];
    var names = ["u", "i", "j", "k"];

    var point = [1, 0, 0];
    var pointQuat = new Quaternion().setPoint(point);
    console.log(point, pointQuat);
    pointQuat = pointQuat.multiply(j);
    var newPoint = pointQuat.getPoint();
    console.log(point, pointQuat, newPoint);

    for (var lElt = 0; lElt < 4; lElt++) {
      for (var rElt = 0; rElt < 4; rElt++) {
        $("#content").append("<p>" + names[lElt] + " * " + names[rElt] +
            " = " + elts[lElt].multiply(elts[rElt]).value + "</p>");
      }
    }
  })
