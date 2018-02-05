var express = require('express');
var router = express.Router();
var path = require('path');
var mongo_db_cred = require(path.join(__dirname, '../../config/mongo_config.js'));
var mongojs = require('mongojs');
var db = mongojs(mongo_db_cred.config);

router.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/api/lists').get(function(req, res){
   if(req.isAuthenticated()){
      db.collection("frontpage_lists").find().sort({count: -1},function(err, docs){
         res.json(docs);
      });
   } else {
      res.send(false);
   }
});

router.route('/api/thumbnails').get(function(req, res){
   if(req.isAuthenticated()){
      db.collection("suggested_thumbnails").find(function(err, docs){
         res.json(docs);
      });
   } else {
      res.send(false);
   }
});

router.route('/api/descriptions').get(function(req, res){
   if(req.isAuthenticated()){
      db.collection("suggested_descriptions").find(function(err, docs){
         res.json(docs);
      });
   } else {
      res.send(false);
   }
});

router.route('/api/approve_thumbnail').post(function(req, res){
   if(req.isAuthenticated()){
      var channel = req.param("channel");
      db.collection("suggested_thumbnails").find({channel: channel}, function(err, docs){
         var thumbnail = docs[0].thumbnail;
         db.collection("frontpage_lists").update({_id: channel}, {$set:{thumbnail: thumbnail}}, {upsert: true}, function(err, docs){
            db.collection(channel).update({views:{$exists:true}}, {$set:{thumbnail: thumbnail}}, {upsert: true}, function(err, docs){
               db.collection("suggested_thumbnails").remove({channel: channel}, function(err, docs){
                  res.send(true);
               });
            });
         });
      });
   } else {
      res.send(false);
   }
});

router.route('/api/deny_thumbnail').post(function(req, res){
   if(req.isAuthenticated()){
      var channel = req.param("channel");
      db.collection("suggested_thumbnails").remove({channel: channel},function(err, docs){
         res.send(true);
      });
   } else {
      res.send(false);
   }
});

router.route('/api/approve_description').post(function(req, res){
   if(req.isAuthenticated()){
      var channel = req.param("channel");
      db.collection("suggested_descriptions").find({channel: channel}, function(err, docs){
         var description = docs[0].description;
         db.collection("frontpage_lists").update({_id: channel}, {$set:{description: description}}, {upsert: true}, function(err, docs){
           db.collection(channel).update({views:{$exists:true}}, {$set:{description: description}}, function(err, docs){
             db.collection("suggested_descriptions").remove({channel: channel}, function(err, docs){
                res.send(true);
              });
            });
          });
      });
   } else {
      res.send(false);
   }
});

router.route('/api/deny_description').post(function(req, res){
   if(req.isAuthenticated()){
      var channel = req.param("channel");
      db.collection("suggested_descriptions").remove({channel: channel}, 1,function(err, docs){
         res.send(true);
      });
   } else {
      res.send(false);
   }
});

router.route('/api/remove_thumbnail').post(function(req, res){
   if(req.isAuthenticated()){
      var channel = req.param("channel");
      db.collection("frontpage_lists").update({_id: channel}, {$set:{thumbnail: ""}}, function(err, docs){
         db.collection(channel).update({views:{$exists:true}}, {$set:{thumbnail: ""}}, function(err, docs){
            res.send(true);
         });
      });
   } else {
      res.send(false);
   }
});

router.route('/api/remove_description').post(function(req, res){
   if(req.isAuthenticated()){
      var channel = req.param("channel");
      db.collection("frontpage_lists").update({_id: channel}, {$set:{description: ""}}, function(err, docs){
         db.collection(channel).update({views:{$exists:true}}, {$set:{description: ""}}, function(err, docs){
            res.send(true);
         });
      });
   } else {
      res.send(false);
   }
});

router.route('/api/names').get(function(req, res) {
   if(req.isAuthenticated()){
      db.collection("registered_users").find({_id: {$exists: true}}, {_id: 1, icon: 1}, function(err, docs) {
         res.json(docs);
      })
   } else {
      res.send(false);
   }
});

router.route('/api/names').post(function(req, res) {
   if(req.isAuthenticated()) {
      var icon = req.param("icon");
      var name = req.param("name");
      db.collection("registered_users").update({_id: name}, {$set: {icon: icon}}, function(err, docs) {
         if(err) res.send(false);
         else res.send(true);
      });
   } else {
      res.send(false);
   }
})

router.route('/api/token').get(function(req, res){
   if(req.isAuthenticated()){
      token_db.collection("tokens").find(function(err, docs){
         if(docs.length == 1){
            res.json({token: docs[0].token});
         } else {
            var id = new Buffer(makeid()).toString('base64');
            token_db.collection("tokens").insert({token: id}, function(err, docs){
               res.json({token: id});
            });
         }
      })
   } else {
      res.send(false);
   }
});

router.route('/api/delete').post(function(req, res){
   if(req.isAuthenticated()){
      var list = req.param("_id");
      db.collection(list).drop(function(err, docs){
         db.collection("frontpage_lists").remove({_id: list}, function(err, docs){
            res.send(true);
         })
      });
   } else {
      res.send(false);
   }
});

router.route('/api/remove_token').get(function(req, res){
   if(req.isAuthenticated()){
      token_db.collection("tokens").find(function(err, docs){
         if(docs.length == 1){
            token_db.collection("tokens").remove({token: docs[0].token}, function(err, docs){
               res.send(true);
            })
         } else {
            res.send(false);
         }
      })
   } else {
      res.send(false);
   }
});

router.route('/api/pinned').post(function(req, res){
   if(req.isAuthenticated()){
      var to_pin = req.param("_id");
      db.collection("frontpage_lists").update({pinned:1}, {$set:{pinned:0}}, function(err, resp){
        	db.collection("frontpage_lists").update({_id:to_pin}, {$set:{pinned:1}}, function(err, resp){
        		res.send(true);
        	});
        });
   } else {
      res.send(false);
   }
});

router.route('/api/admin').post(function(req, res){
   if(req.isAuthenticated()){
      var to_remove = req.param("_id");
      db.collection(to_remove).update({views: {$exists: true}}, {$set:{adminpass: ""}}, function(err, docs){
         res.send(true);
      });
   } else {
      res.send(false);
   }
});

router.route('/api/userpass').post(function(req, res){
   if(req.isAuthenticated()){
      var to_remove = req.param("_id");
      db.collection(to_remove).update({views: {$exists: true}}, {$set:{userpass: ""}}, function(err, docs){
         res.send(true);
      });
   } else {
      res.send(false);
   }
});

module.exports = router;
