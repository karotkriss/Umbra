/**
 * Umbra.js
 *
 * Hides things.
 * Umbra simplifies hiding elements we might commonly hide in Frappe forms.
 * 
 * @version 0.1.0
 *
 * @module Umbra
 */
const Umbra = (function () {
	/**
	 * Checks if the current user has any of the specified roles.
	 *
	 * @private
	 * @param {string[]} roles - Array of role names to check.
	 * @returns {boolean} True if the user has at least one of the roles, false otherwise.
	 */
	function userHasRole(roles) {
		if (!roles || !Array.isArray(roles)) return false;
		for (let i = 0; i < roles.length; i++) {
			if (frappe.user.has_role(roles[i])) {
				return true;
			}
		}
		return false;
	}

	// ----------------------------
	// Actions
	// ----------------------------
	/**
	 * Controls the visibility of the actions button group for the current doctype.
	 *
	 * Props are:
	 * - conditional: a callback receiving window.cur_frm; returns true to hide actions.
	 * - permissions: an array of role names; if the current user has any, the hide behavior is bypassed.
	 * - debug: if true, outputs debug information.
	 *
	 * @param {Object} [props] - Optional properties to control behavior.
	 * @param {Function} [props.conditional] - Callback receiving window.cur_frm; return true to hide actions.
	 * @param {string[]} [props.permissions] - Array of roles; if the user has any, the hide behavior is bypassed.
	 * @param {boolean} [props.debug=false] - Enable debug logging.
	 *
	 * @example
	 * frappe.ui.form.on('Meat', {
	 *   onload: function(frm) {
	 *     if (typeof Umbra !== 'undefined') {
	 *       Umbra.actions({
	 *         conditional: function(cur_frm) {
	 *           return cur_frm.doc.status === 'Draft';
	 *         },
	 *         permissions: ['System Manager'],
	 *         debug: true
	 *       });
	 *     }
	 *   }
	 * });
	 */
	function actions(props) {
		let doctype;
		if (window.cur_frm && window.cur_frm.doctype) {
			doctype = window.cur_frm.doctype;
		} else {
			console.warn("Umbra.actions(): No doctype specified and window.cur_frm is not available.");
			return;
		}
		props = props || {};
		if (typeof props.conditional === "function") {
			if (!props.conditional(window.cur_frm)) {
				if (props.debug) {
					console.debug(`Umbra.actions(): Conditional check returned false for doctype ${doctype}`);
				}
				return;
			}
		}
		if (Array.isArray(props.permissions)) {
			if (userHasRole(props.permissions)) {
				if (props.debug) {
					console.debug(`Umbra.actions(): User has bypass role, skipping hide for doctype ${doctype}`);
				}
				return;
			}
		}

		$(".actions-btn-group").css("cssText", "display: none !important;");
		if (props.debug) {
			console.debug(`Umbra.actions(): Actions hidden for doctype ${doctype}`);
		}
	}

	// ----------------------------
	// Timeline
	// ----------------------------
	/**
	 * Filters the standard Frappe timeline.
	 *
	 * When called with a filter object, this function can:
	 *  - Display only Communication timeline items.
	 *  - Optionally restrict those communications to only those relevant to the current user,
	 *    by setting `userOnly` to true.
	 *  - Optionally use a conditional callback (via the communications filter) to decide whether to apply filtering.
	 *  - Alternatively, if the filter has an "all" property set to true, it displays all timeline items.
	 *
	 * Additionally, a top-level conditional property (props.conditional) can be provided to decide whether
	 * timeline filtering should proceed at all.
	 *
	 * An extras property can be provided to hide extra timeline UI elements:
	 *  - hideActivitySwitch: if true, hides elements with class "show-all-activity" (defaults to true).
	 *
	 * If no filter is provided or the filter isn't recognized, the entire timeline is hidden by
	 * hiding the wrapper element with the class "new-timeline".
	 *
	 * @param {Object} [props] - Optional properties to control timeline behavior.
	 * @param {boolean|Function} [props.conditional] - Top-level conditional; if false or returns false, aborts filtering.
	 * @param {Object} [props.filter] - Filter configuration.
	 * @param {boolean} [props.filter.all] - If true, display all timeline items.
	 * @param {Object} [props.filter.communications] - Configuration for filtering Communication items.
	 * @param {boolean} [props.filter.communications.userOnly=false] - When true, only displays communications
	 *   for which the current user (frappe.session.user) is the sender or included in the recipients.
	 * @param {Function} [props.filter.communications.conditional] - A callback that returns true if the
	 *   communications filter should proceed.
	 * @param {Object} [props.extras] - Configuration for hiding extra timeline UI elements.
	 * @param {boolean} [props.extras.hideActivitySwitch=true] - If true, hides elements with class "show-all-activity".
	 * @param {boolean} [props.debug=false] - Enable debug logging.
	 *
	 * @example
	 * // To filter timeline to show only communications relevant to the current user
	 * // (only if the document's workflow_state is "Draft") and hide extra elements:
	 * Umbra.timeline({
	 *   filter: {
	 *     communications: {
	 *       userOnly: true,
	 *       conditional: () => frm.doc.workflow_state === "Draft"
	 *     }
	 *   },
	 *   extras: {
	 *     hideActivitySwitch: true
	 *   },
	 *   debug: true,
	 *   conditional: () => true  // Top-level conditional: must return true to process filtering.
	 * });
	 *
	 * // To display all timeline items:
	 * Umbra.timeline({
	 *   filter: {
	 *     all: true
	 *   },
	 *   extras: {
	 *     hideActivitySwitch: true
	 *   },
	 *   debug: true
	 * });
	 *
	 * // If no filter is provided, the timeline is hidden by hiding the .new-timeline container.
	 */
	function timeline(props) {
		props = props || {};
		const debug = props.debug || false;

		function processExtras() {
			let hideActivitySwitch = true;
			if (props.extras && typeof props.extras === "object") {
				if (typeof props.extras.hideActivitySwitch !== "undefined") {
					hideActivitySwitch = props.extras.hideActivitySwitch;
				}
			}
			if (hideActivitySwitch) {
				$(".show-all-activity").css("cssText", "display: none !important;");
				if (debug) console.debug("Umbra.timeline: Hiding extra element with class 'show-all-activity'.");
			}
		}

		// Process top-level conditional.
		if (typeof props.conditional !== "undefined") {
			if (typeof props.conditional === "function") {
				if (!props.conditional()) {
					if (debug) console.debug("Umbra.timeline: Top-level conditional check returned false. Aborting timeline filtering.");
					processExtras();
					return;
				}
			} else if (props.conditional === false) {
				if (debug) console.debug("Umbra.timeline: Top-level conditional is false. Aborting timeline filtering.");
				processExtras();
				return;
			}
		}

		// If no filter prop is provided, hide the entire timeline wrapper (.new-timeline) and process extras.
		if (!props.filter) {
			const $wrapper = $(".new-timeline");
			if ($wrapper.length) {
				$wrapper.hide();
				if (debug) console.debug("Umbra.timeline: No filter provided. Hiding entire timeline container (.new-timeline).");
			} else {
				console.warn("Umbra.timeline: Timeline wrapper (.new-timeline) not found.");
			}
			processExtras();
			return;
		}

		// Check if filter.all is true - display all timeline items.
		if (props.filter.all) {
			const $timelineContainer = $(".timeline-items");
			if ($timelineContainer.length) {
				$timelineContainer.find(".timeline-item").show();
				if (debug) console.debug("Umbra.timeline: Filter set to all. Displaying all timeline items.");
			} else {
				console.warn("Umbra.timeline: Timeline container (.timeline-items) not found.");
			}
			processExtras();
			return;
		}

		if (typeof props.filter === "object" && props.filter.communications) {
			const communicationsFilter = props.filter.communications;
			const userOnly = communicationsFilter.userOnly || false;

			if (typeof communicationsFilter.conditional === "function") {
				try {
					if (!communicationsFilter.conditional()) {
						if (debug) console.debug("Umbra.timeline: Communications filter conditional check returned false. Aborting timeline filtering.");
						processExtras();
						return;
					}
				} catch (e) {
					console.warn("Umbra.timeline: Error in communications filter conditional function.", e);
					processExtras();
					return;
				}
			}

			const $timelineContainer = $(".timeline-items");
			if (!$timelineContainer.length) {
				console.warn("Umbra.timeline: Timeline container (.timeline-items) not found.");
				processExtras();
				return;
			}

			const $items = $timelineContainer.find(".timeline-item");
			if (debug) console.debug(`Umbra.timeline: Found ${$items.length} timeline items.`);
			$items.hide();

			const commItems = [];
			const commItemMap = {};
			$items.each(function () {
				const $item = $(this);
				if ($item.attr("data-doctype") === "Communication") {
					const commName = $item.attr("data-name");
					if (commName) {
						commItems.push(commName);
						if (!commItemMap[commName]) {
							commItemMap[commName] = $();
						}
						commItemMap[commName] = commItemMap[commName].add($item);
					}
				}
			});
			if (debug) console.debug(`Umbra.timeline: Found ${commItems.length} communication items.`);

			if (commItems.length === 0) {
				if (debug) console.debug("Umbra.timeline: No communication items to process.");
				processExtras();
				return;
			}

			if (!userOnly) {
				$.each(commItemMap, function (name, $elements) {
					$elements.show();
					if (debug) console.debug(`Umbra.timeline: Displaying communication ${name} (all communications shown).`);
				});
			} else {
				frappe.call({
					method: "frappe.client.get_list",
					args: {
						doctype: "Communication",
						fields: ["name", "sender", "recipients"],
						filters: [["name", "in", commItems]]
					},
					callback: function (r) {
						if (r.message) {
							const commRecords = {};
							r.message.forEach(rec => {
								commRecords[rec.name] = rec;
							});
							$.each(commItemMap, function (name, $elements) {
								const record = commRecords[name];
								let shouldDisplay = false;
								if (record) {
									const currentUser = frappe.session.user;
									if (record.sender === currentUser) {
										shouldDisplay = true;
									} else {
										const recipients = record.recipients || "";
										const recArr = recipients.split(",").map(s => s.trim());
										if (recArr.indexOf(currentUser) !== -1) {
											shouldDisplay = true;
										}
									}
								} else {
									if (debug) console.warn(`Umbra.timeline: Communication record not found for ${name}`);
								}
								if (shouldDisplay) {
									$elements.show();
									if (debug) console.debug(`Umbra.timeline: Displaying communication ${name} for current user.`);
								} else {
									if (debug) console.debug(`Umbra.timeline: Hiding communication ${name} not meant for current user.`);
								}
							});
							processExtras();
						} else {
							console.warn("Umbra.timeline: Error fetching communication records.");
							processExtras();
						}
					},
					error: function (err) {
						console.warn("Umbra.timeline: Error during frappe.call", err);
						processExtras();
					}
				});
				return;
			}
		} else {
			const $wrapper = $(".new-timeline");
			if ($wrapper.length) {
				$wrapper.hide();
				if (debug) console.debug("Umbra.timeline: Unrecognized filter. Hiding entire timeline container (.new-timeline).");
			} else {
				console.warn("Umbra.timeline: Timeline wrapper (.new-timeline) not found.");
			}
		}
		processExtras();
	}

	// ----------------------------
	// Comment Box
	// ----------------------------
	/**
	 * Hides the comment box element in a Frappe form.
	 *
	 * @param {Object} [props] - Configuration options.
	 * @param {Function} [props.conditional] - A callback that receives window.cur_frm and returns a boolean. If true, the comment box will be hidden.
	 * @param {string[]} [props.permissions] - An array of role names. If the current user has any of these roles, the comment box will not be hidden.
	 * @param {boolean} [props.debug=false] - If true, debug messages are logged to the console.
	 *
	 * @example
	 * frappe.ui.form.on('Meat', {
	 *   onload: function(frm) {
	 *     if (typeof Umbra !== 'undefined') {
	 *       Umbra.comment({
	 *         conditional: cur_frm => cur_frm.doc.status === 'Draft',
	 *         permissions: ['System Manager'],
	 *         debug: true
	 *       });
	 *     }
	 *   }
	 * });
	 */
	function comment(props) {
		let doctype;
		if (window.cur_frm && window.cur_frm.doctype) {
			doctype = window.cur_frm.doctype;
		} else {
			console.warn("Umbra.comment(): No doctype specified and window.cur_frm is not available.");
			return;
		}

		props = props || {};
		if (typeof props.conditional === "function") {
			if (!props.conditional(window.cur_frm)) {
				if (props.debug) {
					console.debug(`Umbra.comment(): Conditional check returned false for doctype ${doctype}`);
				}
				return;
			}
		}
		if (Array.isArray(props.permissions)) {
			if (userHasRole(props.permissions)) {
				if (props.debug) {
					console.debug(`Umbra.comment(): User has bypass role, skipping comment hiding for doctype ${doctype}`);
				}
				return;
			}
		}
		$(".comment-box").css("cssText", "display: none !important;");
		if (props.debug) {
			console.debug(`Umbra.comment(): Comment box hidden for doctype ${doctype}`);
		}
	}
	// ----------------------------
	// Sidebar
	// ----------------------------
	/**
	 * Hides the sidebar element in a Frappe form.
	 * 
	 * If the conditional returns false or the user has any bypass roles (permissions), no action is taken.
	 * Otherwise, the sidebar is forcibly hidden via a CSS override.
	 *
	 * @param {Object} [props] - Optional properties to control the sidebar hiding behavior.
	 * @param {Function} [props.conditional] - A callback function that takes window.cur_frm as an argument
	 *   and should return a boolean. Return true to proceed with hiding the sidebar, or false to skip hiding.
	 * @param {string[]} [props.permissions] - An array of role names. If the current user has any of these roles,
	 *   the sidebar will not be hidden.
	 * @param {boolean} [props.debug=false] - If set to true, the function will output debug messages to the console.
	 *
	 * @example
	 * frappe.ui.form.on('Meat', {
	 *   onload: function(frm) {
	 *     if (typeof Umbra !== 'undefined') {
	 *       Umbra.sidebar({
	 *         conditional: (cur_frm) => cur_frm.doc.status === 'Draft',
	 *         permissions: ['System Manager'],
	 *         debug: true
	 *       });
	 *     }
	 *   }
	 * });
	 */
	function sidebar(props) {
		let doctype;
		if (window.cur_frm && window.cur_frm.doctype) {
			doctype = window.cur_frm.doctype;
		} else {
			console.warn("Umbra.sidebar(): No doctype specified and window.cur_frm is not available.");
			return;
		}

		props = props || {};


		if (typeof props.conditional === "function") {
			if (!props.conditional(window.cur_frm)) {
				if (props.debug) {
					console.debug(`Umbra.sidebar(): Conditional check returned false for doctype ${doctype}`);
				}
				return;
			}
		}

		// Check permissions; if the current user has any of the bypass roles, skip hiding.
		if (Array.isArray(props.permissions)) {
			if (userHasRole(props.permissions)) {
				if (props.debug) {
					console.debug(`Umbra.sidebar(): User has bypass role, skipping sidebar hiding for doctype ${doctype}`);
				}
				return;
			}
		}

		$(".layout-side-section:has(.form-sidebar)").css("cssText", "display: none !important;");
		$("button.sidebar-toggle-btn").css("cssText", "display: none !important;");
		if (props.debug) {
			console.debug(`Umbra.sidebar(): Sidebar hidden for doctype ${doctype}`);
		}
	}


	// Expose public methods.
	return {
		actions: actions,
		timeline: timeline,
		comment: comment,
		sidebar: sidebar
	};
})();

// If using ES modules, you can export Umbra as the default export.
// export default Umbra;
