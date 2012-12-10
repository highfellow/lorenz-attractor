// javascript to represent quaternion multiplication, 
// conjugation, and normalisation.
// (useful for doing 3D rotations).

define([], function() {
  function Quaternion(a, b, c, d) {
    // representation of a quaternion
    // values is an array of values of basis elements.
    this.value = [a, b, c, d];
    // rules for combining basis elements.
    this.multRules = [
      [[0, +1], [1, +1], [2, +1], [3, +1]],
      [[1, +1], [0, -1], [3, +1], [2, -1]],
      [[2, +1], [3, -1], [0, -1], [1, +1]],
      [[3, +1], [2, +1], [1, -1], [0, -1]]];
  }

  Quaternion.prototype.setValues = function(a, b, c, d) {
    this.value = [a, b, c, d];
  }

  Quaternion.prototype.setArray = function(values) {
    this.value = values;
    return this;
  }

  Quaternion.prototype.setAxisAngle = function(axis, angle) {
    this.value[0] = Math.cos(angle / 2);
    var sin = Math.sin(angle / 2);
    for (var i = 0; i < 3; i++) {
      this.value[i + 1] = sin * axis[i];
    }
    return this;
  }

  Quaternion.prototype.setPoint = function(point) {
    // create a quaternion to represent a 3D point.
    this.value[0] = 0;
    for (var i = 0; i < 3; i++) {
      this.value[i + 1] = point[i];
    }
    return this;
  }

  Quaternion.prototype.getPoint = function() {
    // return the 3D point represented by a quaternion.
    var point = [];
    for (var i = 0; i < 3; i++) {
      point[i] = this.value[i + 1];
    }
    return point;
  }

  Quaternion.prototype.multiply = function(quatern) {
    // right-multiply the quaternion with 'quatern'
    var newValue=[0, 0, 0, 0];
    for (var i = 0; i < 4; i++) {
      // an element of the left hand quaternion
      var leftElt = this.value[i];
      for (var j = 0; j < 4; j++) {
        // an element of the right hand quaternion
        var rule = this.multRules[i][j];
        var rightElt = quatern.value[j];
        newValue[rule[0]] += rule[1] * leftElt * rightElt;
      }
    }
    return new Quaternion().setArray(newValue);
  }

  Quaternion.prototype.conjugate = function(quatern) {
    // return a new quaternion which is this one's conjugate.
    return new Quaternion(this.value[0], -this.value[1], -this.value[2], -this.value[3]);
  }

  return Quaternion;
});
