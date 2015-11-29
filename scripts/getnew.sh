#!/bin/bash
cd /var/www/
git stash
git pull
scripts/./setperms.sh
