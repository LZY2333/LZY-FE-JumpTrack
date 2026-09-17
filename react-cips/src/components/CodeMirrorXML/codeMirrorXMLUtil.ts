import { foldedRanges } from '@codemirror/language';
import type { EditorState } from '@uiw/react-codemirror';

const FOLD_PLACEHOLDER = '…';

/** 按 XML CodeMirror 当前折叠区间生成打印内容。 */
export const getPrintableCode = (state: EditorState) => {
  const source = state.doc.toString();
  const foldedRangeCursor = foldedRanges(state).iter();
  let sourceOffset = 0;
  let printableCode = '';

  while (foldedRangeCursor.value) {
    if (foldedRangeCursor.from >= sourceOffset) {
      printableCode += source.slice(sourceOffset, foldedRangeCursor.from);
      printableCode += FOLD_PLACEHOLDER;
      sourceOffset = foldedRangeCursor.to;
    }
    foldedRangeCursor.next();
  }

  return printableCode + source.slice(sourceOffset);
};
