# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-08

### Added

- Country flag metadata for every country in the world catalog
- New `getCountryFlag()`, `getCountryPresentation()`, and `getCountryCustomizationProfile()` APIs
- International checkout and localization helpers for shipping, tax, and address customization flows
- Stronger documentation for GitHub and npm consumers, including flag-first examples and real-world country profile usage

### Changed

- Expanded the public country model with richer display metadata and personalization support
- Improved README content to emphasize global usability, not region-specific behavior
- Cleaned lint and formatting checks for generated build artifacts

## 1.0.0 (2026-11-07)

### Bug Fixes

- update ESLint configuration to import URL and include examples in TypeScript config ([13a63a0](https://github.com/shamsad-alam-meraj/country-rules/commit/13a63a0cab8bc6c2de94f8675b4f86fd2fbf879a))

## [Unreleased]

### Added

- Initial TypeScript-first country metadata package scaffold
- Core country lookup, address, postal, phone, currency, locale, and coverage APIs
- Data provenance and verification metadata
- CI and release automation for npm publishing

## [1.0.0] - 2026-11-08

### Added

- Initial public release of `country-rules`
- Curated country metadata and rule sets for priority countries
- ESM and CommonJS builds with TypeScript declarations
- Test and build verification pipeline
