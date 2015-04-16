#!/bin/bash
cd /var/www
git stash
git pull
./setperms.sh
forever restartall
