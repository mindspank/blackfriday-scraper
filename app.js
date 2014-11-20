var request = require('request');
var cheerio = require('cheerio');
var mysql = require('mysql');
var async = require('async');
var _ = require('underscore');

var auth = require('./auth');

var BASEURL = 'http://bfads.net';
var connection = mysql.createConnection(auth);


function connect() {

	connection.connect();

	//Truncate table and start from scratch.
	connection.query('TRUNCATE deals;', function(err, result) {

		//Get store list
		getStoreList();

	});

};

function getStoreList() {
	request(BASEURL + '/Stores', function(err, response, body) {

		var $ = cheerio.load(body);
		var stores = $("a.store-grid-title").map(function(idx, elem) {
			return {
				name: $(elem).text().trim(),
				url: $(elem).attr("href")
			};
		}).toArray();

		getStoreDeals(stores);

	});

};


function getStoreDeals(stores) {

	async.each(stores, function(store, callback) {
		request(BASEURL + store.url, function(err, res, body) {

			var $ = cheerio.load(body);

			//If there are no deals yet - abort
			if ($('.mailing-signup').length > 0) {
				console.log('No deals yet for ' + store.name);
				return callback();
			};

			var pages = +$('.pagination li a').last().text();
			var storeHours = $('span.time').text();

			async.each(_.range(1,pages+1), function(page, cb) {
				request(BASEURL + store.url + '?page=' + page, function(err, res, body) {

					var $$ = cheerio.load(body);

					$$('h2.heading-store-type').each(function(index, item) {
						var cat = $$(item).text();

						$$(item).next('.store-items').find('a.hd-title').each(function(index2, val) {
							var deal = {
								store: store.name,
								category: cat,
								product: $$(val).text(),
								price: $$(val).parent().next().find('.hd-price-item').text(),
								storehours: storeHours
							};
							connection.query('INSERT INTO deals SET ?', deal)
						})
					});
					cb();
				});
			}, function(err) {
				console.log('Done loading deals from ' + store.name);
				callback();
			});

		});
	}, function(err) {
		console.log('Done!')
		connection.end();
	});

};

//Initialize
connect();