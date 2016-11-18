var receiver = new cast.receiver.Receiver("E6856E24", ["no.zoff.customcast"],"",5);
var ytChannelHandler = new cast.receiver.ChannelHandler(cfg.msgNamespace);
var nextVideo;
ytChannelHandler.addChannelFactory(receiver.createChannelFactory(cfg.msgNamespace));
ytChannelHandler.addEventListener(
  cast.receiver.Channel.EventType.MESSAGE,
	onMessage.bind(this)
);

receiver.start();

window.addEventListener('load', function() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

ytMessages={
  "getNextVideo": function(event) {
  	nextVideo=event.message.videoId;
  },
  "loadVideo": function(event) {
  	player.loadVideoById(event.message.videoId);
  },
  "stopCasting": function() {
  	endcast();
  },
  "playVideo": function() {
  	player.playVideo();
  },
  "pauseVideo": function() {
  	player.pauseVideo();
  },
  "stopVideo": function() {
  	player.stopVideo();
  },
  "seekTo": function(event) {
    player.seekTo(event.message.seekTo)
  },
  "getStatus": function() {
  	channel.send({'event':'statusCheck','message':player.getPlayerState()});
  }
};

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
	    height: 562,
	    width: 1000,
			playerVars: { 'autoplay': 0, 'controls': 0 },
      events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
      }
  });
}

function onPlayerReady() {
  channel.send({'event':'iframeApiReady','message':'ready'});
}

function onPlayerStateChange(event) {
	channel.send({'event':'stateChange','message':event.data});
	/*if (event.data==YT.PlayerState.ENDED) {
		endcast();
	}*/
}

	function onMessage(event) {
		ytMessages[event.message.type](event);
    	}

	function endcast() {
		setTimeout(window.close, 2000);
	}
