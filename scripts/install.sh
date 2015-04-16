#!/bin/bash
apt-get update
apt-get install -y npm
apt-get install -y nodejs
npm install -g forever
ln -s /usr/bin/nodejs /usr/bin/node
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/server
forever stopall
CMD="forever start -l /var/log/zoff.log -a --workingDir $DIR $DIR/server.js"
crontab -l | { cat; echo "@reboot" $CMD; } | crontab -
$CMD
echo $CMD
