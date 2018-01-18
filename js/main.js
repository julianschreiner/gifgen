var app = angular.module('gifGen', []);



app.controller('gifGenCtrl', function($scope, $http, $timeout, $rootScope, $filter, $sce, $anchorScroll, $templateCache) {
  //Clearing Cache programatically
  $templateCache.removeAll();

  $scope.loading = true;
  $scope.dataIndex = 0;
  //$scope.subreddit = 'aww'

  //We store every link there
  $scope.initCoreData = function(){
    $rootScope.links = [];
    $rootScope.subReddits = [];
    $rootScope.chosenSubreddits = [];
  }
  $scope.initCoreData();

  $scope.goToAnchor = function() {
    $('html, body').animate({
      scrollTop: $("#image").offset().top + 90
    }, 700);
    //console.log("scrolled");
  };

  $scope.getRedditData = function(subreddit) {
    var sortFactor = '';
    /*  var randomNumber = Math.floor((Math.random() * 2) + 1);

      if(randomNumber == 1){
        sortFactor = 'top';
      }
      else{
        sortFactor = 'new';
      }
    */
    var sortFactor = 'new';
    //console.log(sortFactor);

    $http({
      method: "GET",
      url: "https://www.reddit.com/r/" + subreddit + "/" + sortFactor + ".json?sort=" + sortFactor
    }).then(function mySuccess(response) {
      $scope.ret = response;

      //Store requested subReddits
      $rootScope.subReddits.push(subreddit);

      //There we store all our links
      $rootScope.data = $scope.ret.data.data.children;


      //Appending .png to all imgur links that are being fetched.
      angular.forEach($rootScope.data, function(value2, key) {
        angular.forEach($rootScope.data[key].data, function(value, key) {
          if (key == 'url') {
            var testify = value;


            if (testify.includes("imgur") && !testify.includes('gif')) {
              testify += '.png';
            }
            if (testify.includes("imgur") && testify.includes('gifv')) {
              testify = testify.substring(0, testify.length - 1); // "12345.0"
            }

            //Filter Links...

            if (
              (testify.includes("imgur") || testify.includes("redd") || testify.includes("giphy")) &&
              !testify.includes("://v.redd.it") &&
              !testify.includes(".gifv") &&
              !testify.includes(".webm") &&
              !(testify.includes("imgur") && testify.includes("gallery")) &&
              !(testify.includes("reddit") && testify.includes("comments")) &&
              !(testify.includes("imgur") && testify.includes("/a/"))
            ) {
              $rootScope.links.push(testify);
            }

            /*
            if(
              !testify.includes("://gfycat.com") &&
              !testify.includes("yandex") &&
              !testify.includes("theverge") &&
              !testify.includes("://soundcloud.com") &&
              !testify.includes("://youtu.be") &&
              !testify.includes("://www.youtube.com") &&
              !testify.includes("://www.facebook.com") &&
              !(testify.includes("imgur") && testify.includes("/a/")) &&
              !testify.includes("://v.redd.it") &&
              !testify.includes("gallery") &&
              !testify.includes("gifv")
            )
            {
              $rootScope.links.push(testify);
            }
            */

            return key = testify;
          }

        });
      });
    }, function myError(err) {
      console.log(err);
    });
  }
  /* TODO OVERWORK THIS */
  $scope.getRedditData('trippy');
  $scope.getRedditData('memes');
  $scope.getRedditData('WTF');
  $scope.getRedditData('pics');
  $scope.getRedditData('gif');
  $scope.getRedditData('BeAmazed');
  $scope.getRedditData('mildlyinfuriating');

  //SORT (RANDOM EFFECT)
  $rootScope.links = $filter('orderBy')($rootScope.links, 'key', true)


  //LET FRONTEND LOAD
  $timeout(function() {
    $scope.loading = false;

    //box.js
    subredditChoice();
    $('#mainDiv').addClass('blur');

    //Scroll..
    $scope.goToAnchor();
  }, 1500);



  $scope.showNextContent = function() {
    //console.log('triggered');
    //console.log($rootScope.links.length);

    if ($rootScope.links.length <= 0) {
      //Getting new Data
      /* TODO only get data that user really choosed */
      $scope.getRedditData('trippy');
      $scope.getRedditData('WTF');
      $scope.getRedditData('pics');
      $scope.getRedditData('gif');
      $scope.getRedditData('BeAmazed');
      $scope.getRedditData('mildlyinfuriating');
    }

    //delete old index from array.links
    $rootScope.links.splice($scope.dataIndex, 1);

    //Choose random index in range(0, array.links.size)
    var randIndex = Math.floor((Math.random() * $rootScope.links.length) + 0);

    //change dataIndex to that random value
    $scope.dataIndex = randIndex;

    //WAIT until GIF is loaded
    if ($rootScope.links[$scope.dataIndex].includes(".gif")) {
      $scope.loading = true;
      $timeout(function() {
        $scope.loading = false;


        //Scroll..
        $scope.goToAnchor();
      }, 1500);
    }

    //$scope.dataIndex++;
  };

  function subredditChoice() {
    bootbox.prompt({
      title: "What kind of stuff do you want to see?",
      inputType: 'checkbox',
      closeButton: false,
      inputOptions: [{
          text: 'Trippy',
          value: 'trippy',
        },
        {
          text: 'Memes',
          value: 'memes',
        },
        {
          text: 'WTF',
          value: 'wtf',
        },
        {
          text: 'Pics',
          value: 'pics',
        },
        {
          text: 'Gif',
          value: 'gif',
        },
        {
          text: 'Be Amazed',
          value: 'BeAmazed',
        },
        {
          text: 'Mildly Infuriating',
          value: 'mildlyinfuriating',
        }
      ],
      callback: function(result) {
        //console.log(result);
        if (result !== null) {
          $scope.initCoreData();
          $rootScope.chosenSubreddits = result;

          angular.forEach($rootScope.chosenSubreddits, function(value, key) {
            $scope.getRedditData(value);
          });
        }

        $('#mainDiv').removeClass('blur');
      }
    });

  };


  $scope.customContent = function() {

  }


});


angular.module('gifGen')
  .filter('trustUrl', function($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  });
