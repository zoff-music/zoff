#!/bin/bash
cd /home/kasper/zoff-server
git stash
git pull
/var/www/scripts/./setperms.sh
forever restart zoff
