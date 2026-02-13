# Changelog


## [1.8.0] - 2026-02-13
### Added
- **Frappe v16 Support:**
  - Added `getFrappeVersion()` utility to detect Frappe version
  - Added `isV16()` helper to check for Frappe v16+
  - Updated `Umbra.workspace.edit()` with v16-specific ellipsis button handling
  - Updated `Umbra.workspace.new()` with v16-specific ellipsis button handling
  - Updated `Umbra.workspace.sidebar()` with v16-specific sidebar structure support
  - All workspace methods now support optional `v16` prop to manually override version detection

### Fixed
- **Section API Bug Fixes:**
  - Fixed undefined variable reference in `Umbra.section` conditional check (line 911: `conditional` → `props.conditional`)
  - Fixed incorrect variable name in `Umbra.section` error message (line 956: `fieldName` → `sectionName`)

### Changed
- **Code Quality:**
  - Improved code formatting and consistency (quote standardization, line breaks for readability)

## [1.7.0] - 2025-06-03
### Added
- **Child Table Support:** Introduced `Umbra.table.form` namespace to manage UI elements in child table row forms.
  - `Umbra.table.form.controls()`: Hide child table row action controls (e.g., move, insert above/below).
  - `Umbra.table.form.shortcuts()`: Hide the keyboard shortcuts toolbar in the child table row form.

## [1.6.0] - 2025-04-13
### Added
- **Support for multiple fields in one call**
  - Introduced `Umbra.fields()` for hiding multiple fields (requires `Utils.js` or `frappe.utilsPlus`).

## [1.5.1] - 2025-04-13
### Fixed
- **Conditional Prop is now optional when hiding `section` and `field`**
  - Fixed logical error that made conditional prop mandatory. Now defaults to `() => true` if not provided.

## [1.5.0] - 2025-04-13
### Added
- **Support for multiple sections in one call**
  - Introduced `Umbra.sections()` for hiding multiple sections (requires `Utils.js` or `frappe.utilsPlus`).

## [1.4.1] - 2025-04-11
### Fixed
- Patched conditional function run logic for hiding `actions`. Ensured conditional is evaluated correctly to determine display state.

## [1.4.0] - 2025-04-11
### Changed
- **Refactor `Umbra.actions`**
  - Enhanced the logic for dynamically displaying/hiding actions, ensuring a more consistent user experience.
  - Now provides clearer feedback when display conditions aren’t met, improving overall stability.

## [1.3.0] - 2025-04-11
### Changed
- **Refactor `Umbra.field` and `Umbra.section`**
  - Enhanced the logic for dynamically displaying/hiding fields and sections, ensuring a more consistent user experience.
  - Now provides clearer feedback when display conditions aren’t met, improving overall stability. (Relies on Utils.js updates if applicable).

## [1.2.0] - 2025-04-10
### Added
- **List View Support**
  - Introduced `Umbra.list.sidebar()` to hide the list view sidebar.

## [1.1.2] - 2025-04-10
### Fixed
- Disable all console logging in production environments to prevent unintentional log output. Debug logs now only show if `props.debug` is true AND `getEnvironment()` returns "development".

## [1.1.0] - 2025-03-19
### Added
- **Workspace Page Compatibility** with `Umbra.workspace`.
  - `Umbra.workspace.edit()`: Hide the Edit Workspace button.
  - `Umbra.workspace.new()`: Hide the New (Create) Workspace button (corrected from `create` in original changelog).
  - `Umbra.workspace.sidebar()`: Hide the Workspace sidebar.

## [1.0.0] - 2025-03-18
### Added
- Unified API: Consolidated all hiding functions (actions, timeline, comment, sidebar, fields, and sections) into a single, cohesive module.
- Dynamic Field & Section API: Introduced dynamic methods using JavaScript Proxy for hiding fields (`Umbra.field.FIELD_NAME(props)`) and sections (`Umbra.section.SECTION_NAME(props)`).
- Conditional & Permission Controls: Added support for a `conditional` callback and `permissions` array in all APIs so developers can control hiding based on document state and user roles.
- Debug Logging: Improved debug messages across all functions to aid developers in troubleshooting.
### Changed
- Documentation: Updated JSDoc comments and examples to align with the new API design.

## [0.1.0] - 2025-03-06
- Initial Version: Provided basic functionality to hide elements in Frappe forms including actions, timeline items, comment boxes, and sidebars.