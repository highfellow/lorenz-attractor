// code to run the input boxes and sliders.

define([], function() {

    function Input(options, group) {
      // abstraction of an input field. Can have a slider, or be in
      // a group.
      this.options = options;
      this.group = group;
      $('#' + parm).val(options.init).change(function() {
          this.inputChange(parm, options);
          });
      if (options.slider !== false) {
        // make a slider for the options.
        $("#" + parm + "Slider").slider({
            orientation: "horizontal",
            range: "min",
            max: options.max,
            min: options.min,
            step: options.step,
            value: options.init,
            slide: function() {
                this.sliderChange();
              },
          });
      }
      this.value = options.init;
      this.changed = false;
    }

    Input.prototype.sliderChange = function () {
      // the slider for parameter parm was changed
      var value = $("#" + parm + "Slider").slider("value");
      $("#" + parm).val(value);
      this.value = +value;
      if (this.group !== undefined) {
        this.group.setChanged(true);
      }
      this.changed = true;
    }

    Input.prototype.inputChange = function () {
      // an input box was changed directly.
      var v = $('#' + parm).val();
      
      if (v && !isNaN(+v)) {
          this.value = +v;
          if (this.value < this.options.min)
              this.value = this.options.min;
          if (this.value > this.options.max)
              this.value = this.options.max;
          $('#'+ parm).val("" + this.value);
      }
      if (this.group !== undefined) {
        this.group.setChanged(true);
      }
      if (input.slider !== false) {
        $("#" + parm + "Slider").slider("value", this.value);
      }
    }

    Input.prototype.resetInput = function() {
      // reset an input to its initial value.
      this.value = this.options.init;
      $('#' + parm).val(this.value);
      if (input.slider !== false) {
        $('#' + parm + 'Slider').slider("value", this.value);
      }
      if (this.group !== false) {
        this.group.setChanged(true);
      }
    }

    function InputGroup(inputs) {
      this.members = {};
      this.changed = false;
      for (var input in inputs) {
          var options = inputs[input];
          this.members[input] = new Input(options, this);
          });
    }

    InputGroup.prototype.getMember = function(key) {
      return this.members[key];
    }
    
    InputGroup.prototype.setChanged = function(changed) {
      this.changed = changed;
    }

    InputGroup.prototype.getChanged = function() {
      return this.changed;
    }
