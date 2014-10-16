Zöff
====

The shared youtube radio


Zöff is built around the youtube search and video API, and enables the creation of collaboratiive and shared live playlists, with billions of videos and songs to choose from, all for free and without registration.


The project is currently under development and runs on http://zoff.no

Install notes
=============

Composer
--------

This projects uses composer. Install composer by typing:

    curl -sS https://getcomposer.org/installer | php

After that, fetch project dependencies:

    php composer.phar update

.htaccess
---------

We also use .htaccess to prettify the urls. To keep it easy to develop elsewhere, we have a stock ht.access file. Copy this and call it .htaccess. If you develop in a directory that is not the base in your webserver change

    RewriteBase /

To

    RewriteBase /your-sub-directory