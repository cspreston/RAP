(function () {
	
	let app = angular.module('CTR-RAP-AWS', ['ui.router', 'ngFileUpload']);

	app.config(AppConfiguration);

	AppConfiguration.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

	function AppConfiguration($stateProvider, $urlRouterProvider, $locationProvider) {

		$locationProvider.hashPrefix(''); 
		//$urlRouterProvider.otherwise('/upload');

		//$stateProvider
		//	.state('upload', {
		//		url: '/upload',
		//		component: 'planUploader'
		//	})
		//	.state('edit', {
		//		url: '/edit',
		//		component: 'planEditor',
		//		params: {
		//			'dzi': ''
		//		}
		//	});
	}

})();