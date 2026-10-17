# Conversational rules polish implementation plan

Goal: improve the existing free deterministic assistant without a model or new services.
Architecture: normalize familiar phrasing before intent planning; bounded name repair, safe catalog context for variant clarification, concise plain text answers. Preserve current ACL, approved/current product-page retrieval, unknown facts and medical constraints.

- [x] Red/green tests: abbreviations, one-edit product names, purpose, ingredients, preparation, fasting, unknown ingredient/product, multi-product ambiguity, variant follow-up and greeting.
- [x] Extract input normalization into question-language.ts, maintain residual topic restrictions and safety precedence.
- [x] Carry catalog product IDs as bounded conversation context, preserve ambiguity instead of assuming a flavor; validate HTTP input.
- [x] Improve empty-state suggestions, reset conversation, readable responses and pending/error controls; no persisted conversations or sources for clients.
- [x] Full suite, type check, production build, source backup, private publication and live browser question sequence.

