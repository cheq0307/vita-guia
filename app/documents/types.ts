import type {DocumentRecord,DocumentVersion} from '../../db/document-store';
export type VersionView=Omit<DocumentVersion,'upload_id'|'storage_key'>&{links:{product_id:string;page_from:number;page_to:number}[]};
export type DocumentDetailData={document:DocumentRecord;versions:VersionView[]};
export type UploadStart={document:DocumentRecord;version:VersionView;fileId:string;partSize:number;reused:boolean;parts:{number:number}[]};
export type DocumentRow=DocumentRecord&{version_number:number|null;version_count:number;filename:string|null;size:number|null};
export type LibraryResult={documents:DocumentRow[];pages:number;page:number;total:number;usedBytes?:number;quota?:number;products?:{id:string;name:string}[]};
