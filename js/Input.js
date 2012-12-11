// code to run the input boxes and sliders.

define([], function() {

    function Input(options, group) {
      // abstraction of an input field. Can have a slider, or be in
      // a group.
      var that = this;
      this.options = options;
      this.group = group;
      this.input = $(options.selector);
      this.slider = $(options.selector + "Slider");
      this.input.val(options.init).change(function() {
          that.inputChange();
          });
      if (options.slider !== false) {
        // make a slider for the options.
        this.slider.slider({
            orientation: "horizontal",
            range: "min",
            max: options.max,
            min: options.min,
            step: options.step,
            value: options.init,
            slide: function() {
                that.sliderChange();
              },
          });
      }
      this.value = options.init;
      this.changed = false;
    }

    Input.prototype.sliderChange = function () {
      // the slider for parameter was changed
      var value = this.slider.slider("value");
      this.input.val(value);
      this.value = +value;
      if (this.group !== undefined) {
        this.group.setChanged(true);
      }
      this.changed = true;
    }

    Input.prototype.inputChange = function () {
      // an input box was changed directly.
      var v = this.input.val();
      
      if (v && !isNaN(+v)) {
          this.value = +v;
          if (this.value < this.options.min)
              this.value = this.options.min;
          if (this.value > this.options.max)
              this.value = this.options.max;
          this.input.val("" + this.value);
      }
      if (this.options.slider !== false) {
        this.slider.slider("value", this.value);
      }
      if (this.group !== undefined) {
        this.group.setChanged(true);
      }
      this.changed = true;
    }

    Input.prototype.reset = function() {
      // reset an input to its initial value.
      this.value = this.options.init;
      this.input.val(this.value);
      if (this.options.slider !== false) {
        this.slider.slider("value", this.value);
      }
      if (this.group !== false) {
        this.group.setChanged(true);
      }
      this.changed = true;
    }

    Input.prototype.setChanged = function(changed) {
      this.changed = changed;
    }

    Input.prototype.getChanged = function() {
      return this.changed;
    }

    Input.prototype.getValue = function() {
      return this.value;
    }

    return Input;
});
