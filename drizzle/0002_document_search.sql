CREATE VIRTUAL TABLE document_page_search USING fts5(content, tokenize='unicode61 remove_diacritics 2');
--> statement-breakpoint
CREATE TRIGGER document_pages_search_insert AFTER INSERT ON document_pages BEGIN
 INSERT INTO document_page_search(rowid,content) VALUES(new.rowid,new.content);
END;
--> statement-breakpoint
CREATE TRIGGER document_pages_search_update AFTER UPDATE ON document_pages BEGIN
 DELETE FROM document_page_search WHERE rowid=old.rowid;
 INSERT INTO document_page_search(rowid,content) VALUES(new.rowid,new.content);
END;
--> statement-breakpoint
CREATE TRIGGER document_pages_search_delete AFTER DELETE ON document_pages BEGIN
 DELETE FROM document_page_search WHERE rowid=old.rowid;
END;
