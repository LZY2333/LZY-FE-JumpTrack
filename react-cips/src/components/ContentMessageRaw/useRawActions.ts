import { App } from 'antd';
import { copyText } from '@/utils/fileUtil';
import { printXmlDocument } from './contentRawUtil';

/** 报文原文操作上下文 */
interface RawActionsParams {
  /** 当前操作的报文标识 */
  msgId?: string;
  /** 完整原文或当前编辑内容 */
  content: string;
  /** 是否正在加载原文 */
  loading?: boolean;
  /** 点击打印时读取编辑器的实时折叠内容 */
  getPrintableValue?: () => string;
}

/** 为单条原文及未展开的当前报文提供复制和打印操作 */
const useRawActions = ({ msgId, content, loading, getPrintableValue }: RawActionsParams) => {
  const { message } = App.useApp();

  /** 复制完整原文，不受 XML 折叠状态影响 */
  const copyCurrent = async () => {
    if (!checkAvailable()) return;
    try {
      await copyText(content);
      message.success('Current message copied');
    } catch {
      message.error('Failed to copy the raw message');
    }
  };

  /** 打印当前编辑器的折叠视图，未挂载编辑器时打印完整原文 */
  const printCurrent = () => {
    if (!checkAvailable()) return;
    const opened = printXmlDocument(`${msgId || 'message'}.xml`, getPrintableValue?.() ?? content);
    if (!opened) message.error('The print window was blocked. Allow pop-ups and try again.');
  };

  const checkAvailable = () => {
    if (loading) {
      message.warning('Raw message is still loading');
      return false;
    }
    if (!content) {
      message.warning('Raw message is unavailable');
      return false;
    }
    return true;
  };

  return { copyCurrent, printCurrent };
};

export default useRawActions;
