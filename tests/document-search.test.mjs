import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {DocumentSearch} from '../db/document-search.ts';
function setup(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');
 for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 const db={prepare(sql){let args=[];const statement=sqlite.prepare(sql);const bound={bind(...a){args=a;return bound},async first(){return statement.get(...args)??null},async all(){return {results:statement.all(...args)}},async run(){const r=statement.run(...args);return{meta:{changes:Number(r.changes)}}}};return bound}};
 function seed(id,audience='clients',status='current',text='Preparación: mezclar con agua caliente.',product='complex-mocha-frasco'){
  sqlite.prepare('INSERT INTO documents(id,title,category,audience,knowledge_audience,status,current_version_id)VALUES(?,?,?,?,?,?,?)').run(id,'Documento '+id,'technical',audience,audience,status,id+'v');
  sqlite.prepare("INSERT INTO document_files(id,sha256,size,mime,storage_key,state)VALUES(?,?,100,'application/pdf',?,'ready')").run(id+'f',id,id);
  sqlite.prepare("INSERT INTO document_versions(id,document_id,file_id,number,filename,page_count,text_status,approved)VALUES(?,?,?,1,'fuente.pdf',2,'extracted',1)").run(id+'v',id,id+'f');
  sqlite.prepare('INSERT INTO document_pages(version_id,number,content)VALUES(?,1,?)').run(id+'v',text);
  sqlite.prepare('INSERT INTO document_pages(version_id,number,content)VALUES(?,2,?)').run(id+'v','Texto fuera del rango: preparación con limón.');
  sqlite.prepare('INSERT INTO document_product_links(version_id,product_id,page_from,page_to)VALUES(?,?,1,1)').run(id+'v',product);
 }
 return {sqlite,search:new DocumentSearch(db),seed};
}
test('full text search filters audience, approved current versions and linked product pages',async()=>{
 const {sqlite,search,seed}=setup();try{
  seed('public');seed('internal','internal');seed('advisors','advisors');seed('archived','clients','archived');seed('pending','clients','pending');
  assert.equal((await search.find('client',['preparacion'],['complex-mocha-frasco'])).length,1);
  assert.deepEqual((await search.find('advisor',['preparacion'],['complex-mocha-frasco'])).map(r=>r.documentId).sort(),['advisors','public']);
  assert.equal((await search.find('admin',['preparacion'],['complex-mocha-frasco'])).length,3);
  assert.equal((await search.find('client',['limon'],['complex-mocha-frasco'])).length,0,'Ignore pages outside product range');
  sqlite.exec("UPDATE document_versions SET approved=0 WHERE id='publicv'");assert.equal((await search.find('client',['preparacion'],[])).length,0);
  sqlite.exec("UPDATE document_versions SET approved=1 WHERE id='publicv'; UPDATE documents SET current_version_id=NULL WHERE id='public'");assert.equal((await search.find('client',['preparacion'],[])).length,0,'Approved historical versions are excluded');
 }finally{sqlite.close()}
});
test('index updates with page text and backfill is bounded and idempotent',async()=>{
 const {sqlite,search,seed}=setup();try{
  seed('one');sqlite.exec('DELETE FROM document_page_search');
  assert.equal((await search.find('client',['preparacion'],[])).length,0);
  const batch=await search.indexBatch(0);assert.equal(batch.indexed,2);assert.equal((await search.find('client',['preparacion'],[])).length,1);
  await search.indexBatch(0);assert.equal((await search.find('client',['preparacion'],[])).length,1);
  sqlite.exec("UPDATE document_pages SET content='Contiene inulina.' WHERE number=1");assert.equal((await search.find('client',['inulina'],[])).length,1);
  sqlite.exec('DELETE FROM document_pages WHERE number=1');assert.equal((await search.find('client',['inulina'],[])).length,0);
  assert.equal((await search.find('client',['inexistente'],[])).length,0);
 }finally{sqlite.close()}
});
test('publishing product knowledge never requires publishing the original and excludes unrelated pages',async()=>{
 const {sqlite,search,seed}=setup();try{
  seed('internal','internal');
  sqlite.exec("UPDATE documents SET knowledge_audience='clients' WHERE id='internal'");
  assert.equal((await search.find('client',['preparacion'],['complex-mocha-frasco'])).length,1);
  assert.equal((await search.find('client',['limon'],[])).length,0,'No unlinked private business pages');
  assert.equal((await search.find('client',['preparacion'],[])).length,1);
  sqlite.exec("UPDATE documents SET knowledge_audience='internal' WHERE id='internal'");
  assert.equal((await search.find('client',['preparacion'],[])).length,0);
 }finally{sqlite.close()}
});
