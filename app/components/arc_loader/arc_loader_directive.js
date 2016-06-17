'use strict';

angular.module('myApp.arc_loader', [])
	.controller('ArcLoaderController', ['$scope', function($scope) {
		var MIN_RADIAN = 0.01745; // 1 degree converted to radian, used for visual
		var GRAY = '#eeeeee';
		var GREEN = '#88cc00';
		var PALE_GREEN = '#ccee99';
		var RED = '#ff0000';
		var ORANGE = '#ffaa33';

		$scope.actual = 0;
		$scope.expected = 0;
		$scope.configs = {
			containerWidth: 300,
			containerHeight: 300
		};

		$scope.initializeSvgs = function() {
			var centerX = $scope.configs.containerWidth/2;
			var centerY = $scope.configs.containerHeight/2;

			$scope.svgContainer = d3.select('.view-container').append('svg')
				.attr('width', $scope.configs.containerWidth)
				.attr('height', $scope.configs.containerHeight);

			$scope.svgContainer.append('circle')
				.style('fill', GRAY)
				.attr('r', 50)
				.attr('cx',centerX)
				.attr('cy',centerY);

			$scope.arc = d3.arc()
				.cornerRadius(5)
				.startAngle(0);

			$scope.expectedArc = $scope.svgContainer.append('svg:path')
				.style('fill', PALE_GREEN)
				.datum({
					endAngle: MIN_RADIAN,
					innerRadius: 55,
					outerRadius: 59
				})
				.attr('transform', 'translate('+centerX+','+centerY+')')
				.attr('d', $scope.arc);

			$scope.actualArc = $scope.svgContainer.append('svg:path')
				.style('fill', GREEN)
				.datum({
					endAngle: MIN_RADIAN,
					innerRadius: 61,
					outerRadius: 69
				})
				.attr('transform', 'translate('+centerX+','+centerY+')')
				.attr('d', $scope.arc);

			$scope.createText(150, 168, 'label', 'Progress');
			$scope.percentLabel = $scope.createText(165, 150, 'label percent-label', '%');
			$scope.valueLabel = $scope.createText(145, 150, 'label actual-value-label', '0');
		};

		$scope.createText = function(x, y, classes, text) {
			return $scope.svgContainer.append('text')
				.attr('dx', x)
				.attr('dy', y)
				.attr('class', classes)
				.text(text);
		};

		$scope.arcTween = function(transition, newFinishAngle, arc) {
			transition.attrTween('d', function (d) {
				var valEnd = d3.interpolate(d.endAngle, newFinishAngle);
				return function (t) {
					d.endAngle = valEnd(t);
					return arc(d);
				};
			});
		};

		$scope.arcTransition = function(arcData) {
			$scope.actualArc.transition()
				.duration(750)
				.style('fill', arcData.arcActual.color)
				.call($scope.arcTween, arcData.arcActual.endAngle, $scope.arc);

			$scope.expectedArc.transition()
				.duration(750)
				.call($scope.arcTween, arcData.arcExpected.endAngle, $scope.arc);
		};

		$scope.textTransition = function(endVal) {
			$scope.valueLabel.data([endVal]);
			$scope.valueLabel.transition()
				.duration(750)
				.tween('text', function() {
					var val = d3.interpolate(this.textContent, endVal);
					return function(t) {
						this.textContent = Math.round(val(t));
					}.bind(this);
				});

			var percentLabelPosition = (endVal == 100) ? 173 : 165;
			$scope.percentLabel.transition()
				.duration(750)
				.attr('dx', percentLabelPosition);
		};

		$scope.update = function() {
			var arcData = $scope.calculateNewArcParams();
			if (arcData.error) {
				$('.error-msg').text(arcData.errorMsg).fadeIn(500).delay(3000).fadeOut(500);
				return;
			}

			$scope.arcTransition(arcData);
			$scope.textTransition(Math.round(parseFloat($scope.actual*100)));
		};

		$scope.convertFloatToRad = function(num) {
			return num * 2 * Math.PI;
		};

		$scope.calculateNewArcParams = function() {
			var res = {};
			var actual = parseFloat($scope.actual);
			var expected = parseFloat($scope.expected);
			if (actual < 0 || actual >1 || expected < 0 || expected > 1 || isNaN(actual) || isNaN(expected)) {
				res = {
					error: true,
					errorMsg: 'Inputs must be values between 0.0 and 1.0.'

				};
			} else {
				// Rounding below is used to take care of float point issues on javascript
				var progressRatio = (expected === 0) ? 1 : Math.round(1000*actual/expected)/1000;
				var arcActualColor = GREEN;
				if (progressRatio < 0.75) {
					arcActualColor = (progressRatio < 0.5) ? RED : ORANGE;
				}

				res.arcActual = {
					endAngle: Math.max(MIN_RADIAN, $scope.convertFloatToRad(actual)),
					color: arcActualColor
				};
				res.arcExpected = {
					endAngle: Math.max(MIN_RADIAN, $scope.convertFloatToRad(expected)),
					color: PALE_GREEN
				};
			}

			return res;
		};
	}])
	.directive('arcLoaderZzz', function() {
		return {
			templateUrl: '/components/arc_loader/arc_loader_template.html',
			link: function(scope, elem, attr) {
				scope.initializeSvgs();
			}
		};
	});
