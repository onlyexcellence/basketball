/**
 *
 *  Defines `hNumberPicker` directive which can only be used as element.
 *
 *  It allows end-user to choose number, instead of typing
 *
 *  usage:
 *
 *       <h-number value="input.num" min="1" max="10" step="1" change="onChange()"></h-number>
 *
 *  @author  Howard.Zuo
 *  @date    Apr 15th, 2015
 *
 */
(function(angular) {
    'use strict';

    var defaults = {
        min: 0,
        max: 100,
        step: 1,
        timeout: 600
    };

    var assign = function(dest, src) {
        for (var key in src) {
            if (!dest[key]) {
                dest[key] = src[key];
            }
        }
        return dest;
    };

    var isNumber = function(value) {
        var val = Number(value);
        return !isNaN(val) && val == value;
    };

    var toNumber = function(value) {
        return Number(value);
    };

    var checkNumber = function(value) {
        if (!isNumber(value)) {
            throw new Error('value [' + value + '] is not a valid number');
        }
    };

    var getTarget = function(e) {
        if (e.touches && e.touches.length > 0) {
            return angular.element(e.touches[0].target);
        }
        return angular.element(e.target);
    };

    var getType = function(e) {
        return getTarget(e).attr('type');
    };

    var transform = function(opts) {
        for (var key in opts) {
            var value = opts[key];
            opts[key] = toNumber(value);
        }
    };


    var moduleName = 'angularNumberPicker';

    var module = angular.module(moduleName, []);

    var directive = function($timeout, $interval) {

        return {
            restrict: 'E',
            scope: {
                'singular': '@',
                'plural': '@',
                'min': '@',
                'max': '@',
                'step': '@',
                'change': '&',
                'ngModel': '=',
                'label': '@'
            },
            link: function($scope, element) {

                var opts = assign({
                    min: $scope.min,
                    max: $scope.max,
                    step: $scope.step
                }, defaults);

                checkNumber(opts.min);
                checkNumber(opts.max);
                checkNumber(opts.step);

                transform(opts);

                $scope.$watch('ngModel', function(newValue) {
                    $scope.canDown = newValue > opts.min;
                    $scope.canUp = newValue < opts.max;
                });

                var changeNumber = function($event) {
                    var type = getType($event);
                    if ('up' === type) {
                        if ($scope.ngModel >= opts.max) {
                            return;
                        }
                        $scope.ngModel += opts.step;
                    } else if ('down' === type) {
                        if ($scope.ngModel <= opts.min) {
                            return;
                        }
                        $scope.ngModel -= opts.step;
                    }
                    $scope.change();
                };

                var timeoutPro, intervalPro;
                var start, end;
                var addon = element.find('span.btn');
                // var addon = element.find('button');

                addon.on('click', function(e) {

                    JP('CLICK');

                    changeNumber(e);
                    $scope.$apply();
                    e.stopPropagation();

                });

                addon.on('touchstart', function(e) {
                    getTarget(e).addClass('active');
                    start = new Date().getTime();
                    timeoutPro = $timeout(function() {
                        intervalPro = $interval(function() {
                            changeNumber(e);
                        }, 200);
                    }, opts.timeout);
                    e.preventDefault();
                });

                addon.on('touchend', function(e) {
                    end = new Date().getTime();
                    if (intervalPro) {
                        $interval.cancel(intervalPro);
                        intervalPro = undefined;
                    }
                    if (timeoutPro) {
                        $timeout.cancel(timeoutPro);
                        timeoutPro = undefined;
                    }
                    if ((end - start) < opts.timeout) {
                        changeNumber(e);
                        $scope.$apply();
                    }
                    getTarget(e).removeClass('active');
                });

                $scope.$on('$destroy', function() {
                    addon.off('touchstart touchend click');
                });

            },
            template: '<div class="input-group"><div class="input-group-btn"><span class="btn btn-danger" type="down">-</span></div><input type="text" class="form-control" ng:model="ngModel" /><div class="input-group-addon" ng:if="label && label != \'\'">{{label}}</div><div class="input-group-btn"><span class="btn btn-success" type="up">+</span></div></div>'
            // template: '<div class="input-group"><span class="input-group-btn"><span class="btn btn-default" type="down"><span class="glyphicon glyphicon-minus"></span></span></span><input type="text" class="form-control" ng:model="value" /><span class="input-group-btn"><span class="btn btn-default" type="up"><span class="glyphicon glyphicon-plus"></span></span></span></div>'
            // template: '<div class="input-group"><span class="input-group-addon" type="down" ng-disabled="!canDown">&nbsp;&nbsp;-&nbsp;&nbsp;</span><label class="form-control">{{ value }} {{value === 1 ? singular : plural}}</label><span class="input-group-addon" type="up" ng-disabled="!canUp">&nbsp;&nbsp;+&nbsp;&nbsp;</span></div>'
        };
    };


    module.directive('hNumber', ['$timeout', '$interval', directive]);



}(angular));