import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@uiw/react-codemirror';
import type { Extension } from '@uiw/react-codemirror';
import { tags } from '@lezer/highlight';

export type XMLCodeThemeName = 'light' | 'dark';

interface CodeMirrorXMLThemePalette {
  /** 编辑器背景色。 */
  backgroundColor: string;
  /** 编辑器正文颜色。 */
  textColor: string;
  /** XML 标签颜色。 */
  tagColor: string;
  /** XML 属性名颜色。 */
  attributeKeyColor: string;
  /** XML 属性值颜色。 */
  attributeValueColor: string;
  /** XML 分隔符颜色。 */
  separatorColor: string;
  /** XML 注释颜色。 */
  commentColor: string;
  /** CDATA 颜色。 */
  cdataColor: string;
  /** 当前行背景色。 */
  activeLineColor: string;
  /** 选择区域背景色。 */
  selectionColor: string;
  /** 非法语法颜色。 */
  invalidColor: string;
}

export interface XMLCodeThemePreset {
  /** 主题展示名称。 */
  label: string;
  /** 是否为暗色主题。 */
  dark: boolean;
  /** 编辑器容器颜色类名。 */
  containerClassName: string;
  /** 工具栏边框颜色类名。 */
  toolbarClassName: string;
  /** CodeMirror 主题扩展。 */
  extensions: Extension[];
}

const LIGHT_PALETTE: CodeMirrorXMLThemePalette = {
  backgroundColor: '#f6f8fa',
  textColor: '#24292f',
  tagColor: '#cf222e',
  attributeKeyColor: '#0550ae',
  attributeValueColor: '#0a3069',
  separatorColor: '#57606a',
  commentColor: '#6e7781',
  cdataColor: '#116329',
  activeLineColor: '#eef1f4',
  selectionColor: '#b6d7ff',
  invalidColor: '#cf222e',
};

const DARK_PALETTE: CodeMirrorXMLThemePalette = {
  backgroundColor: '#282a36',
  textColor: '#f8f8f2',
  tagColor: '#ff79c6',
  attributeKeyColor: '#50fa7b',
  attributeValueColor: '#f1fa8c',
  separatorColor: '#f8f8f2',
  commentColor: '#6272a4',
  cdataColor: '#8be9fd',
  activeLineColor: '#343746',
  selectionColor: '#44475a',
  invalidColor: '#ff5555',
};

/** 为 CodeMirror 构造与旧 XML Viewer 一致的配色。 */
const createXMLCodeTheme = (palette: CodeMirrorXMLThemePalette, dark: boolean): Extension[] => {
  return [
    EditorView.theme(
      {
        '&': {
          backgroundColor: palette.backgroundColor,
          color: palette.textColor,
          height: '100%',
        },
        '.cm-scroller': {
          fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        },
        '.cm-content': {
          caretColor: palette.textColor,
          padding: '12px 0',
        },
        '.cm-gutters': {
          backgroundColor: palette.backgroundColor,
          borderRight: `1px solid ${palette.separatorColor}`,
          color: palette.separatorColor,
        },
        '.cm-activeLine, .cm-activeLineGutter': {
          backgroundColor: palette.activeLineColor,
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: palette.textColor,
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
          backgroundColor: palette.selectionColor,
        },
        '.cm-foldPlaceholder': {
          backgroundColor: palette.activeLineColor,
          borderColor: palette.separatorColor,
          color: palette.textColor,
        },
      },
      { dark },
    ),
    syntaxHighlighting(
      HighlightStyle.define([
        { tag: tags.content, color: palette.textColor },
        { tag: tags.tagName, color: palette.tagColor },
        { tag: tags.attributeName, color: palette.attributeKeyColor },
        { tag: tags.attributeValue, color: palette.attributeValueColor },
        { tag: [tags.angleBracket, tags.definitionOperator], color: palette.separatorColor },
        { tag: tags.blockComment, color: palette.commentColor, fontStyle: 'italic' },
        { tag: [tags.processingInstruction, tags.documentMeta], color: palette.commentColor },
        { tag: tags.special(tags.string), color: palette.cdataColor },
        { tag: [tags.character, tags.invalid], color: palette.invalidColor },
      ]),
    ),
  ];
};

/** XML CodeMirror 可选主题。 */
export const XML_CODE_THEMES: Record<XMLCodeThemeName, XMLCodeThemePreset> = {
  light: {
    label: 'Light',
    dark: false,
    containerClassName: 'border-gray-300 bg-gray-50',
    toolbarClassName: 'border-gray-300',
    extensions: createXMLCodeTheme(LIGHT_PALETTE, false),
  },
  dark: {
    label: 'Dark',
    dark: true,
    containerClassName: 'border-gray-600 bg-gray-900',
    toolbarClassName: 'border-gray-600',
    extensions: createXMLCodeTheme(DARK_PALETTE, true),
  },
};
