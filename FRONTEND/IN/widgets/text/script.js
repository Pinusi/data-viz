// if( !DATAVIZ ) { var DATAVIZ = {}; }
// if( !DATAVIZ.WIDGETS ) { DATAVIZ.WIDGETS = {}; }
// if( !DATAVIZ.WIDGETS.Text ) { DATAVIZ.WIDGETS.Text = {}; }

// DATAVIZ.WIDGETS.Text.Main = function( container, config )
// {
// 	angular.module('dataviz').controller('textWidget', function($scope) {
// 			  $scope.spices = [{"name":"pasilla", "spiciness":"mild"},
// 			                   {"name":"jalapeno", "spiciness":"hot hot hot!"},
// 			                   {"name":"habanero", "spiciness":"LAVA HOT!!"}];
// 			  $scope.spice = "habanero";
// 			  $scope.template = { name: 'template1.html', url: 'text.html'}
// 	});
// }
angular.module('dataviz').controller('textWidget', function($scope) {
	$scope.template = { name: 'template1.html', url: 'templates/text.html'}
});