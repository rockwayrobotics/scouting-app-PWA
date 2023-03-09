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

var Match = {
	team: 0,
	load: function() {
		return Match.team;
	}
	
}

// Components
var NavBar = {
	view: function() {
		return m("nav",
			m("ul",
				m("li", m("a", { class: "button", href: "#!/scout" }, "Home" )),
				m("li", m("a", { class: "button", href: "#!/scout/pit" }, "Pit Scout" )),
				m("li", m("a", { class: "button", href: "#!/scout/match" }, "Match Scout" )),
				m("li", m("a", { class: "button", href: "#!/driver" }, "Driver Meeting" ))
			))
	}
}

// Views`
var Splash = {
    view: function() {
        return m("div", { class: "center" },
			m("a", { class: "button", href: "#!/scout"}, "Scout a Match!")
		)}
}

var ScoutSetup = {
	view: function() {
		return m("div", { class: "main" },
			m(NavBar),
			m("form", {
				onsubmit: function(e) {
					e.preventDefault()
					window.location.href = "#!/scout/pit";
				}
			}, [
				m("label.label", "Team #"),
				m("input.input[type=number][placeholder=8089]", {
					oninput: function(e) {
						Match.team = e.target.value;
						console.log("Team " + Match.team);
					}
				}),
				m("button.button[type=submit]", "Start Scouting!"),
			])
		)
	}
}

var ScoutMatch = {
	view: function() {
		return m("div", { class: "main" }, [
			m(NavBar),
			m("div", [
				m("h1", "Match Scouting"),
				m("h2", "Team #"+Match.team),
			]),
		])
	}
}

var ScoutPit = {
	view: function() {
		return m("div", { class: "main" },
			m(NavBar),
			m("div", [
				m("h1", "Pit Scouting"),
				m("h2", "Team #"+Match.team),
			]),
		)
	}
}

var DriverMeeting = {
	view: function() {
		return m("div", { class: "main" },
			m(NavBar),
			m("div", [
				m("h1", "Driver Meeting"),
				m("h2", "Team #"+Match.team),
			]),
		)
	}
}

m.route(root, "/splash", {
    "/splash": Splash,
	"/scout": ScoutSetup,
	"/scout/pit": ScoutPit,
	"/scout/match": ScoutMatch,
	"/driver": DriverMeeting,
})
