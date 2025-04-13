# Changelog

## [1.5.0] - 2025-04-10

### Added
- **Support for multiple sections in one call**
  - Introduced `Umbra.sections()` for hiding multiple sections.

## [1.4.1] - 2025-04-11

### Added

- **Fixed**
- patched conditional function run logic for hiding `actions`

## [1.4.0] - 2025-04-11

### Added

- **Refactor**
  - Enhanced the logic for dynamically displaying actions, ensuring a more consistent user experience.
  - Now provides clearer feedback when display conditions aren’t met, improving overall stability.

## [1.3.0] - 2025-04-11

### Fixed

- **Refactor**
  - Enhanced the logic for dynamically displaying fields and sections, ensuring a more consistent user experience.
  - Now provides clearer feedback when display conditions aren’t met, improving overall stability.

## [1.2.0] - 2025-04-10

### Added
- **List View Support**
  - Introduced `Umbra.list.sidebar()` to hide the list view sidebar.

## [1.1.2] - 2025-04-10

### Fixed

- Disable all logging in production environments

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