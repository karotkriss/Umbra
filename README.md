<br>
<div align="center" style="padding-bottom: 2rem;">
  <a href="https://dev.egov.gy/dev-tools/umbra" style="padding-bottom: 1rem;">
    <img src="images/icons/umbra-black.png" alt="Logo height="192">
  </a>

  <h1 align="center">Umbra JS API for Frappe</h1>

  <div align="center">
    Hide Frappe UI Elements with Clean Code.
    <br>
    <br>
    <div style="text-align: justify; text-justify: inter-word;">
    Umbra is a lightweight JavaScript utility designed specifically for Frappe forms. It simplifies the process of hiding UI elements you might not need, so you can focus on building custom functionality. Whether you're a junior developer or an experienced pro, Umbra makes it easy to streamline your Frappe interfaces with minimal code.
    </div>
  </div>
</div>





---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Actions](#actions)
  - [Timeline](#timeline)
  - [Comment Box](#comment-box)
  - [Sidebar](#sidebar)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

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

Umbra is distributed as a standalone JavaScript module. The recommended approach is to include it as a Git submodule in your custom Frappe app. This allows you to keep Umbra’s code separate, update it easily, and reference it alongside your other JavaScript assets.

### Adding Umbra as a Git Submodule

1. **Navigate to Your App’s Public JS Folder:**

   Open your terminal and change to the directory where your app’s JavaScript files reside (typically `your_app/public/js`):

   ```bash
   cd path/to/your_app/public/js
   ```

2. **Add Umbra as a Submodule:**

    Run the following command (replace the URL with Umbra’s repository URL):

    ```bash
    git submodule add https://dev.egov.gy/dev-tools/umbra umbra
    ```
    This creates a new folder called `umbra` inside your `public/js` directory that contains the Umbra module.

3. **Initialize the Submodule (for New Clones):**

    When you or others clone your repository, run:

    ```bash
    git submodule update --init --recursive
    ```
    This ensures Umbra is downloaded along with your custom app.

### Referencing Umbra via hooks.py

Frappe best practices recommend including your JavaScript assets in your app’s `hooks.py` file. You can specify multiple JS files by listing them in an array. For example, add the following to your `hooks.py`:

```python
app_include_js = [
    "/assets/your_app/js/umbra/umbra.js",
    # Include any other JS files your app needs
]
```
This configuration ensures that Umbra loads on every page where your app is active.

---

## Usage

Umbra is intended for use in your Frappe form's onload hook. Here are some common use cases:

### Actions

Hide the actions button group based on a condition:

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

---

## API Reference

For a detailed description of each method and its properties, refer to the inline JSDoc comments in the `Umbra.js` file.

- Umbra.actions({props}): Hides the actions button group.
- Umbra.timeline({props}): Filters and displays timeline items based on specified criteria.
- Umbra.comment({props}): Hides the comment box.
- Umbra.sidebar({props}): Hides the sidebar by targeting the layout side section that contains the form sidebar.

> All props are optional

---
## Contributing

Contributions are welcome! Please follow these guidelines:

Fork the repository: Create your own branch for your changes.
Write clear code: Follow the existing style and include comments.
Update the README: If you add features, update the documentation.
Submit a pull request: Provide a clear description of your changes.

---

Umbra is designed to streamline your Frappe development process by making it easier to hide unwanted UI elements. With its modular design and simple integration via Git submodules and hooks.py, Umbra is an ideal utility for developers of all skill levels. Give it a try and see how much cleaner your custom Frappe interfaces can become!