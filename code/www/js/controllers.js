angular.module('songhop.controllers', ['ionic', 'songhop.services'])



/*
发现页面的控制器
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, Recommendations)
{
	//创建APP加载动画
	var showLoading = function() {
		$ionicLoading.show({
			template: '<i class="ion-loading-c"></i>',
			noBackdrop: true
		});
	}

	var hideLoading = function() {
		$ionicLoading.hide();
	}

	  // set loading to true first time while we retrieve songs from server.
	showLoading();


	Recommendations.init()
	  .then(function(){
	  	$scope.currentSong = Recommendations.queue[0];
	  	Recommendations.playCurrentSong();
	})
	  .then(function(){
	  	//关闭加载动画
	  	hideLoading();
	  	$scope.currentSong.loaded = true;
	  });
	

	//随机选择下一首。
	// fired when we favorite / skip a song.
	$scope.sendFeedback = function (bool) {

			// first, add to favorites if they favorited
		if (bool) User.addSongToFavorites($scope.currentSong);

		 // set variable for the correct animation sequence
		$scope.currentSong.rated = bool;
		$scope.currentSong.hide = true;  

		//准备下一首歌
		Recommendations.nextSongs();

		$timeout(function() {
		// $timeout to allow animation to complete
		$scope.currentSong = Recommendations.queue[0]; 
		$scope.currentSong.loaded = false;
		},250);

		Recommendations.playCurrentSong().then(function() {
			$scope.currentSong.loaded = true;
		});
	}

	 // used for retrieving the next album image.
  // if there isn't an album image available next, return empty string.
    $scope.nextAlbumImg = function () {
    	if (Recommendations.queue.length > 1) {
    		return Recommendations.queue[1].image_large;
    	}

    	return '';
    }
})


/*
喜欢页面的控制器
*/
.controller('FavoritesCtrl', function($scope, $window, User) 
{
// get the list of our favorites from the user service
	$scope.favorites = User.favorites;
	$scope.username = User.username;
	$scope.removeSong = function(song, index) 
	{
	 	User.removeSongFromFavorites(song, index);

	}
	$scope.openSong = function(song) {
		$window.open(song.open_url, "_system");

	}
}
)


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, $window, Recommendations, User) {
	// expose the number of new favorites to the scope
	$scope.favCount = User.favoritesCount;
	// 按下喜欢按钮清零数字
	$scope.enteringFavorites = function() {
		User.newFavorites = 0;
		Recommendations.haltAudio();
	}
	$scope.leavingFavorites = function() {
		Recommendations.init();
	}

	$scope.logout = function() {
		User.destroySession();
		// instead of using $state.go, we're going to redirect.
    // reason: we need to ensure views aren't cached.
		$window.location.href = 'index.html';
	}
}
)

.controller('SplashCtrl', function($scope, $state, User) {
	// attempt to signup/login via User.auth
	$scope.submitForm = function(username, signingUp) {
		User.auth(username, signingUp).then(function(){
			//console.log('tab.discover');
			// session is now set, so lets redirect to discover page
			$state.go('tab.discover');

		}, function(err) {
			//console.log(err);
			 // error handling here
			alert('Hmm... ' + err.data.message);

		});
	}

});