
<div align="center" style="padding-bottom: 2rem;">
  <a href="https://dev.egov.gy/dev-tools/umbra" style="padding bottom: 3rem;">
    <img src="images/icons/umbra-black.png" alt="Logo" style="width: 192px; padding: 2rem">
  </a>

  <h1 align="center">Umbra JS API for Frappe</h1>

  <div align="center">
    Hide Frappe UI and Form Elements with Clean Code.
    <br>
    <br>
    <div style="text-align: justify; text-justify: inter-word;">
    Umbra is a lightweight JavaScript utility designed specifically for Frappe forms. It simplifies the process of hiding UI elements you might not need, so you can focus on building custom functionality. Whether you're a junior developer or an experienced pro, Umbra makes it easy to streamline your Frappe interfaces with minimal code.
    </div>
  </div>
</div>

<br><br>
<img src="images/drawings/umbra-tutorial.png" style="padding: 2rem">
<br><br>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
  - [Method 1: CDN (Recommended)](#method-1-cdn-recommended)
  - [Method 2: Git Subtree ()](#method-2-git-subtree-)
    - [Adding Umbra.js as a Git Subtree](#adding-umbrajs-as-a-git-subtree)
    - [Referencing in hooks.py](#referencing-in-hookspy)
  - [Clear Cache](#clear-cache)
- [Usage](#usage)
  - [Actions](#actions)
  - [Timeline](#timeline)
  - [Comment Box](#comment-box)
  - [Sidebar](#sidebar)
  - [Form Fields](#form-fields)
    - [Hiding a Specific Field](#hiding-a-specific-field)
    - [Hiding Multiple Fields](#hiding-multiple-fields)
  - [Form Sections](#form-sections)
    - [Hiding Specific Section](#hiding-specific-section)
    - [Hiding Multiple Sections](#hiding-multiple-sections)
  - [Workspace](#workspace)
    - [Workspace Sidebar](#workspace-sidebar)
    - [New Workspace Button](#new-workspace-button)
    - [Edit Workspace Button](#edit-workspace-button)
  - [List View](#list-view)
    - [List View Sidebar](#list-view-sidebar)
- [Contributing](#contributing)
<!-- - [API Reference](#api-reference) -->
- [Contributing](#contributing)

---

## Overview

Umbra helps you hide common UI components on Frappe forms—such as action buttons, timeline items, comment boxes, and sidebars—using a simple, consistent API. It allows you to specify conditions and permissions that determine when an element should be hidden, giving you full control over your form's appearance.

This utility is especially useful in custom Frappe apps where you want to declutter the interface for your end users.

---

## Features

- **Simple API:** Easily hide elements with one function call.
- **Conditional Hiding:** Use callbacks to determine when elements are hidden (e.g., based on document status).
- **Role-Based Control:** Bypass hiding for users with specific roles.
- **Flexible Filtering:** Customize which timeline items are displayed, including filtering communications.
- **Forced CSS Override:** Ensures elements are hidden even if other styles override your settings.
- **Modular Design:** Separate functions for actions, timeline, comment box, and sidebar.
- **Easy Integration:** Manage Umbra as a Git submodule and reference it in your `hooks.py` for a clean, maintainable project.

---

## Installation

### Method 1: CDN (Recommended)

Reference the `jsdelivr` in your Frappe app’s `hooks.py` to load it on your pages:

```python
app_include_js = [
	"https://cdn.jsdelivr.net/gh/karotkriss/Umbra@latest/umbra.js",
	# Other JS files can be included here
]

```
### Method 2: Git Subtree ()

#### Adding Umbra.js as a Git Subtree

1. **Navigate to Your App’s root:**
	```bash
	cd path/to/your_apps/root/directory

	```

	This creates a new folder called umbra in the public folder that contains the umbra.js module.
2. **Add Umbra.js as a Subtree:**
	```bash
	git subtree add --prefix=path/to/public/js/folder/umbra https://github.com/karotkriss/Umbra.git master --squash

	```


#### Referencing in hooks.py

Reference the Umbra.js file in your Frappe app’s `hooks.py` to load it on your pages:

```python

app_include_js = [
	"/assets/your_app/js/umbra/umbra.js",
	# Other JS files can be included here
]

```

### Clear Cache

```bash
SITE_NAME=localhost #replace this with the name of your site
bench --site $SITE_NAME clear-cache
bench --site $SITE_NAME clear-website-cache
```

> You should now be able to use any Utils method by calling `Utils.[method]` client  side, <br>
> You may also need to clear your browser cache as well. <br>
> Reference to [Usage](#usage) for all a list methods and how to use them.

---

## Usage

Umbra is intended for use in your javascript files or client scripts. Here's some example usage:

```javascript
Umbra.elementToHide({props})
```

>
> All props are optional
>
> You can refer to the JsDoc in the `Umbra.js` file for more details 
> 

### Actions

```javascript
Umbra.actions()
```
Hide the actions button group if certain conditions are met:

```javascript
frappe.ui.form.on('YourDoctype', {
    onload: function(frm) {
        Umbra.actions({
            conditional: cur_frm => cur_frm.doc.status === 'Draft',
            permissions: ['System Manager'],
            debug: true
        });
  }
});

```

### Timeline

```javascript
Umbra.timeline()
```

Filter the timeline to show only specific communication items or all items:

```javascript
// Show only communications for the current user when workflow_state is Draft:
frappe.ui.form.on('YourDoctype', {
    onload: function(frm) {
        Umbra.timeline({
            conditional: () => true,
            filter: {
                communications: {
                    userOnly: true,
                    conditional: () => frm.doc.workflow_state === "Draft"
                }
            },
            extras: {
                hideActivitySwitch: true  // Defaults to true if not specified.
            },
            debug: true
        });
    }
});

```
Or, display all timeline items:

```javascript
frappe.ui.form.on('YourDoctype', {
    onload: function(frm) {
        Umbra.timeline({
            filter: { all: true },
            extras: { hideActivitySwitch: true },
            debug: true
        });
    }
});

```
Or, hide the timeline completely:

```javascript
frappe.ui.form.on('YourDoctype', {
    onload: function(frm) {
        Umbra.timeline({
            filter: { all: true },
            extras: { hideActivitySwitch: true },
            debug: true
        });
    }
});

```

### Comment Box
```javascript
Umbra.comment()
```

Hide the comment box if certain conditions are met:

```javascript
frappe.ui.form.on('YourDoctype', {
    onload: function(frm) {
        Umbra.comment({
            conditional: cur_frm => cur_frm.doc.status === 'Draft',
            permissions: ['System Manager'],
            debug: true
        });
    }
});

```

### Sidebar

```javascript
Umbra.sidebar()
```

Hide the sidebar (the layout section containing the form sidebar):

```javascript
frappe.ui.form.on('YourDoctype', {
    onload: function(frm) {
        Umbra.sidebar({
            conditional: cur_frm => cur_frm.doc.status === 'Draft',
            permissions: ['System Manager'],
            debug: true
        });
    }
});

```

### Form Fields

#### Hiding a Specific Field
```javascript
Umbra.field.name_of_desired_field()
```

Hide the field "my_field" if the document status is 'Draft'
and the current user is not a System Manager.

```javascript
Umbra.field.my_field({
  conditional: (cur_frm) => { return cur_frm.doc.status === "Draft"; },
  permissions: ["System Manager"],
  debug: true
});

```

#### Hiding Multiple Fields
```javascript
Umbra.fields({ fields: ["middle_name", "salary"] });
```

Hide multiple fields "middle_name" and "salary" with conditional logic
and the current user is not the owner/creator of the form.

```javascript
Umbra.fields({
  fields: ["middle_name", "salary"],
  conditional: (frm) => {
    return frappe.session.user !== frm.doc.owner
  },
  debug: true
});

```

### Form Sections

#### Hiding Specific Section
```javascript
Umbra.section.name_of_desired_section()
```

Hide the section "my_section" if the document status is 'Draft'
and the current user is not a System Manager.

```javascript
Umbra.section.my_section({
  conditional: (cur_frm) => { return cur_frm.doc.status === "Draft"; },
  permissions: ["System Manager"],
  debug: true
});

```
#### Hiding Multiple Sections
```javascript
Umbra.sections({ sections: ['section_break_nmki', 'section_break_3ki7'] })
```

Hide sections if the document status is 'Draft'
and the current user is not a System Manager.

```javascript
Umbra.sections({
  sections: ['section_break_nmki', 'section_break_3ki7'],
  conditional: (cur_frm) => { return cur_frm.doc.status === "Draft"; },
  permissions: ["System Manager"],
  debug: true
});

```
	 
### Workspace

> <br>
> :information_source:	The following functions are intended to be used in any one of your `app_included_js` files
> <br>
> <br>

#### Workspace Sidebar
```javascript
Umbra.workspace.sidebar()
```
Hide Workspace sidebar by calling it in a [self-invoked function](https://samah-gaber.medium.com/self-invoking-functions-in-javascript-ea6ee39ba4d8)

```javascript
(() => {
  $(document).ready(() => {
    if (typeof Umbra !== 'undefined' && Umbra.workspace) {
      // Automatically hide the Workspace sidebar
      Umbra.workspace.sidebar();
    } else {
      console.warn("Umbra.workspace is not available.");
    }
  })
})();

```

#### New Workspace Button
```javascript
Umbra.workspace.new()

```
Hide New Workspace Button by calling it in a [self-invoked function](https://samah-gaber.medium.com/self-invoking-functions-in-javascript-ea6ee39ba4d8)
```javascript
(() => {
  $(document).ready(() => {
    if (typeof Umbra !== 'undefined' && Umbra.workspace) {
      // Automatically hide the Create Workspace button
      Umbra.workspace.new();
    } else {
      console.warn("Umbra.workspace is not available.");
    }
  })
})();

```
#### Edit Workspace Button

```javascript
Umbra.workspace.edit()

```
Hide Edit Workspace Edit by calling it in a [self-invoked function](https://samah-gaber.medium.com/self-invoking-functions-in-javascript-ea6ee39ba4d8)

```javascript
(() => {
  $(document).ready(() => {
    if (typeof Umbra !== 'undefined' && Umbra.workspace) {
      // Automatically hide the Create Workspace button
      Umbra.workspace.new();
    } else {
      console.warn("Umbra.workspace is not available.");
    }
  })
})();

```


### List View

> <br>
> :information_source:	The following functions are intended to be used in any one of your `app_included_js` files
> <br>
> <br>

#### List View Sidebar
```javascript
Umbra.list.sidebar()
```
Hide List View sidebar

```javascript
frappe.listview_settings['Your DocType'] = {
  onload(listview) {
    if (typeof Umbra !== 'undefined' && Umbra.list) {
      // Automatically hide the list view sidebar
      Umbra.list.sidebar();
    } else {
      console.warn("Umbra.list is not available.");
    }
  }
}

```
<!-- ---

## API Reference

For a detailed description of each method and its properties, refer to the inline JSDoc comments in the `Umbra.js` file.

- Umbra.actions({props}): Hides the actions button group.
- Umbra.timeline({props}): Filters and displays timeline items based on specified criteria.
- Umbra.comment({props}): Hides the comment box.
- Umbra.sidebar({props}): Hides the sidebar by targeting the layout side section that contains the form sidebar.

> All props are optional -->

---
## Contributing

Contributions are welcome! Please follow these guidelines:

- Fork the repository: Create your own branch for your changes.
- Write clear code: Follow the existing style and include comments.
- Update the README: If you add features, update the documentation.
- Submit a pull request: Provide a clear description of your changes.

---

Umbra is designed to streamline your Frappe development process by making it easier to hide unwanted UI elements. With its modular design and simple integration via Git submodules and hooks.py, Umbra is an ideal utility for developers of all skill levels. Give it a try and see how much cleaner your custom Frappe interfaces can become!