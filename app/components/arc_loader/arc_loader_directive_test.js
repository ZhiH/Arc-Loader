'use strict';

describe('ArcLoaderController', function() {
	var $controller;

	beforeEach(module('myApp.arc_loader'));
	beforeEach(inject(function(_$controller_){
		// The injector unwraps the underscores (_) from around the parameter names when matching
		$controller = _$controller_;
	}));

	describe('$scope.convertFloatToRad', function() {
		var $scope;
		var controller;

		beforeEach(function() {
			$scope = {};
			controller = $controller('ArcLoaderController', { $scope: $scope });
		});

		it('0% of a circle should be 0 rad', function() {
			expect($scope.convertFloatToRad(0)).toEqual(0);
		});

		it('50% of a circle should be pi rad', function() {
			expect($scope.convertFloatToRad(0.5)).toEqual(Math.PI);
		});

		it('100% of a circle should be 2pi rad', function() {
			expect($scope.convertFloatToRad(1)).toEqual(2 * Math.PI);
		});
	});

	describe('$scope.calculateNewArcParams', function() {
		describe('on invalid input', function() {
			it('should have error set to true in the response', function() {
				var $scope = {};
				var controller = $controller('ArcLoaderController', { $scope: $scope });
				$scope.actual = 'abc';
				$scope.expected = '---';

				expect($scope.calculateNewArcParams().error).toEqual(true);
			});
		});

		describe('on actual progress being greater than 75% of the expected progress', function() {
			it("should have the actual arc's color set to #88cc00", function() {
				var $scope = {};
				var controller = $controller('ArcLoaderController', { $scope: $scope });
				$scope.actual = '1';
				$scope.expected = '0';

				expect($scope.calculateNewArcParams().arcActual.color).toEqual('#88cc00');
			});
		});

		describe('on actual progress being between 50% to 75% of the expected progress', function() {
			it("should have the actual arc's color set to #ffaa33", function() {
				var $scope = {};
				var controller = $controller('ArcLoaderController', { $scope: $scope });
				$scope.actual = '.6';
				$scope.expected = '0.9';

				expect($scope.calculateNewArcParams().arcActual.color).toEqual('#ffaa33');
			});
		});

		describe('on actual progress being between less than 50% of the expected progress', function() {
			it("should have the actual arc's color set to #ffaa33", function() {
				var $scope = {};
				var controller = $controller('ArcLoaderController', { $scope: $scope });
				$scope.actual = '0';
				$scope.expected = '0.9';

				expect($scope.calculateNewArcParams().arcActual.color).toEqual('#ff0000');
			});
		});
	});
});
