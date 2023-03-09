var root = document.body

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('js/sw.js');
}

// Open DB
const dbName = "matches";
const request = indexedDB.open(dbName, 2);

request.onerror = (event) => {
	// Generic error handler for all errors targeted at this database's
	// requests!
	console.error(`Database error: ${event.target.errorCode}`);
};
request.onupgradeneeded = (event) => {
	const db = event.target.result;
	const objectStore = db.createObjectStore("match", { keyPath: "time" });
	objectStore.createIndex("id", "id", { unique: false });
	objectStore.transaction.oncomplete = (event) => {
		const matchObjectStore = db
			.transaction("match", "readwrite")
			.objectStore("match");
		matchData.forEach((match) => {
			matchObjectStore.add(match);
		});
	};
};

// Components
var NavBar = {
	view: function() {
		return m("nav",
			m("ul",
				m("li", m("button", { onclick: "window.location.href='#!/scout/pit'" }, "Pit Scout" )),
				m("li", m("button", { onclick: "window.location.href='#!/scout/match'" }, "Match Scout" )),
				m("li", m("button", { onclick: "window.location.href='#!/driver'" }, "Driver Meeting" ))
			))
	}
}

// Views`
var Splash = {
    view: function() {
        return m("div", { class: "center" },
			m("button", { onclick: "window.location.href='#!/scout'"}, "Scout a Match!")
		)}
}

var ScoutSetup = {
	view: function() {
		return m("div", { class: "main" },
			m(NavBar),
			m("form", [
				m("label.label", "Team #"),
				m("input.input[type=number][placeholder=8089]"),
				m("button.button[type=submit]", "Continue"),
			])
		)
	}
}

m.route(root, "/splash", {
    "/splash": Splash,
	"/scout": ScoutSetup,
	// "/scout/pit": ScoutPit,
	// "/scout/match": ScoutMatch,
	// "/driver": DriverMeeting,
})
