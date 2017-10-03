var express = require('express');
const path = require('path');
var router = express.Router();
router.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/favicon.ico').get(function(req, res, next) {
    res.sendFile(path.join(pathThumbnails, '/public/assets/images/favicon.ico'));
});

router.route('/browserconfig.xml').get(function(req, res, next) {
    res.sendFile(path.join(pathThumbnails, '/public/assets/images/browserconfig.xml'));
});

router.route('/apple-touch-icon.png').get(function(req, res, next) {
    res.sendFile(path.join(pathThumbnails, '/public/assets/images/apple-touch-icon.png'));
});

module.exports = router;
