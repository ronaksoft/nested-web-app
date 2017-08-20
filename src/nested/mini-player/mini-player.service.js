(function() {
    'use strict';
    angular
      .module('ronak.nested.web.message')
      .service('SvcMiniPlayer', SvcMiniPlayer);
  
    /** @ngInject */
    function SvcMiniPlayer($rootScope,$window,deviceDetector,$timeout, NstSvcFileFactory, NstSvcStore, _) {
        var obj = {},
            audioDOMS= [],
            audioObjs = [],
            currentlyPlay;

        obj.addMusic = function (item) {
            
            var alreadyCreated = audioDOMS.find(function (audioDOM) {
                return audioDOM.className === item.id;
            })
            if ( alreadyCreated ) {
                // alreadyCreated.pause();
                // alreadyAdded.remove();
                // pauseCallback(false);
                // _.remove(audioDOMS, function(n) {
                //     return n.className === item.id;
                // });
                return ;
            } 
            audioObjs.push(item);
            
            var audio = document.createElement('audio');
            audio.style.display = "none";
            audio.className = item.id;
            audio.autoplay = item.isPlayed ? true : false;
            audio.src = item.src;
            document.body.appendChild(audio);

            audioDOMS.push(audio);

            audio.onended = function(){
                // audio.remove() //Remove when played.
                $rootScope.$broadcast('play-audio', '');
                // _.remove(audioDOMS, function(n) {
                //     return n.className === item.id;
                // });
            };
        };

        obj.play = function (id) {
            currentlyPlay = id;
            var DOM = audioDOMS.find(function (audioDOM) {
                return audioDOM.className === id;
            });
            DOM.play();
            $rootScope.$broadcast('play-audio', id);
        };

        obj.pause = function (id) {
            currentlyPlay = '';
            var DOM = audioDOMS.find(function (audioDOM) {
                return audioDOM.className === id;
            });
            DOM.pause();
            $rootScope.$broadcast('play-audio', '');
        }

        obj.removeAll = function () {
            audioDOMS.forEach(function (i){
                i.pause();
                i.remove();
            });
            audioDOMS = [];
            audioObjs = [];
            $rootScope.$broadcast('play-audio', '');
        };

        return obj;
    }
  })();
  