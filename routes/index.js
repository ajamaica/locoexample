var express = require('express');
var request = require('request');
var async = require('async');
var _ = require('underscore')

var router = express.Router();


const host = "http://node.locomote.com/code-task"
/* GET home page. */
router.get('/', function(req, res, next) {
	
  res.render('index', { title: 'Express' });
});

router.get('/airlines', function(req, res, next) {

  request({ uri: host + '/airlines' }, function(err, response, body){
	if(err != undefined){
			res.setHeader('Content-Type', 'application/json');
			return res.status(500).send({ "error" : 500 , "description" : "Server Error"});
	}
	res.setHeader('Content-Type', 'application/json');
  	res.send(body);
  })
  
});

router.get('/airports', function(req, res, next) {
  if(err != undefined){
		res.setHeader('Content-Type', 'application/json');
		return res.status(500).send({ "error" : 500 , "description" : "Server Error"});
  }
  request({ uri: host + '/airports' }, function(err, response, body){
	res.setHeader('Content-Type', 'application/json');
  	res.send(body);
  })

});

router.get('/search', function(req, res, next) {
 	
	// Get Airlines
	request({ uri: host + '/airlines' }, function(err, response, body){
		
		if(err != undefined){
			res.setHeader('Content-Type', 'application/json');
			return res.status(500).send({ "error" : 500 , "description" : "Server Error"});
		}
		
		var parsed_airlines = JSON.parse(body);
		var queue = []; 
		var urls = [];
		
		// Prepare all uls to target
		for (var i=0; i < parsed_airlines.length; i++) {
			urls.push(host + '/flight_search/' + parsed_airlines[i]["code"] + '?date=2018-09-02&from=SYD&to=JFK')
		};
		
		// Prepare callbacks for parallel
		for(var i = 0; i < urls.length; i++){
		    (function(URLIndex){
		       queue.push(function(callback){
		           request(urls[URLIndex], function(error, response, json) {
		               callback(error, json);
		           });
		       });
		    })(i);
		}
		
		// Todo Everything in Parallel
		async.parallel(queue, function(err, results){
			
			if(err != undefined){
				res.setHeader('Content-Type', 'application/json');
				return res.status(500).send({ "error" : 500 , "description" : "Server Error"});
			}
			
			var to_render = [];

			// I know underscore :)
			 _.each(results, function(result) {
				var parsed_results = JSON.parse(result);
				to_render.push( parsed_results );
			 });
			
			to_render = _.flatten(to_render, true);

			res.setHeader('Content-Type', 'application/json');
			return res.send(to_render);

		});
		
	});
		
	
});

module.exports = router;
