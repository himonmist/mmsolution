"use client";
import { useEffect, useRef } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Quote, Undo2, Eraser, Image as ImgIcon } from "lucide-react";

/**
 * Lightweight WYSIWYG (contentEditable). Output is untrusted: the server sanitises
 * it with an allow-list on save and again on render.
 */
export function RichEditor({ value, onChange, id }: { value: string; onChange: (html: string) => void; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || ""; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const exec = (cmd: string, arg?: string) => { ref.current?.focus(); document.execCommand(cmd, false, arg); onChange(ref.current?.innerHTML ?? ""); };
  const link = () => { const u = prompt("Link URL (https://… or /path)"); if (u && /^(https?:\/\/|\/|mailto:|tel:)/.test(u)) exec("createLink", u); };
  const image = () => { const u = prompt("Image URL (/uploads/… or https://…)"); if (u && /^(https:\/\/|\/)/.test(u)) exec("insertImage", u); };
  const B = ({ on, label, children }: { on: () => void; label: string; children: React.ReactNode }) => (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={on} title={label} aria-label={label} className="grid h-8 w-8 place-items-center rounded-md text-navy hover:bg-white">{children}</button>
  );
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10">
      <div className="flex flex-wrap gap-0.5 border-b border-line bg-mist p-1">
        <B on={() => exec("bold")} label="Bold"><Bold className="h-4 w-4" /></B>
        <B on={() => exec("italic")} label="Italic"><Italic className="h-4 w-4" /></B>
        <B on={() => exec("formatBlock", "H2")} label="Heading"><Heading2 className="h-4 w-4" /></B>
        <B on={() => exec("formatBlock", "H3")} label="Subheading"><Heading3 className="h-4 w-4" /></B>
        <B on={() => exec("formatBlock", "P")} label="Paragraph"><span className="text-xs font-bold">P</span></B>
        <B on={() => exec("insertUnorderedList")} label="Bullet list"><List className="h-4 w-4" /></B>
        <B on={() => exec("insertOrderedList")} label="Numbered list"><ListOrdered className="h-4 w-4" /></B>
        <B on={() => exec("formatBlock", "BLOCKQUOTE")} label="Quote"><Quote className="h-4 w-4" /></B>
        <B on={link} label="Link"><Link2 className="h-4 w-4" /></B>
        <B on={image} label="Image"><ImgIcon className="h-4 w-4" /></B>
        <B on={() => exec("removeFormat")} label="Clear formatting"><Eraser className="h-4 w-4" /></B>
        <B on={() => exec("undo")} label="Undo"><Undo2 className="h-4 w-4" /></B>
      </div>
      <div id={id} ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true"
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }}
        className="prose-mm min-h-60 p-4 outline-none" />
    </div>
  );
}
