app.directive("znamkyPredmet", function() {
    return {
      restrict: "E",
      scope: {
          lesson: "="
      },
      replace: true
    };
});