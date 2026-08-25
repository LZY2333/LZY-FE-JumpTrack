declare module 'react-xml-viewer' {
  import type { ComponentType, ReactElement } from 'react';

  export interface ReactXMLViewerTheme {
    attributeKeyColor?: string;
    attributeValueColor?: string;
    cdataColor?: string;
    commentColor?: string;
    fontFamily?: string;
    separatorColor?: string;
    tagColor?: string;
    textColor?: string;
  }

  export interface ReactXMLViewerProps {
    xml?: string;
    indentSize?: number;
    invalidXml?: ReactElement;
    collapsible?: boolean;
    /** 2.0.1 版本使用的原始属性名，拼写在后续版本中才得到修正。 */
    initalCollapsedDepth?: number;
    theme?: ReactXMLViewerTheme;
  }

  const ReactXMLViewer: ComponentType<ReactXMLViewerProps>;

  export default ReactXMLViewer;
}
