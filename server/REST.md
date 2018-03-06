## REST

All PUT, DELETE and POST endpoints have a 1-second waitlimit for each command per client. You'll get a response with Retry-After header for how long you have to wait. Shuffling in a player has a 5-second waitlimit, but per channel instead of per client.

If you want to skip the wait-times, create a token at <a href="https://zoff.me/api/apply">https://zoff.me/api/apply</a>. Tokens are added to all the POST, PUT, DELETE, requests as ``` token: TOKEN ```.

All requests return things on this form (results field is added if successful.)

```
{
    status: STATUSCODE,
    error: MESSAGE,
    success: IF_SUCCESSFULL,
    results: [RESULTS] (if something went wrong, there is one element in this array. This tells you what is wrong with the request, and what was expected)
}
```

Add song

```
POST /api/list/:channel_name/:video_id
    {
        "title": TITLE,
        "duration": END_TIME - START_TIME,
        "end_time": END_TIME,
        "start_time": START_TIME,
        "adminpass": PASSWORD, (leave this blank if there is no password/you don't know the password)
        "userpass": USER_PASSWORD
    }

Returns 400 for bad request
Returns 403 for bad authentication (but will return a song object, with the type == "suggested", and the song will show up in the suggested tab for channel-admins)
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

Returns 400 for bad request
Returns 403 for bad authentication
Returns 404 if the song doesnt exist or is the currently playing song
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

Returns 400 for bad request
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
        "vote": BOOLEAN,
        "addsongs": BOOLEAN,
        "longsongs": BOOLEAN,
        "frontpage": BOOLEAN (if you want to set userpassword, this MUST be false for it to work),
        "allvideos": BOOLEAN,
        "removeplay": BOOLEAN,
        "skip": BOOLEAN,
        "shuffle": BOOLEAN,
        "userpass_changed": BOOLEAN (this must be true if you want to keep the userpassword you're sending)
    }

Returns 400 for bad request
Returns 403 for bad authentication
Returns 404 if the list doesn't exist
Returns 429 if you're doing too much of this request, with a Retry-After int value in the header.
Returns 200 and the newly added configuration if successful
```

Get channelsettings
```
GET /api/conf/:channel_name/

Returns 403 for bad authentication (if you get this, try POST with userpassword attached)
Returns 404 if the channel doesn't exist
Returns 200 and the settings-object
```

Get channelsettings (protected)
```
POST /api/conf/:channel_name/
    {
        "userpass": USERPASS
    }

Returns 400 for bad request
Returns 403 for bad authentication
Returns 404 if the channel doesn't exist
Returns 200 and the settings-object
```

Get song in channel
```
GET /api/list/:channel_name/

Returns 403 for bad authentication (if you get this, the channel is protected, try getting the full channel with POST, and search through the object)
Returns 404 if the song doesn't exist
Returns 200 and the song
```

Get song in channel (protected)
```
// Important fetch_song is present, or else the request will try to add a song to the channel
POST /api/list/:channel_name/
    {
        "fetch_song": ANYTHING_HERE,
        "userpass": USERPASS
    }

Returns 400 for bad request
Returns 403 for bad authentication
Returns 404 if the song doesn't exist
Returns 200 and the song
```

Get channelsettings
```
GET /api/conf/:channel_name/

Returns 403 for bad authentication (if you get this, try POST with userpassword attached)
Returns 404 if the channel doesn't exist
Returns 200 and the objects in the channel
```

Get channelsettings (protected)
```
POST /api/conf/:channel_name/
    {
        "userpass": USERPASS
    }

Returns 400 for bad request
Returns 403 for bad authentication
Returns 404 if the channel doesn't exist
Returns 200 and the objects in the channel
```

Get now playing song
```
GET /api/list/:channel_name/__np__

Returns 400 for bad request
Returns 403 for bad authentication (if you get this, try POST with userpassword attached)
Returns 404 if the channel doesn't exist
Returns 200 and the now playing object
```

Get now playing song (protected)
```
POST /api/list/:channel_name/__np__
    {
        "userpass": USERPASS
    }

Returns 400 for bad request
Returns 403 for bad authentication (if you get this, try POST with userpassword attached)
Returns 404 if the channel doesn't exist
Returns 200 and the now playing object
```

Get all lists
```
GET /api/frontpages

Returns 200 and the frontpage-lists
```
