import { foldGutter, forceParsing } from '@codemirror/language';
import { ViewPlugin } from '@uiw/react-codemirror';
import type { EditorView, Extension, ViewUpdate } from '@uiw/react-codemirror';

const XML_FOLD_REFRESH_DELAY = 120;
const XML_FOLD_PARSE_TIMEOUT = 30;
const XML_FOLD_PARSE_MAX_RETRIES = 3;
const XML_FOLD_MARKER_CLASS = 'cm-foldMarker';
const XML_FOLD_MARKER_EXPANDED_CLASS = 'cm-foldMarker-expanded';
const XML_FOLD_MARKER_ICON_CLASS = 'cm-foldMarkerIcon';

/** 创建 XML 原生折叠栏，并在编辑后补齐异步语法解析。 */
export const createXMLFoldExtensions = (): Extension[] => {
  return [foldGutter({ markerDOM: createFoldMarker }), ViewPlugin.fromClass(XMLFoldRefreshPlugin)];
};

/** 在用户停止输入后分片推进解析，使新增的完整 XML 节点及时显示折叠入口。 */
class XMLFoldRefreshPlugin {
  private refreshTimer: number | undefined;
  private parseTarget = 0;
  private parseRetries = 0;

  constructor(private readonly view: EditorView) {}

  update(update: ViewUpdate) {
    if (!update.docChanged) return;

    this.parseTarget = update.state.doc.length;
    this.parseRetries = 0;
    this.scheduleRefresh();
  }

  destroy() {
    window.clearTimeout(this.refreshTimer);
  }

  private scheduleRefresh() {
    window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(this.refreshFoldGutter, XML_FOLD_REFRESH_DELAY);
  }

  private refreshFoldGutter = () => {
    this.refreshTimer = undefined;
    const parseTarget = Math.min(this.parseTarget, this.view.state.doc.length);
    if (forceParsing(this.view, parseTarget, XML_FOLD_PARSE_TIMEOUT)) return;

    this.parseRetries += 1;
    if (this.parseRetries < XML_FOLD_PARSE_MAX_RETRIES) this.scheduleRefresh();
  };
}

/** 使用 CodeMirror markerDOM 构造尺寸稳定的折叠箭头。 */
const createFoldMarker = (open: boolean) => {
  const marker = document.createElement('span');
  marker.className = open ? `${XML_FOLD_MARKER_CLASS} ${XML_FOLD_MARKER_EXPANDED_CLASS}` : XML_FOLD_MARKER_CLASS;
  marker.title = open ? 'Fold node' : 'Unfold node';

  const icon = document.createElement('span');
  icon.className = XML_FOLD_MARKER_ICON_CLASS;
  marker.appendChild(icon);
  return marker;
};
