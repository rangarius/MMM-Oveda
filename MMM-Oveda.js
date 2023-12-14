/* global Module */

const { Interval } = require("luxon");

/* Magic Mirror
 * Module: MMM-Oveda
 *
 * By stuff@stuffdev.de
 *
 * 
 */


class Event {
	
	id = "";
	name = "";
	place = {
		name: "",
		street: "",
		city: "",
		postalCode: ""
	};
	description = "";
	dates = [];
	categories = [];
	photo = null;

	constructor(event_data, base_url) {
		this.id = event_data.id;
		this.name = event_data.name;
		this.description = event_data.description;
		this.photo = event_data.photo ? base_url + event_data.photo.image_url : "images/event.png";

		event_data.categories.map((el) => {
			this.categories.push(el.name)
		})
		event_data.date_definitions.map((el) => {
			this.dates.push({
				start: el.start,
				end: el.end,
				allday: el.allday,
				rrulle: el.reccurrency_rule
			})
		})
		this.place = {
			name: event_data.name,
			street: event_data.street,
			city: event_data.city,
			postalCode: event_data.postalCode
		}
	}


}

//UserPresence Management (PIR sensor)
//var UserPresence = true; //true by default, so no impact for user without a PIR sensor
var cycleTimer;


Module.register("MMM-Oveda", {

	defaults: {
		maximumEntries: 5,
		urlBase: "https://oveda.de",
		apiPath: "/api/v1",
		refreshRate: 5 * 60 * 1000,
		cycleCategories: true,
		category_ids: [],
		debug: false,
		days_until: 3,
		width: "600px"
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
	getScripts: function() {
		return [
			'moment.js', // this file is available in the vendor folder, so it doesn't need to be available in the module folder.
		]
	},

	start: function () {
		var self = this;
		Log.info("Starting module: " + this.name);
		this.events = []
		
		self.sendSocketNotification("FETCH_OVEDA", self.config);
		let timer = new Interval(() => {
			self.sendSocketNotification("FETCH_OVEDA", self.config)
		}, refreshRate )
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
	createEvents(payload) {
		payload.items.map(el => {
			this.events.push(new Event(el, this.config.urlBase))
		})
	},
	// Override socket notification handler.
	// ******** Data sent from the Backend helper. This is the data from the Oveda API ************
	socketNotificationReceived: function (notification, payload) {
		var self = this;
		if (notification === "EVENTS") {
			if(self.config.debug) {
				Log.info("Oveda recived infos: ", payload)
			}
			this.createEvents(payload);
			var index = 0;
				var cycleTime = Math.floor(self.config.maximumEntries / self.events.length  * 10000 )
				cycleTime = cycleTime < 2000 ? 2000 : cycleTime
				if(this.cycleTimer) {
					cycleTimer = null;
				}
				this.cycleTimer = setInterval( function() {
					console.log("Oveda index is: ", index)
					console.log("Oveda max entries is: ", self.config.maximumEntries)
					console.log("Oveda events length is: ", self.events.length)

					self.drawElements(index)

					index = index + self.config.maximumEntries;
					if(index >= self.events.length) {
						index = 0;
					}
					console.log("Oveda index is: ", index)
				}, cycleTime)

			this.loaded = true;
			this.updateDom(1000);

		} else if (notification === "FETCH_ERROR") {
			Log.error("Todoist Error. Could not fetch todos: " + payload.error);
		}
	},

	drawElements(index) {
		let elements = []
		for(let i = index; i <= index + this.config.maximumEntries; i++) {
			if(this.events[i]) {
				elements.push(this.events[i])
			}
			
		}
		var header = document.querySelector("#event_list_header");
		header.innerHTML = "";

		
		var title = document.createElement("h3");
		title.innerHTML = "Veranstaltungen " + index + " - " + (this.config.maximumEntries + index)
		header.append(title)

		var divider = document.createElement("hr")
		header.append(divider)
		
		var event_body = document.querySelector("#event_list_body")
		event_body.innerHTML = ""
		event_body.classList.add("d-flex")
		
		for(const element of elements) {
			var el_wrapper = document.createElement("div");
			el_wrapper.classList.add("event_wrapper")

			var img_div = document.createElement("div");
			img_div.classList.add("event_photo_wrapper")
			
			var img = document.createElement("img");
			img.classList.add("event_photo")

			img.src = element.photo
			img.width = "100";
			

			img_div.append(img)
			el_wrapper.append(img_div)

			var text_el_wrapper = document.createElement("div")
			text_el_wrapper.classList.add("text_element_wrapper")
			el_wrapper.append(text_el_wrapper)

			var title = document.createElement("h3")
			title.classList.add("bright")
			title.innerHTML = element.name;
			text_el_wrapper.append(title)

			var date_list_wrapper = document.createElement("div")
			date_list_wrapper.classList.add("date_list_wrapper")

			for(const date of element.dates) {
				var date_string = document.createElement("h4")
				date_string.classList.add("date_string")
				date_string.classList.add("bright")

				date_string.innerHTML = moment(date.start).format("dddd, Do MMMM YYYY")
					if (!date.allday) {
						date_string.innerHTML += " " + moment(date.start).format("HH:mm")
						if(date.end) {
							date_string.innerHTML += " - " + moment(date.end).format("HH:mm")
						}
					}
				date_list_wrapper.append(date_string);
			}
			text_el_wrapper.append(date_list_wrapper)
			

			var description = document.createElement("p");
			description.classList.add("description");
			description.innerHTML = element.description.substring(0, 200);

			
			text_el_wrapper.append(description);

			event_body.append(el_wrapper)

		}

	},

	getDom: function () {
	
		//HIDE IF NOTHING TO DISPLAY
		// if (this.config.hideWhenEmpty && this.tasks.items.length===0) {
		// 	return null;
		// }
	
		//Add a new div to be able to display the update time alone after all the task
		var event_container = document.createElement("div");
		event_container.width = this.config.width;
		event_container.style.width = this.config.width;
		event_container.id = "event_container";

		//display "loading..." if not loaded
		if (!this.loaded) {
			event_container.innerHTML = "Loading...";
			event_container.className = "dimmed light small";
			return event_container;
		}



		var event_list_header = document.createElement("div");
		event_list_header.id="event_list_header";
		event_container.append(event_list_header)

		var event_list_body = document.createElement("div");
		event_list_body.id = "event_list_body";
		event_container.append(event_list_body);


		return event_container;
	},

});
