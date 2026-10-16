export type AnswerSource={documentId:string;title:string;versionId:string;version:number;page:number;excerpt:string};
export type AssistantAnswer={kind:'catalog'|'documents'|'missing'|'clarify'|'precaution';message:string;sources:AnswerSource[];productId?:string};
