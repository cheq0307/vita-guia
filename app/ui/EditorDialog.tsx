'use client';
import {useEffect,useId,useRef,type ReactNode} from 'react';
import {ArrowLeft} from 'lucide-react';
export default function EditorDialog({title,children,onClose,busy=false}:{title:string;children:ReactNode;onClose:()=>void;busy?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),heading=useRef<HTMLHeadingElement>(null),id=useId();
 useEffect(()=>{const el=dialog.current;const before=document.activeElement as HTMLElement|null;el?.showModal();heading.current?.focus();return()=>{el?.close();before?.focus()}},[]);
 return <dialog className="editor-dialog" ref={dialog} aria-labelledby={id} onCancel={e=>{e.preventDefault();if(!busy)onClose()}}><header className="editor-dialog-head"><button type="button" className="document-secondary" onClick={onClose} disabled={busy} aria-label="Cerrar y volver"><ArrowLeft size={20} aria-hidden="true"/></button><h2 ref={heading} tabIndex={-1} id={id}>{title}</h2></header><div className="editor-dialog-body">{children}</div></dialog>;
}
