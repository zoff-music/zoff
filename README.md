Zöff
====

##### The server-side is required for this website, and it's found at: <a href="https://github.com/zoff-music/zoff-server">here</a>

##### Config

To get the website to run as intended, please add ```AllowOverride All``` to the directory containing the webserver in Apache2 (it's usually 000-default.conf)

### About

Zöff is a shared (free) YouTube based radio service, built upon the YouTube API. 

Zöff is mainly a webbased service. The website uses <a href="https://nodejs.org/">NodeJS</a> with <a href="http://socket.io/">Socket.IO</a>, <a href="https://www.mongodb.org/">MongoDB</a> and PHP on the backend, with JavaScript, jQuery and <a href="http://materializecss.com/">Materialize</a> on the frontend.

The team consists of Kasper Rynning-Tønnesen and Nicolas Almagro Tonne, and the project has been worked on since late 2014.

### Contact

The team can be reached on <a href="mailto:contact@zoff.no?Subject=Contact%20Zoff">contact@zoff.no</a>

###Screenshots of desktop version:

![Frontpage desktop](http://i.imgur.com/f9MoSDN.png)

![Channel desktop](http://puu.sh/ivYKz/b1b65b339c.jpg)

![Channel desktop 2](http://puu.sh/ivYVo/9036795b95.jpg)

### Screenshots of the mobile version:

![Frontpage mobile](http://lh5.googleusercontent.com/-_rATUkLCLH8/VUKTzZ19TqI/AAAAAAAABLc/ab9ZiJtLy4g/w330-h586-no/Screenshot_2015-04-30-22-30-43.png)     ![Channel mobile](http://lh5.googleusercontent.com/-YaH8pUMzjRM/VUKTpr7ZpdI/AAAAAAAABLQ/ABOOB-1RWcw/w330-h586-no/Screenshot_2015-04-30-22-39-44.png)     ![Channel mobile 2](http://lh5.googleusercontent.com/-wVKAxHBwIAI/VUKToHhHxgI/AAAAAAAABLI/RyCteTkdvDY/w330-h586-no/Screenshot_2015-04-30-22-36-00.png)

### Android exclusive screens:

<div style="text-align:center;">
<img src="http://i.imgur.com/2LMOnUe.png" alt="android1" height="600px"> 
<img src="http://i.imgur.com/mIOrtng.png" alt="android2" height="400px">
</div>

### Events

Emitted events between the server and client
```
socket.emit("end", VIDEO_ID); 														Tells the server the song is clientside
socket.emit("pos"); 		  														Asks server where in the song it should be
socket.emit('list', CHANNEL_NAME);  												Tells the server the client wants the list
socket.emit("add", [VIDEO_ID, VIDEO_TITLE, sha256(PASSWORD), VIDEO_DURATION]);		Sends info about a song the client wants to add
socket.emit("change_channel");														Tells the server to disconnect the user from the current channel, is used for remote controlling on the host side
socket.emit("all,chat", TEXT);														Sends chat text to all chat
socket.emit("chat", TEXT); 															Sends chat text to channelchat
socket.emit('vote', [CHANNEL_NAME, VIDEO_ID, VOTE_TYPE, PASSWORD]);					Sends info about song the user wants to vote on. If VOTE_TYPE is del, its deleting the song, if its pos, its just voting
socket.emit('skip', [CHANNEL_NAME, PASSWORD]);										Sends skip message to server
socket.emit("password", [PASSWORD, CHANNEL_NAME]);									Sends password for instant log in to server
socket.emit('frontpage_lists');														Tells the server the client wants frontpage lists
socket.emit("id", [CHANNEL_ID, "play", "mock"]);									Sends message to the host channel for play
socket.emit("id", [CHANNEL_ID, "pause", "mock"]);									Sends message to the host channel for pause
socket.emit("id", [CHANNEL_ID, "skip", "mock"]);									Sends message to the host channel for skip
socket.emit("id", [CHANNEL_ID, "volume", VALUE]);									Sends message to the host channel to change volume
socket.emit("id", [CHANNEL_ID, "channel", NEW_CHANNEL_NAME]);						Sends message to the host channel to change channel

socket.on("toast", STRING)															Recieves a string from server for what type of toast to be triggered
socket.on("pw", STRING)																Recieves the password for the channel if the user sent the right in the first place
socket.on("conf", [ARRAY])															Recieves configuration array from server
socket.on("chat.all", [CLIENT_NAME, STRING, CLIENT_CHANNEL_NAME])					Recieves chat message from allchat
socket.on("chat", [CLIENT_NAME, STRING])											Recieves chat message from channelchat
socket.on("id", STRING)																Recieves the ID of the current client, used for remote listening
socket.on(id, [ARRAY])																Recieves the messages sent on CHANNEL_ID above
socket.on("channel", [TYPE, [TYPE_SPECIFIC_VALUE]])														Recieves updates from channel. [0] is one of the following: list, added, deleted, vote, song_change
socket.on("get_list")																Recieves message from the server that its ready to send the playlist and info
socket.on('playlists', [ARRAY])														Recieves the playlists for the frontpage
socket.on("np", [NOW_PLAYING, CONFIGURATION, SERVER_TIME])															Recieves array of now playing song. Is triggered on song-change
socket.on("viewers", VALUE)															Recieves number of viewers on the current channel
```

### Legal

Copyright © 2016 
Nicolas Almagro Tonne and Kasper Rynning-Tønnesen 

Creative Commons License
Zöff is licensed under a 
<a href="http://creativecommons.org/licenses/by-nc-nd/3.0/no/">Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Norway License.</a>. 
Do not redistribute without permission from the developers. 
