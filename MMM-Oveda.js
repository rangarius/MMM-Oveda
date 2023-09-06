/* global Module */

/* Magic Mirror
 * Module: MMM-Oveda
 *
 * By stuff@stuffdev.de
 *
 * 
 */


//UserPresence Management (PIR sensor)
//var UserPresence = true; //true by default, so no impact for user without a PIR sensor
var cycleTimer;


Module.register("MMM-Oveda", {

	defaults: {
		maximumEntries: 10,
		urlBase: "https://oveda.de/api/v1/",
		refreshRate: 5 * 60 * 1000,
		cycleCategories: true,
		category_ids: [],
		debug: false,
		days_until: 3
	},

	// Define required scripts.
	getStyles: function () {
		return ["MMM-Oveda.css"];
	},
	getTranslations: function () {
		return {
			en: "translations/en.json",
			de: "translations/de.json",
		};
	},

	start: function () {
		var self = this;
		Log.info("Starting module: " + this.name);

		
		self.sendSocketNotification("FETCH_OVEDA", self.config);
	},

	suspend: function () { //called by core system when the module is not displayed anymore on the screen

	},

	resume: function () { //called by core system when the module is displayed on the screen

	},

	notificationReceived: function (notification, payload) {
		if (notification === "USER_PRESENCE") { // notification sended by module MMM-PIR-Sensor. See its doc
			//Log.log("Fct notificationReceived USER_PRESENCE - payload = " + payload);
			UserPresence = payload;
			this.GestionUpdateIntervalToDoIst();
		}
	},

	// Override socket notification handler.
	// ******** Data sent from the Backend helper. This is the data from the Todoist API ************
	socketNotificationReceived: function (notification, payload) {
		var self = this;
		if (notification === "EVENTS") {
			this.createEvents(payload);

				var cycleTime = Math.floor(50 / this.events.length) * 2000
				if(cycleTimer) {
					cycleTimer = null;
				}
				cycleTimer = setInterval( function() {
					if(index > this.events.length) {
						index = 0;
					}
					drawElements(this.events[index])
				}, cycleTime)
				
			this.loaded = true;
			this.updateDom(1000);

		} else if (notification === "FETCH_ERROR") {
			Log.error("Todoist Error. Could not fetch todos: " + payload.error);
		}
	},

	drawElements(elements) {
		var header = document.getElementById("event_list_header");
		header.innerHTML = "";

		var title = 
	},

	getDom: function () {
	
		//HIDE IF NOTHING TO DISPLAY
		// if (this.config.hideWhenEmpty && this.tasks.items.length===0) {
		// 	return null;
		// }
	
		//Add a new div to be able to display the update time alone after all the task
		var wrapper = document.createElement("div");

		//display "loading..." if not loaded
		if (!this.loaded) {
			wrapper.innerHTML = "Loading...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var event_container = document.createElement("div");
		event_container.id = "event_container";

		var event_list_header = document.createElement("div");
		event_list_header.id="event_list_header";

		var event_list_body = document.createElement("div");
		event_list_body.id = "event_list_body";
		
		return wrapper;
	}

});
