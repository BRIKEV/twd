## <small>1.7.2 (2026-04-21)</small>

* fix(mockBridge): forward `responseHeaders` to `__twdCollectMock` so downstream contract validation can apply Content-Type-aware schema selection.
* fix(screenDom): prioritize known app roots (`#root`, `#app`, `app-root`) and skip empty containers when scoping queries; add `rootSelector` option to `initTWD` for non-standard roots (e.g. sandbox environments that inject overlay siblings).


## <small>1.7.1 (2026-04-15)</small>

* feat(waitFor): make generic to return callback value (#214) ([836695c](https://github.com/BRIKEV/twd/commit/836695c14b7563a1e0c83b61f6ccec13145bf69f)), closes [#214](https://github.com/BRIKEV/twd/issues/214)


## <small>1.7.0 (2026-04-15)</small>

* feat: add twd.waitFor() polling utility (#212) ([f596e4d](https://github.com/BRIKEV/twd/commit/f596e4d)), closes [#212](https://github.com/BRIKEV/twd/issues/212)


## <small>1.6.6 (2026-04-13)</small>

* feat: migrate sidebar inline styles to CSS classes (#211) ([180eab7](https://github.com/BRIKEV/twd/commit/180eab7)), closes [#211](https://github.com/BRIKEV/twd/issues/211)
* fix(userEvent): add unfocused tab fallbacks for keyboard(), clear() and blur (#210) ([6260196](https://github.com/BRIKEV/twd/commit/6260196)), closes [#210](https://github.com/BRIKEV/twd/issues/210)
* chore: add release automation agent ([f1091c2](https://github.com/BRIKEV/twd/commit/f1091c2))
* chore(deps-dev): bump @vitest/coverage-v8 from 4.1.2 to 4.1.4 (#207) ([a96f5c1](https://github.com/BRIKEV/twd/commit/a96f5c1)), closes [#207](https://github.com/BRIKEV/twd/issues/207)
* chore(deps-dev): bump jsdom from 29.0.1 to 29.0.2 (#208) ([1766069](https://github.com/BRIKEV/twd/commit/1766069)), closes [#208](https://github.com/BRIKEV/twd/issues/208)
* chore(deps-dev): bump vite from 8.0.7 to 8.0.8 (#206) ([b968da2](https://github.com/BRIKEV/twd/commit/b968da2)), closes [#206](https://github.com/BRIKEV/twd/issues/206)


## <small>1.6.5 (2026-04-12)</small>

* feat: add unfocused tab fallbacks for clear() and keyboard() in userEvent proxy (#205) ([af6eea2](https://github.com/BRIKEV/twd/commit/af6eea2)), closes [#205](https://github.com/BRIKEV/twd/issues/205)
* feat: send testId with __twdCollectMock for contract validation (#203) ([fc0958c](https://github.com/BRIKEV/twd/commit/fc0958c)), closes [#203](https://github.com/BRIKEV/twd/issues/203)
* feat: redesign homepage with custom Vue component (#188) ([d0f45eb](https://github.com/BRIKEV/twd/commit/d0f45eb)), closes [#188](https://github.com/BRIKEV/twd/issues/188)
* feat(docs): update OG/Twitter meta — ecosystem diagram as social image, refresh descriptions and keywords ([5d44af9](https://github.com/BRIKEV/twd/commit/5d44af9))
* docs: add AI Workflow tutorial and restructure docs (#195) ([643d6a0](https://github.com/BRIKEV/twd/commit/643d6a0)), closes [#195](https://github.com/BRIKEV/twd/issues/195)
* docs: add contract testing page, update CI execution and coverage docs ([98dec30](https://github.com/BRIKEV/twd/commit/98dec30))
* chore(deps): bump preact from 10.29.0 to 10.29.1 (#189) ([4178609](https://github.com/BRIKEV/twd/commit/4178609)), closes [#189](https://github.com/BRIKEV/twd/issues/189)
* chore(deps): bump vite (#191) ([bbb54f0](https://github.com/BRIKEV/twd/commit/bbb54f0)), closes [#191](https://github.com/BRIKEV/twd/issues/191)
* chore(deps): bump lodash and @microsoft/api-extractor (#197) ([46071af](https://github.com/BRIKEV/twd/commit/46071af)), closes [#197](https://github.com/BRIKEV/twd/issues/197)
* chore(deps): bump axios from 1.13.5 to 1.15.0 in /examples/twd-test-app (#204) ([fc6a5cb](https://github.com/BRIKEV/twd/commit/fc6a5cb)), closes [#204](https://github.com/BRIKEV/twd/issues/204)
* chore(deps): bump axios in /examples/tutorial-example (#202) ([51689f0](https://github.com/BRIKEV/twd/commit/51689f0)), closes [#202](https://github.com/BRIKEV/twd/issues/202)
* chore(deps-dev): bump basic-ftp in /examples/tutorial-example (#200) ([bf9a42d](https://github.com/BRIKEV/twd/commit/bf9a42d)), closes [#200](https://github.com/BRIKEV/twd/issues/200)
* chore(deps-dev): bump basic-ftp in /examples/twd-test-app (#201) ([2c319bc](https://github.com/BRIKEV/twd/commit/2c319bc)), closes [#201](https://github.com/BRIKEV/twd/issues/201)
* chore(deps-dev): bump basic-ftp in /examples/twd-test-app (#199) ([fe50d29](https://github.com/BRIKEV/twd/commit/fe50d29)), closes [#199](https://github.com/BRIKEV/twd/issues/199)
* chore(deps-dev): bump basic-ftp in /examples/tutorial-example (#198) ([32e6458](https://github.com/BRIKEV/twd/commit/32e6458)), closes [#198](https://github.com/BRIKEV/twd/issues/198)
* chore(deps): bump lodash in /examples/tutorial-example (#196) ([21c7dbe](https://github.com/BRIKEV/twd/commit/21c7dbe)), closes [#196](https://github.com/BRIKEV/twd/issues/196)
* chore(deps-dev): bump vite in /examples/tutorial-example (#194) ([8e36efe](https://github.com/BRIKEV/twd/commit/8e36efe)), closes [#194](https://github.com/BRIKEV/twd/issues/194)
* chore(deps-dev): bump vite from 7.2.2 to 7.3.2 in /examples/twd-test-app (#193) ([445fd07](https://github.com/BRIKEV/twd/commit/445fd07)), closes [#193](https://github.com/BRIKEV/twd/issues/193)
* chore(deps-dev): bump vite in /examples/vue-twd-example (#192) ([49a2b0c](https://github.com/BRIKEV/twd/commit/49a2b0c)), closes [#192](https://github.com/BRIKEV/twd/issues/192)


## <small>1.6.4 (2026-03-31)</small>

* fix: revert TS 6 upgrade that broke type declarations, add CI build checks (#187) ([82f5d20](https://github.com/BRIKEV/twd/commit/82f5d20)), closes [#187](https://github.com/BRIKEV/twd/issues/187)
* fix: regenerate package-lock.json for CI compatibility ([96e4705](https://github.com/BRIKEV/twd/commit/96e4705))


## <small>1.6.3 (2026-03-30)</small>

* feat: add contract validation hook to mockRequest (#186) ([87752b1](https://github.com/BRIKEV/twd/commit/87752b1)), closes [#186](https://github.com/BRIKEV/twd/issues/186)
* fix: CSS issues and patch dependency updates (#184) ([45ad966](https://github.com/BRIKEV/twd/commit/45ad966)), closes [#184](https://github.com/BRIKEV/twd/issues/184)
* chore(deps-dev): bump typescript from 5.9.3 to 6.0.2 (#185) ([c04aade](https://github.com/BRIKEV/twd/commit/c04aade)), closes [#185](https://github.com/BRIKEV/twd/issues/185)
* chore(deps-dev): bump flatted in /examples/tutorial-example (#173) ([461375c](https://github.com/BRIKEV/twd/commit/461375c)), closes [#173](https://github.com/BRIKEV/twd/issues/173)
* chore(deps-dev): bump flatted in /examples/twd-test-app (#172) ([dc1f1af](https://github.com/BRIKEV/twd/commit/dc1f1af)), closes [#172](https://github.com/BRIKEV/twd/issues/172)
* docs: improvements from AI feedback session (#174) ([d8c22b1](https://github.com/BRIKEV/twd/commit/d8c22b1)), closes [#174](https://github.com/BRIKEV/twd/issues/174)
* docs: add --test flag documentation for twd-relay run ([45c5384](https://github.com/BRIKEV/twd/commit/45c5384))
* docs: add missing plugin skills (ci-setup, test-gaps, test-quality, test-flow-gallery) ([ce678e8](https://github.com/BRIKEV/twd/commit/ce678e8))


## <small>1.6.2 (2026-03-16)</small>

* fix: update dependencies and errors (#171) ([b98f0ac](https://github.com/BRIKEV/twd/commit/b98f0ac)), closes [#171](https://github.com/BRIKEV/twd/issues/171)
* fix: search input Preact compat + improve CONTRIBUTING.md (#170) ([3fad4d4](https://github.com/BRIKEV/twd/commit/3fad4d4)), closes [#170](https://github.com/BRIKEV/twd/issues/170)
* chore: update dependencies ([95e0198](https://github.com/BRIKEV/twd/commit/95e0198))
* chore(deps): bump preact from 10.28.4 to 10.29.0 (#168) ([33c347b](https://github.com/BRIKEV/twd/commit/33c347b)), closes [#168](https://github.com/BRIKEV/twd/issues/168)
* chore(deps-dev): bump @vitest/coverage-v8 from 4.0.18 to 4.1.0 (#169) ([ae73933](https://github.com/BRIKEV/twd/commit/ae73933)), closes [#169](https://github.com/BRIKEV/twd/issues/169)
* chore(deps-dev): bump jsdom from 28.1.0 to 29.0.0 (#167) ([14112f3](https://github.com/BRIKEV/twd/commit/14112f3)), closes [#167](https://github.com/BRIKEV/twd/issues/167)
* docs: add retryCount option to twd.config.json documentation ([84573f1](https://github.com/BRIKEV/twd/commit/84573f1))


## <small>1.6.1 (2026-03-15)</small>

* feat: improve CI test stability with retries and timeout (#164) ([03aa5ee](https://github.com/BRIKEV/twd/commit/03aa5ee)), closes [#164](https://github.com/BRIKEV/twd/issues/164)
* fix: improve theme search (#163) ([3e9b420](https://github.com/BRIKEV/twd/commit/3e9b420)), closes [#163](https://github.com/BRIKEV/twd/issues/163)
* perf: memoize sidebar tree building and deduplicate from TestList (#161) ([b79c375](https://github.com/BRIKEV/twd/commit/b79c375)), closes [#161](https://github.com/BRIKEV/twd/issues/161)
* feat: add optional search/filter to sidebar (#160) ([b4a78c7](https://github.com/BRIKEV/twd/commit/b4a78c7)), closes [#160](https://github.com/BRIKEV/twd/issues/160)
* chore(deps): bump undici from 7.22.0 to 7.24.1 (#162) ([41279f0](https://github.com/BRIKEV/twd/commit/41279f0)), closes [#162](https://github.com/BRIKEV/twd/issues/162)
* docs: add sitemap, robots.txt, and per-page SEO meta descriptions ([0c8e7eb](https://github.com/BRIKEV/twd/commit/0c8e7eb))
* docs: add llms.txt for LLM-friendly project documentation ([1f2e053](https://github.com/BRIKEV/twd/commit/1f2e053))


## 1.6.0 (2026-03-06)

* feat: improve waitForRequest timeout error with detailed rule info (#159) ([5a2db79](https://github.com/BRIKEV/twd/commit/5a2db79))
* feat: add viewport command with CSS @media query support (#150) ([285a404](https://github.com/BRIKEV/twd/commit/285a404))
* feat: add agent skills for AI adoption and separate AI docs section ([4f8a44f](https://github.com/BRIKEV/twd/commit/4f8a44f))
* fix: vulnerabilities ([02fbea1](https://github.com/BRIKEV/twd/commit/02fbea1))
* docs: remove standard setup option, keep bundled as the only approach ([af8fd55](https://github.com/BRIKEV/twd/commit/af8fd55))
* docs: add state management & test isolation guidance for visit command ([762062d](https://github.com/BRIKEV/twd/commit/762062d))
* docs: add dedicated Claude Code Plugin page and restructure AI sidebar ([a283923](https://github.com/BRIKEV/twd/commit/a283923))


## <small>1.5.2 (2026-02-11)</small>

* fix: remove hardcoded version from CLI service worker registration ([698923a](https://github.com/BRIKEV/twd/commit/698923a))
* feat: display TWD version in sidebar UI


## <small>1.5.1 (2026-02-10)</small>

* boundary-aware URL matching in mockRequest to prevent overlapping matches (#144) ([392a58a](https://github.com/BRIKEV/twd/commit/392a58a)), closes [#144](https://github.com/BRIKEV/twd/issues/144)
* docs: update remote testing docs ([ee54a5e](https://github.com/BRIKEV/twd/commit/ee54a5e))


## 1.5.0 (2026-02-09)

* Feat/add communication ai tools (#143) ([89e9363](https://github.com/BRIKEV/twd/commit/89e9363)), closes [#143](https://github.com/BRIKEV/twd/issues/143)
* Feat/mock service worker delay count (#142) ([fd5db36](https://github.com/BRIKEV/twd/commit/fd5db36)), closes [#142](https://github.com/BRIKEV/twd/issues/142)
* feat: add clear mocks button (#141) ([ec645c2](https://github.com/BRIKEV/twd/commit/ec645c2)), closes [#141](https://github.com/BRIKEV/twd/issues/141)
* docs: improve agent and prompt guidelines ([182cea7](https://github.com/BRIKEV/twd/commit/182cea7))


## <small>1.4.3 (2026-02-04)</small>

* Fix/service worker issues (#138) ([1ab3f95](https://github.com/BRIKEV/twd/commit/1ab3f95)), closes [#138](https://github.com/BRIKEV/twd/issues/138)


## <small>1.4.2 (2026-01-29)</small>

* Fix/improve execution (#136) ([7503805](https://github.com/BRIKEV/twd/commit/7503805)), closes [#136](https://github.com/BRIKEV/twd/issues/136)
* Fix/performance (#137) ([8843ca4](https://github.com/BRIKEV/twd/commit/8843ca4)), closes [#137](https://github.com/BRIKEV/twd/issues/137)
* docs: add coverage documentation and link in CI execution ([970f9d5](https://github.com/BRIKEV/twd/commit/970f9d5))
* chore(deps-dev): bump lodash from 4.17.21 to 4.17.23 (#132) ([ad5e056](https://github.com/BRIKEV/twd/commit/ad5e056)), closes [#132](https://github.com/BRIKEV/twd/issues/132)
* chore(deps): bump devalue from 5.5.0 to 5.6.2 in /examples/astro-example (#129) ([8e9dbb5](https://github.com/BRIKEV/twd/commit/8e9dbb5)), closes [#129](https://github.com/BRIKEV/twd/issues/129)
* chore(deps): bump diff and astro in /examples/astro-example (#131) ([4895ef8](https://github.com/BRIKEV/twd/commit/4895ef8)), closes [#131](https://github.com/BRIKEV/twd/issues/131)
* chore(deps): bump h3 from 1.15.4 to 1.15.5 in /examples/astro-example (#130) ([5e39564](https://github.com/BRIKEV/twd/commit/5e39564)), closes [#130](https://github.com/BRIKEV/twd/issues/130)
* chore(deps): bump lodash in /examples/tutorial-example (#133) ([5f5addd](https://github.com/BRIKEV/twd/commit/5f5addd)), closes [#133](https://github.com/BRIKEV/twd/issues/133)



## <small>1.4.1 (2026-01-13)</small>

* Fix/error messages format (#128) ([9527af9](https://github.com/BRIKEV/twd/commit/9527af9)), closes [#128](https://github.com/BRIKEV/twd/issues/128)

## 1.4.0 (2026-01-09)

* chore: update dependencies ([628d4fb](https://github.com/BRIKEV/twd/commit/628d4fb))
* Feat/improve sidebar ux (#126) ([e36f435](https://github.com/BRIKEV/twd/commit/e36f435)), closes [#126](https://github.com/BRIKEV/twd/issues/126)
* docs: add new domain to vitepress docs ([aad1d35](https://github.com/BRIKEV/twd/commit/aad1d35))
* fix: error with broken links in the mcp docs ([a7b98b9](https://github.com/BRIKEV/twd/commit/a7b98b9))
* docs: add twd-mcp guide ([6a866ec](https://github.com/BRIKEV/twd/commit/6a866ec))


## <small>1.3.4 (2025-12-29)</small>

* docs: add ai agent document ([b2b86ea](https://github.com/BRIKEV/twd/commit/b2b86ea))
* docs: add better info for react router framework mode apps ([4123037](https://github.com/BRIKEV/twd/commit/4123037))
* docs: add testing guide for shadcn components in React applications ([792dcc2](https://github.com/BRIKEV/twd/commit/792dcc2))
* docs: add tutorial docs about react testing library ([92dce2d](https://github.com/BRIKEV/twd/commit/92dce2d))
* docs: enhance documentation for React Router and Next.js integration with TWD ([0d30644](https://github.com/BRIKEV/twd/commit/0d30644))
* docs: improve documentation about framework integration ([66eeb9a](https://github.com/BRIKEV/twd/commit/66eeb9a))
* fix: add better screendom selector (#119) ([9b66ff8](https://github.com/BRIKEV/twd/commit/9b66ff8)), closes [#119](https://github.com/BRIKEV/twd/issues/119)


## <small>1.3.3 (2025-12-16)</small>

* Fix/error hmr (#117) ([67fbef6](https://github.com/BRIKEV/twd/commit/67fbef6)), closes [#117](https://github.com/BRIKEV/twd/issues/117)
* Fix/screendom modals example (#115) ([d080ba1](https://github.com/BRIKEV/twd/commit/d080ba1)), closes [#115](https://github.com/BRIKEV/twd/issues/115)



## <small>1.3.2 (2025-12-13)</small>

* feat: add bundle options to use or not service worker and path option (#113) ([927e7c8](https://github.com/BRIKEV/twd/commit/927e7c8)), closes [#113](https://github.com/BRIKEV/twd/issues/113)

## <small>1.3.1 (2025-12-09)</small>

* feat: add preact for bundle version (#112) ([d1a19c2](https://github.com/BRIKEV/twd/commit/d1a19c2)), closes [#112](https://github.com/BRIKEV/twd/issues/112)
* Feat/frameworks integration (#109) ([f6550f3](https://github.com/BRIKEV/twd/commit/f6550f3)), closes [#109](https://github.com/BRIKEV/twd/issues/109)
* Fix/bundle improvements (#111) ([8b4947c](https://github.com/BRIKEV/twd/commit/8b4947c)), closes [#111](https://github.com/BRIKEV/twd/issues/111)


## 1.3.0 (2025-12-08)

* docs: improve documentation about framework integration ([66eeb9a](https://github.com/BRIKEV/twd/commit/66eeb9a))
* Feat/frameworks integration (#109) ([f6550f3](https://github.com/BRIKEV/twd/commit/f6550f3)), closes [#109](https://github.com/BRIKEV/twd/issues/109)


## <small>1.2.3 (2025-12-03)</small>

* Feat/add retry wait request (#108) ([b36861e](https://github.com/BRIKEV/twd/commit/b36861e)), closes [#108](https://github.com/BRIKEV/twd/issues/108)
* Feat/url retry command (#106) ([54564e0](https://github.com/BRIKEV/twd/commit/54564e0)), closes [#106](https://github.com/BRIKEV/twd/issues/106)
* chore(deps): bump mdast-util-to-hast in /examples/astro-example (#104) ([e0e3b73](https://github.com/BRIKEV/twd/commit/e0e3b73)), closes [#104](https://github.com/BRIKEV/twd/issues/104)


## <small>1.2.2 (2025-11-28)</small>

* Fix/add path initmocking (#103) ([2ef73c1](https://github.com/BRIKEV/twd/commit/2ef73c1)), closes [#103](https://github.com/BRIKEV/twd/issues/103)

## <small>1.2.1 (2025-11-26)</small>

* feat: add new bundle for mocking component (#102) ([9f0fd7a](https://github.com/BRIKEV/twd/commit/9f0fd7a)), closes [#102](https://github.com/BRIKEV/twd/issues/102)

## 1.2.0 (2025-11-23)

* docs: change selector importance to testing library ones ([31d9580](https://github.com/BRIKEV/twd/commit/31d9580))
* Feat/describe improvements (#99) ([fb8d635](https://github.com/BRIKEV/twd/commit/fb8d635)), closes [#99](https://github.com/BRIKEV/twd/issues/99)
* Feat/exists command (#100) ([94a893b](https://github.com/BRIKEV/twd/commit/94a893b)), closes [#100](https://github.com/BRIKEV/twd/issues/100)
* Feat/mock component (#94) ([112a4f3](https://github.com/BRIKEV/twd/commit/112a4f3)), closes [#94](https://github.com/BRIKEV/twd/issues/94)

## <small>1.1.2 (2025-11-15)</small>

* fix: error total tests using describe ([c209d29](https://github.com/BRIKEV/twd/commit/c209d29))

## <small>1.1.1 (2025-11-14)</small>

* Fix/select testing library (#89) ([7b2ed30](https://github.com/BRIKEV/twd/commit/7b2ed30)), closes [#89](https://github.com/BRIKEV/twd/issues/89)

## 1.1.0 (2025-11-14)

* Feat/pre release improvements (#87) ([266362e](https://github.com/BRIKEV/twd/commit/266362e)), closes [#87](https://github.com/BRIKEV/twd/issues/87)
* Feat/selector rta (#85) ([00f59ef](https://github.com/BRIKEV/twd/commit/00f59ef)), closes [#85](https://github.com/BRIKEV/twd/issues/85)

## <small>1.0.2 (2025-11-12)</small>

* Fix/types coverage v1 (#82) ([83bebd1](https://github.com/BRIKEV/twd/commit/83bebd1)), closes [#82](https://github.com/BRIKEV/twd/issues/82)


## <small>1.0.1 (2025-11-11)</small>

* fix: error chai types ([524d298](https://github.com/BRIKEV/twd/commit/524d298))


## 1.0.0 (2025-11-10)

* chore(deps-dev): bump vite from 7.1.4 to 7.2.2 in /examples/twd-test-app (#78) ([87a50af](https://github.com/BRIKEV/twd/commit/87a50af)), closes [#78](https://github.com/BRIKEV/twd/issues/78)
* Docs/improve framework docs (#79) ([2b01606](https://github.com/BRIKEV/twd/commit/2b01606)), closes [#79](https://github.com/BRIKEV/twd/issues/79)
* Feat/add better tutorials (#77) ([b790749](https://github.com/BRIKEV/twd/commit/b790749)), closes [#77](https://github.com/BRIKEV/twd/issues/77)
* docs: improve docs by adding logo ([9e7225f](https://github.com/BRIKEV/twd/commit/9e7225f))
* docs: update favicon and web app manifest files ([ce189c9](https://github.com/BRIKEV/twd/commit/ce189c9))


## 0.8.0 (2025-11-01)

* Docs/ci example (#71) ([17983ab](https://github.com/BRIKEV/twd/commit/17983ab)), closes [#71](https://github.com/BRIKEV/twd/issues/71)
* Fix/service worker installation (#76) ([b374c41](https://github.com/BRIKEV/twd/commit/b374c41)), closes [#76](https://github.com/BRIKEV/twd/issues/76)
* Fix/url mocking (#75) ([268bd4b](https://github.com/BRIKEV/twd/commit/268bd4b)), closes [#75](https://github.com/BRIKEV/twd/issues/75)

## 0.7.1 (2025-10-28)

* fix: error exporting bundle files

## 0.7.0 (2025-10-26)

* Feat/add window to handle ci tests (#70) ([81c808e](https://github.com/BRIKEV/twd/commit/81c808e)), closes [#70](https://github.com/BRIKEV/twd/issues/70)
* Feat/improve runner (#67) ([72ca85e](https://github.com/BRIKEV/twd/commit/72ca85e)), closes [#67](https://github.com/BRIKEV/twd/issues/67)
* Feat/visit command improvements (#69) ([c669452](https://github.com/BRIKEV/twd/commit/c669452)), closes [#69](https://github.com/BRIKEV/twd/issues/69)
* feat: add support to other types (#66) ([fef815f](https://github.com/BRIKEV/twd/commit/fef815f)), closes [#66](https://github.com/BRIKEV/twd/issues/66)
* fix: error when regex is invalid (#65) ([dba0cdf](https://github.com/BRIKEV/twd/commit/dba0cdf)), closes [#65](https://github.com/BRIKEV/twd/issues/65)
* fix: error with http no content responses (#60) ([dca1005](https://github.com/BRIKEV/twd/commit/dca1005)), closes [#60](https://github.com/BRIKEV/twd/issues/60)


## 0.6.0 (2025-10-16)

* Feat/improve design (#59) ([e788575](https://github.com/BRIKEV/twd/commit/e788575)), closes [#59](https://github.com/BRIKEV/twd/issues/59)
* fix: error with http no content responses (#60) ([dca1005](https://github.com/BRIKEV/twd/commit/dca1005)), closes [#60](https://github.com/BRIKEV/twd/issues/60)
* Add Vite plugin to remove mock service worker from production builds (#61) ([0eeb03f](https://github.com/BRIKEV/twd/commit/0eeb03f)), closes [#61](https://github.com/BRIKEV/twd/issues/61)

## 0.5.2 (2025-10-12)

* Feat/improve mocking requests format (#55) ([36aec97](https://github.com/BRIKEV/twd/commit/36aec97)), closes [#55](https://github.com/BRIKEV/twd/issues/55)

## 0.5.1 (2025-10-12)

* Fix/error installing library (#53) ([879951c](https://github.com/BRIKEV/twd/commit/879951c)), closes [#53](https://github.com/BRIKEV/twd/issues/53)

## 0.5.0 (2025-10-11)

* Docs/improve documentation (#44) ([401a5f9](https://github.com/BRIKEV/twd/commit/401a5f9)), closes [#44](https://github.com/BRIKEV/twd/issues/44)
* Feat/improve loading bundle tests (#51) ([48e7736](https://github.com/BRIKEV/twd/commit/48e7736)), closes [#51](https://github.com/BRIKEV/twd/issues/51)
* Feat/improve UI (#49) ([ad793a6](https://github.com/BRIKEV/twd/commit/ad793a6)), closes [#49](https://github.com/BRIKEV/twd/issues/49)



## 0.4.0 (2025-10-07)

* feat: add get all methods (#43) ([cb2593e](github.com/BRIKEV/twd/commits/cb2593e)), closes [#43](github.com/BRIKEV/twd/issues/43)
* feat: implement eventsMessage function and update userEvent logging (#42) ([1d38a28](github.com/BRIKEV/twd/commits/1d38a28)), closes [#42](github.com/BRIKEV/twd/issues/42)
* feat: improve visit command (#37) ([c326810](github.com/BRIKEV/twd/commits/c326810)), closes [#37](github.com/BRIKEV/twd/issues/37)
* Feat/wait for requests (#41) ([4a7319b](github.com/BRIKEV/twd/commits/4a7319b)), closes [#41](github.com/BRIKEV/twd/issues/41)
* fix: improve wait command (#40) ([6912369](github.com/BRIKEV/twd/commits/6912369)), closes [#40](github.com/BRIKEV/twd/issues/40)
* fix: remove truncate chai expects (#39) ([c3404d7](github.com/BRIKEV/twd/commits/c3404d7)), closes [#39](github.com/BRIKEV/twd/issues/39)
* fix: url command assertion message (#38) ([c40e795](github.com/BRIKEV/twd/commits/c40e795)), closes [#38](github.com/BRIKEV/twd/issues/38)

## 0.3.1 (2025-10-01)

* docs: add CODE_OF_CONDUCT and CONTRIBUTING guidelines (#28) ([833e2c4](github.com/BRIKEV/twd/commits/833e2c4)), closes [#28](github.com/BRIKEV/twd/issues/28)
* fix: error with intercept routes (#26) ([19ee847](github.com/BRIKEV/twd/commits/19ee847)), closes [#26](github.com/BRIKEV/twd/issues/26)

## 0.3.0 (2025-09-28)

* Feat/add better UI (#23) ([cc63a67](github.com/BRIKEV/twd/commits/cc63a67)), closes [#23](github.com/BRIKEV/twd/issues/23)
* Fix/mock bridge (#22) ([87eb23a](github.com/BRIKEV/twd/commits/87eb23a)), closes [#22](github.com/BRIKEV/twd/issues/22)
* Feat/add UI tests (#20) ([491df53](github.com/BRIKEV/twd/commits/491df53)), closes [#20](github.com/BRIKEV/twd/issues/20)

## 0.2.0 (2025-09-18)

* Feat/add cli command (#19) ([b70110f](github.com/BRIKEV/twd/commits/b70110f)), closes [#19](github.com/BRIKEV/twd/issues/19)
* Feat/add UI tests (#20) ([491df53](github.com/BRIKEV/twd/commits/491df53)), closes [#20](github.com/BRIKEV/twd/issues/20)
* Feat/improve networkintercept (#17) ([b39b723](github.com/BRIKEV/twd/commits/b39b723)), closes [#17](github.com/BRIKEV/twd/issues/17)
* Feat/url command (#15) ([7542950](github.com/BRIKEV/twd/commits/7542950)), closes [#15](github.com/BRIKEV/twd/issues/15)


## 0.1.2 (2025-09-11)

* chore: update version ([e8599da](https://github.com/BRIKEV/twd/commit/e8599da))
* Feat/improve assertion messages (#14) ([a2a36a2](https://github.com/BRIKEV/twd/commit/a2a36a2)), closes [#14](https://github.com/BRIKEV/twd/issues/14)
* Feat/url command (#15) ([7542950](https://github.com/BRIKEV/twd/commit/7542950)), closes [#15](https://github.com/BRIKEV/twd/issues/15)

## 0.1.1 (2025-09-07)

* fix: missing ts types ([28276ab](https://github.com/BRIKEV/twd/commit/28276ab))
* fix: add new packge name ([178de35](https://github.com/BRIKEV/twd/commit/178de35))
* chore: add script for generating conventional changelog ([80b9e6d](https://github.com/BRIKEV/twd/commit/80b9e6d))

## 0.1.0 (2025-09-07)

* Docs/add examples (#13) ([d9e372b](https://github.com/BRIKEV/twd/commit/d9e372b)), closes [#13](https://github.com/BRIKEV/twd/issues/13)
* Feat/add vitest unit tests (#12) ([56a5324](https://github.com/BRIKEV/twd/commit/56a5324)), closes [#12](https://github.com/BRIKEV/twd/issues/12)
* Initial commit ([2fdf78b](https://github.com/BRIKEV/twd/commit/2fdf78b))
* ci: add GitHub Actions workflow for npm package publishing ([c740764](https://github.com/BRIKEV/twd/commit/c740764))
* feat: add basic example with poc methods ([6268a4f](https://github.com/BRIKEV/twd/commit/6268a4f))
* feat: add basic setup and poc files ([31ed776](https://github.com/BRIKEV/twd/commit/31ed776))
* feat: add better describe grouping ([f5244c3](https://github.com/BRIKEV/twd/commit/f5244c3))
* feat: add first version with intelisense ([51efd5a](https://github.com/BRIKEV/twd/commit/51efd5a))
* feat: add XHR mocks ([a49cfa1](https://github.com/BRIKEV/twd/commit/a49cfa1))
* feat: get body request from fetch call ([a2ccc44](https://github.com/BRIKEV/twd/commit/a2ccc44))
* feat: improve IntelliSense ([6330ff2](https://github.com/BRIKEV/twd/commit/6330ff2))
* feat: improve jsdoc for new network options ([6de3d2e](https://github.com/BRIKEV/twd/commit/6de3d2e))
* feat: improve type command ([597d023](https://github.com/BRIKEV/twd/commit/597d023))
