## [2.14.1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.14.0...v2.14.1) (2026-09-28)


### Bug Fixes

* **skills:** refresh an outdated database in get-style-guide.sh ([79fb485](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/79fb48523c66c533b1eb7e96048f6e5abf4fa7c3))

## [2.14.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.13.0...v2.14.0) (2026-09-28)


### Features

* **skills:** mozaic-style-guide works without the MCP server ([83ac57a](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/83ac57afea3dae0a9ac50e92377dae8a32e5bf71))

## [2.13.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.12.0...v2.13.0) (2026-09-28)


### Features

* **http:** add style guide tools to the MCP Light API ([b430100](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/b4301004123821721367d8d84a0f6bc09ebb9a65))

## [2.12.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.11.1...v2.12.0) (2026-09-28)


### Features

* **cli:** drop the custom installer, use the standard CLIs only ([780f715](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/780f715a4a6eed81a53caf23a080becd3ce93636))

## [2.11.1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.11.0...v2.11.1) (2026-09-28)


### Bug Fixes

* **skills:** escape script arguments in SQL and slim SKILL.md files ([a62643d](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/a62643d0bc5c6fd3c26d10fd928798f990b491f9))

## [2.11.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.10.4...v2.11.0) (2026-09-28)


### Features

* **website:** add style guide and Freemarker tools to the playground ([2874334](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/2874334b8ad6749266a0d7744e13422f088627c5))

## [2.10.4](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.10.3...v2.10.4) (2026-09-28)


### Bug Fixes

* **http:** honor CORS_ORIGINS, report real version, fix Docker build ([8fb09fe](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/8fb09fe58e2f3160c9b9bc47f2d03369b4293967))
* **webcomponents:** generate imports for @mozaic-ds/web-components ([6deefff](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/6deefffc575565c02edd36beb01e1308899afe35))


### Documentation

* bring README, docs, diagrams and website up to date ([17b27db](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/17b27db13e2d8131cda5d7798b9607420af8b7e4))

## [2.10.3](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.10.2...v2.10.3) (2026-09-28)


### Bug Fixes

* **cli:** installer fails when launched through npx ([c72110f](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/c72110fc87c592d9386b2cbfbbba40de4d78fcde))

## [2.10.2](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.10.1...v2.10.2) (2026-09-28)


### Continuous Integration

* make publish re-runnable and retry MCP Registry 5xx ([8eea1a6](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/8eea1a61dab03a3546a21b5f3860986f19289555))

## [2.10.1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.10.0...v2.10.1) (2026-09-28)


### Continuous Integration

* wait for npm before publishing to the MCP Registry ([a6466c0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/a6466c0835371db4b02fc33712decca8338a7c24))

## [2.10.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.9.3...v2.10.0) (2026-09-28)


### Features

* **cli:** harness-agnostic installer and MCP Registry publishing ([e8bdf41](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/e8bdf41a92ec3090eeaba73ab3692c6452365ddb))
* **skills:** follow the Agent Skills spec and use a neutral database path ([211c6f2](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/211c6f2f8235e981c9b9ea2a1ab7f248037c55f8))


### Documentation

* document agent-agnostic install on README and website ([ef48364](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/ef48364d8d86d5a3846038977f56ba26e8a91deb))

## [2.9.3](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.9.2...v2.9.3) (2026-09-28)


### Continuous Integration

* gate DB rebuild on MOZAIC_REPOS_TOKEN ([c31197a](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/c31197ac99da9cdc8dcd777cc40632008f15bfd9))

## [2.9.2](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.9.1...v2.9.2) (2026-09-28)


### Continuous Integration

* authenticate clones of private adeo/mozaic-* repos ([5a0cea2](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/5a0cea265d73c9fd861a354abc5adbccdb1b5f3d))

## [2.9.1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.9.0...v2.9.1) (2026-09-28)


### Continuous Integration

* pin npm 11 in publish workflow ([a60f65f](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/a60f65f048c7d7d682367dd6e88cd054d2402485))

## [2.9.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.8.5...v2.9.0) (2026-09-28)


### Features

* **website:** add Style Guides page and refresh stats ([e4a6095](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/e4a6095b5956321ec64b2e49e349c390e7ec5b45))


### Bug Fixes

* **style-guides:** install skill, validate component slugs, drop wrong screenshot ([aad0434](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/aad043460ffe1cd9ce4c98ee6bd7e3669023129b))


### Continuous Integration

* rebuild database in CI and refresh it daily ([3e16533](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/3e16533d55cae2a340145577fb83c99d93db1db2))


### Chores

* stop tracking Playwright MCP snapshots ([bfc29c8](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/bfc29c8762e53a573f66c29ca6e41b3dcf1076ed))

## [2.8.5](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.8.4...v2.8.5) (2026-09-02)


### Documentation

* add Web Components and Freemarker repos to data-flow diagram ([3df6607](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/3df6607f40967bfb27c01c5b6cdbe3ff542cb5a0))

## [2.8.4](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.8.3...v2.8.4) (2026-09-02)


### Bug Fixes

* stop tracking SQLite WAL/SHM journal files ([870085c](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/870085cd1f1fdeaa822dad7ce2eb4abf2da30983))

## [2.8.3](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.8.2...v2.8.3) (2026-09-02)


### Chores

* add .adeo-ai.json to each skill for ADEO AI Marketplace listing ([b83d618](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/b83d61863b0b9a2c24aa5ac131386f5a091c2838))

## [2.8.2](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.8.1...v2.8.2) (2026-09-02)


### Documentation

* sync DEVELOPMENT.md with shipped Web Components, Freemarker, and HTTP server ([a838615](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/a8386150cd0a6019d49e0e1c580feeac687e243e))

## [2.8.1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.8.0...v2.8.1) (2026-07-02)


### Chores

* trigger release build ([57efa3a](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/57efa3a015e7dcaae00c868dd46f3a0d5213fcd2))

## [2.8.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.7.0...v2.8.0) (2026-05-26)


### Features

* add MCP protocol initialize method to /mcp/light endpoint ([92857a0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/92857a09076ef58e2af7f67fec7584c24e7b02bf))

## [2.7.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.6.0...v2.7.0) (2026-05-26)


### Features

* add JSON-RPC 2.0 endpoint for MCP Light protocol ([04e3d78](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/04e3d78804cd0dd5883f06412f290c677058cb18))

## [2.6.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.5.5...v2.6.0) (2026-05-21)


### Features

* add lightweight /mcp/light controller with 5 token tools ([fa4c6c3](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/fa4c6c395ea4c99925c3240366271a6b8e524f75))
* add MCP Light controller for design tokens and utilities ([bc667c7](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/bc667c75760f8b89cdef59a233de04120410ffea))

## [2.5.5](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.5.4...v2.5.5) (2026-05-20)


### Documentation

* add public API documentation and navigation ([46100b0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/46100b02747738c97248f68164bd63ba1f97f23e))

## [2.5.4](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.5.3...v2.5.4) (2026-05-20)


### Bug Fixes

* add website to workspace to fix GitHub Actions build ([dc42099](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/dc42099328f279fe46b921d5c9c70e3ec476c938))

## [2.5.3](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.5.2...v2.5.3) (2026-05-20)


### Chores

* remove temporary db files and improve MCP message parsing ([b688fc8](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/b688fc8959261d7dafef1dfe4a6de2b5cd15ea4a))

## [2.5.2](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.5.1...v2.5.2) (2026-05-20)


### Chores

* update docs and workflow for website deployment ([771c8ab](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/771c8ab4dd287b1178476c8a320ed6edc984a246))

## [2.5.1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.5.0...v2.5.1) (2026-05-20)


### Bug Fixes

* expose PORT for Dokploy ([526d5ff](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/526d5ff1c68feef56d9349920ea5f67fe78132d9))

## [2.5.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.4.0...v2.5.0) (2026-05-20)


### Features

* add NestJS HTTP wrapper for v0 integration ([558f156](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/558f15613242606a86134bbed1fb49fda3a50126))


### Bug Fixes

* add nixpacks.toml for Dokploy build ([35e3e0b](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/35e3e0b6e081a91685489d263479f412a8f8ce33))
* remove GH_PAT from release workflow ([b891248](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/b89124838898297357629610f2b13a5289f03765))
* skip database build in Dokploy ([c2f58a1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/c2f58a1468191f9eeaad8954d2c870374e8392f8))
* use GH_TOKEN for semantic-release ([2db99a3](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/2db99a333921d83efd3ad3780a924268c94436bd))

## [2.4.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.3.0...v2.4.0) (2026-04-09)


### Features

* add webcomponents and freemarker builders to install options ([1ea0953](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/1ea09536855a9c8a7f54bd2d5e742053c2a5be48))

## [2.3.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.2.0...v2.3.0) (2026-04-09)


### Features

* add Freemarker support with new builder skill and 3 MCP tools ([10977a1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/10977a1b085ec7b5fb46705d0ad6796baa872b4f))

## [2.2.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.1.1...v2.2.0) (2026-04-09)


### Features

* add Web Components support with new skill and 3 MCP tools ([dbc4d12](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/dbc4d126b1f653e2e060ce817ff852b583fe7a84))

## [2.1.1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.1.0...v2.1.1) (2026-04-08)


### Chores

* remove temporary SQLite files ([280ce67](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/280ce67200ec6179d7e2fdf9543db448be06454b))

## [2.1.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.0.7...v2.1.0) (2026-04-08)


### Features

* trigger build to regenerate db ([958b286](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/958b2867f5ae9e5c167e6efc4d8b86e079a7dde7))

## [2.0.7](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.0.6...v2.0.7) (2026-03-23)


### Documentation

* add npm downloads badge ([3284fa1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/3284fa1fbf125532d06c4ceb9bab797fa9e01411))

## [2.0.6](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.0.5...v2.0.6) (2026-03-23)


### Documentation

* add README with project overview and usage ([e5e5cfc](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/e5e5cfccd7cc379a87f3bf54082577b2d7790d0c))

## [2.0.5](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.0.4...v2.0.5) (2026-03-23)


### Chores

* remove mozaic component skills ([052f85a](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/052f85aeb1314c8eb7155e52db5e121b4a74169e))

## [2.0.4](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.0.3...v2.0.4) (2026-03-23)


### Bug Fixes

* trigger automatic publish workflow test ([1f4faeb](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/1f4faebf718b2fe35ddb3d46c5100c042caced50))


### Chores

* update deprecated dependencies ([5ba5b95](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/5ba5b957d7f7c2add0c1e22dfc7cc737313d1f04))

## [2.0.3](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.0.2...v2.0.3) (2026-03-23)


### Chores

* rename package to adeo-mozaic-install-tools ([497599e](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/497599ec0a02aebbde2d2f2ac464f21f5dec81e3))

## [2.0.2](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.0.1...v2.0.2) (2026-03-23)


### Bug Fixes

* use GH_PAT to trigger publish workflow automatically ([e41ca75](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/e41ca754495143ebf3f528a86f100bfd7eca213f))

## [2.0.1](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v2.0.0...v2.0.1) (2026-03-23)


### Chores

* configure semantic-release github plugin ([16213e7](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/16213e7236a8c4916830261e65120db0ae722b84))

## [2.0.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v1.2.0...v2.0.0) (2026-03-23)


### ⚠ BREAKING CHANGES

* Minimum Node.js version updated from 25.0.0 to 25.2.0. Users running older versions of Node.js 25.x will need to upgrade to 25.2.0 or later.

### Features

* update minimum Node.js version requirement ([307330d](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/307330d4cb75fbfd493c79c89d206a29140ad606))

## [1.2.0](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/compare/v1.1.3...v1.2.0) (2026-03-23)


### Features

* enhance Skills page with database visualization ([21f259a](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/21f259a048cb88e589530150ccd86105b701adbc))


### Chores

* update workflows and docs ([9b540e5](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/9b540e59a278bd768ad18aada7e5a1622393be2b))
* update workflows and scripts ([3b7ef7f](https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/commit/3b7ef7fa3ed83dc6e765487413976a5e97c6d641))
