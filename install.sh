#!/bin/bash
apt-get update
apt-get install npm
apt-get install nodejs
npm install -g forever
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/server
forever stopall
CMD="forever start -l /var/log/zoff.log -a --workingDir $DIR $DIR/server.js"
crontab -l | { cat; echo "@reboot" $CMD; } | crontab -
$CMD
echo $CMD
