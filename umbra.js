/**
 * Umbra.js
 *
 * Hides things.
 * Umbra simplifies hiding elements we might commonly hide in Frappe.
 * 
 * @version 1.4.0
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

	/**
	 * Determines the current running environment.
	 *
	 * This function checks if Frappe's boot information is available to determine
	 * if the application is running in development mode (using the developer_mode flag).
	 * If that is not available, it falls back to checking the window's hostname for common
	 * development hosts such as "localhost" or "127.0.0.1". If neither method provides a 
	 * definitive answer, it defaults to "production".
	 *
	 * @private
	 * @returns {string} Returns "development" if in a development environment, otherwise "production".
	 */
	const getEnvironment = () => {
		// If Frappe boot is available, use its developer_mode flag.
		if (typeof frappe !== 'undefined' && frappe.boot && typeof frappe.boot.developer_mode !== 'undefined') {
			return frappe.boot.developer_mode ? 'development' : 'production';
		}

		if (typeof window !== 'undefined' && window.location && window.location.hostname) {
			const devHosts = ['localhost', '127.0.0.1'];
			return devHosts.includes(window.location.hostname) ? 'development' : 'production';
		}

		return 'production';
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
			if (props.debug && getEnvironment() === "development") console.warn("Umbra.actions(): No doctype specified and window.cur_frm is not available.");
			return;
		}
		props = props || {};

		const { conditional } = props
		if (typeof conditional !== 'undefined' && typeof props.conditional !== "function") {
			if (props.debug && getEnvironment() === "development") {
				console.debug(`Umbra.action(): 'conditional' must be a function.`);
			}
			return;
		}

		if (Array.isArray(props.permissions)) {
			if (userHasRole(props.permissions)) {
				if (props.debug && getEnvironment() === "development") {
					console.debug(`Umbra.actions(): User has bypass role, skipping hide for doctype ${doctype}`);
				}
				return;
			}
		}

		if (typeof conditional !== 'undefined') {
			$(".actions-btn-group").css("cssText", `display: ${!conditional(window.cur_frm) ? 'block' : 'none'}`);
			if (!props.conditional(window.cur_frm)) {
				if (props.debug && getEnvironment() === "development") {
					console.debug(`Umbra.actions(): Conditional check returned false for doctype ${doctype}`);
				}
			}
		} else {
			$(".actions-btn-group").css("cssText", "display: none");
		}

		if (props.debug && getEnvironment() === "development") {
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
				if (debug && getEnvironment() === "development") console.debug("Umbra.timeline: Hiding extra element with class 'show-all-activity'.");
			}
		}

		// Process top-level conditional.
		if (typeof props.conditional !== "undefined") {
			if (typeof props.conditional === "function") {
				if (!props.conditional()) {
					if (debug && getEnvironment() === "development") console.debug("Umbra.timeline: Top-level conditional check returned false. Aborting timeline filtering.");
					processExtras();
					return;
				}
			} else if (props.conditional === false) {
				if (debug && getEnvironment() === "development") console.debug("Umbra.timeline: Top-level conditional is false. Aborting timeline filtering.");
				processExtras();
				return;
			}
		}

		// If no filter prop is provided, hide the entire timeline wrapper (.new-timeline) and process extras.
		if (!props.filter) {
			const $wrapper = $(".new-timeline");
			if ($wrapper.length) {
				$wrapper.hide();
				if (debug && getEnvironment() === "development") console.debug("Umbra.timeline: No filter provided. Hiding entire timeline container (.new-timeline).");
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
				if (debug && getEnvironment() === "development") console.debug("Umbra.timeline: Filter set to all. Displaying all timeline items.");
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
						if (debug && getEnvironment() === "development") console.debug("Umbra.timeline: Communications filter conditional check returned false. Aborting timeline filtering.");
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
			if (debug && getEnvironment() === "development") console.debug(`Umbra.timeline: Found ${$items.length} timeline items.`);
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
			if (debug && getEnvironment() === "development") console.debug(`Umbra.timeline: Found ${commItems.length} communication items.`);

			if (commItems.length === 0) {
				if (debug && getEnvironment() === "development") console.debug("Umbra.timeline: No communication items to process.");
				processExtras();
				return;
			}

			if (!userOnly) {
				$.each(commItemMap, function (name, $elements) {
					$elements.show();
					if (debug && getEnvironment() === "development") console.debug(`Umbra.timeline: Displaying communication ${name} (all communications shown).`);
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
									if (debug && getEnvironment() === "development") console.warn(`Umbra.timeline: Communication record not found for ${name}`);
								}
								if (shouldDisplay) {
									$elements.show();
									if (debug && getEnvironment() === "development") console.debug(`Umbra.timeline: Displaying communication ${name} for current user.`);
								} else {
									if (debug && getEnvironment() === "development") console.debug(`Umbra.timeline: Hiding communication ${name} not meant for current user.`);
								}
							});
							processExtras();
						} else {
							if (debug && getEnvironment() === "development") console.warn("Umbra.timeline: Error fetching communication records.");
							processExtras();
						}
					},
					error: function (err) {
						if (debug && getEnvironment() === "development") console.warn("Umbra.timeline: Error during frappe.call", err);
						processExtras();
					}
				});
				return;
			}
		} else {
			const $wrapper = $(".new-timeline");
			if ($wrapper.length) {
				$wrapper.hide();
				if (debug && getEnvironment() === "development") console.debug("Umbra.timeline: Unrecognized filter. Hiding entire timeline container (.new-timeline).");
			} else {
				if (debug && getEnvironment() === "development") console.warn("Umbra.timeline: Timeline wrapper (.new-timeline) not found.");
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
			if (props.debug && getEnvironment() === "development") console.warn("Umbra.comment(): No doctype specified and window.cur_frm is not available.");
			return;
		}

		props = props || {};
		if (typeof props.conditional === "function") {
			if (!props.conditional(window.cur_frm)) {
				if (props.debug && getEnvironment() === "development") {
					console.debug(`Umbra.comment(): Conditional check returned false for doctype ${doctype}`);
				}
				return;
			}
		}
		if (Array.isArray(props.permissions)) {
			if (userHasRole(props.permissions)) {
				if (props.debug && getEnvironment() === "development") {
					console.debug(`Umbra.comment(): User has bypass role, skipping comment hiding for doctype ${doctype}`);
				}
				return;
			}
		}
		$(".comment-box").css("cssText", "display: none !important;");
		if (props.debug && getEnvironment() === "development") {
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
			if (props.debug && getEnvironment() === "development") console.warn("Umbra.sidebar(): No doctype specified and window.cur_frm is not available.");
			return;
		}

		props = props || {};


		if (typeof props.conditional === "function") {
			if (!props.conditional(window.cur_frm)) {
				if (props.debug && getEnvironment() === "development") {
					console.debug(`Umbra.sidebar(): Conditional check returned false for doctype ${doctype}`);
				}
				return;
			}
		}

		// Check permissions; if the current user has any of the bypass roles, skip hiding.
		if (Array.isArray(props.permissions)) {
			if (userHasRole(props.permissions)) {
				if (props.debug && getEnvironment() === "development") {
					console.debug(`Umbra.sidebar(): User has bypass role, skipping sidebar hiding for doctype ${doctype}`);
				}
				return;
			}
		}

		$(".layout-side-section:has(.form-sidebar)").css("cssText", "display: none !important;");
		$("button.sidebar-toggle-btn").css("cssText", "display: none !important;");
		if (props.debug && getEnvironment() === "development") {
			console.debug(`Umbra.sidebar(): Sidebar hidden for doctype ${doctype}`);
		}
	}

	// ----------------------------
	// Form Field
	// ----------------------------
	/**
	 * Dynamic API to hide individual fields in a Frappe form.
	 * 
	 * You can call this as:
	 *     Umbra.field.FIELD_NAME(props);
	 * 
	 * where `FIELD_NAME` is the actual fieldname you wish to hide.
	 * 
	 * Utils.js is a dependency of this API
	 * 
	 * @namespace Umbra.field
	 * 
	 * @function
	 * 
	 * @param {Object} [props] - Configuration options.
	 * @param {Function} [props.conditional] - A callback that returns a boolean and determines whether the field should be hidden.
	 * @param {string[]} [props.permissions] - An array of role names. If the current user has any of these roles,
	 *     the field will not be hidden.
	 * @param {boolean} [props.debug=false] - If true, outputs debug information to the console.
	 *
	 * @example
	 * // Hide the field "my_field" if the document status is 'Draft'
	 * // and the current user is not a System Manager.
	 * Umbra.field.my_field({
	 *   conditional: function(cur_frm) { return cur_frm.doc.status === "Draft"; },
	 *   permissions: ["System Manager"],
	 *   debug: true
	 * });
	 */
	const field = new Proxy({}, {
		get(target, fieldName) {
			return function (props = {}) {
				// Check if Utils is available
				if (typeof Utils === 'undefined') {
					if (props.debug && getEnvironment() === "development") {
						console.warn("Umbra.field: Utils module is not available.\nhttps://github.com/karotkriss/Utils");
						frappe.show_alert("Utils module is missing. Please include Utils.js.");
					}
					return;
				}

				// Check conditional prop
				if (typeof props.conditional !== "function") {
					if (props.debug && getEnvironment() === "development") {
						console.debug(`Umbra.field.${fieldName}(): 'conditional' must be a function.`);
					}
					return;
				}

				// Check permissions prop: if user has any bypass role, skip hiding
				if (Array.isArray(props.permissions)) {
					if (userHasRole(props.permissions)) {
						if (props.debug && getEnvironment() === "development") {
							console.debug(`Umbra.field.${fieldName}(): User has bypass role, skipping field hiding.`);
						}
						return;
					}
				}

				// Check if the field exists and is not a Tab Break, Section Break, or Column Break.
				const frm = cur_frm;
				if (frm && frm.fields_dict && frm.fields_dict[fieldName]) {
					const fieldDef = frm.fields_dict[fieldName].df;
					const fieldType = fieldDef.fieldtype;
					if (["Tab Break", "Section Break", "Column Break"].includes(fieldType)) {
						console.warn(`Umbra.field.${fieldName}(): Field type "${fieldType}" cannot be hidden using Umbra.field.`);
						frappe.show_alert({
							message: `Field "${fieldName}" is a ${fieldType} and cannot be hidden using Umbra.field.`,
							indicator: 'warning'
						});
						return;
					}
				} else {
					if (props.debug && getEnvironment() === "development") {
						console.warn(`Umbra.field.${fieldName}(): Field not found in current form.`);
						frappe.show_alert(`Field "${fieldName}" not found in current form.`);
					}
					return;
				}

				// Hide the field using Utils.hideFields.
				Utils.hideFields({ fields: [fieldName], conditional: props.conditional, debug: props.debug });

				if (props.debug && getEnvironment() === "development") {
					console.debug(`Umbra.field.${fieldName}(): Field "${fieldName}" hidden.`);
				}
			};
		}
	})

	// ----------------------------
	// Form Section
	// ----------------------------
	/**
	 * Dynamic API to hide individual sections in a Frappe form.
	 *
	 * You can call this as:
	 *     Umbra.section.SECTION_NAME(props);
	 *
	 * where `SECTION_NAME` is the actual fieldname of the section you wish to hide.
	 * This API depends on Utils.js.
	 *
	 * @namespace Umbra.section
	 * 
	 * @function
	 * 
	 * @param {Object} [props] - Configuration options.
	 * @param {Function} [props.conditional] - A callback that returns a boolean and determines whether the section should be hidden.
	 * @param {string[]} [props.permissions] - An array of role names. If the current user has any of these roles,
	 *     the section will not be hidden.
	 * @param {boolean} [props.debug=false] - If true, outputs debug information to the console.
	 *
	 * @example
	 * // Hide the section "my_section" if the document status is 'Draft'
	 * // and the current user is not a System Manager.
	 * Umbra.section.my_section({
	 *   conditional: function(cur_frm) { return cur_frm.doc.status === "Draft"; },
	 *   permissions: ["System Manager"],
	 *   debug: true
	 * });
	 */
	const section = new Proxy({}, {
		get(target, sectionName) {
			return function (props = {}) {
				// Check if Utils is available
				if (typeof Utils === 'undefined') {
					if (props.debug && getEnvironment() === "development") {
						console.warn("Umbra.section: Utils module is not available.\nhttps://github.com/karotkriss/Utils");
						frappe.show_alert("Utils module is missing. Please include Utils.js.");
					}
					return;
				}
				// Check conditional prop
				if (typeof props.conditional !== "function") {
					if (props.debug && getEnvironment() === "development") {
						console.debug(`Umbra.section.${sectionName}(): 'conditional' must be a function.`);
					}
					return;
				}
				// Check permissions prop: if user has any bypass role, skip hiding
				if (Array.isArray(props.permissions) && userHasRole(props.permissions)) {
					if (props.debug && getEnvironment() === "development") {
						console.debug(`Umbra.section.${sectionName}(): User has bypass role, skipping section hiding.`);
					}
					return;
				}
				// Check if the section exists and is a Section Break
				const frm = cur_frm;
				if (frm && frm.fields_dict && frm.fields_dict[sectionName]) {
					const fieldDef = frm.fields_dict[sectionName].df;
					const fieldType = fieldDef.fieldtype;
					if (fieldType !== "Section Break") {
						if (props.debug && getEnvironment() === "development") {
							console.warn(`Umbra.section.${sectionName}(): Field type "${fieldType}" is not a Section Break.`);
							frappe.show_alert({
								message: `Field "${fieldName}" is a ${fieldType} and cannot be hidden using Umbra.section.`,
								indicator: 'warning'
							});
						}
						return;
					}
				} else {
					if (props.debug && getEnvironment() === "development") {
						console.warn(`Umbra.section.${sectionName}(): Section not found in current form.`);
						frappe.show_alert(`Section "${sectionName}" not found in current form.`);
					}
					return;
				}
				// Hide the section using Utils.hideFields.
				Utils.hideFields({ fields: [sectionName], conditional: props.conditional, debug: props.debug });
				if (props.debug && getEnvironment() === "development") {
					console.debug(`Umbra.section.${sectionName}(): Section "${sectionName}" hidden.`);
				}
			};
		}
	})

	// ----------------------------
	// Workspace
	// ----------------------------
	/**
	 * Dynamic API to hide individual elements for the /app route.
	 * 
	 * @namespace Umbra.workspace
	* (() => {
	*   $(document).ready(() => {
	*     // Automatically hide the Create Workspace button
	*     Umbra.workspace.new();
	*   } else {
	*     console.warn("Umbra.workspace is not available.");
	*   }
	* })();
	 * 
	 */
	const workspace = {
		// ----------------------------
		// Edit Workspace Button
		// ----------------------------
		/**
		 * Hides the Edit Workspace button.
		 *
		 * @param {Object} [props] - Configuration options.
		 * @param {Function} [props.conditional] - A callback that returns a boolean and determines whether the edit button should be hidden
		 * @param {string[]} [props.permissions] - An array of role names. If the current user has any of these roles,
		 *        the edit button will not be hidden.
		 * @param {boolean} [props.debug=false] - If true, outputs debug information to the console.
		 *
		 * @example
		 
		 */
		edit: function (props = {}) {
			if (typeof props.conditional === "function") {
				if (!props.conditional()) {
					if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.edit(): Conditional check returned false.");
					return;
				}
			}

			if (Array.isArray(props.permissions) && typeof frappe !== 'undefined' && frappe.user) {
				if (userHasRole(props.permissions)) {
					if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.edit(): User has bypass role, skipping hide.");
					return;
				}
			}
			// Hide the Edit Workspace button.
			const $btn = $('[data-page-route=Workspaces] .workspace-footer').find('[data-label="Edit"]');
			if (!$btn.length) {
				if (props.debug && getEnvironment() === "development") {
					console.warn("Umbra.workspace.edit(): Edit workspace button not found.");
					frappe.show_alert("Edit workspace button not found.");
				}
				return;
			}
			$btn.css("cssText", "display: none !important;");
			if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.edit(): Edit workspace button hidden.");
		},
		// ----------------------------
		// Edit Workspace Button
		// ----------------------------
		/**
		 * Hides the New Workspace button.
		 *
		 * @param {Object} [props] - Configuration options.
		 * @param {Function} [props.conditional] - A callback that returns a boolean and determines whether the new button should be hidden
		 * @param {string[]} [props.permissions] - An array of role names. If the current user has any of these roles,
		 *        the create button will not be hidden.
		 * @param {boolean} [props.debug=false] - If true, outputs debug information to the console.
		 *
		 * @example
		 * (() => {
		 *   $(document).ready(() => {
		 *     // Automatically hide the Create Workspace button
		 *     Umbra.workspace.new();
		 *   } else {
		 *     console.warn("Umbra.workspace is not available.");
		 *   }
		 * })();
		 */
		new: function (props = {}) {
			if (typeof props.conditional === "function") {
				if (!props.conditional()) {
					if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.new(): Conditional check returned false.");
					return;
				}
			}
			if (Array.isArray(props.permissions) && typeof frappe !== 'undefined' && frappe.user) {
				if (userHasRole(props.permissions)) {
					if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.new(): User has bypass role, skipping hide.");
					return;
				}
			}

			const $btn = $('[data-page-route=Workspaces] .workspace-footer').find('[data-label="New"]');
			if (!$btn.length) {
				if (props.debug && getEnvironment() === "development") {
					console.warn("Umbra.workspace.new(): Create workspace button not found.");
					frappe.show_alert("Create workspace button not found.");
				}
				return;
			}
			$btn.css("cssText", "display: none !important;");
			if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.new(): Create workspace button hidden.");
		},

		// ----------------------------
		// Workspace Sidebar
		// ----------------------------
		/**
		 * Hides the Workspace sidebar.
		 *
		 * @param {Object} [props] - Configuration options.
		 * @param {Function} [props.conditional] - A callback that returns a boolean and determines whether the workspace sidebar should be hidden
		 * @param {string[]} [props.permissions] - An array of role names. If the current user has any of these roles,
		 *        the sidebar will not be hidden.
		 * @param {boolean} [props.debug=false] - If true, outputs debug information to the console.
		 *
		 * @example
		 * (() => {
		 *   $(document).ready(() => {
		 *     if (typeof Umbra !== 'undefined' && Umbra.workspace) {
		 *       // Automatically hide the Workspace sidebar
		 *       Umbra.workspace.sidebar();
		 *     } else {
		 *       console.warn("Umbra.workspace is not available.");
		 *     }
		 *   })
		 * })();
		 */
		sidebar: function (props = {}) {
			if (typeof props.conditional === "function") {
				if (!props.conditional()) {
					if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.sidebar(): Conditional check returned false.");
					return;
				}
			}
			if (Array.isArray(props.permissions) && typeof frappe !== 'undefined' && frappe.user) {
				if (userHasRole(props.permissions)) {
					if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.sidebar(): User has bypass role, skipping hide.");
					return;
				}
			}

			const $sidebar = $('[data-page-route=Workspaces] .layout-side-section');
			if (!$sidebar.length) {
				if (props.debug && getEnvironment() === "development") {
					console.warn("Umbra.workspace.sidebar(): Workspace sidebar not found.");
					frappe.show_alert("Workspace sidebar not found.");
				}
				return;
			}
			$sidebar.css("cssText", "display: none !important;");

			$("button.sidebar-toggle-btn").css("cssText", "display: none !important;");
			if (props.debug && getEnvironment() === "development") console.debug("Umbra.workspace.sidebar(): Workspace sidebar hidden.");
		}
	};


	// ----------------------------
	// List
	// ----------------------------
	/**
	 * Dynamic API to hide individual elements for the * list routes (list view).
	 * 
	 * @namespace Umbra.list
	 * 
	 */
	const list = {
		// ----------------------------
		// List Sidebar
		// ----------------------------
		/**
		 * Hides the list view sidebar.
		 *
		 * @param {Object} [props] - Configuration properties.
		 * @param {Function} [props.conditional] - A callback that returns a boolean and determines whether the list sidebar should be hidden
		 * @param {string[]} [props.permissions] - An array of role names. If the current user has any of these roles,
		 *        the sidebar will not be hidden.
		 * @param {boolean} [props.debug=false] - If true, outputs debug information to the console.
		 *
		 * @example
		 * (() => {
		 *   $(document).ready(() => {
		 *     if (typeof Umbra !== 'undefined' && Umbra.list) {
		 *       // Automatically hide the list view sidebar
		 *       Umbra.list.sidebar();
		 *     } else {
		 *       console.warn("Umbra.list is not available.");
		 *     }
		 *   })
		 * })();
		 */
		sidebar: function (props = {}) {
			if (typeof props.conditional === "function") {
				if (!props.conditional()) {
					if (props.debug && getEnvironment() === "development") console.debug("Umbra.list.sidebar(): Conditional check returned false.");
					return;
				}
			}
			if (Array.isArray(props.permissions) && typeof frappe !== 'undefined' && frappe.user) {
				if (userHasRole(props.permissions)) {
					if (props.debug && getEnvironment() === "development") console.debug("Umbra.list.sidebar(): User has bypass role, skipping hide.");
					return;
				}
			}

			const $sidebar = $('[data-page-route^="List"] .layout-side-section');
			if (!$sidebar.length) {
				if (props.debug && getEnvironment() === "development") {
					console.warn("Umbra.list.sidebar(): List View sidebar not found.");
					frappe.show_alert("List View sidebar not found.");
				}
				return;
			}
			$sidebar.css("cssText", "display: none !important;");

			$("[data-page-route^='List'] button.sidebar-toggle-btn").css("cssText", "display: none !important;");
			if (props.debug && getEnvironment() === "development") console.debug("Umbra.list.sidebar(): List sidebar hidden.");
		}
	};


	// Expose public API methods.
	return {
		actions: actions,
		timeline: timeline,
		comment: comment,
		sidebar: sidebar,
		field: field,
		section: section,
		workspace: workspace,
		list: list
	};
})();

// If using ES modules, you can export Umbra as the default export.
// export default Umbra;
