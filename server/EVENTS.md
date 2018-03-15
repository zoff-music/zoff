## Events

### To server
```
//  Tells the server the song is over
'end', {
    id: video_id,
    channel: channel_name,
    pass: Base64(channel_pass)
}

// Asks server where in the song it should be
'pos', {
    channel: channel_name,
    pass: Base64(hannel_pass)
}

// Tells the server the client wants the list
'list', {
    channel: channel_name,
    pass: Base64(channel_pass),
    version: system_version (can be checked in VERSION.js)
}

// Sends info about a song the client wants to add
'add', {
    id: VIDEO_ID,
    title: VIDEO_TITLE,
    adminpass: Base64(PASSWORD),
    duration: VIDEO_DURATION,
    list: channel_name,
    playlist: true_if_importing_playlist,
    num: current_number_of_sending_songs,
    total: total_number_of_sending_songs,
    pass: Base64(channel_pass)
}

// Tells the server to disconnect the user from the current channel, is used for remote controlling on the host side
'change_channel', {
    channel: channel_name
}

// Sends chat text to all chat
'all,chat', {
    channel: channel_name,
    data: input
}

// Sends chat text to channelchat
'chat',{
    channel: channel_name,
    data: input,
    pass: Base64(channel_pass)
}

// Sends info about song the user wants to vote on. If VOTE_TYPE is del, its deleting the song, if its pos, its just voting
'vote', {
    channel: CHANNEL_NAME,
    id: VIDEO_ID,
    type: VOTE_TYPE,
    adminpass: Base64(PASSWORD)
}

// Sends shuffle to the server (Only works every 5 seconds per list)
'shuffle', {
    adminpass: Base64(PASSWORD),
    channel: CHANNELNAME,
    pass: Base64(USER_PASSWORD)
}

// Sends skip message to server
'skip', {
    pass: Base64(PASSWORD),
    id:video_id,
    channel: chan,
    userpass: Base64(channel_pass)
}

// Sends password for instant log in to server
'password', {
    password: Base64(PASSWORD),
    channel: CHANNEL_NAME,
    oldpass: Base64(old_pass_if_changing_password)
}

// Sends message to the host channel for play
'id', {
    id: CHANNEL_ID,
    type: "play",
    value: "mock"
}

// Sends message to the host channel for pause
'id', {
    id: CHANNEL_ID,
    type: "pause",
    value: "mock"
}

// Sends message to the host channel for skip
'id', {
    id: CHANNEL_ID,
    type: "skip",
    value: "mock"
}

// Sends message to the host channel to change volume
'id', {
    id: CHANNEL_ID,
    type: "volume",
    value: VALUE
}

// Sends message to the host channel to change channel
'id', {
    id: CHANNEL_ID,
    type: "channel",
    value: NEW_CHANNEL_NAME
}

// Sends a video that triggered an error
'error_video', {
    channel: CHANNEL_NAME,
    id: VIDEO_ID,
    title: VIDEO_TITLE
}

// Requests chat-history from the last 10 minutes
'get_history', {
    channel: CHANNEL_NAME,
    all: BOOLEAN (if true, it requests  for all-chat),
    pass: Base64(USERPASS)
}
```

### From server
```
// Receives a string from server for what type of toast to be triggered
'toast', STRING  

// Receives a boolean if the password was correct
'pw', BOOLEAN   

// Receives configuration array from server
'conf', [ARRAY]

// Receives chat message from allchat
'chat.all', {
    from: name,
    msg: message,
    channel: channel,
    icon: icon_src
}

// Receives chat-history for all and for current channel
'chat_history', {
    all: BOOLEAN (if true, it is for all-chat),
    data: CHAT_HISTORY
}

// Receives chat message from channelchat
'chat', {
    from: name,
    msg: message,
    icon: icon_src
}

// Receives the ID of the current client, used for remote listening
'id', STRING    

// Receives the messages sent on CHANNEL_ID above
id, {
    type: STRING,
    value: VALUE
}

// Receives updates from channel. type is one of the following: list, added, deleted, vote, song_change, changed_values (see further down for better explanation here)
'channel', {
    type: TYPE,
    value: value,
    time: time_of_occurence
}

// Receives message from the server that its ready to send the playlist and info
'get_list'

// Receives array of now playing song. Is triggered on song-change
'np', {
    np: NOW_PLAYING,
    conf: CONFIGURATION,
    time: SERVER_TIME
}

// Receives number of viewers on the current channel
'viewers', VALUE    

// Receives a newly updated video, that was checked for errors (song_generated contains .id which is the current id of the video, and a .new_id for the new video to change the video to)
'channel', {
    type: "changed_values",
    value: song_generated
}

'update_required', {
    description of what is wrong as an object
}
```
