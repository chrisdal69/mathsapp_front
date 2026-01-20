import { useCallback, useMemo, useState } from "react";
import {
  createEditor,
  Editor,
  Element as SlateElement,
  Transforms,
} from "slate";
import { Slate, Editable, useSlate, withReact } from "slate-react";
import { withHistory } from "slate-history";

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Tape ton texte ici..." }],
  },
];

function Test() {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const previewEditor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(initialValue);
  const previewKey = useMemo(() => JSON.stringify(value), [value]);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  return (
    <div className="space-y-4">
      <Slate editor={editor} initialValue={value} onChange={setValue}>
        <div className="flex flex-wrap gap-2">
          <MarkButton format="bold" icon="format_bold" label="Gras" />
          <MarkButton
            format="underline"
            icon="format_underlined"
            label="Souligne"
          />
          <MarkButton format="italic" icon="format_italic" label="Italique" />
          <BlockButton
            format="bulleted-list"
            icon="format_list_bulleted"
            label="Liste"
          />
          <BlockButton
            format="numbered-list"
            icon="format_list_numbered"
            label="Liste numerotee"
          />
          <BlockButton format="left" icon="format_align_left" label="Gauche" />
          <BlockButton format="center" icon="format_align_center" label="Centre" />
          <BlockButton format="right" icon="format_align_right" label="Droite" />
          <BlockButton
            format="justify"
            icon="format_align_justify"
            label="Justifie"
          />
        </div>
        <Editable
          className="min-h-[140px] rounded border border-slate-300 p-3"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Texte et formules avec $...$"
          spellCheck
        />
      </Slate>

      <div>
        <p className="mb-2 text-sm text-slate-500">Apercu</p>
        <Slate key={previewKey} editor={previewEditor} initialValue={value}>
          <Editable
            readOnly
            className="min-h-[140px] rounded border border-slate-200 bg-slate-50 p-3"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
          />
        </Slate>
      </div>
    </div>
  );
}

function MarkButton({ format, icon, label }) {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`rounded border px-2 py-1 text-sm ${
        isActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
      }`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <span className="material-icons text-base leading-none">{icon}</span>
    </button>
  );
}

function BlockButton({ format, icon, label }) {
  const editor = useSlate();
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? "align" : "type"
  );
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`rounded border px-2 py-1 text-sm ${
        isActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
      }`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <span className="material-icons text-base leading-none">{icon}</span>
    </button>
  );
}

function toggleMark(editor, format) {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

function isMarkActive(editor, format) {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}

function toggleBlock(editor, format) {
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? "align" : "type"
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (node) =>
      !Editor.isEditor(node) &&
      SlateElement.isElement(node) &&
      LIST_TYPES.includes(node.type) &&
      !isAlignType(format),
    split: true,
  });

  let newProperties;
  if (isAlignType(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    Transforms.wrapNodes(editor, { type: format, children: [] });
  }
}

function isBlockActive(editor, format, blockType = "type") {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node) =>
      !Editor.isEditor(node) &&
      SlateElement.isElement(node) &&
      (blockType === "align" ? node.align === format : node.type === format),
  });
  return !!match;
}

function Element({ attributes, children, element }) {
  const style = {};
  if (isAlignElement(element)) {
    style.textAlign = element.align;
  }
  switch (element.type) {
    case "bulleted-list":
      return (
        <ul className="list-disc pl-6" style={style} {...attributes}>
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol className="list-decimal pl-6" style={style} {...attributes}>
          {children}
        </ol>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
}

function Leaf({ attributes, children, leaf }) {
  let content = children;
  if (leaf.bold) {
    content = <strong>{content}</strong>;
  }
  if (leaf.underline) {
    content = <u>{content}</u>;
  }
  if (leaf.italic) {
    content = <em>{content}</em>;
  }
  return <span {...attributes}>{content}</span>;
}

function isAlignType(format) {
  return TEXT_ALIGN_TYPES.includes(format);
}

function isAlignElement(element) {
  return "align" in element;
}

export default Test;
