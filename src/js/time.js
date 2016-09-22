(function() {
  TimeUtils = {
  // function for default locale based formatting anything that can be date
    format: function(dt) {
      var type = typeof dt;
      if (type == "string") {
        //possible here we must do addition work for parse string
        dt = new Date(dt);
      }
      if (type = "number") {
        dt = new Date(dt);
      }
      return dt.toLocaleString();
    }
  };
})();