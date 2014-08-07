/**
 * Created with JetBrains WebStorm.
 * User: ttran03
 * Date: 6/6/13
 * Time: 9:05 PM
 * To change this template use File | Settings | File Templates.
 */
'use strict';
//Define noivado module and services this module.
var custApp = angular.module('custApp', ['ngCookies']).config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/off', {templateUrl: 'template/cust-widget/offline.html'}).
        when('/off_call_back', {templateUrl: 'template/cust-widget/off-callback.html'}).
        when('/on1', {templateUrl: 'template/cust-widget/online1.html'}).
        when('/on2', {templateUrl: 'template/cust-widget/online2.html'}).
        when('/wait', {templateUrl: 'template/cust-widget/waiting.html'}).
        when('/wait_call_back', {templateUrl: 'template/cust-widget/waiting-callback.html'}).
        when('/chat', {templateUrl: 'template/cust-widget/text-chat.html'}).
        when('/feedback', {templateUrl: 'template/cust-widget/feedback.html'}).
        when('/feedback_thank', {templateUrl: 'template/cust-widget/feedback-thank.html'}).
        when('/loading', {templateUrl: 'template/cust-widget/loading.html'}).
        when('/cb_thank', {templateUrl: 'template/cust-widget/callmeback-thank.html'}).
        otherwise({redirectTo: '/loading'});
}]);