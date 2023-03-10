var root = document.body

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('js/sw.js');
}

// Models
var Match = {
	team: 0,
	width: 0.0,
	swerve: false,
	tippy: false,
	autos: "",

	data: {
		linked_event: "",
		alliance: "blue",
		auto: {
			balance: false,
			move: false,
		},
		teleop: {
			balance: false,
		},
		endgame: {
			parked: false,
			score: 0,
			time: 0,
		},
		penalty: {
			penalty: 0,
			disabled: false,
		},
		misc: {
			alliance_final_score: 0,
			cycle_time: 0,
			pickup_time: 0,
			comments: "",
		}
	},

	reset: function() {
		Match.width=0.0;
		Match.swerve=false;
		Match.tippy=false;
		Match.autos="";

		Match.data.linked_event="";
		Match.data.alliance="blue";
		Match.data.auto.balance=false;
		Match.data.auto.move=false;
		Match.data.teleop.balance=false;
		Match.data.endgame.parked=false;
		Match.data.endgame.score=0;
		Match.data.endgame.time=0;
		Match.data.penalty.penalty=0;
		Match.data.penalty.disabled=false;
		Match.data.misc.alliance_final_score=0;
		Match.data.misc.cycle_time=0;
		Match.data.misc.pickup_time=0;
		Match.data.misc.comments="";
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
					e.preventDefault();
					Match.reset();
					window.location.href = "#!/scout/pit";
				},
				class: "setup",
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
			m("div", { class: "page" }, [
				m("h1", "Match Scouting"),
				m("h2", "Team #"+Match.team),
			m("form", {
				onsubmit: function(e) {
					e.preventDefault()
				}
			}, [m("div", { class: "formBlock" }, [
				m("label.label", "Event"),
				m("input.input[type=text][placeholder=abc123]", {
					value: Match.data.linked_event,
					oninput: function(e) {
						Match.data.linked_event = e.target.value;
						console.log("Event: " + Match.data.linked_event);
					}
				})]),
				m("div", { class: "formBlock" }, [
					m("label.label", "Alliance"),
					m("select[name=alliance][id=alliance]", {
						value: Match.data.alliance,
						oninput: function(e) {
							Match.data.alliance = e.target.value;
							console.debug("Alliance: " + Match.data.alliance);
						}
					},
						m("option[value=red]", "Red"),
						m("option[value=blue]", "Blue"),
					),
				]),
				m("div", { class: "formBlock" }, [
					m("label.label", "Auto Balance"),
					m("input.input[type=checkbox]", {
						checked: Match.data.auto.balance,
						oninput: function(e) {
							Match.data.auto.balance = e.target.checked;
							console.log("Auto Balance: " + Match.data.auto.balance);
						}
					})
				]),
			]),
		])]
		)}
}

var ScoutPit = {
	view: function() {
		return m("div", { class: "main" },
			m(NavBar),
			m("div", { class: "page" }, [
				m("h1", "Pit Scouting"),
				m("h2", "Team #"+Match.team),
			m("form", {
				onsubmit: function(e) {
					e.preventDefault()
				}
			}, [m("div", { class: "formBlock" }, [
				m("label.label", "Robot Width (in)"),
				m("input.input[type=number][placeholder=0.0]", {
					value: Match.width,
					oninput: function(e) {
						Match.width = e.target.value;
						console.log("Width: " + Match.width);
					}
				})]),
				m("div", { class: "formBlock" }, [
				m("label.label", "Swerve Drive?"),
				m("input.input[type=checkbox]", {
					checked: Match.swerve,
					oninput: function(e) {
						Match.swerve = e.target.checked;
						console.log("Swerve: " + Match.swerve);
					}
				})]),
				m("div", { class: "formBlock" }, [
				m("label.label", "Tippy?"),
				m("input.input[type=checkbox]", {
					checked: Match.tippy,
					oninput: function(e) {
						Match.tippy = e.target.checked;
						console.log("Tippy: " + Match.tippy);
					}
				})]),
				m("div", { class: "formBlock" }, [
				m("label.label", "Auto Routine Description"),
				m("input.input[type=text]", {
					value: Match.autos,
					oninput: function(e) {
						Match.autos = e.target.value;
						console.log("Autos: " + Match.autos);
					}
				})]),
			]),
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
