// Defines a group of inputs.

define(["Input"], function(Input) {

    function InputGroup(inputs) {
      // constructor for InputGroup.
      this.members = {};
      this.changed = false;
      for (var input in inputs) {
          var options = inputs[input];
          this.members[input] = new Input(options, this);
          }
    }

    InputGroup.prototype.iterMembers = function(callback) {
      // iterate over all members of the group using a callback.
      for (key in this.members) {
        var input = this.members[key];
        callback && callback(key, input);
      }
    }

    InputGroup.prototype.getMember = function(key) {
      // get a particular member by key
      return this.members[key];
    }
    
    InputGroup.prototype.setChanged = function(changed) {
      // set whether an input in the group has been changed.
      this.changed = changed;
    }

    InputGroup.prototype.getChanged = function() {
      // get whether an input in the group has been changed.
      return this.changed;
    }

    return InputGroup;
})
