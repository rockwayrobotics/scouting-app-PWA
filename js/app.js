var root = document.body

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('js/sw.js');
}

// Database
var db = new Dexie("Scouting");

db.version(1).stores({
	teams: "&number",
	matches: "&match_number, linked_team"
});

// Functions
let vals = [];
const loopNestedObj = obj => {
	Object.keys(obj).forEach(key => {
		if (obj[key] && typeof obj[key] === "object") loopNestedObj(obj[key]); // recurse.
		else {
			vals.push([key, obj[key]]); // or do something with key and val.
		}
	});
	return vals;
};

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

	async save() {
		await db.teams.put({
			number: parseInt(Team.number),
			name: Team.name,
			width: parseFloat(Team.width),
			autos: Team.autos,
			swerve: Team.swerve,
			tippy: Team.tippy,
		});
		await Team.list();
	},

	async load(id) {
		var new_team = await db.teams.where('number').equals(parseInt(id)).first();
		Team.number = new_team.number;
		Team.name = new_team.name;
		Team.width = new_team.width;
		Team.autos = new_team.autos;
		Team.swerve = new_team.swerve;
		Team.tippy = new_team.tippy;

	},

	async list() {
		const teams = await db.teams.toArray();
		state.teams_list = teams;
	},

	qr() {
		var vals = loopNestedObj(Team);
		var concat = "";
		for (i in vals) {
			if (Number.isInteger(vals[i])) {
				vals[i] = vals[i].toString(16);
			} else if (typeof vals[i] == "boolean") {
				vals[i] = vals[i] ? 1 : 0;
			}

			if (i == 0) {
				concat += vals[i];
			} else if (i <= 5) {
				concat += ";" + vals[i];
			}
		}
		console.log(concat);

		// compress data
		var compressed = LZW.compress(concat);
		console.log(compressed);
		var c_str = String.fromCharCode(...compressed);
		console.log(c_str);

		// generate QR code image
		let qrcodeContainer = document.getElementById("qrcode");
		qrcodeContainer.style = "";
		qrcodeContainer.innerHTML = "";
		new QRCode(qrcodeContainer, {text:c_str,correctLevel:QRCode.CorrectLevel.L});
	},
	
	async reset() {
		Team.number=0;
		Team.width=0.0;
		Team.swerve=false;
		Team.tippy=false;
		Team.autos="";
	}
}

var Match = {
	number: 0,
	linked_team: 0,
	linked_event: "X",
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
		time: "X",
	},
	penalty: 0,
	disabled: false,

	alliance_final_score: 0,
	cycle_time: "X",
	pickup_time: "X",
	comments: "X",

	async load(number) {
		var new_match = await db.matches.where('match_number').equals(parseInt(number)).first();
		Match.number = new_match.match_number;
		Match.linked_team = new_match.linked_team;
		Match.linked_event = new_match.linked_event;
		Match.recorded_time = new_match.recorded_time;
		Match.alliance = new_match.alliance;
		Match.auto.balance = new_match.auto_balance;
		Match.auto.move = new_match.auto_move;
		Match.teleop = new_match.teleop_balance;
		Match.endgame.parked = new_match.parked;
		Match.endgame.score = new_match.endgame_score;
		Match.endgame.time = new_match.endgame_time;
		Match.penalty = new_match.penalty;
		Match.disabled = new_match.disabled;
		Match.alliance_final_score = new_match.alliance_final_score;
		Match.cycle_time = new_match.cycle_time;
		Match.pickup_time = new_match.pickup_time;
		Match.comments = new_match.comments;
	},

	async save() {
		await db.matches.put({
			match_number: parseInt(Match.number),
			linked_team: parseInt(Match.linked_team),
			linked_event: Match.linked_event,
			recorded_time: Math.floor(Date.now() / 1000),
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
		await Match.list();
	},

	async list() {
		const matches = await db.matches.toArray();
		state.matches_list = matches;
	},

	qr() {
		var vals = loopNestedObj(Match);
		var concat_arr = [];
		var concat = "";
		for (i in vals) {
			var k = vals[i][0];
			var v = vals[i][1];
			switch (k) {
				case "number": concat_arr[0] = v.toString(16); break;
				case "linked_team": concat_arr[1] = v.toString(16); break;
				case "linked_event": concat_arr[2] = v; break;
				case "alliance": concat_arr[3] = v; break;
				case "balance": concat_arr[4] = v ? 1 : 0; break;
				case "move": concat_arr[5] = v ? 1 : 0; break;
				case "teleop": concat_arr[6] = v ? 1 : 0; break;
				case "parked": concat_arr[7] = v ? 1 : 0; break;
				case "score": concat_arr[8] = v.toString(16); break;
				case "time": concat_arr[9] = v; break;
				case "penalty": concat_arr[10] = v.toString(16); break;
				case "disabled": concat_arr[11] = v ? 1 : 0; break;
				case "alliance_final_score": concat_arr[12] = v.toString(16); break;
				case "comments": concat_arr[13] = v; break;
				case "recorded_time": concat_arr[14] = v.toString(16); break;
			};
		}

		for (i in concat_arr) {
			if (i == 0) {
				concat += concat_arr[i];
			} else {
				concat += ";" + concat_arr[i];
			}
		}
		console.log(concat);

		// compress data
		var compressed = LZW.compress(concat);
		var c_str = String.fromCharCode(...compressed);

		// generate QR code image
		let qrcodeContainer = document.getElementById("qrcode");
		qrcodeContainer.style = "";
		qrcodeContainer.innerHTML = "";
		new QRCode(qrcodeContainer, {text:c_str,correctLevel:QRCode.CorrectLevel.L});
	},

	async reset() {
		Match.number=0;
		Match.linked_team=0;
		Match.linked_event="X";
		Match.alliance="blue";
		Match.auto.balance=false;
		Match.auto.move=false;
		Match.teleop.balance=false;
		Match.endgame.parked=false;
		Match.endgame.score=0;
		Match.endgame.time="X";
		Match.penalty.penalty=0;
		Match.penalty.disabled=false;
		Match.alliance_final_score=0;
		Match.cycle_time="X";
		Match.pickup_time="X";
		Match.comments="X";
	}
}

// State
const State = () => ({ match: Match, team: Team, load_id: 0, teams_list: [], matches_list: [] });
const Actions = state => ({
	reset: async function() {
		await Team.list();
		await Match.list();
		await Match.reset();
		await Team.reset();
		window.location.href = "#!/scout/pit";
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
				m("li", m("a", { class: "button", id: "del", href: "#!/reset" }, "Reset" )),
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

var selectBlock = {
	view: function(vnode) {
		let options = [];
		if (vnode.attrs.id == "teams") {
			for (i in state.teams_list) {
				options.push(m("option", { value: state.teams_list[i].number }, state.teams_list[i].number ));
			};
		} else {
			for (i in state.matches_list) {
				options.push(m("option", { value: state.matches_list[i].match_number }, state.matches_list[i].match_number ));
			};
		}
		return m("div", { class: "formBlock" },
			m("label.label", vnode.attrs.label),
			m("select.input[name="+vnode.attrs.id+"][id="+vnode.attrs.id+"]",
				{
					oninput: function(e) {
						if (vnode.attrs.vars.length == 1) {
							state[vnode.attrs.vars[0]] = e.target.value;
						} else {
							state[vnode.attrs.vars[0]][vnode.attrs.vars[1]] = e.target.value;
						}
					}
				},
				options
			)
		)
	}
}

// Views`
var Splash = {
    view: function() {
		Team.list();
		Match.list();
        return m("div", { class: "center" },
			m("a", { class: "button", href: "#!/reset"}, "Start Scouting!")
		)
	}
}

var Reset = {
	view: function() {
		actions.reset();
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
						label: "Match Number:",
						type: "number",
						vars: ['match', 'number'],
					}),
					m(selectBlock, {
						label: "Linked Team:",
						id: "teams",
						vars: ['match', 'linked_team'],
					}),
					m(inputBlock, {
						label: "Event Code:",
						type: "text",
						vars: ['match', 'linked_event'],
					}),
					m(checkBlock, {
						label: "Can they balance in Auto?",
						vars: ['match', 'auto', 'balance'],
					}),
					m(checkBlock, {
						label: "Did they move in Auto?",
						vars: ['match', 'auto', 'move'],
					}),
					m(checkBlock, {
						label: "Can they balance in Teleop?",
						obj: "match",
						vars: ['match', 'teleop', 'balance'],
					}),
					m(checkBlock, {
						label: "Did they park in the Endgame?",
						vars: ['match', 'endgame', 'parked'],
					}),
					m(inputBlock, {
						label: "Endgame Score:",
						type: "number",
						vars: ['match', 'endgame', 'score'],
					}),
					m(inputBlock, {
						label: "Penalties:",
						type: "number",
						vars: ['match', 'penalty'],
					}),
					m(checkBlock, {
						label: "Were they disabled?",
						vars: ['match', 'disabled'],
					}),
					m(inputBlock, {
						label: "Alliance Final Score:",
						type: "number",
						vars: ['match', 'alliance_final_score'],
					}),
					m(inputBlock, {
						label: "Misc. Comments:",
						type: "text",
						vars: ['match', 'comments'],
					}),
				),
				m(QR),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button[id=ok]", {
						onclick: async function() {
							await Match.save();
						}
					}, "Save"),
					m("button.button", {
						onclick: function() {
							document.getElementById("qrcode").style = "";
							Match.qr();
						}
					},"Show QR")
				),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button[id=ok]", {
						onclick: function() {
							Match.load(state.load_id);
						}
					}, "Load Match"),
					m(selectBlock, {
						label: "",
						id: "matches",
						vars: ['load_id'],
					}),
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
						label: "Team #:",
						type: "number",
						vars: ['team', 'number'],
					}),
					m(inputBlock, {
						label: "Team Name:",
						type: "text",
						vars: ['team', 'name'],
					}),
					m(inputBlock, {
						label: "Robot Width (in):",
						type: "number",
						vars: ['team', 'width'],
					}),
					m(checkBlock, {
						label: "Do they have Swerve Drive?",
						vars: ['team', 'swerve'],
					}),
					m(checkBlock, {
						label: "Are they tippy?",
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
					m("button.button[id=ok]", {
						onclick: async function() {
							await Team.save();
						}
					}, "Save"),
					m("button.button", {
						onclick: function() {
							document.getElementById("qrcode").style = "";
							Team.qr();
						}
					},"Show QR")
				),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button[id=ok]", {
						onclick: function() {
							Team.load(state.load_id);
						}
					}, "Load Team"),
					m(selectBlock, {
						label: "",
						id: "teams",
						vars: ['load_id'],
					}),
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
