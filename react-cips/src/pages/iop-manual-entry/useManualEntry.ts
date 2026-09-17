import { useEffect, useState } from 'react';
import useMessageDetail from '@/components/MessageInfo/useMessageDetail';
import useMessageRaw from '@/components/ContentMessageRaw/useMessageRaw';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { IopTaskNode } from '@/types/enums';

/** 手工补录页面的原文、明细及审批流程编排。 */
const useManualEntry = (task: IopTaskData) => {
  const makerMode = task.taskNode === IopTaskNode.MakerStage || task.taskNode === IopTaskNode.MakerRework;
  const checkerMode = task.taskNode === IopTaskNode.Checker1Stage;
  /** 当前编辑或展示的原文。 */
  const [currentRaw, setCurrentRaw] = useState('');
  /** 首次查询的原文，仅供 Reset 使用。 */
  const [originRaw, setOriginRaw] = useState('');
  /** Maker 是否已完成 Update。 */
  const [updated, setUpdated] = useState(false);
  const { raw: rawMessage, rawLoading, rawError } = useMessageRaw(task.busRefNo, task.msgDirection);
  const { detail, detailError } = useMessageDetail({
    msgId: task.busRefNo,
    msgDirection: task.msgDirection,
    businessType: task.businessType,
    enabled: checkerMode || updated,
  });
  const canUpdate = !rawLoading && Boolean(currentRaw.trim()) && currentRaw !== originRaw;
  const currentRawMessage = {
    msgId: rawMessage?.msgId ?? task.busRefNo,
    msgContent: currentRaw,
    createTime: rawMessage?.createTime ?? '',
  };

  // 后台原文返回时建立当前 Task 的固定 Reset 基线。
  useEffect(() => {
    if (!rawMessage) return;

    setOriginRaw(rawMessage.msgContent);
    setCurrentRaw(rawMessage.msgContent);
    setUpdated(false);
  }, [rawMessage]);

  return {
    currentRaw,
    originRaw,
    currentRawMessage,
    rawLoading,
    rawError,
    detail,
    detailError,
    makerMode,
    checkerMode,
    updated,
    canUpdate,
    setCurrentRaw,
    setUpdated,
  };
};

export type ManualEntryState = ReturnType<typeof useManualEntry>;

export default useManualEntry;
