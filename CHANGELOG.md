# Changelog

## [1.1.0] - 2025-03-19

### Added

- Compatibility for workspace pages with `Umbra.workspace`.
  - `Umbra.workspace.edit()`: Hide the Edit Workspace button.
  - `Umbra.workspace.create()`: Hide the Create Workspace button.
  - `Umbra.workspace.sidebar()`: Hide the Workspace sidebar.

## [1.0.0] - 2025-03-18

### Added

- Unified API: Consolidated all hiding functions (actions, timeline, comment, sidebar, fields, and sections) into a single, cohesive module.
- Dynamic Field & Section API: Introduced dynamic methods using JavaScript Proxy for hiding fields (Umbra.field.FIELD_NAME(props)) and sections (Umbra.section.SECTION_NAME(props)).
- Conditional & Permission Controls: Added support for a conditional callback and permissions array in all APIs so developers can control hiding based on document state and user roles.
- Debug Logging: Improved debug messages across all functions to aid developers in troubleshooting.

### Changed

- Documentation: Updated JSDoc comments and examples to align with the new API design.

## [0.1.0] - 2025-03-06

- Initial Version: Provided basic functionality to hide elements in Frappe forms including actions, timeline items, comment boxes, and sidebars.