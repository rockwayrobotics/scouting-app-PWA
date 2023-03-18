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
const loopNestedObj = obj => {
	let vals = [];
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
			number: parseInt(state.team.number),
			name: state.team.name,
			width: parseFloat(state.team.width),
			autos: state.team.autos,
			swerve: state.team.swerve,
			tippy: state.team.tippy,
		});
		await Team.list();
	},

	async load(id) {
		var new_team = await db.teams.where('number').equals(parseInt(id)).first();
		state.team.number = new_team.number;
		document.getElementById('number').value = null;
		state.team.name = new_team.name;
		document.getElementById('name').value = null;
		state.team.width = new_team.width;
		document.getElementById('width').value = null;
		state.team.autos = new_team.autos;
		document.getElementById('autos').value = null;
		state.team.swerve = new_team.swerve;
		document.getElementById('swerve').checked = actions.get(["team","swerve"]);
		state.team.tippy = new_team.tippy;
		document.getElementById('tippy').value = actions.get(["team","tippy"]);


		window.location.href = "#!/reset/pit";
	},

	async list() {
		const teams = await db.teams.toArray();
		state.teams_list = teams;
	},

	qr() {
		var vals = loopNestedObj(state.team);
		var concat_arr = [];
		var concat = "";
		for (i in vals) {
			var k = vals[i][0];
			var v = vals[i][1];
			switch (k) {
				case "number": concat_arr[0] = v.toString(16); break;
				case "name": concat_arr[1] = v; break;
				case "width": concat_arr[2] = v; break;
				case "autos": concat_arr[3] = v; break;
				case "swerve": concat_arr[4] = v ? 1 : 0; break;
				case "tippy": concat_arr[5] = v ? 1 : 0; break;
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
}

var Match = {
	number: 0,
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
	comments: "",

	async load(number) {
		var new_match = await db.matches.where('match_number').equals(parseInt(number)).first();
		state.match.number = new_match.match_number;
		document.getElementById('number').value = null;
		state.match.linked_team = new_match.linked_team;
		document.getElementById('teams').value = null;
		state.match.linked_event = new_match.linked_event;
		document.getElementById('linked_event').value = null;
		state.match.recorded_time = new_match.recorded_time;
		state.match.alliance = new_match.alliance;
		state.match.auto.balance = new_match.auto_balance;
		document.getElementById('balance').checked = actions.get(['match', 'auto', 'balance']);
		state.match.auto.move = new_match.auto_move;
		document.getElementById('move').checked = actions.get(['match', 'auto', 'move']);
		state.match.teleop.balance = new_match.teleop_balance;
		document.getElementById('t_balance').checked = actions.get(['match', 'teleop', 'balance']);
		state.match.endgame.parked = new_match.parked;
		document.getElementById('park').checked = actions.get(['match', 'endgame', 'parked']);
		state.match.endgame.score = new_match.endgame_score;
		document.getElementById('score').value = null;
		state.match.endgame.time = new_match.endgame_time;
		state.match.penalty = new_match.penalty;
		document.getElementById('penalty').value = null;
		state.match.disabled = new_match.disabled;
		document.getElementById('disabled').checked = false;
		state.match.alliance_final_score = new_match.alliance_final_score;
		document.getElementById('final_score').value = null;
		state.match.cycle_time = new_match.cycle_time;
		state.match.pickup_time = new_match.pickup_time;
		state.match.comments = new_match.comments;
		document.getElementById('comments').value = null;

		window.location.href = "#!/reset/match";
	},

	async save() {
		await db.matches.put({
			match_number: parseInt(state.match.number),
			linked_team: parseInt(state.match.linked_team),
			linked_event: state.match.linked_event,
			recorded_time: Math.floor(Date.now() / 1000),
			alliance: state.match.alliance,
			auto_balance: state.match.auto.balance,
			auto_move: state.match.auto.move,
			teleop_balance: state.match.teleop.balance,
			parked: state.match.endgame.parked,
			endgame_score: state.match.endgame.score,
			endgame_time: state.match.endgame.time,
			penalty: state.match.penalty,
			disabled: state.match.disabled,
			alliance_final_score: state.match.alliance_final_score,
			cycle_time: state.match.cycle_time,
			pickup_time: state.match.pickup_time,
			scouter_comments: state.match.comments,
		});
		await state.match.list();
	},

	async list() {
		const matches = await db.matches.toArray();
		state.matches_list = matches;
	},

	qr() {
		var vals = loopNestedObj(state.match);
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
}

// State
const State = () => ({ match: Match, team: Team, load_id: 0, teams_list: [], matches_list: [] });
const Actions = state => ({
	async reset(page) {
		await Team.list();
		await Match.list();
		state.team = Team;
		state.match = Match;

		if (page == "pit") {
			window.location.href = "#!/scout/pit";
		} else if (page == "match") {
			window.location.href = "#!/scout/match";
		}

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
				m("li", m("a", { class: "button", id: "del", href: "#!/reset/match" }, "Reset" )),
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
			m("input.input[type="+vnode.attrs.type+"][placeholder="+actions.get(vnode.attrs.vars)+"][id="+vnode.attrs.id+"]",
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
			m("input.input[type=checkbox][id="+vnode.attrs.id+"]",
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
		options.push(m("option", { value: "" }, ""));
		if (vnode.attrs.id == "teams") {
			for (i in state.teams_list) {
				options.push(m("option", { value: state.teams_list[i].number }, state.teams_list[i].number ));
			};
		} else if (vnode.attrs.id == "matches") {
			for (i in state.matches_list) {
				options.push(m("option", { value: state.matches_list[i].match_number }, state.matches_list[i].match_number ));
			};
		} else if (vnode.attrs.id == "alliance") {
			options.push(m("option", { value: "blue" }, "Blue"));
			options.push(m("option", { value: "red" }, "Red"));
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
		state.team.list();
		state.match.list();
        return m("div", { class: "center" },
			m("a", { class: "button", href: "#!/reset/pit"}, "Start Scouting!")
		)
	}
}

var ResetPit = {
	view: function() {
		actions.reset("pit");
	}
}
var ResetMatch = {
	view: function() {
		actions.reset("match");
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
						id: "number",
						type: "number",
						vars: ['match', 'number'],
					}),
					m(selectBlock, {
						label: "Linked Team:",
						id: "teams",
						vars: ['match', 'linked_team'],
					}),
					m(selectBlock, {
						label: "Alliance",
						id: "alliance",
						vars: ['match', 'alliance'],
					}),
					m(inputBlock, {
						label: "Event Code:",
						id: "linked_event",
						type: "text",
						vars: ['match', 'linked_event'],
					}),
					m(checkBlock, {
						label: "Can they balance in Auto?",
						id: "balance",
						vars: ['match', 'auto', 'balance'],
					}),
					m(checkBlock, {
						label: "Did they move in Auto?",
						id: "move",
						vars: ['match', 'auto', 'move'],
					}),
					m(checkBlock, {
						label: "Can they balance in Teleop?",
						id: "t_balance",
						obj: "match",
						vars: ['match', 'teleop', 'balance'],
					}),
					m(checkBlock, {
						label: "Did they park in the Endgame?",
						id: "park",
						vars: ['match', 'endgame', 'parked'],
					}),
					m(inputBlock, {
						label: "Endgame Score:",
						id: "score",
						type: "number",
						vars: ['match', 'endgame', 'score'],
					}),
					m(inputBlock, {
						label: "Penalties:",
						id: "penalty",
						type: "number",
						vars: ['match', 'penalty'],
					}),
					m(checkBlock, {
						label: "Were they disabled?",
						id: "disabled",
						vars: ['match', 'disabled'],
					}),
					m(inputBlock, {
						label: "Alliance Final Score:",
						id: "final_score",
						type: "number",
						vars: ['match', 'alliance_final_score'],
					}),
					m(inputBlock, {
						label: "Misc. Comments:",
						id: "comments",
						type: "text",
						vars: ['match', 'comments'],
					}),
				),
				m(QR),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button[id=ok]", {
						onclick: async function() {
							await state.match.save();
						}
					}, "Save"),
					m("button.button", {
						onclick: function() {
							document.getElementById("qrcode").style = "";
							state.match.qr();
						}
					},"Show QR")
				),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button[id=ok]", {
						onclick: function() {
							state.match.load(state.load_id);
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
						id: "number",
						type: "number",
						vars: ['team', 'number'],
					}),
					m(inputBlock, {
						label: "Team Name:",
						id: "name",
						type: "text",
						vars: ['team', 'name'],
					}),
					m(inputBlock, {
						label: "Robot Width (in):",
						id: "width",
						type: "number",
						vars: ['team', 'width'],
					}),
					m(checkBlock, {
						label: "Do they have Swerve Drive?",
						id: "swerve",
						vars: ['team', 'swerve'],
					}),
					m(checkBlock, {
						label: "Are they tippy?",
						id: "tippy",
						vars: ['team', 'tippy'],
					}),
					m(inputBlock, {
						label: "Short Description of Autos:",
						id: "autos",
						type: "text",
						vars: ['team', 'autos'],
					}),
				),
				m(QR),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button[id=ok]", {
						onclick: async function() {
							await state.team.save();
						}
					}, "Save"),
					m("button.button", {
						onclick: function() {
							document.getElementById("qrcode").style = "";
							state.team.qr();
						}
					},"Show QR")
				),
				m("div", { class: "formBlock", id: "bottom" },
					m("button.button[id=ok]", {
						onclick: function() {
							state.team.load(state.load_id);
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
	"/reset/pit": ResetPit,
	"/reset/match": ResetMatch,
	"/scout/pit": ScoutPit,
	"/scout/match": ScoutMatch,
	"/driver": DriverMeeting,
})
