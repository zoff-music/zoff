var connection_options = {
	'sync disconnect on unload':true,
	'secure': true,
	'force new connection': true
};
var socket = io.connect(window.location.protocol + '//' + window.location.hostname, connection_options);
var api_token_list;
var dynamicListeners = {};

function toast(text, length, classes) {
	M.toast({ html: text, displayLength: length, classes: classes});
}

window.addEventListener("DOMContentLoaded", function() {
    M.Tabs.init(document.querySelector(".tabs_admin"), {
		onShow: function() {
			if(this.index == 2) {
			    M.Tabs.getInstance(document.querySelector(".tabs_admin_info")).updateTabIndicator();
			}
		}
	});
    M.Tabs.init(document.querySelector(".tabs_admin_info"));
    api_token_list = document.querySelector("#api_token_list").cloneNode(true);
    document.querySelector("#api_token_list").remove();
    loaded();

	addClass(".channel_things", "hide");
	removeClass(".preloader-wrapper", "hide");

	document.addEventListener("click", function(event) {
	    handleEvent(event, event.target, false, "click");
	}, true);

	document.addEventListener("input", function(event) {
	    handleEvent(event, event.target, false, "input");
	}, true);

	document.addEventListener("change", function(event) {
	    handleEvent(event, event.target, false, "change");
	}, true);

	document.addEventListener("submit", function(event) {
	    handleEvent(event, event.target, false, "submit");
	}, true);

	document.getElementById("refresh_all").addEventListener("click", function(event) {
		event.preventDefault();
		document.getElementById("descriptions_cont").innerHTML = "";
		document.getElementById("thumbnails_cont").innerHTML = "";
		document.querySelector(".names-container").innerHTML = "";
        var elements = document.querySelectorAll(".api_token_container");
        for(var i = 0; i < elements.length; i++) {
        	elements[i].remove();
        }

		addClass(".channel_things", "hide");

		removeClass(".preloader-wrapper", "hide");
		loaded();
		document.querySelector("#listeners").innerHTML = "";
		socket.emit("get_spread");
	});
});

addListener("click", ".update_api_token", function(event) {
	this.preventDefault();
	var that = event;
	var id = that.getAttribute("data-id");
	var limit = document.querySelector("#limit-" + id).value;

	toggleClass(that, "disabled");

	toggleClass("#delete-" + id, "disabled");
	ajax({
		type: "PUT",
		url: "api/api_token",
		headers: {
			"Content-Type": "application/json"
		},
		data: {
			id: id,
			limit: limit,
		},
		success: function(response) {
			if(response == "OK") {
				toast("Updated limit!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
			toggleClass(that, "disabled");
			toggleClass("#delete-" + id, "disabled");
		}
	});
});

addListener("click", ".delete_api_token", function(event) {
	this.preventDefault();
	var that = event;
	var id = that.getAttribute("data-id");
	toggleClass(that, "disabled");
	toggleClass("#limit-" + id, "disabled");
	ajax({
		type: "DELETE",
		url: "api/api_token",
		headers: {
			"Content-Type": "application/json"
		},
		data: {
			id: id
		},
		success: function(response) {
			if(response == "success") {
				toast("Removed token!", 2000, "green lighten");
				document.querySelector("#element-" + id).remove();
			} else {
				toast("Something went wrong...", 2000, "red lighten");
				toggleClass(that, "disabled");
				toggleClass("#limit-" + id, "disabled");
			}
		},
	});
});

addListener("click", ".approve_name", function(event) {
	var that = event;
	var name = that.getAttribute("data-name");
	var value = that.parentElement.querySelector("input").value;
	ajax({
		type: "POST",
		url: "/api/names",
		data: {
			icon: value,
			name: name,
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(resp) {
			if(resp == true) {
				toast("Approved image!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

addListener("click", ".remove_name", function(event) {
	var that = event;
	var name = that.getAttribute("data-name");
	ajax({
		type: "DELETE",
		url: "/api/names",
		data: {
			name: name,
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(resp) {
			if(resp == true) {
				toast("Removed username!", 2000, "green lighten");
				that.parentElement.remove();
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

addListener("click", ".thumbnail_link", function(event) {
	this.preventDefault();
	window.open("https:" + event.value,'_blank');
});

addListener("click", "#get_token", function(event) {
	this.preventDefault();
	ajax({
		type: "GET",
		url: "/api/token",
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response != false){
				document.querySelector("#new_token").value = response.token;
				toggleClass("#get_token", "hide");
				toggleClass("#remove_token", "hide");
			}
		}
	})
});

addListener("click", ".approve_thumbnails", function(event) {
	this.preventDefault();
	var that = event;
	var channel = that.getAttribute("data-channel");
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}
	ajax({
		type: "POST",
		url: "/api/approve_thumbnail",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				that.parentElement.remove();
				var length = parseInt(document.querySelector(".thumbnails-badge").innerText);
				length = length - 1;
				increaseInfo(-1);
				document.querySelector(".thumbnails-badge").innerText = length;
				if(length <= 0){
					addClass(".thumbnails-badge", "hide");
				}
				toast("Approved Thumbnail!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		},
		error: function(err) {
		}
	});
});

addListener("click", ".deny_thumbnails", function(event) {
	this.preventDefault();
	var that = event;
	var channel = that.getAttribute("data-channel");
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}

	ajax({
		type: "POST",
		url: "/api/deny_thumbnail",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				that.parentElement.remove();
				var length = parseInt(document.querySelector(".thumbnails-badge").innerText);
				length = length - 1;
				increaseInfo(-1);
				document.querySelector(".thumbnails-badge").innerText = length;
				if(length <= 0){
					addClass(".thumbnails-badge", "hide");
				}
				toast("Denied thumbnail!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

addListener("click", ".approve_descriptions", function(event) {
	this.preventDefault();
	var that = event;
	var channel = that.getAttribute("data-channel");
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}

	ajax({
		type: "POST",
		url: "/api/approve_description",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				that.parentElement.remove();
				var length = parseInt(document.querySelector(".descriptions-badge").innerText);
				length = length - 1;
				increaseInfo(-1);
				document.querySelector(".descriptions-badge").innerText = length;
				if(length <= 0){
					addClass(".descriptions-badge", "hide");
				}
				toast("Approved description!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

addListener("click", ".deny_descriptions", function(event) {
	this.preventDefault();
	var that = event;
	var channel = that.getAttribute("data-channel");
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}

	ajax({
		type: "POST",
		url: "/api/deny_description",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				that.parentElement.remove();
				var length = parseInt(document.querySelector(".descriptions-badge").innerText);
				length = length - 1;
				increaseInfo(-1);
				document.querySelector(".descriptions-badge").innerText = length;
				if(length <= 0){
					addClass(".descriptions-badge", "hide");
				}
				toast("Denied description!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

addListener("click", ".approve_rules", function(event) {
	this.preventDefault();
	var that = event;
	var channel = that.getAttribute("data-channel");
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}

	ajax({
		type: "POST",
		url: "/api/approve_rules",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				that.parentElement.remove();
				var length = parseInt(document.querySelector(".rules-badge").innerText);
				length = length - 1;
				increaseInfo(-1);
				document.querySelector(".rules-badge").innerText = length;
				if(length <= 0){
					addClass(".rules-badge", "hide");
				}
				toast("Approved rules!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

addListener("click", ".deny_rules", function(event) {
	this.preventDefault();
	var that = event;
	var channel = that.getAttribute("data-channel");
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}

	ajax({
		type: "POST",
		url: "/api/deny_rules",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				that.parentElement.remove();
				var length = parseInt(document.querySelector(".rules-badge").innerText);
				length = length - 1;
				increaseInfo(-1);
				document.querySelector(".rules-badge").innerText = length;
				if(length <= 0){
					addClass(".rules-badge", "hide");
				}
				toast("Denied description!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

addListener("click", "#remove_description_button", function(event) {
	this.preventDefault();
	var that = event;
	var channel = document.querySelector("#remove_description").value;
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}
	ajax({
		type: "POST",
		url: "/api/remove_description",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				toast("Removed description!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});


addListener("click", "#remove_rules_button", function(event) {
	this.preventDefault();
	var that = event;
	var channel = document.querySelector("#remove_rules").value;
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}
	ajax({
		type: "POST",
		url: "/api/remove_rules",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				toast("Removed rules!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

addListener("click", "#remove_thumbnail_button", function(event) {
	this.preventDefault();
	var that = event;
	var channel = document.querySelector("#remove_thumbnail").value;
	if(!channel) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}

	ajax({
		type: "POST",
		url: "/api/remove_thumbnail",
		data: {
			channel: channel
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response){
				toast("Removed thumbnail!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
});

function delete_channel(that) {
	var to_delete = document.querySelector("#delete_channel_name").value;
	if(!to_delete) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}
	var r = confirm("Delete list \""+ decodeChannelName(to_delete) + "\"?");
	if (r == true) {
		ajax({
			type: "POST",
			url: "/api/delete",
			data: {
				_id: to_delete
			},
			headers: {
				"Content-Type": "application/json"
			},
			success: function(response){
				if(response == true){
					loaded();
					toast("Deleted channel!", 2000, "green lighten");
				} else {
					toast("Something went wrong...", 2000, "red lighten");
				}
			}
		})
	}
}

addListener("submit", "#delete_channel", function(event) {
	this.preventDefault();
	delete_channel(event);
});

addListener("click", "#delete_channel_button", function(event) {
	this.preventDefault();
	delete_channel(event);
});

addListener("click", "#remove_token", function(event) {
	this.preventDefault();
	ajax({
		type: "GET",
		url: "/api/remove_token",
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response != false){
				document.querySelector("#new_token").value = "";
				toggleClass("#get_token", "hide");
				toggleClass("#remove_token", "hide");
			}
		}
	})
});

addListener("submit", "#change_pinned", function(event) {
	this.preventDefault();
	change_pinned(event);
});

addListener("click", "#change_pinned_button", function(event) {
	this.preventDefault();
	change_pinned(event);
});

addListener("click", "#delete_admin_button", function(event) {
	this.preventDefault();
	delete_admin_list(event);
});

function change_pinned(that) {
	var to_pin = document.querySelector("#frontpage_pinned").value;
	if(!to_pin) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}
	ajax({
		type: "POST",
		url: "/api/pinned",
		data: {
			_id: to_pin
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response == true){
				toast("Pinned channel!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	})
}

function delete_admin_list(that) {
	var to_remove_password = document.querySelector("#delete_list_name").value;
	if(!to_remove_password) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}
	ajax({
		type: "POST",
		url: "/api/admin",
		data: {
			_id: to_remove_password
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response == true){
				toast("Removed admin password!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	});
}

function delete_userpass(that) {
	var to_remove_password = document.querySelector("#delete_userpass_name").value;
	if(!to_remove_password) {
		toast("Something went wrong...", 2000, "red lighten");
		return;
	}
	ajax({
		type: "POST",
		url: "/api/userpass",
		data: {
			_id: to_remove_password
		},
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response == true){
				toast("Removed userpass password!", 2000, "green lighten");
			} else {
				toast("Something went wrong...", 2000, "red lighten");
			}
		}
	})
}

addListener("click", "#delete_userpass_button", function(event) {
	this.preventDefault();
	delete_userpass(event);
});

addListener("submit", "#delete_list", function(event) {
	this.preventDefault();
	delete_admin_list(event);
});

addListener("submit", "#delete_userpass", function(event) {
	this.preventDefault();
	delete_userpass(event);
});

socket.on("spread_listeners", function(obj){
	document.querySelector("#listeners").insertAdjacentHTML("beforeend", "<p>Private listeners: " + obj.offline + "</p>");
	document.querySelector("#listeners").insertAdjacentHTML("beforeend", "<p>Total listeners: " + obj.total + "</p>");
	document.querySelector("#listeners").insertAdjacentHTML("beforeend", "<hr>");
	for(var x in obj.online_users){
		if(obj.online_users[x]._id != "total_users" && obj.online_users[x].hasOwnProperty("users") && obj.online_users[x].users.length > 0){
			document.querySelector("#listeners").insertAdjacentHTML("beforeend", "<p>" + decodeChannelName(obj.online_users[x]._id) + ": " + obj.online_users[x].users.length + "</p>");
		}
	}
});

function add_to_tab(dest, resp){
	for(var x = 0; x < resp.length; x++){
		if(dest == "thumbnails"){
			document.querySelector("#" + dest + "_cont").insertAdjacentHTML("beforeend", "<div><div class='col s4 m3'>" + decodeChannelName(resp[x].channel) + "</div><input type='text' readonly class='col s4 m6 thumbnail_link' value='" + resp[x].thumbnail + "'><a class='btn green waves-effect col s2 m1 approve_" + dest + "' href='#' data-channel='" + resp[x].channel + "'><i class='material-icons'>check</i></a><a class='btn red waves-effect col s2 m1 deny_" + dest + "' href='#' data-channel='" + resp[x].channel + "'>X</a></div>");
		} else if(dest == "descriptions"){
			document.querySelector("#" + dest + "_cont").insertAdjacentHTML("beforeend", "<div><div class='col s4 m3'>" + decodeChannelName(resp[x].channel) + "</div><input type='text' readonly class='col s4 m6' value='" + resp[x].description + "'><a class='btn green waves-effect col s2 m1 approve_" + dest + "' href='#' data-channel='" + resp[x].channel + "'><i class='material-icons'>check</i></a><a class='btn red waves-effect col s2 m1 deny_" + dest + "' href='#' data-channel='" + resp[x].channel + "'>X</a></div>");
		} else {
			resp[x].rules = resp[x].rules.replace(/\n/g, " /n\\ ");
			document.querySelector("#" + dest + "_cont").insertAdjacentHTML("beforeend", "<div><div class='col s4 m3'>" + decodeChannelName(resp[x].channel) + "</div><input type='text' readonly class='col s4 m6' value='" + resp[x].rules + "'><a class='btn green waves-effect col s2 m1 approve_" + dest + "' href='#' data-channel='" + resp[x].channel + "'><i class='material-icons'>check</i></a><a class='btn red waves-effect col s2 m1 deny_" + dest + "' href='#' data-channel='" + resp[x].channel + "'>X</a></div>");
		}
	}
}

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function increaseInfo(num) {
	removeClass(".info-badge", "hide");
	try {
		var currentNumber = parseInt(document.querySelector(".info-badge").innerText);
		if(isNaN(currentNumber)) currentNumber = 0;
		document.querySelector(".info-badge").innerText = currentNumber + num;
		currentNumber += num;
		if(currentNumber <= 0) {
			addClass(".info-badge", "hide");
		}
	} catch(e) {
		document.querySelector(".info-badge").innerText = 1;
	}
}

function loaded() {
	ajax({
		type: "GET",
		headers: {
			"Content-Type": "application/json"
		},
		url: "/api/api_token",
		success: function(response) {
			if(response.length == 0) {
				addClass(".header-api-fields", "hide");
				return;
			}
			removeClass(".header-api-fields", "hide");
			for(var i = 0; i < response.length; i++) {
				var to_add = api_token_list.cloneNode(true);
				to_add.setAttribute("id", "element-" + response[i]._id);
				to_add.querySelector(".api_token_name").innerText = response[i].name;
				to_add.querySelector(".api_token_usage").innerText = response[i].usage;
                to_add.querySelector(".api_token_origin").innerText = response[i].origin;
				to_add.querySelector(".update_api_token").setAttribute("id", "update-" + response[i]._id);
				to_add.querySelector(".api_token_limit").setAttribute("id", "limit-" + response[i]._id);
				to_add.querySelector("#limit-" + response[i]._id).value = parseInt(response[i].limit);
				to_add.querySelector(".delete_api_token").setAttribute("id", "delete-" + response[i]._id);
				to_add.querySelector(".delete_api_token").setAttribute("data-id", response[i]._id);
				to_add.querySelector(".update_api_token").setAttribute("data-id", response[i]._id);
				if(response[i].active) {
                    removeClass(to_add.querySelector(".check"), "hide");
                } else {
                    removeClass(to_add.querySelector(".uncheck"), "hide");
                }
				document.querySelector("#api_keys").insertAdjacentHTML("beforeend", '<div class="row api_token_container" id="element-' + response[i]._id + '">' + to_add.innerHTML + "</div>");
				document.querySelector("#limit-" + response[i]._id).value = parseInt(response[i].limit);
			}
		},
		error: function(err) {
		}
	});

	ajax({
		type: "GET",
		headers: {
			"Content-Type": "application/json"
		},
		url: "/api/lists",
		success: function(response){
			response = response.sort(predicate({
                name: '_id',
                reverse: false
            }));
			var output_pinned = '<option value="" disabled selected>Channels</option>';
			var output_delete = '<option value="" disabled selected>Channels</option>';
			for(var x = 0; x < response.length; x++){
				if(response[x].count > 2){
					output_pinned += "<option class='" + response[x]._id + "' value='" + response[x]._id + "'>" + decodeChannelName(response[x]._id) + "</option>";
				}
				output_delete += "<option class='" + response[x]._id + "' value='" + response[x]._id + "'>" + decodeChannelName(response[x]._id) + "</option>";
			}

			document.querySelector("#frontpage_pinned").innerHTML = output_pinned;
			document.querySelector("#remove_thumbnail").innerHTML = document.querySelector("#frontpage_pinned").cloneNode(true).innerHTML;
			document.querySelector("#remove_description").innerHTML = document.querySelector("#frontpage_pinned").cloneNode(true).innerHTML;
			document.querySelector("#remove_rules").innerHTML = document.querySelector("#frontpage_pinned").cloneNode(true).innerHTML;
			document.querySelector("#delete_list_name").innerHTML = document.querySelector("#frontpage_pinned").cloneNode(true).innerHTML;
			document.querySelector("#delete_userpass_name").innerHTML = document.querySelector("#frontpage_pinned").cloneNode(true).innerHTML;
			document.querySelector("#delete_channel_name").innerHTML = document.querySelector("#frontpage_pinned").cloneNode(true).innerHTML;
			var selects = document.querySelectorAll("select");
			for(var i = 0; i < selects.length; i++) {
				M.FormSelect.init(selects[i]);
			}

			addClass(".preloader-wrapper", "hide");
			removeClass(".channel_things", "hide");
		}
	});

	ajax({
	    type: "GET",
	    url: "/api/names",
		headers: {
			"Content-Type": "application/json"
		},
	    success: function(response) {
			for(var i = 0; i < response.length; i++) {
				var icon = "";
				if(response[i].icon && response[i].icon != "") {
					icon = "<img class='chat-icon' src='" + response[i].icon + "' alt='" + escapeHtml(response[i]._id) + "'>";
				}

				document.querySelector(".names-container").insertAdjacentHTML("beforeend", "<div class='col s12'><div class='name-chat col s3'>" + icon + escapeHtml(response[i]._id) + "</div><input type='text' class='" + escapeHtml(response[i]._id) + "_input col s5'><a class='btn green waves-effect col s2 m1 approve_name' href='#' data-name='" + escapeHtml(response[i]._id) + "'><i class='material-icons'>check</i></a><a class='btn red waves-effect col s2 m1 remove_name' href='#' data-name='" + escapeHtml(response[i]._id) + "'><i class='material-icons'>close</i></a></div>");
			}
	    },
	});

	ajax({
		type: "GET",
		url: "/api/thumbnails",
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response.length > 0){
				removeClass(".thumbnails-badge", "hide");
				document.querySelector(".thumbnails-badge").innerText = response.length;
				increaseInfo(response.length);
			}
			add_to_tab("thumbnails", response);
		}
	});

	ajax({
		type: "GET",
		url: "/api/descriptions",
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response.length > 0){
				removeClass(".descriptions-badge", "hide");
				document.querySelector(".descriptions-badge").innerText = response.length;
				increaseInfo(response.length);
			}
			add_to_tab("descriptions", response);
		}
	});

	ajax({
		type: "GET",
		url: "/api/rules",
		headers: {
			"Content-Type": "application/json"
		},
		success: function(response){
			if(response.length > 0){
				removeClass(".rules-badge", "hide");
				document.querySelector(".rules-badge").innerText = response.length;
				increaseInfo(response.length);
			}
			add_to_tab("rules", response);
		}
	});
}

function predicate() {
	var fields = [],
	n_fields = arguments.length,
	field, name, cmp;

	var default_cmp = function (a, b) {
		if(a == undefined) a = 0;
		if(b == undefined) b = 0;
		if (a === b) return 0;
		return a < b ? -1 : 1;
	},
	getCmpFunc = function (primer, reverse) {
		var dfc = default_cmp,
		// closer in scope
		cmp = default_cmp;
		if (primer) {
			cmp = function (a, b) {
				return dfc(primer(a), primer(b));
			};
		}
		if (reverse) {
			return function (a, b) {
				return -1 * cmp(a, b);
			};
		}
		return cmp;
	};

	// preprocess sorting options
	for (var i = 0; i < n_fields; i++) {
		field = arguments[i];
		if (typeof field === 'string') {
			name = field;
			cmp = default_cmp;
		} else {
			name = field.name;
			cmp = getCmpFunc(field.primer, field.reverse);
		}
		fields.push({
			name: name,
			cmp: cmp
		});
	}

	// final comparison function
	return function (A, B) {
		var name, result;
		for (var i = 0; i < n_fields; i++) {
			result = 0;
			field = fields[i];
			name = field.name;

			result = field.cmp(A[name], B[name]);
			if (result !== 0) break;
		}
		return result;
	};
}

function removeClass(element, className) {
	try {
		if(typeof(element) == "object") {
			element.classList.remove(className);
		} else if(element.substring(0,1) == "#") {
			document.getElementById(element.substring(1)).classList.remove(className);
		} else {
			var elements = document.getElementsByClassName(element.substring(1));
			for(var i = 0; i < elements.length; i++) {
				elements[i].classList.remove(className);
			}
		}
	} catch(e) {
		//console.log(e);
	}
}

function addClass(element, className) {
	try {
		if(typeof(element) == "object") {
			try {
				if(element.length > 0) {
					for(var i = 0; i < element.length; i++) {
						if(element[i].className.indexOf(className) == -1) {
							element[i].className += " " + className;
						}
					}
				} else {
					if(element.className.indexOf(className) == -1) {
						element.className += " " + className;
					}
				}
			} catch(e) {
				if(element.className.indexOf(className) == -1) {
					element.className += " " + className;
				}
			}
		} else if(element.substring(0,1) == "#") {
			var elem = document.getElementById(element.substring(1));
			if(elem.className.indexOf(className) == -1) {
				elem.className += " " + className;
			}
		} else {
			var elements;
			if(element.substring(0,1) == ".") {
				elements = document.getElementsByClassName(element.substring(1));
			} else {
				elements = document.getElementsByTagName(element);
			}
			for(var i = 0; i < elements.length; i++) {
				if(elements[i].className.indexOf(className) == -1) {
					elements[i].className += " " + className;
				}
			}
		}
	}catch(e) {}
}

function decodeChannelName(str) {
  var _fn = decodeURIComponent;
  str = str.toUpperCase();
  try {
      var toReturn = _fn(str.replace(/%5F/g, "_").replace(/%27/g, "'"));
      return toReturn.toLowerCase();
  } catch(e) {
      return str.toLowerCase();
  }
}

function toggleClass(element, className) {
	try {
		if(typeof(element) == "object") {
			if(element.className.indexOf(className) == -1) {
				addClass(element, className);
			} else {
				removeClass(element, className);
			}
		} else if(element.substring(0,1) == "#") {
			var elem = document.getElementById(element.substring(1));
			if(elem.className.indexOf(className) == -1) {
				addClass(elem, className);
			} else {
				removeClass(elem, className);
			}
		} else {
			var elements;
			if(element.substring(0,1) == ".") {
				var testSplit = element.substring(1).split(" ");
				if(testSplit.length > 1) {
					var insideElement = document.getElementsByClassName(testSplit[0]);
					elements = [];
					for(var i = 0; i < insideElement.length; i++) {
						var innards = insideElement[i].querySelectorAll(testSplit[1]);
						for(var y = 0; y < innards.length; y++) {
							elements.push(innards[y]);
						}
					}
				} else {
					elements = document.getElementsByClassName(element.substring(1));
				}
			} else {
				elements = document.getElementsByTagName(element);
			}
			for(var i = 0; i < elements.length; i++) {
				if(elements[i].className.indexOf(className) == -1) {
					addClass(elements[i], className);
				}  else {
					removeClass(element, className);
				}
			}
		}
	}catch(e) {
		//console.log(e);
	}
}

function ajax(obj) {
	var _async = true;
	if(obj.async) _async = obj.async;
	if(obj.method == undefined && obj.type != undefined) obj.method = obj.type;
	if(obj.method == undefined) obj.method = "GET";
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
			if (xmlhttp.status == 200 || xmlhttp.status == 201 || xmlhttp.status == 202) {
				try {
					obj.success(JSON.parse(xmlhttp.responseText), xmlhttp);
				} catch(e) {
					obj.success(xmlhttp.responseText, xmlhttp);
				}
			}
			else if(obj.hasOwnProperty("error")){
				obj.error(xmlhttp);
			}
		}
	};

	xmlhttp.open(obj.method, obj.url, _async);
	if(obj.headers) {
		for(header in obj.headers) {
			xmlhttp.setRequestHeader(header, obj.headers[header]);
		}
	}
	if(obj.data) {
		if(typeof(obj.data) == "object") obj.data = JSON.stringify(obj.data);
		//xmlhttp.send(sendRequest);
		xmlhttp.send(obj.data);
	}
	else xmlhttp.send();
}

function handleEvent(e, target, tried, type) {
    var path = e.path || (e.composedPath && e.composedPath());
    if(!path) {
        var path = [target];
        var parent = target.parentElement;
        while(parent != null) {
            path.push(parent);
            try {
                parent = parent.parentElement;
            } catch(e){break;}
        }
    }
    if(path) {
        for(var y = 0; y < path.length; y++) {
            var target = path[y];
            if(dynamicListeners[type] && dynamicListeners[type]["#" + target.id]) {
                dynamicListeners[type]["#" + target.id].call(e, target);
                return;
            } else {
                if(target.classList == undefined) return;
                for(var i = 0; i < target.classList.length; i++) {
                    if(dynamicListeners[type] && dynamicListeners[type]["." + target.classList[i]]) {
                        dynamicListeners[type]["." + target.classList[i]].call(e, target);
                        return;
                    }
                }
            }
        }
    }
}

function addListener(type, element, callback) {
    if(dynamicListeners[type] == undefined) dynamicListeners[type] = {};
    dynamicListeners[type][element] = callback;
}

function removeListener(type, element) {
    delete dynamicListeners[type][element];
}

socket.emit("get_spread");
