var root = document.body

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('js/sw.js');
}

function convertObjectToBinary(obj) {
    let output = '',
        input = JSON.stringify(obj) // convert the json to string.
    // loop over the string and convert each charater to binary string.
    for (i = 0; i < input.length; i++) {
        output += input[i].charCodeAt(0).toString(2) + " ";
    }
    return output.trimEnd();
}

function convertBinaryToObject(str) {
    var newBin = str.split(" ");
    var binCode = [];
    for (i = 0; i < newBin.length; i++) {
        binCode.push(String.fromCharCode(parseInt(newBin[i], 2)));
    }
    let jsonString = binCode.join("");
    return JSON.parse(jsonString)
}

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
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
			time: "",
		},
		penalty: {
			penalty: 0,
			disabled: false,
		},
		misc: {
			alliance_final_score: 0,
			cycle_time: "",
			pickup_time: "",
			comments: "",
		}
	},

	// save: function() {
	// 	// Save team&match data in IndexedDB
	// }

	// load: function(id) {
	// 	// Load team data from INdexedDB
	// }

	qr: function() {
		// gzip data
		var binary = convertObjectToBinary(Match);
		var compressed = bin2String(LZW.compress(binary));
		console.info(binary);
		console.info(compressed);
		// generate QR code image
		let qrcodeContainer = document.getElementById("qrcode");
		qrcodeContainer.style = "";
		qrcodeContainer.innerHTML = "";
		new QRCode(qrcodeContainer, {text:compressed,correctLevel:QRCode.CorrectLevel.L});
	},

	reset: function() {
		Match.qr();
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
		Match.data.endgame.time="";
		Match.data.penalty.penalty=0;
		Match.data.penalty.disabled=false;
		Match.data.misc.alliance_final_score=0;
		Match.data.misc.cycle_time="";
		Match.data.misc.pickup_time="";
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
			m("div[style='display:none']", { id: "qrcode" }),
			m("button.button", { onclick: Match.qr }, "QR Code"),
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
				m("div", { class: "formBlock" }, [
					m("label.label", "Auto Move"),
					m("input.input[type=checkbox]", {
						checked: Match.data.auto.move,
						oninput: function(e) {
							Match.data.auto.move = e.target.checked;
							console.log("Auto Move: " + Match.data.auto.move);
						}
					})
				]),
				m("div", { class: "formBlock" }, [
					m("label.label", "Teleop Balance"),
					m("input.input[type=checkbox]", {
						checked: Match.data.teleop.balance,
						oninput: function(e) {
							Match.data.teleop.balance = e.target.checked;
							console.log("Teleop Balance: " + Match.data.teleop.balance);
						}
					})
				]),
				m("div", { class: "formBlock" }, [
					m("label.label", "Endgame Parked"),
					m("input.input[type=checkbox]", {
						checked: Match.data.endgame.parked,
						oninput: function(e) {
							Match.data.endgame.parked = e.target.checked;
							console.log("Endgame Parked: " + Match.data.endgame.parked);
						}
					})
				]),
				m("div", { class: "formBlock" }, [
				m("label.label", "Endgame Score"),
				m("input.input[type=number][placeholder=0]", {
					value: Match.data.endgame.score,
					oninput: function(e) {
						Match.data.endgame.score = e.target.value;
						console.log("Endgame Score: " + Match.data.endgame.score);
					}
				})]),
				m("div", { class: "formBlock" }, [
					m("label.label", "Endgame Time"),
					m("input.input[type=text][id='durationForm']", {
						name: "duration",
						maxlength: 8,
						pattern: "^((\d+:)?\d+:)?\d*$",
						placeholder: "mm:ss",
						size: 30,
						value: Match.data.endgame.time,
						oninput: function(e) {
							Match.data.endgame.time = e.target.value;
							console.log("Endgame Time: " + Match.data.endgame.time);
						}
					})
				]),
				m("div", { class: "formBlock" }, [
				m("label.label", "Penalties"),
				m("input.input[type=number]", {
					value: Match.data.penalty.penalty,
					oninput: function(e) {
						Match.data.penalty.penalty = e.target.value;
						console.log("Penalties: " + Match.data.penalty.penalty);
					}
				})]),
				m("div", { class: "formBlock" }, [
					m("label.label", "Disabled"),
					m("input.input[type=checkbox]", {
						checked: Match.data.penalty.disabled,
						oninput: function(e) {
							Match.data.penalty.disabled = e.target.checked;
							console.log("Disabled: " + Match.data.penalty.disabled);
						}
					})
				]),
				m("div", { class: "formBlock" }, [
				m("label.label", "Alliance Final Score"),
				m("input.input[type=number]", {
					value: Match.data.misc.alliance_final_score,
					oninput: function(e) {
						Match.data.misc.alliance_final_score = e.target.value;
						console.log("Alliance Final Score: " + Match.data.misc.alliance_final_score);
					}
				})]),
				m("div", { class: "formBlock" }, [
					m("label.label", "Cycle Time"),
					m("input.input[type=text][id='durationForm']", {
						name: "duration",
						maxlength: 8,
						pattern: "^((\d+:)?\d+:)?\d*$",
						placeholder: "mm:ss",
						size: 30,
						value: Match.data.misc.cycle_time,
						oninput: function(e) {
							Match.data.misc.cycle_time = e.target.value;
							console.log("Cycle Time: " + Match.data.misc.cycle_time);
						}
					})
				]),
				m("div", { class: "formBlock" }, [
					m("label.label", "Pickup Time"),
					m("input.input[type=text][id='durationForm']", {
						name: "duration",
						maxlength: 8,
						pattern: "^((\d+:)?\d+:)?\d*$",
						placeholder: "mm:ss",
						size: 30,
						value: Match.data.misc.pickup_time,
						oninput: function(e) {
							Match.data.misc.pickup_time = e.target.value;
							console.log("Pickup Time: " + Match.data.misc.pickup_time);
						}
					})
				]),
				m("div", { class: "formBlock" }, [
				m("label.label", "Comments"),
				m("input.input[type=text][placeholder='Freeform short comment']", {
					value: Match.data.misc.comments,
					oninput: function(e) {
						Match.data.misc.comments = e.target.value;
					}
				})]),
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
