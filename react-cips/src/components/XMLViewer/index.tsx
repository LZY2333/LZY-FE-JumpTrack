import { useEffect, useState } from 'react';
import type { ComponentProps, CSSProperties, ReactElement } from 'react';
import { ConfigProvider, Segmented, theme as antdTheme } from 'antd';
import cn from 'classnames';
import ReactXMLViewer from 'react-xml-viewer';

export type XMLViewerThemeName = 'github-light' | 'dracula';

const XML_VIEWER_THEME_STORAGE_KEY = 'xml-viewer-theme';

export interface XMLViewerProps {
  xml: string;
  className?: string;
  style?: CSSProperties;
  theme?: XMLViewerThemeName;
  defaultTheme?: XMLViewerThemeName;
  onThemeChange?: (theme: XMLViewerThemeName) => void;
  indentSize?: number;
  collapsible?: boolean;
  initialCollapsedDepth?: number;
  showLineNumbers?: boolean;
  invalidXml?: ReactElement;
}

type ReactXMLViewerTheme = NonNullable<ComponentProps<typeof ReactXMLViewer>['theme']>;

interface XMLViewerThemePreset {
  label: string;
  dark: boolean;
  backgroundColor: string;
  toolbarBackgroundColor: string;
  borderColor: string;
  viewerTheme: ReactXMLViewerTheme;
}

const XML_VIEWER_THEMES: Record<XMLViewerThemeName, XMLViewerThemePreset> = {
  'github-light': {
    label: 'GitHub Light',
    dark: false,
    backgroundColor: '#f6f8fa',
    toolbarBackgroundColor: '#ffffff',
    borderColor: '#d0d7de',
    viewerTheme: {
      tagColor: '#cf222e',
      textColor: '#24292f',
      attributeKeyColor: '#0550ae',
      attributeValueColor: '#0a3069',
      separatorColor: '#57606a',
      commentColor: '#6e7781',
      cdataColor: '#116329',
      fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
      lineNumberBackground: '#f6f8fa',
      lineNumberColor: '#8c959f',
    },
  },
  dracula: {
    label: 'Dracula',
    dark: true,
    backgroundColor: '#282a36',
    toolbarBackgroundColor: '#21222c',
    borderColor: '#44475a',
    viewerTheme: {
      tagColor: '#ff79c6',
      textColor: '#f8f8f2',
      attributeKeyColor: '#50fa7b',
      attributeValueColor: '#f1fa8c',
      separatorColor: '#f8f8f2',
      commentColor: '#6272a4',
      cdataColor: '#8be9fd',
      fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
      lineNumberBackground: '#21222c',
      lineNumberColor: '#6272a4',
    },
  },
};

const THEME_OPTIONS = Object.entries(XML_VIEWER_THEMES).map(([value, preset]) => ({
  label: preset.label,
  value: value as XMLViewerThemeName,
}));

const isXMLViewerThemeName = (value: string | null): value is XMLViewerThemeName =>
  value === 'github-light' || value === 'dracula';

const readStoredTheme = (fallback: XMLViewerThemeName) => {
  try {
    const storedTheme = localStorage.getItem(XML_VIEWER_THEME_STORAGE_KEY);
    return isXMLViewerThemeName(storedTheme) ? storedTheme : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredTheme = (theme: XMLViewerThemeName) => {
  try {
    localStorage.setItem(XML_VIEWER_THEME_STORAGE_KEY, theme);
  } catch {
    // Storage 不可用时仅保留当前组件生命周期内的主题状态。
  }
};

/** 统一 XML 的格式化展示、主题切换和异常内容回退。 */
const XMLViewer = ({
  xml,
  className,
  style,
  theme,
  defaultTheme = 'github-light',
  onThemeChange,
  indentSize = 2,
  collapsible = true,
  initialCollapsedDepth,
  showLineNumbers = true,
  invalidXml,
}: XMLViewerProps) => {
  const [internalTheme, setInternalTheme] = useState<XMLViewerThemeName>(() => readStoredTheme(defaultTheme));
  const activeTheme = theme ?? internalTheme;
  const preset = XML_VIEWER_THEMES[activeTheme];

  useEffect(() => {
    writeStoredTheme(activeTheme);
  }, [activeTheme]);

  const handleThemeChange = (nextTheme: XMLViewerThemeName) => {
    if (theme === undefined) setInternalTheme(nextTheme);
    onThemeChange?.(nextTheme);
  };

  return (
    <ConfigProvider theme={{ algorithm: preset.dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <div
        className={cn('flex flex-col overflow-hidden rounded border', className)}
        data-theme={activeTheme}
        style={{
          backgroundColor: preset.backgroundColor,
          borderColor: preset.borderColor,
          colorScheme: preset.dark ? 'dark' : 'light',
          ...style,
        }}
      >
        <div
          className='flex shrink-0 items-center justify-end border-b px-3 py-2'
          style={{ backgroundColor: preset.toolbarBackgroundColor, borderColor: preset.borderColor }}
        >
          <Segmented<XMLViewerThemeName>
            aria-label='XML 展示主题'
            size='small'
            options={THEME_OPTIONS}
            value={activeTheme}
            onChange={handleThemeChange}
          />
        </div>
        <div className='min-h-0 flex-1 overflow-auto p-3'>
          <ReactXMLViewer
            xml={xml}
            theme={preset.viewerTheme}
            indentSize={indentSize}
            collapsible={collapsible}
            initialCollapsedDepth={initialCollapsedDepth}
            showLineNumbers={showLineNumbers}
            invalidXml={
              invalidXml ?? (
                <pre
                  className='m-0 whitespace-pre overflow-auto font-mono text-xs'
                  style={{ color: preset.viewerTheme.textColor }}
                >
                  {xml}
                </pre>
              )
            }
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default XMLViewer;
