var root = document.body

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('js/sw.js');
}

// Database
var db = new Dexie("Scouting");

db.version(1).stores({
	teams: "&number",
	matches: "++match_number, linked_team"
});

// Functions
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
var Team = {
	number: 0,
	name: "",
	width: 0.0,
	autos: "",
	swerve: false,
	tippy: false,

	save: function() {
		db.teams.put({
			number: parseInt(Team.number),
			name: Team.name,
			width: parseFloat(Team.width),
			autos: Team.autos,
			swerve: Team.swerve,
			tippy: Team.tippy,
		});
	},

	qr: function() {
		// gzip data
		var binary = convertObjectToBinary(Team);
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
		Team.number=0;
		Team.width=0.0;
		Team.swerve=false;
		Team.tippy=false;
		Team.autos="";
	}
}

var Match = {
	linked_team: 0,
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
	penalty: 0,
	disabled: false,

	alliance_final_score: 0,
	cycle_time: 0,
	pickup_time: 0,
	comments: 0,

	save: function() {
		var d = new Date();
		db.matches.put({
			linked_team: parseInt(Match.linked_team),
			linked_event: Match.linked_event,
			recorded_time: d.getTime(),
			alliance: Match.alliance,
			auto_balance: Match.auto.balance,
			auto_move: Match.auto.move,
			teleop_balance: Match.teleop.balance,
			parked: Match.endgame.parked,
			endgame_score: Match.endgame.score,
			endgame_time: Match.endgame.time,
			penalty: Match.penalty,
			disabled: Match.disabled,
			alliance_final_score: Match.alliance_final_score,
			cycle_time: Match.cycle_time,
			pickup_time: Match.pickup_time,
			scouter_comments: Match.comments,
		});
	},

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
		Match.linked_event="";
		Match.alliance="blue";
		Match.auto.balance=false;
		Match.auto.move=false;
		Match.teleop.balance=false;
		Match.endgame.parked=false;
		Match.endgame.score=0;
		Match.endgame.time="";
		Match.penalty.penalty=0;
		Match.penalty.disabled=false;
		Match.alliance_final_score=0;
		Match.cycle_time="";
		Match.pickup_time="";
		Match.comments="";
	}
}

// State
const State = () => ({ match: Match, team: Team });
const Actions = state => ({
	reset: function() {
		Match.save();
		Match.reset();
		Team.save();
		Team.reset();
	},
	get: function(vars) {
		if (vars.length == 2) {
			return state[vars[0]][vars[1]];
		} else if (vars.length == 3) {
			return state[vars[0]][vars[1]][vars[2]];
		} else {
			console.error("Cannot access variable!");
		}
	}
});

const state = State();
const actions = Actions(state);

// Components
var NavBar = {
	view: function() {
		return m("nav",
			m("ul",
				m("li", m("a", { class: "button", href: "#!/reset" }, "Save & Reset" )),
				m("li", m("a", { class: "button", href: "#!/scout/pit" }, "Pit Scout" )),
				m("li", m("a", { class: "button", href: "#!/scout/match" }, "Match Scout" )),
				m("li", m("a", { class: "button", href: "#!/driver" }, "Driver Meeting" ))
			))
	}
}

var QR = {
	view: function() {
		return m("div", { id: "qrcode", class: "qrcode", style: "display:none" })
	}
}

var inputBlock = {
	view: function(vnode) {
		return m("div", { class: "formBlock" },
			m("label.label", vnode.attrs.label),
			m("input.input[type="+vnode.attrs.type+"][placeholder="+actions.get(vnode.attrs.vars)+"]",
				{
					oninput: function(e) {
						if (vnode.attrs.vars.length == 2) {
							state[vnode.attrs.vars[0]][vnode.attrs.vars[1]] = e.target.value;
						} else if (vnode.attrs.vars.length == 3) {
							state[vnode.attrs.vars[0]][vnode.attrs.vars[1]][vnode.attrs.vars[2]] = e.target.value;
						};
					}
				}
			)
		)
	}
}

var checkBlock = {
	view: function(vnode) {
		return m("div", { class: "formBlock" },
			m("label.label", vnode.attrs.label),
			m("input.input[type=checkbox]",
				{
					checked: actions.get(vnode.attrs.vars),
					onready: function(e){ e.target.checked = actions.get(vnode.attrs.vars); },
					oninput: function(e) {
						if (vnode.attrs.vars.length == 2) {
							state[vnode.attrs.vars[0]][vnode.attrs.vars[1]] = e.target.checked;
						} else if (vnode.attrs.vars.length == 3) {
							state[vnode.attrs.vars[0]][vnode.attrs.vars[1]][vnode.attrs.vars[2]] = e.target.checked;
						};
					}
				}
			)
		)
	}
}

// Views`
var Splash = {
    view: function() {
        return m("div", { class: "center" },
			m("a", { class: "button", href: "#!/reset"}, "Start Scouting!")
		)
	}
}

var Reset = {
	view: function() {
		actions.reset();
		return m("div", { class: "main" },
			m(NavBar),
			m("div", { class: "page" },
				m("h1", "Hi")
			))
	}
}

var ScoutMatch = {
	view: function() {
		return m("div", { class: "main" }, [
			m(NavBar),
			m("div", { class: "page" }, [
				m("h1", "Match Scouting"),
				m("form", {
					onsubmit: function(e) {
						e.preventDefault()
					}
				},
					m(inputBlock, {
						label: "Linked Team",
						type: "number",
						vars: ['match', 'linked_team'],
					}),
					m(inputBlock, {
						label: "Linked Event",
						type: "text",
						vars: ['match', 'linked_event'],
					}),
					m(checkBlock, {
						label: "Auto Balance",
						vars: ['match', 'auto', 'balance'],
					}),
					m(checkBlock, {
						label: "Auto Move",
						vars: ['match', 'auto', 'move'],
					}),
					m(checkBlock, {
						label: "Teleop Balance",
						obj: "match",
						vars: ['match', 'teleop', 'balance'],
					}),
					m(checkBlock, {
						label: "Endgame Parked",
						vars: ['match', 'endgame', 'parked'],
					}),
					m(inputBlock, {
						label: "Endgame Score",
						type: "number",
						vars: ['match', 'endgame', 'score'],
					}),
					m(inputBlock, {
						label: "Penalties",
						type: "number",
						vars: ['match', 'penalty'],
					}),
					m(checkBlock, {
						label: "Disabled",
						vars: ['match', 'disabled'],
					}),
					m(inputBlock, {
						label: "Alliance Final Score",
						type: "number",
						vars: ['match', 'alliance_final_score'],
					}),
					m(inputBlock, {
						label: "Comments",
						type: "text",
						vars: ['match', 'comments'],
					}),
				),
				m(QR),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button", {
						onclick: function() {
							Match.save();
						}
					}, "Save"),
					m("button.button", {
						onclick: function() {
							document.getElementById("qrcode").style = "";
							Match.qr();
						}
					},"Show QR")
				)
			])
		])
	}
}

var ScoutPit = {
	view: function() {
		return m("div", { class: "main" }, [
			m(NavBar),
			m("div", { class: "page" }, [
				m("h1", "Pit Scouting"),
				m("form", {
					onsubmit: function(e) {
						e.preventDefault()
					}
				},
					m(inputBlock, {
						label: "Team #",
						type: "number",
						vars: ['team', 'number'],
					}),
					m(inputBlock, {
						label: "Team Name",
						type: "text",
						vars: ['team', 'name'],
					}),
					m(inputBlock, {
						label: "Robot Width (in)",
						type: "number",
						vars: ['team', 'width'],
					}),
					m(checkBlock, {
						label: "Swerve Drive?",
						vars: ['team', 'swerve'],
					}),
					m(checkBlock, {
						label: "Tippy?",
						vars: ['team', 'tippy'],
					}),
					m(inputBlock, {
						label: "Short Description of Autos:",
						type: "text",
						vars: ['team', 'autos'],
					}),
				),
				m(QR),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button", {
						onclick: function() {
							Team.save();
						}
					}, "Save"),
					m("button.button", {
						onclick: function() {
							document.getElementById("qrcode").style = "";
							Team.qr();
						}
					},"Show QR")
				)
			])
		])
	}
}

var DriverMeeting = {
	view: function() {
		return m("div", { class: "main" },
			m(NavBar),
			m("div", [
				m("h1", "Driver Meeting"),
				m("h2", "Team #"+state.team.number),
			]),
		)
	}
}

m.route(root, "/splash", {
    "/splash": Splash,
	"/reset": Reset,
	"/scout/pit": ScoutPit,
	"/scout/match": ScoutMatch,
	"/driver": DriverMeeting,
})
