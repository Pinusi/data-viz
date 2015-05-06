angular.module('dataviz')
.controller('textWidget', function($scope) {
	// $scope.template = { name: 'template1.html', url: 'templates/text.html'};
})
.directive('datavizWidgetText', function() {
	return {
		restrict: "C",
		templateUrl: 'templates/text.html'
	};
});