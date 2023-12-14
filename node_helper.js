"use strict";

/* Magic Mirror
 * Module: MMM-Oveda
 *
 * By stuff@stuffdev.de
 *
 */

//HELPER IMPORT
//const NodeHelper = require("node_helper");
var NodeHelper = require('node_helper')
const moment = require("moment")
const request = require("request");

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting node helper for: " + this.name);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "FETCH_OVEDA") {
            //Setup helper variables
			this.config = payload;            
            this.handleRequest()
		}
	},

    handleRequest() {
        var self = this

        var url = this.handleUrl()

        request({
			url: url,
			method: "GET",
			headers: {
				"cache-control": "no-cache",
				//"Authorization": "Bearer " + acessCode
			},
		},

		function(error, response, body) {
			if (error) {
				self.sendSocketNotification("FETCH_ERROR", {
					error: error
				});
				return console.error(" ERROR - MMM-Oveda: " + error);
			}
			if(self.config.debug){
				// console.log(body);
			}
			if (response.statusCode === 200) {
				var eventsJson = JSON.parse(body);

				self.sendSocketNotification("EVENTS", eventsJson);
			}
			else{
				console.log("Oveda API equest status="+response.statusCode);
			}

		});
    },

    handleUrl() {
        var self = this;

        var url = self.config.urlBase + self.config.apiPath;

        //add StartDate to
        url += "/events/search?";
        var startDate = moment().format("YYYY-MM-DD");
        url += "date_from="+startDate;

		
        var endDate = moment().add(config.days_until, "days").format("YYYY-MM-DD")
		url += "&date_to=" + endDate;

		if(config.category_ids) {
			url += "&category_id="
			for(var category_id in config.category_ids) {
				url += category_id + "%2C"
			}
		}


		if(self.config.search_coordinate && self.config.seach_distance) {
			url += "&coordinate=" + self.config.search_coordinate.lat + "%2C"+ self.config.search_coordinate.lng
			url += "&distance=" + self.config.search_distance
		}

		if(self.config.debug) {
			console.log("Oveda request string: ", url)
		}
		return url;

    }

    // send notification back
    //self.sendSocketNotification("TASKS", taskJson);


});