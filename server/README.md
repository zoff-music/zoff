## Events

### To server
```
//  Tells the server the song is clientside
'end', {id: video_id, channel: channel_name, pass: channel_pass}

// Asks server where in the song it should be
'pos', {channel: channel_name, pass: channel_pass}

// Tells the server the client wants the list
'list', {channel: channel_name, pass: channel_pass, version: system_version (now 3)}

// Sends info about a song the client wants to add
'add', {id: VIDEO_ID, title: VIDEO_TITLE, adminpass: sha256(PASSWORD), duration: VIDEO_DURATION, list: channel_name, playlist: true_if_importing_playlist, num: current_number_of_sending_songs, total: total_number_of_sending_songs, pass: channel_pass}

// Tells the server to disconnect the user from the current channel, is used for remote controlling on the host side
'change_channel', {channel: channel_name}

// Sends chat text to all chat
'all,chat', {channel: channel_name, data: input}

// Sends chat text to channelchat
'chat',{channel: channel_name, data: input, pass: channel_pass}

// Sends info about song the user wants to vote on. If VOTE_TYPE is del, its deleting the song, if its pos, its just voting
'vote', {channel: CHANNEL_NAME, id: VIDEO_ID, type: VOTE_TYPE, adminpass: PASSWORD}

// Sends skip message to server
'skip', {pass: adminpass, id:video_id, channel: chan, userpass: channel_pass}

// Sends password for instant log in to server
'password', {password: PASSWORD, channel: CHANNEL_NAME, oldpass: old_pass_if_changing_password}

// Sends message to the host channel for play
'id', {id: CHANNEL_ID, type: "play", value: "mock"}

// Sends message to the host channel for pause
'id', {id: CHANNEL_ID, type: "pause", value: "mock"}

// Sends message to the host channel for skip
'id', {id: CHANNEL_ID, type: "skip", value: "mock"}

// Sends message to the host channel to change volume
'id', {id: CHANNEL_ID, type: "volume", value: VALUE}

// Sends message to the host channel to change channel
'id', {id: CHANNEL_ID, type: "channel", value: NEW_CHANNEL_NAME}
```

### From server
```
// Recieves a string from server for what type of toast to be triggered
'toast', STRING  

// Recieves the password for the channel if the user sent the right in the first place
'pw', STRING   

// Recieves configuration array from server
'conf', [ARRAY]

// Recieves chat message from allchat
'chat.all', {from: name, msg: message, channel: channel, icon: icon_src}

// Recieves chat message from channelchat
'chat', {from: name, msg: message, icon: icon_src}

// Recieves the ID of the current client, used for remote listening
'id', STRING    

// Recieves the messages sent on CHANNEL_ID above
id, {type: STRING, value: VALUE}

// Recieves updates from channel. type is one of the following: list, added, deleted, vote, song_change
'channel', {type: TYPE, value: value, time: time_of_occurence}

// Recieves message from the server that its ready to send the playlist and info
'get_list'

// Recieves array of now playing song. Is triggered on song-change
'np', {np: NOW_PLAYING, conf: CONFIGURATION, time: SERVER_TIME}

// Recieves number of viewers on the current channel
'viewers', VALUE    
```
