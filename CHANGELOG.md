# Changelog

All notable changes to @rimora/velora will be documented in this file.

## [0.1.8] - Unreleased

### Added
- `folder_path` parameter to `JobCreatePayload` for organizing jobs into folders
- `folder_path` parameter to `JobUpdatePayload` for moving jobs between folders
- `folder_path` parameter to `JobListParams` for filtering jobs by folder
- SDK now sends `folder_path` to the API and returns it in job listings

## [0.1.7] - Previous

### Features
- Initial release
- Job CRUD operations (create, read, update, delete)
- Job control (pause, resume, trigger)
- Job run history
- Webhook triggering with HMAC signature support
- Usage and plan endpoints
