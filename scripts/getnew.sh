#!/bin/bash
cd /var/www
git stash
git pull
scripts/./setperms.sh
cd /var/dev
git stash
git pull
scripts/./setperms.sh
forever restartall
