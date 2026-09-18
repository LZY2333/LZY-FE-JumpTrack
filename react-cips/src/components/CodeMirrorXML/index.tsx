import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ConfigProvider, Segmented, theme as antdTheme } from 'antd';
import { xml as xmlLanguage } from '@codemirror/lang-xml';
import CodeMirror from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import cn from 'classnames';
import { createXMLFoldExtensions } from './codeMirrorXMLFoldUtil';
import { getPrintableCode } from './codeMirrorXMLUtil';
import { XML_CODE_THEMES } from './codeMirrorXMLTheme';
import type { XMLCodeThemeName } from './codeMirrorXMLTheme';

export type { XMLCodeThemeName } from './codeMirrorXMLTheme';

const XML_CODE_THEME_STORAGE_KEY = 'xml-viewer-theme';
const XML_LANGUAGE_EXTENSION = xmlLanguage();

interface CodeMirrorXMLBaseProps {
  /** XML 原文。 */
  value: string;
  /** 空内容提示。 */
  placeholder?: string;
  /** 布局类名。 */
  className?: string;
  /** 受控主题。 */
  theme?: XMLCodeThemeName;
  /** 默认主题。 */
  defaultTheme?: XMLCodeThemeName;
  /** 主题变更回调。 */
  onThemeChange?: (theme: XMLCodeThemeName) => void;
  /** 缩进空格数。 */
  indentSize?: number;
  /** 是否允许折叠 XML 节点。 */
  collapsible?: boolean;
}

interface CodeMirrorXMLEditableProps extends CodeMirrorXMLBaseProps {
  /** 编辑模式。 */
  readOnly?: false;
  /** XML 原文变更回调。 */
  onChange: (value: string) => void;
}

interface CodeMirrorXMLReadOnlyProps extends CodeMirrorXMLBaseProps {
  /** 只读模式。 */
  readOnly: true;
  /** 只读模式不允许传入变更回调。 */
  onChange?: never;
}

export type CodeMirrorXMLProps = CodeMirrorXMLEditableProps | CodeMirrorXMLReadOnlyProps;

export interface CodeMirrorXMLRef {
  /** 获取包含当前折叠状态的打印内容。 */
  getPrintableValue: () => string;
}

const THEME_OPTIONS = Object.entries(XML_CODE_THEMES).map(([value, preset]) => ({
  label: preset.label,
  value: value as XMLCodeThemeName,
}));

const isXMLCodeThemeName = (value: string | null): value is XMLCodeThemeName => value === 'light' || value === 'dark';

/** 将旧版本持久化的主题名迁移到 light/dark，保留用户原有明暗偏好。 */
const normalizeStoredTheme = (value: string | null): XMLCodeThemeName | undefined => {
  if (isXMLCodeThemeName(value)) return value;
  if (value === 'github-light') return 'light';
  if (value === 'dracula') return 'dark';
  return undefined;
};

const readStoredTheme = (fallback: XMLCodeThemeName) => {
  try {
    const storedTheme = localStorage.getItem(XML_CODE_THEME_STORAGE_KEY);
    return normalizeStoredTheme(storedTheme) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStoredTheme = (theme: XMLCodeThemeName) => {
  try {
    localStorage.setItem(XML_CODE_THEME_STORAGE_KEY, theme);
  } catch {
    // Storage 不可用时仅保留当前组件生命周期内的主题状态。
  }
};

/** 提供统一的 XML 编辑和只读展示能力。 */
const CodeMirrorXML = forwardRef<CodeMirrorXMLRef, CodeMirrorXMLProps>((props, forwardedRef) => {
  const {
    value,
    placeholder = 'Enter raw message',
    className,
    theme,
    defaultTheme = 'light',
    onThemeChange,
    indentSize = 2,
    collapsible = true,
  } = props;
  const readOnly = props.readOnly === true;
  const handleChange = readOnly ? undefined : props.onChange;
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);
  const [internalTheme, setInternalTheme] = useState<XMLCodeThemeName>(() => readStoredTheme(defaultTheme));
  const activeTheme = theme ?? internalTheme;
  const preset = XML_CODE_THEMES[activeTheme];
  const foldExtensions = useMemo(() => (collapsible ? createXMLFoldExtensions() : []), [collapsible]);
  const extensions = useMemo(
    () => [XML_LANGUAGE_EXTENSION, ...foldExtensions, ...preset.extensions],
    [foldExtensions, preset.extensions],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      getPrintableValue: () => {
        // React 封装的 state 仅保存初始化状态；折叠事务必须从实时 EditorView 读取。
        const editorState = codeMirrorRef.current?.view?.state ?? codeMirrorRef.current?.state;
        return editorState ? getPrintableCode(editorState) : value;
      },
    }),
    [value],
  );

  useEffect(() => {
    writeStoredTheme(activeTheme);
  }, [activeTheme]);

  const handleThemeChange = (nextTheme: XMLCodeThemeName) => {
    if (theme === undefined) setInternalTheme(nextTheme);
    onThemeChange?.(nextTheme);
  };

  return (
    <ConfigProvider theme={{ algorithm: preset.dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <div
        className={cn('flex flex-col overflow-hidden rounded border', preset.containerClassName, className)}
        data-theme={activeTheme}
      >
        <div className={cn('flex shrink-0 justify-end border-b px-2 py-1', preset.toolbarClassName)}>
          <Segmented<XMLCodeThemeName>
            size='small'
            options={THEME_OPTIONS}
            value={activeTheme}
            onChange={handleThemeChange}
          />
        </div>
        <CodeMirror
          ref={codeMirrorRef}
          className='min-h-0 flex-1 overflow-auto text-xs'
          value={value}
          height='100%'
          theme='none'
          extensions={extensions}
          editable={!readOnly}
          readOnly={readOnly}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            foldKeymap: collapsible,
            highlightActiveLine: !readOnly,
            highlightActiveLineGutter: !readOnly,
            autocompletion: !readOnly,
            history: !readOnly,
            tabSize: indentSize,
          }}
          onChange={handleChange}
        />
      </div>
    </ConfigProvider>
  );
});

CodeMirrorXML.displayName = 'CodeMirrorXML';

export default CodeMirrorXML;
