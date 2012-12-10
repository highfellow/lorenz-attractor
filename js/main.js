requirejs(["quaternion"], function (Quaternion) {
  $(function () {
    // integrates the lorentz equations and displays the result in a nice
    // flot graph with sliders.
    //
    // graphing: http://www.flotcharts.org/
    // sliders: http://jqueryui.com/
    // the maths: http://en.wikipedia.org/wiki/Lorenz_system

    // config of input boxes.
    var inputs = {
      sigma: 
        {
          init: 10,
          min: 0,
          max: 30,
          group: 0,
          slider: true,
          step: 0.1
        },
      rho: 
        {
          init: 28,
          min: 0,
          max: 100,
          group: 0,
          slider: true,
          step: 0.1
        },
      beta: 
        {
          init: 2.66,
          min: 0,
          max: 30,
          group: 0,
          slider: true,
          step: 0.1
        },
      ranVary:
        {
          init: 0,
          min: 0,
          max: 50,
          group: false,
          slider: true,
          step: 0.1
        },
      ranSpread:
        {
          init: 0,
          min: 0,
          max: 10,
          group: false,
          slider: true,
          step: 0.1
        },
      zoom:
        {
          init: 1,
          min: 0.1,
          max: 10,
          group: 2,
          slider: true,
          step: 0.1
        },
      updateInterval:
        {
          init: 50,
          min: 20,
          max: 1000,
          group: false,
          slider: false
        },
      numSeries:
        {
          init: 1,
          min: 1,
          max: 10,
          group: false,
          slider: false
        }
    };

    // the array of raw data for all the plot series
    var data = [[]];
    // maxiumum number of points in the series.
    var totalPoints = 1000;
    // length of the axes on the graph.
    var axisLength = 3;
    // true when running.
    var running = true;
    // true during mouse drag.
    var dragging = false;
    // true if shift key down.
    var shifty = false;
    // drag origin
    var dragOrigin = null;
    // current drag Position relative to drag start.
    var dragPos = null;
    // total rotation quaternion
    var rotation = new Quaternion(1, 0, 0, 0);
    // rotation during this mouse drag
    var dragRot = new Quaternion(1, 0, 0, 0);
    // current total rotation (from both above)
    var curRot = new Quaternion(1, 0, 0, 0);
    // number of drag pixels per full rotation
    var dragScale = 300;
    // original x, y, z axes of the plot, in screen coords
    var origAxes = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    // current x, y, z axes after rotation, in screen coords.
    // need to define twice or do a deep copy.
    var axes = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
      ];

    // values of input boxes
    var inputVals = {};
    // parameter values to use in equation.
    var parmVals = {};
    // the theta (rotation) values for each axis.
    var thetaVals = [0, 0, 0];
    // the number of data series.
    var numSeries = 1;

    // true if a parameter in a group has just changed
    var groupChanged = [];

    // default values of parameters etc.
    var parmCtrls = ["sigma", "rho", "beta"];
    var thetaCtrls = ["thetaX", "thetaY", "thetaZ"];
    var dt = 0.01;
    var initialPoints = [[]];
    var iters = 5; // number of iterations per refresh
    var updateInterval = 50; // time in ms per refresh
    var plot; // object to store the flot plot in.

    // scale of the plot (0-10);
    var scale = 1;

    function getInitialPoints(random) {
      // get some random starting points.
      // inputVals.ranVary - randomness of the central point.
      // inputVals.ranSpread - spread around that point.
      var centrePoint = [];
      for (var axis = 0; axis < 3; axis++) {
        centrePoint[axis] = 0.1 +
          2 * Math.random() * inputVals.ranVary - inputVals.ranVary;
      }
      for (var series = 0; series < numSeries; series++) {
        if (random && running || initialPoints[series] === undefined) {
          initialPoints[series] = [];
          for (var axis = 0; axis < 3; axis++) {
            initialPoints[series][axis] = centrePoint[axis] +
              2 * Math.random() * inputVals.ranSpread - inputVals.ranSpread;
          }
        }
      }
    }

    function addDataPoint(series) {
      // add a new data point to data[series].
      if (data[series] === undefined) {
        data[series] = [];
      }
      var sData = data[series];
      var prev = sData.length !== 0 ? sData[sData.length - 1] : initialPoints[series];
      if (sData.length >= totalPoints ) {
        // remove first point.
        sData = sData.slice(1);
      }
      var next = [
        // integrate the lorenz equations.
        prev[0] + dt * (parmVals.sigma * (prev[1] - prev[0])),
        prev[1] + dt * (prev[0] * (parmVals.rho - prev[2]) - prev[1]),
        prev[2] + dt * (prev[0] * prev[1] - parmVals.beta * prev[2])
        ];
      sData.push(next);
      data[series] = sData;
    }

    function addAllDataPoints() {
      for (var series = 0; series < numSeries; series++) {
        addDataPoint(series);
      }
    }

    function getSeries(series, axes) {
      // return a data series as an object with formatting parameters.
      return {
        color: "rgba(255, 128, 32, 0.5)",
        lines: {lineWidth: 1},
        data: project(data[series], axes)
      }
    }

    function getAxisSeries(axis) {
      // get the series for the axes
      var colour = "rgba(";
      for (var i = 0; i < 3; i++) {
        var col = (i === axis) ? 255 : 64;
        colour += col + ",";
      }
      if (axes[axis][2] >= 0) {
        colour += "0.7)";
      } else {
        colour += "0.3)";
      }
      return {
        color: colour,
        lines: {lineWidth: 2},
        data: [
          [0, 0],
          [
            axisLength * axes[axis][0], 
            axisLength * axes[axis][1]
          ]
        ]
      };
    }

    function getAllSeries(axes) {
      // get all data series plus the axes.
      var ret=[];
      for (var series = 0; series < numSeries; series++) {
        ret.push(getSeries(series, axes));
      }
      for (var axis = 0; axis < 3; axis++) {
        ret.push(getAxisSeries(axis));
      }
      return ret;
    }

    function resetAxes() {
      // deep copy origAxes into axes.
      axes = [];
      for (var i = 0; i < 3; i++) {
          axes[i] = [];
        for (var j = 0; j < 3; j++) {
          axes[i][j] = origAxes[i][j];
        }
      }
      rotation.setValues(1, 0, 0, 0);
    }

    function rotatePoint(point, rot) {
      // rotate a 3D point by the quaternion curRot
      var conj = rot.conjugate();
      var pointQuat = new Quaternion().setPoint(point);
      var newPoint = rot.multiply(
          pointQuat.multiply(conj)).getPoint();
      return newPoint;
    }

    function projectPoint(point, axes) {
      // project a point using the rotated axes 'axes'
      var newPoint = [];
      for (var i = 0; i < 2; i++) {
        newPoint[i] = 0;
        for (var j = 0; j < 3; j++) {
          newPoint[i] += point[j] * axes[j][i];
        }
      }
      return newPoint;
    }

    function project(data, axes) {
      // return a 2D projected version of the data.
      var ret = [];
      var point;
      for (var i = 0; i < data.length; i++) {
        point = data[i];
        point = projectPoint(point, axes);
        ret.push(point);
      }
      return ret;
    }

    function makePlot() {
      // set up the plot
      var xscale = 50 * scale;
      var yscale = xscale * $("#chart").height() / $("#chart").width();
      var options = {
          series: { shadowSize: 0 }, // drawing is faster without shadows
          yaxis: { min: -yscale, max: yscale },
          xaxis: { min: -xscale, max: xscale }
      };
      plot = $.plot($("#chart"), getAllSeries(axes), options);
    }

    function sliderChange(parm, input) {
      // the slider for parameter parm was changed
      var value = $("#" + parm + "Slider").slider("value");
      $("#" + parm).val(value);
      if (input.group !== false) {
        groupChanged[input.group] = true;
      }
      inputVals[parm] = +value;
    }

    function inputChange(parm, input) {
      // an input box was changed directly.
      var v = $('#' + parm).val();
      
      if (v && !isNaN(+v)) {
          inputVals[parm] = +v;
          if (inputVals[parm] < input.min)
              inputVals[parm] = input.min;
          if (inputVals[parm] > input.max)
              inputVals[parm] = input.max;
          $('#'+ parm).val("" + inputVals[parm]);
      }
      if (input.group !== false) {
        groupChanged[input.group] = true;
      }
      if (input.slider !== false) {
        $("#" + parm + "Slider").slider("value", v);
      }
      inputVals[parm] = +v;
    }

    function initInput(parm) {
      // initialise an html input field; add slider if appropriate.
      var input = inputs[parm];
      $('#' + parm).val(input.init).change(function() {
          inputChange(parm, input);
          });
      if (input.group !== false) {
        groupChanged[input.group] = false;
      }
      if (input.slider !== false) {
        // make a slider for the input.
        $("#" + parm + "Slider").slider({
            orientation: "horizontal",
            range: "min",
            max: input.max,
            min: input.min,
            step: input.step,
            value: input.init,
            slide: function() {
                sliderChange(parm, input);
              },
          });
      }
      inputVals[parm] = input.init;
    }

    function resetInput(parm) {
      // reset an input to its initial value.
      var input = inputs[parm];
      $('#' + parm).val(input.init);
      if (input.group !== false) {
        groupChanged[input.group] = false;
      }
      if (input.slider !== false) {
        $('#' + parm + 'Slider').slider("value", input.init);
      }
      inputVals[parm] = input.init;
    }

    function getParms() {
      // put the input values for the parameters into the equation.
      parmCtrls.forEach(function(parm) {
        parmVals[parm] = inputVals[parm]
        });
    }

    // set up the buttons.
    $("#restart").click(function (evt) {
          data = [];
          numSeries = inputVals.numSeries;
          getParms();
          getInitialPoints($("#randomise").is(":checked"));
          running = true;
          $("#pause").text("Pause");
        });

    $("#resetParms").click(function (evt) {
          parmCtrls.forEach(function (parm) {
            resetInput(parm);
          });
        });

    $("#pause").click(function (evt) {
        if (running) {
          $("#pause").text("Play");
          running = false;
        } else {
          $("#pause").text("Pause");
          running = true;
        }
      });

    $("#resetAxes").click(resetAxes);

    // do mouse drag events.
    chartPos = $("#chart").position();

    $("#chart").mousedown(function (evt) {
        dragging = true;
        dragOrigin = null;
      });

    $("#chart").mouseup(function (evt) {
        dragging = false;
        rotation = curRot;
      });

    $("#chart").mousemove(function(evt) {
        if (!dragging) return;
        if (dragOrigin === null) {
          dragOrigin = {
            x: evt.pageX,
            y: evt.pageY
          };
        }
        dragPos = {
          x: evt.pageX - dragOrigin.x,
          y: evt.pageY - dragOrigin.y
        };
      });

    // detect shift key
    $(document).keydown(function(e) {
        if (e.which === 16) {
          shifty = true;
        }
      });

    $(document).keyup(function(e) {
        if (e.which === 16) {
          shifty = false;
        }
      });

    // set up input boxes.
    for (var parm in inputs) {
      initInput(parm);
    }

    // get the initial parameter values.
    getParms();

    // get an initial data point.
    getInitialPoints(true);
   
    // make the initial plot.
    makePlot();

    function update() {
      // do the animation loop.
      if (running) {
        // animation running.
        for (var i = 0; i < iters; i++) {
          // do iters iterations of the lorenz equations.
          addAllDataPoints();
        }
        // since the axes don't change, we don't need to call plot.setupGrid()
        groupChanged[0] = false;
      } else {
        // animation not running
        if (groupChanged[0]) {
          // one of the parameter values has changed, so redraw from the start.
          groupChanged[0] = false;
          getParms();
          data = [];
          for (var i = 0; i < totalPoints; i++) {
            addAllDataPoints();
          }
        }
      }
      if (groupChanged[2]) {
        // the zoom value has changed.
        groupChanged[2] = false;
        scale = inputVals['zoom'];
        makePlot();
      }
      if (groupChanged[1]) {
        // one of the rotation values has changed.
        groupChanged[1] = false;
        for (var axis = 0; axis < 3; axis++) {
          thetaVals[axis] = inputVals[thetaCtrls[axis]] * 2 * Math.PI / 360;
        }
      }
      if (dragging && dragOrigin !== null) {
        // the mouse is being dragged.
        var angle, axis;
        if (shifty) {
          axis = [0, 0, 1];
          angle = dragPos.x;
        } else {
          var dragDist = Math.sqrt(
            dragPos.x * dragPos.x +
            dragPos.y * dragPos.y
          );
          if (dragDist > 0) {
            axis = [dragPos.y / dragDist, dragPos.x / dragDist, 0];
          } else {
            axis = [0, 1, 0, 0];
          }
          angle = dragDist;
        }
        angle *= 2 * Math.PI / dragScale;
        dragRot.setAxisAngle(axis, angle);
        curRot = dragRot.multiply(rotation);
        for (var i = 0; i < 3; i++) {
          // rotate the axes.
          axes[i] = rotatePoint(origAxes[i], curRot);
        }
      }
      plot.setData(getAllSeries(axes));
      plot.draw();
      setTimeout(update, inputVals.updateInterval);
    }

    update();
  });
});
