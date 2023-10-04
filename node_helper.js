"use strict";

/* Magic Mirror
 * Module: MMM-Oveda
 *
 * By stuff@stuffdev.de
 *
 */

//HELPER IMPORT
//const NodeHelper = require("node_helper");
const moment = require("momentjs")

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting node helper for: " + this.name);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "FETCH_OVEDA") {
            //Setup helper variables
			this.config = payload;            
            this.handleRequest(config)
		}
	},

    handleRequest(config) {
        var self = this

        var url = this.handleUrl(config)

        request({
			url: config.urlBase + url,
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
				console.log(body);
			}
			if (response.statusCode === 200) {
				var eventsJson = JSON.parse(body);

				self.sendSocketNotification("EVENTS", eventJson);
			}
			else{
				console.log("Oveda API equest status="+response.statusCode);
			}

		});
    },

    handleUrl(config) {
        var self = this;

        var url = config.url;

        //add StartDate to
        url += "events/search?";
        var startDate = moment().format("YYYY-MM-DD");
        url += "start_date="+startDate;

		
        var endDate = moment().add(config.days_until, "days").format("YYYY-MM-DD")

		if(config.category_ids) {
			url += "&category_id="
			for(var category_id in config.category_ids) {
				url += category_id + "%2C"
			}
		}


		if(config.search_coordinate && config.seach_distance) {
			url += "&coordinate=" + config.search_coordinate.lat + "%2C"+ config.search_coordinate.lng
			url += "&distance=" + config.search_distance
		}

		return url;

    }

    // send notification back
    //self.sendSocketNotification("TASKS", taskJson);


});