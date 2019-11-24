Zoff
====

Zoff (pronounced __søff__) is a shared (free) YouTube and SoundCloud based radio service, built upon the YouTube API, and SoundCloud API, with integrated casting with Chromecast.

Zoff supports importing YouTube, SoundCloud and Spotify playlists, and has functionality that (tries to) export to YouTube, SoundCloud and Spotify.

<a href="https://zoff.me"><img height="80" src="https://puu.sh/BlSwW/57061de17b.png"></a><a class="android-image-link" href="https://play.google.com/store/apps/details?id=zoff.me.zoff&amp;hl=no&amp;pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"><img alt="Get it on Google Play" height="65" src="https://puu.sh/BcWup/f560259c3f.png"></a>
<a  style="padding-bottom:20px;" class="apple-image-link" href="https://itunes.apple.com/us/app/zoff/id1402037061?ls=1&amp;mt=8"><img height="65" alt="Get it on the AppStore" src="https://puu.sh/BcWvt/09002407c3.png"></a>




## Install

Prerequisites:

```
MongoDB : https://www.mongodb.org/
NodeJS  : https://nodejs.org/en/
npm     : https://www.npmjs.com/
```

Clone this repository into a folder, and  navigate to it. Use ```$ npm install``` in the project folder.

For the server to run, you have to have the files

```
api_key.js
mongo_config.js
```

in ```/server/config```. There are ```*.example.js``` files for all the ones mentioned above. If you're going to deploy the server with a certificate, you also need to create the ```cert_config.js``` in ```/server/config/```. If you want the mailing to work, take a look at ```mailconfig.example.js``` and ```recaptcha.example.js```. You'll need ```mailconfig.js``` and ```recaptcha.js``` for this to work.

If you want to use Google Analytics, have a look at ```analytics.example.js``` in ```server/config/```.

Use ```$ npm start``` to start the server. (Alternative you can use the ```pm2.json``` in the project-root, if you prefer pm2 for running the apps.)

More info in <a href="https://github.com/zoff-music/zoff/blob/master/server/README.md">server/ README</a>

### About

Zoff is mainly a webbased service. The website uses <a href="https://nodejs.org/">NodeJS</a> with <a href="http://socket.io/">Socket.IO</a>, <a href="https://www.mongodb.org/">MongoDB</a> and express on the backend, with JavaScript and <a href="http://materializecss.com/">Materialize</a> on the frontend.

The team consists of Kasper Rynning-Tønnesen and Nicolas Almagro Tonne, and the project has been worked on since late 2014.

### Contact

The team can be reached on <a href="mailto:contact@zoff.me?Subject=Contact%20Zoff">contact@zoff.me</a>

### Screenshots of desktop version:

![Frontpage desktop](https://puu.sh/xCI8P/bbfbdd694c.png)

![Channel desktop](https://puu.sh/EI9Dt/05dea0ae57.png)

![Channel settings](https://puu.sh/EI9DV/0df8e9a5b2.png)

![Channel join](https://puu.sh/EI9E8/6f3810fe7f.png)

![Channel search desktop](https://puu.sh/EI9EJ/459deda44d.png)

![Channel host mode desktop](https://puu.sh/EI9Fb/6c1776230f.png)

### Embedded player:

![embedded](https://puu.sh/EI9HY/54434384af.png)

### Screenshots of the mobile version:

![mobilefront](http://i.imgur.com/aWlEmIx.png)
![mobile1](https://puu.sh/EI9Iz/8673bb3065.png)
![mobile2](https://puu.sh/EI9IS/5d6c3e303a.png)

### Legal

Creative Commons License
Zoff is licensed under a
<a href="http://creativecommons.org/licenses/by-nc-nd/3.0/no/">Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Norway License.</a>.
Do not redistribute without permission from the developers.

Copyright © 2019
Kasper Rynning-Tønnesen and Nicolas Almagro Tonne
