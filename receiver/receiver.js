cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);

window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
var customMessageBus = castReceiverManager.getCastMessageBus('urn:x-cast:zoff.no');
customMessageBus.onMessage = function(event) {
  switch(event.data.type){
    case "loadVideoBy":
      player.loadVideoById(event.data.videoId);
      break;

  }
}
/**
 * Application config
 **/
var appConfig = new cast.receiver.CastReceiverManager.Config();

/**
 * Text that represents the application status. It should meet
 * internationalization rules as may be displayed by the sender application.
 * @type {string|undefined}
 **/
appConfig.statusText = 'Ready to play';

/**
 * Maximum time in seconds before closing an idle
 * sender connection. Setting this value enables a heartbeat message to keep
 * the connection alive. Used to detect unresponsive senders faster than
 * typical TCP timeouts. The minimum value is 5 seconds, there is no upper
 * bound enforced but practically it's minutes before platform TCP timeouts
 * come into play. Default value is 10 seconds.
 * @type {number|undefined}
 **/
// 100 minutes for testing, use default 10sec in prod by not setting this value
appConfig.maxInactivity = 6000;
/**
 * Initializes the system manager. The application should call this method when
 * it is ready to start receiving messages, typically after registering
 * to listen for the events it is interested on.
 */
window.castReceiverManager.start(appConfig);

window.castReceiverManager.onSenderDisconnected = function(event) {
  if(window.castReceiverManager.getSenders().length == 0 &&
    event.reason == cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
      window.close();
  }
}


/*
var receiver = new cast.receiver.Receiver("E6856E24", ["no.zoff.customcast"],"",5);
var ytChannelHandler = new cast.receiver.ChannelHandler("no.zoff.customcast");
var nextVideo;
ytChannelHandler.addChannelFactory(receiver.createChannelFactory("no.zoff.customcast"));
ytChannelHandler.addEventListener(
  cast.receiver.Channel.EventType.MESSAGE,
	onMessage.bind(this)
);

receiver.start();
*/
window.addEventListener('load', function() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

ytMessages={
  "getNextVideo": function(event) {
  	nextVideo=event.data.videoId;
  },
  "loadVideo": function(event) {
  	player.loadVideoById(event.data.videoId);
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
    player.seekTo(event.data.seekTo)
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
  //channel.send({'event':'iframeApiReady','message':'ready'});
}

function onPlayerStateChange(event) {
	channel.send({'event':'stateChange','message':event.data});
	if (event.data==YT.PlayerState.ENDED) {
		endcast();
	}
}
