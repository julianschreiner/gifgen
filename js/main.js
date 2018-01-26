var app = angular.module('gifGen', []);

app.controller('gifGenCtrl', function($scope, $http, $timeout, $rootScope, $filter, $sce, $anchorScroll, $templateCache) {
  //Clearing Cache programatically
  $templateCache.removeAll();
  $scope.isMobile = false;

  if(window.innerWidth < 769){
    $scope.isMobile = true;
    console.log("mobile");
  }
  else{
    console.log("desktop");
  }

  $scope.loading = true;
  $scope.dataIndex = 0;
  //$scope.subreddit = 'aww'
  //TODO build 2 dimensional array:
  /*
  * array(){
    1{
      link:
      titles:
    },
    2{
      link:
      titles:
    }
  }
  *
  */

  //We store every link there
  $scope.initCoreData = function() {
    $rootScope.links = [];
    $rootScope.titles = [];
    $rootScope.names = [];
    $rootScope.subReddits = [];
    $rootScope.chosenSubreddits = [];
  };

  $scope.initCoreData();

  $scope.clearNames = function () {
    $rootScope.names = [];
    $rootScope.links = [];
    $rootScope.titles = [];
    $rootScope.subReddits = [];
  };

  $scope.goToAnchor = function() {
    $('html, body').animate({
      scrollTop: $("#image").offset().top + 90
    }, 700);
    //console.log("scrolled");
  };

  $scope.getRedditData = function(subreddit, afterID = '') {
    var sortFactor = '';
    //console.log(afterID);
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
      url: "https://www.reddit.com/r/" + subreddit + "/" + sortFactor + ".json?sort=" + sortFactor + "&after=" + afterID
    }).then(function mySuccess(response) {
      $scope.ret = response;

      //Store requested subReddits
      $rootScope.subReddits.push(subreddit);
      //console.log($rootScope.subReddits);

      //There we store all our links
      $rootScope.data = $scope.ret.data.data.children;
      $rootScope.names.push($scope.ret.data.data.after);


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
              ) 
            {

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
          else if(key == 'title'){
            $rootScope.titles.push(value);
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
    $scope.subredditChoice();
    $('#mainDiv').addClass('blur');

    //Scroll..
    $scope.goToAnchor();
  }, 1500);



  $scope.showNextContent = function() {
    //console.log('triggered');
    //console.log($rootScope.links.length);

    //delete old index from array.links
    $rootScope.links.splice($scope.dataIndex, 1);

/*
    console.log($rootScope.links.length);
    console.log("---");
    console.log($rootScope.chosenSubreddits.length);
    console.log($rootScope.names.length);
*/

    if ($rootScope.links.length == 0) {
      //Getting new Data
      //console.log("Getting new Data");
      //console.log($rootScope.chosenSubreddits);
      
      $scope.loading = true;
      angular.forEach($rootScope.chosenSubreddits, function(value, key) {
        //Load new content TODO
        //console.log(key);

        $scope.getRedditData(value, $rootScope.names[key]);
      });
      $scope.clearNames();
      
      $timeout(function(){
        $scope.loading = false;
      }, 1000);
    }

    //Choose random index in range(0, array.links.size)
    var randIndex = Math.floor((Math.random() * $rootScope.links.length) + 0);

    //change dataIndex to that random value
    $scope.dataIndex = randIndex;

    //WAIT until GIF is loaded
    if ($rootScope.links[$scope.dataIndex].includes(".gif")) {
      $('#image').attr('src', 'ss');
      $scope.loading = true;
      $timeout(function() {
        $('#image').attr('src', $scope.links[$scope.dataIndex]);
        $scope.loading = false;


        //Scroll..
        $scope.goToAnchor();
      }, 1500);
    }


    //$scope.dataIndex++;
  };

  $scope.subredditChoice = function() {
    bootbox.prompt({
      title: "What kind of stuff do you want to see?",
      closeButton: false,
      cancelButton: false,
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
        },
      ],
      callback: function(result) {
        //console.log(result);
        var customSubreddit = $('#customSubr').val();
        $scope.initCoreData();

        if(customSubreddit.length > 0){
          if(customSubreddit.indexOf(',') != -1){
              customSubreddit = customSubreddit.split(',');
              angular.forEach(customSubreddit, function(value, key) {
                $rootScope.chosenSubreddits.push(value);
              });
          }
          else{
             $rootScope.chosenSubreddits.push(customSubreddit);
             //$scope.getRedditData(customSubreddit);
          }
        }

        if (result.length != null) {
          angular.forEach(result, function(value, key) {
            $rootScope.chosenSubreddits.push(value);
          });
        }
       /* STOPPED HERE ----> */
        if(result === null){
          $( ".modal-body" ).append( "<p>Please choose a subreddit!</p>");
        }

        angular.forEach($rootScope.chosenSubreddits, function(value, key) {
            $scope.getRedditData(value);
        });

        //console.log($rootScope.chosenSubreddits);


        $('#mainDiv').removeClass('blur');
      }
    });

    //Custom Subreddits
    $( ".btn btn-default" ).css('display: none;');
    $( ".modal-body" ).append( "<p>Or add your own:</p>");
    $( ".modal-body" ).append(
      "<div class='text'>" +
      "<input class='bootbox-input bootbox-input-text form-control' id='customSubr' type='text' placeholder='Subreddit (comma separated)'>" +
      "</div>"
    );

  };

  $scope.shareContent = function()  {
    copyToClipboard($scope.links[$scope.dataIndex]);
    var dialog = bootbox.dialog({
      message: '<p class="text-center">Copied URL ✅ Share it with your friends.</p>',
      closeButton: false
    });

    window.setTimeout(function(){
        bootbox.hideAll();
    }, 2000); // 10 seconds expressed in milliseconds
  };


});

angular.module('gifGen')
  .filter('trustUrl', function($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  });


function copyToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return clipboardData.setData("Text", text);

  } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy"); // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};
