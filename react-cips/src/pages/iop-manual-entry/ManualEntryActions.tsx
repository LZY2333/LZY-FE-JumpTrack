import { Button } from 'antd';
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  PrinterOutlined,
  ReloadOutlined,
  RollbackOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { ApprovalYesNo } from '@/types/enums';
import type { ManualEntryState } from './useManualEntry';

/** 手工补录操作栏。 */
const ManualEntryActions = ({
  manualEntry,
  onUpdate,
  onReset,
  onRedo,
  onConfirm,
  onCopy,
  onPrint,
  onApproval,
}: ManualEntryActionsProps) => {
  const rawActionDisabled = manualEntry.rawLoading || !manualEntry.currentRaw;

  return (
    <div className='mb-3 flex shrink-0 items-center justify-between gap-3'>
      <div className='flex flex-wrap gap-2'>
        {manualEntry.makerMode && !manualEntry.updated && (
          <>
            <Button
              size='small'
              type='primary'
              icon={<SaveOutlined />}
              disabled={!manualEntry.canUpdate}
              onClick={onUpdate}
            >
              Update
            </Button>
            <Button size='small' icon={<ReloadOutlined />} disabled={manualEntry.rawLoading} onClick={onReset}>
              Reset
            </Button>
          </>
        )}

        {manualEntry.makerMode && manualEntry.updated && (
          <>
            <Button size='small' icon={<RollbackOutlined />} onClick={onRedo}>
              Redo
            </Button>
            <Button size='small' type='primary' icon={<CheckCircleOutlined />} onClick={onConfirm}>
              Confirm
            </Button>
          </>
        )}

        {manualEntry.checkerMode && (
          <>
            <Button
              size='small'
              type='primary'
              icon={<CheckOutlined />}
              onClick={() => onApproval(ApprovalYesNo.Yes)}
            >
              Approve
            </Button>
            <Button
              size='small'
              danger
              icon={<CloseOutlined />}
              onClick={() => onApproval(ApprovalYesNo.No)}
            >
              Reject
            </Button>
          </>
        )}
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button size='small' icon={<CopyOutlined />} disabled={rawActionDisabled} onClick={onCopy}>
          Copy Current
        </Button>
        <Button size='small' icon={<PrinterOutlined />} disabled={rawActionDisabled} onClick={onPrint}>
          Print Current
        </Button>
      </div>
    </div>
  );
};

interface ManualEntryActionsProps {
  /** 页面业务状态。 */
  manualEntry: ManualEntryState;
  /** 保存原文。 */
  onUpdate: () => void;
  /** 恢复原文。 */
  onReset: () => void;
  /** 返回编辑。 */
  onRedo: () => void;
  /** 确认经办。 */
  onConfirm: () => void;
  /** 复制当前原文。 */
  onCopy: () => void;
  /** 打印当前原文。 */
  onPrint: () => void;
  /** 提交审批。 */
  onApproval: (next: ApprovalYesNo) => void;
}

export default ManualEntryActions;
