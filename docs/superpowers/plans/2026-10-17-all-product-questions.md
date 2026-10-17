# All-product 26-question coverage

Goal: answer the supplied 26 consumer questions for all 17 catalog presentations, using reviewed facts and specific missing/conflict messages rather than generic descriptions.

Architecture: structured product facts for purpose/benefits and review status; question intents with a typed answer record for each product/question; existing authorization and documentary search remain in force for other questions. A generated coverage matrix records gaps without claiming they are resolved by fallback text.

- [x] Compare all catalog/technical product sections, preserve manufacturer claims separately from confirmed facts; no new services or paid model.
- [x] Red/green: 26 intents × 17 products (442 answer cells), contextual and explicit product forms, common-five synonyms, topical applicability, variant ambiguity, unknown qualifiers and medical priority.
- [x] Enrich all families with purpose/benefits and source-specific missing facts; specific answers for evidence, quantities, timing, safety, quality, price, expiry, originality. Never invent dose, price, certification, study verification or safe disease use.
- [x] Show reviewed facts in product pages; produce a reproducible coverage report listing missing/conflicting cells and missing products.
- [x] Tests/type/build/review and publish same private Site; verify representative client questions and browser presentation; GitHub backup.
