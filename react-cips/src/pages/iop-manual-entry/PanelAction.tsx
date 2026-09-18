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

/** 手工补录操作栏。 */
const PanelAction = ({
  isMakerNode,
  isCheckerNode,
  approvalDisabled,
  updated,
  rawLoading,
  currentRaw,
  originRaw,
  onUpdate,
  onReset,
  onRedo,
  onConfirm,
  onCopy,
  onPrint,
  onApproval,
}: PanelActionProps) => {
  /** 当前原文是否禁止更新。 */
  const updateDisabled = rawLoading || !currentRaw.trim() || currentRaw === originRaw;
  /** 当前原文是否禁止复制和打印。 */
  const rawActionDisabled = rawLoading || !currentRaw;

  return (
    <div className='mb-3 flex shrink-0 items-center justify-between gap-3'>
      <div className='flex flex-wrap gap-2'>
        {isMakerNode && !updated && (
          <>
            <Button size='small' type='primary' icon={<SaveOutlined />} disabled={updateDisabled} onClick={onUpdate}>
              Update
            </Button>
            <Button size='small' icon={<ReloadOutlined />} disabled={rawLoading} onClick={onReset}>
              Reset
            </Button>
          </>
        )}

        {isMakerNode && updated && (
          <>
            <Button size='small' icon={<RollbackOutlined />} onClick={onRedo}>
              Redo
            </Button>
            <Button size='small' type='primary' icon={<CheckCircleOutlined />} onClick={onConfirm}>
              Confirm
            </Button>
          </>
        )}

        {isCheckerNode && (
          <>
            <Button
              size='small'
              type='primary'
              icon={<CheckOutlined />}
              disabled={approvalDisabled}
              onClick={() => onApproval(ApprovalYesNo.Yes)}
            >
              Approve
            </Button>
            <Button
              size='small'
              danger
              icon={<CloseOutlined />}
              disabled={approvalDisabled}
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

interface PanelActionProps {
  /** 是否展示 Maker 操作。 */
  isMakerNode: boolean;
  /** 是否展示 Checker 1 操作。 */
  isCheckerNode: boolean;
  /** 审批操作是否禁用。 */
  approvalDisabled: boolean;
  /** Maker 是否已完成 Update。 */
  updated: boolean;
  /** 原文是否正在加载。 */
  rawLoading: boolean;
  /** 当前编辑或展示的原文。 */
  currentRaw: string;
  /** 首次查询的原文。 */
  originRaw: string;
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

export default PanelAction;
