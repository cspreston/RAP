(function () {
	
	let app = angular.module('CTR-RAP-AWS', ['ui.router', 'ngFileUpload']);

	app.factory('awsRequestInterceptor', AwsRequestInterceptor);
	app.config(AppConfiguration);

	AwsRequestInterceptor.$inject = [];
	AppConfiguration.$inject = ['$httpProvider', '$locationProvider'];

	function AwsRequestInterceptor() {

        return {
            request: function(request) {

                if (request.url.includes('/api/niv/') && TKWApp.Data.AuthenticationManager.isAuthenticated()) {
                    request.headers['Authorization'] = 'Bearer ' + TKWApp.Data.AuthenticationManager.AuthenticationToken.Token;
                }

                return request;
            }
        }
    }

	function AppConfiguration($httpProvider, $locationProvider) {

		$locationProvider.hashPrefix(''); 

		$httpProvider.defaults.headers.common['Accept'] = 'application/json, text/javascript, text/html';
		$httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';

		$httpProvider.interceptors.push('awsRequestInterceptor');
	}
})();