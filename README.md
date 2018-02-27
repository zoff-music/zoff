Zoff
====

Zoff (pronounced __søff__) is a shared (free) YouTube based radio service, built upon the YouTube API, with integrated casting with Chromecast.

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

If you have run the server before the table-structures where added, please run ```node server/apps/rewrite.js```. This will fix any crashes that occurs because of faulty document-collectionnames due to moving channel-settings to a separate collection.

Use ```$ npm start``` to start the server. (Alternative you can use the ```pm2.json``` in the project-root, if you prefer pm2 for running the apps.)

### About

Zoff is mainly a webbased service. The website uses <a href="https://nodejs.org/">NodeJS</a> with <a href="http://socket.io/">Socket.IO</a>, <a href="https://www.mongodb.org/">MongoDB</a> and express on the backend, with JavaScript, jQuery and <a href="http://materializecss.com/">Materialize</a> on the frontend.

The team consists of Kasper Rynning-Tønnesen and Nicolas Almagro Tonne, and the project has been worked on since late 2014.

### Contact

The team can be reached on <a href="mailto:contact@zoff.no?Subject=Contact%20Zoff">contact@zoff.no</a>

### Screenshots of desktop version:

![Frontpage desktop](https://puu.sh/xCI8P/bbfbdd694c.png)

![Channel desktop](https://puu.sh/xCHXj/3f7d826329.png)

![Channel join](https://puu.sh/zf1Ap/16587c0749.png)

![Channel search desktop](https://puu.sh/yhuVE/b50c6bbe1b.png)

### Screenshots of the mobile version:

<div style="text-align:center;">
<img src="http://i.imgur.com/aWlEmIx.png" alt="frontpage" height="600px">
<br>
<img src="https://puu.sh/xCI6X/1aead5e1b6.png" alt="channel" height="600px">

<img src="https://puu.sh/yg5y5/2e0f202d6d.png" alt="channel search" height="600px">
</div>

### Legal

Creative Commons License
Zoff is licensed under a
<a href="http://creativecommons.org/licenses/by-nc-nd/3.0/no/">Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Norway License.</a>.
Do not redistribute without permission from the developers.

Copyright © 2018
Kasper Rynning-Tønnesen and Nicolas Almagro Tonne
