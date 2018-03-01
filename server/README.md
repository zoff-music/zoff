## Apps

Under ``` /server/apps/ ```, there are two files, ``` admin.js ``` and ``` client.js ```.``` admin.js ``` are for the adminpanel, and ``` client.js ``` are for zoff itself.

## REST

All PUT, DELETE and POST endpoints have a 2-second waitlimit for each command per client. You'll get a response with Retry-After header for how long you have to wait. Shuffling in a player has a 5-second waitlimit, but per channel instead of per client. 

Add song

```
POST /api/list/:channel_name/:video_id
    {
        "title": TITLE,
        "duration": END_TIME - START_TIME,
        "end_time": END_TIME,
        "start_time": START_TIME,
        "adminpass": PASSWORD,
        "userpass": USER_PASSWORD
    }

Returns 403 for bad authentication
Returns 409 if the song exists
Returns 429 if you're doing too much of this request, with a Retry-After int value in the header.
Returns 200 and the added song object if successful
```

Delete song
```
DELETE /api/list/:channel_name/:video_id
    {
        "adminpass": PASSWORD,
        "userpass": USER_PASSWORD
    }

Returns 403 for bad authentication
Returns 404 if the song doesnt exist
Returns 429 if you're doing too much of this request, with a Retry-After int value in the header.
Returns 200 if successful
```

Vote on song
```
PUT /api/list/:channel_name/:video_id
    {
        "adminpass": PASSWORD,
        "userpass": USER_PASSWORD
    }

Returns 403 for bad authentication
Returns 404 if the song doesnt exist
Returns 409 if you've already voted on that song
Returns 429 if you're doing too much of this request, with a Retry-After int value in the header.
Returns 200 and the added song object if successful
```

Change channel configurations
```
PUT /api/conf/:channel_name
    {
        "userpass": USER_PASSWORD,
        "adminpass": PASSWORD,
        "voting": BOOLEAN,
        "addsongs": BOOLEAN,
        "longsongs": BOOLEAN,
        "frontpage": BOOLEAN (if you want to set userpassword, this MUST be false for it to work),
        "allvideos": BOOLEAN,
        "removeplay": BOOLEAN,
        "skipping": BOOLEAN,
        "shuffling": BOOLEAN,
        "userpass_changed": BOOLEAN (this must be true if you want to keep the userpassword you're sending)
    }

Returns 403 for bad authentication
Returns 404 if the list doesn't exist
Returns 429 if you're doing too much of this request, with a Retry-After int value in the header.
Returns 200 and the newly added configuration if successful
```

Still to come: SKIP and SHUFFLE RESTApi calls..


## Events

### To server
```
//  Tells the server the song is over
'end', {
    id: video_id,
    channel: channel_name,
    pass: channel_pass
}

// Asks server where in the song it should be
'pos', {
    channel: channel_name,
    pass: channel_pass
}

// Tells the server the client wants the list
'list', {
    channel: channel_name,
    pass: channel_pass,
    version: system_version (now 3)
}

// Sends info about a song the client wants to add
'add', {
    id: VIDEO_ID,
    title: VIDEO_TITLE,
    adminpass: AES-CBC-Pkcs7 with Base64 IV(PASSWORD),
    duration: VIDEO_DURATION,
    list: channel_name,
    playlist: true_if_importing_playlist,
    num: current_number_of_sending_songs,
    total: total_number_of_sending_songs,
    pass: channel_pass
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
    pass: channel_pass
}

// Sends info about song the user wants to vote on. If VOTE_TYPE is del, its deleting the song, if its pos, its just voting
'vote', {
    channel: CHANNEL_NAME,
    id: VIDEO_ID,
    type: VOTE_TYPE,
    adminpass: AES-CBC-Pkcs7 with Base64 IV(PASSWORD)
}

// Sends shuffle to the server (Only works every 5 seconds per list)
'shuffle', {
    adminpass: AES-CBC-Pkcs7 with Base64 IV(PASSWORD),
    channel: CHANNELNAME,
    pass: USER_PASSWORD
}

// Sends skip message to server
'skip', {
    pass: AES-CBC-Pkcs7 with Base64 IV(PASSWORD),
    id:video_id,
    channel: chan,
    userpass: channel_pass
}

// Sends password for instant log in to server
'password', {
    password: PASSWORD,
    channel: CHANNEL_NAME,
    oldpass: old_pass_if_changing_password
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
    channel: CHANNE_NAME,
    id: VIDEO_ID,
    title: VIDEO_TITLE
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
```
