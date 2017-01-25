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

/*  
	@Name : airlines
	@Params : []
*/
router.get('/airlines', function(req, res, next) {

  request({ uri: host + '/airlines' }, function(err, response, body){
	
	if(err != undefined || response.statusCode != 200){
			res.setHeader('Content-Type', 'application/json');
			return res.status(500).send({ "error" : 500 , "description" : "Server Error"});
	}
	
	res.setHeader('Content-Type', 'application/json');
  	res.send(body);
  })
  
});

/*  
	@Name : airports
	@Params : []
*/
router.get('/airports', function(req, res, next) {
  
  req.checkQuery('q', 'Must have ').notEmpty();
  var qname = req.query["q"];
  
  request({ uri: host + '/airports?q=' + qname }, function(err, response, body){
	if(err != undefined || response.statusCode != 200 ){
			res.setHeader('Content-Type', 'application/json');
			return res.status(500).send({ "error" : 500 , "description" : "Server Error"});
	}
	
	res.setHeader('Content-Type', 'application/json');
  	res.send(body);
  })

});

/*
	@Name : search
	@Params : [date ,from ,to ]
	@description : 
	@comments : This method may be big but I really want to make it work as a backend api is deploy. Thats why I am validating everything.  
	
*/
router.get('/search', function(req, res, next) {
 	
	// Validator params
	req.checkQuery('date', 'Date must be provided').notEmpty();
	req.checkQuery('from', 'Origin must be provided').notEmpty();
	req.checkQuery('to', 'Destination must be provided').notEmpty();
	// Custom Date Validator
	req.checkQuery('date', 'Must be a valid date').isDate()
	
	var date = req.query['date'];
	var from = req.query['from'];
	var to = req.query['to'];
	
	var errors = req.validationErrors();
	if (errors) {
	  	var errors_array = errors;
		errors_array["error"] = 400
		return res.status(400).send(errors_array);
	}
	
	// Get Airlines
	request({ uri: host + '/airlines' }, function(err, response, body){

		if(err != undefined || response.statusCode != 200){
			 res.setHeader('Content-Type', 'application/json');
			 res.status(500).send({ "error" : 500 , "description" : "Server Error"});
		}
		
		var parsed_airlines = JSON.parse(body);
		var queue = []; 
		var urls = [];
		
		// Prepare all uls to target
		for (var i=0; i < parsed_airlines.length; i++) {
			urls.push(host + '/flight_search/' + parsed_airlines[i]["code"] + '?date='+ date +'&from='+from+'&to=' + to)
		};

		// Prepare callbacks for parallel
		for(var i = 0; i < urls.length; i++){
		    (function(index){
		       queue.push(function(callback){
		           request(urls[index], function(error, response, json) {
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
				try {
				    var parsed_results = JSON.parse(result);
					to_render.push( parsed_results );
				  } catch (e) {}
			 });
			
			to_render = _.flatten(to_render, true);
			res.setHeader('Content-Type', 'application/json');
			return res.send(to_render);

		});
		
	});
	
});

module.exports = router;
