# Internal originals and approved answers

User instruction: clients want only the answer, no sources, no document access. Original files stay internal; document approval is explicit review, never an automatic truth check on upload.

- [x] Add separate knowledge_audience (internal default, advisors, clients), schema migration and admin setting. Existing originals keep their audience. Enabling approved product-page knowledge does not grant file/list access.
- [x] Search approved/current/ready/extracted pages using knowledge audience; non-admin retrieval limited to linked product ranges. Never use arbitrary internal pages for client questions.
- [x] Remove sources from chat UI for every role; strip source details from non-admin assistant JSON on server. Keep internal metadata for administration.
- [x] Deny all original document reads and listings to clients; remove ProductDocuments from portal. Preserve advisor file permissions and admin library.
- [x] Tests: internal original with published knowledge answers a client but direct file404/listempty; internal knowledge is absent; unlinked pages absent; pending/archived/historical absent; sources[] for advisors/clients; revocation still401.
- [x] Review, full suite/type/build and publish same private Site. Configure ONLY the two reviewed PDFs for approved product-page knowledge to clients, keep originals internal, verify production with temporary marked test link then revoke. No paid services.

