import { forwardRef, useEffect, useState } from 'react';
import type { ComponentProps, CSSProperties, ReactElement } from 'react';
import { ConfigProvider, Segmented, theme as antdTheme } from 'antd';
import cn from 'classnames';
import ReactXMLViewer from 'react-xml-viewer';

export type XMLViewerThemeName = 'light' | 'dark';

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
  invalidXml?: ReactElement;
}

type ReactXMLViewerTheme = NonNullable<ComponentProps<typeof ReactXMLViewer>['theme']>;

interface XMLViewerThemePreset {
  label: string;
  dark: boolean;
  backgroundColor: string;
  borderColor: string;
  viewerTheme: ReactXMLViewerTheme;
}

const XML_VIEWER_THEMES: Record<XMLViewerThemeName, XMLViewerThemePreset> = {
  light: {
    label: 'Light',
    dark: false,
    backgroundColor: '#f6f8fa',
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
    },
  },
  dark: {
    label: 'Dark',
    dark: true,
    backgroundColor: '#282a36',
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
    },
  },
};

const THEME_OPTIONS = Object.entries(XML_VIEWER_THEMES).map(([value, preset]) => ({
  label: preset.label,
  value: value as XMLViewerThemeName,
}));

const isXMLViewerThemeName = (value: string | null): value is XMLViewerThemeName =>
  value === 'light' || value === 'dark';

/** 将旧版本持久化的主题名迁移到 light/dark，保留用户原有明暗偏好。 */
const normalizeStoredTheme = (value: string | null): XMLViewerThemeName | undefined => {
  if (isXMLViewerThemeName(value)) return value;
  if (value === 'github-light') return 'light';
  if (value === 'dracula') return 'dark';
  return undefined;
};

const readStoredTheme = (fallback: XMLViewerThemeName) => {
  try {
    const storedTheme = localStorage.getItem(XML_VIEWER_THEME_STORAGE_KEY);
    return normalizeStoredTheme(storedTheme) ?? fallback;
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
const XMLViewer = forwardRef<HTMLDivElement, XMLViewerProps>(
  (
    {
      xml,
      className,
      style,
      theme,
      defaultTheme = 'light',
      onThemeChange,
      indentSize = 2,
      collapsible = true,
      initialCollapsedDepth,
      invalidXml,
    },
    contentRef,
  ) => {
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
          className={cn('relative flex flex-col overflow-hidden rounded border', className)}
          data-theme={activeTheme}
          style={{
            backgroundColor: preset.backgroundColor,
            borderColor: preset.borderColor,
            colorScheme: preset.dark ? 'dark' : 'light',
            ...style,
          }}
        >
          <div className='absolute right-6 top-2 z-10'>
            <Segmented<XMLViewerThemeName>
              size='small'
              options={THEME_OPTIONS}
              value={activeTheme}
              onChange={handleThemeChange}
            />
          </div>
          <div ref={contentRef} className='min-h-0 flex-1 overflow-auto p-3'>
            <ReactXMLViewer
              xml={xml}
              theme={preset.viewerTheme}
              indentSize={indentSize}
              collapsible={collapsible}
              initalCollapsedDepth={initialCollapsedDepth}
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
  },
);

XMLViewer.displayName = 'XMLViewer';

export default XMLViewer;
