var root = document.body

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('js/sw.js');
}

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
		time: "",
	},
	penalty: 0,
	disabled: false,

	alliance_final_score: 0,
	cycle_time: "",
	pickup_time: "",
	comments: "",

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
		Match.reset();
		Team.reset();
	}
});

const state = State();
const actions = Actions(state);

// Components
var NavBar = {
	view: function() {
		return m("nav",
			m("ul",
				m("li", m("a", { class: "button", href: "#!/reset" }, "Reset" )),
				m("li", m("a", { class: "button", href: "#!/scout/pit" }, "Pit Scout" )),
				m("li", m("a", { class: "button", href: "#!/scout/match" }, "Match Scout" )),
				m("li", m("a", { class: "button", href: "#!/driver" }, "Driver Meeting" ))
			))
	}
}

var inputBlock = {
	view: function(vnode) {
		return m("div", { class: "formBlock" },
			m("label.label", vnode.attrs.label),
			m("input.input[type="+vnode.attrs.type+"][placeholder="+vnode.attrs.placeholder+"]",
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

function checked_value(vars) {
	if (vars.length == 2) {
		return state[vars[0]][vars[1]];
	} else if (vars.length == 3) {
		return state[vars[0]][vars[1]][vars[2]];
	};
}

var checkBlock = {
	view: function(vnode) {
		return m("div", { class: "formBlock" },
			m("label.label", vnode.attrs.label),
			m("input.input[type=checkbox]",
				{
					checked: checked_value(vnode.attrs.vars),
					onready: function(e){
						console.log("ready!");
						if (vnode.attrs.vars.length == 2) {
							e.target.checked = state[vnode.attrs.vars[0]][vnode.attrs.vars[1]];
						} else if (vnode.attrs.vars.length == 3) {
							e.target.checked = state[vnode.attrs.vars[0]][vnode.attrs.vars[1]][vnode.attrs.vars[2]];
						};
					},
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
						placeholder: state.team.number,
						vars: ['match', 'linked_team'],
					}),
					m(inputBlock, {
						label: "Linked Event",
						type: "text",
						placeholder: "abc123",
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
						placeholder: state.match.endgame.score,
						vars: ['match', 'endgame', 'score'],
					}),
					m(inputBlock, {
						label: "Penalties",
						type: "number",
						placeholder: state.match.penalty,
						vars: ['match', 'penalty'],
					}),
					m(checkBlock, {
						label: "Disabled",
						vars: ['match', 'disabled'],
					}),
					m(inputBlock, {
						label: "Alliance Final Score",
						type: "number",
						placeholder: state.match.alliance_final_score,
						vars: ['match', 'alliance_final_score'],
					}),
					m(inputBlock, {
						label: "Comments",
						type: "text",
						placeholder: "Freeform comments",
						vars: ['match', 'comments'],
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
						label: "Team #",
						type: "number",
						placeholder: "8089",
						vars: ['team', 'number'],
					}),
					m(inputBlock, {
						label: "Team Name",
						type: "text",
						placeholder: "Rockway Robotics",
						vars: ['team', 'name'],
					}),
					m(inputBlock, {
						label: "Robot Width (in)",
						type: "number",
						placeholder: "24.5",
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
						placeholder: "Can do...",
						vars: ['team', 'autos'],
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
