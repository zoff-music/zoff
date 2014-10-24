cd /var/www
if ! git --git-dir=".git" diff --quiet
then
    git pull
    ./setperms.sh
fi

