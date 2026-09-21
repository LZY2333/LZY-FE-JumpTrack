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

/** 手工补录操作栏。 */
const PanelAction = ({
  isMakerNode,
  isCheckerNode,
  updated,
  onUpdate,
  onReset,
  onRollback,
  onConfirm,
  onCopy,
  onPrint,
  onApproval,
}: PanelActionProps) => {
  return (
    <div className='mb-3 flex shrink-0 items-center justify-between gap-3'>
      <div className='flex flex-wrap gap-2'>
        {isMakerNode && !updated && (
          <>
            <Button size='small' type='primary' icon={<SaveOutlined />} onClick={onUpdate}>
              Update
            </Button>
            <Button size='small' icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>
          </>
        )}

        {isMakerNode && updated && (
          <>
            <Button size='small' icon={<RollbackOutlined />} onClick={onRollback}>
              Rollback
            </Button>
            <Button size='small' type='primary' icon={<CheckCircleOutlined />} onClick={onConfirm}>
              Confirm
            </Button>
          </>
        )}

        {isCheckerNode && (
          <>
            <Button size='small' type='primary' icon={<CheckOutlined />} onClick={() => onApproval(true)}>
              Approve
            </Button>
            <Button size='small' danger icon={<CloseOutlined />} onClick={() => onApproval(false)}>
              Reject
            </Button>
          </>
        )}
      </div>

      {isMakerNode && !updated && (
        <div className='flex flex-wrap gap-2'>
          <Button size='small' icon={<CopyOutlined />} onClick={onCopy}>
            Copy Current
          </Button>
          <Button size='small' icon={<PrinterOutlined />} onClick={onPrint}>
            Print Current
          </Button>
        </div>
      )}
    </div>
  );
};

interface PanelActionProps {
  /** 是否展示 Maker 操作。 */
  isMakerNode: boolean;
  /** 是否展示 Checker 1 操作。 */
  isCheckerNode: boolean;
  /** Maker 是否已完成 Update。 */
  updated: boolean;
  /** 更新报文原文。 */
  onUpdate: () => void;
  /** 恢复原文。 */
  onReset: () => void;
  /** 回滚报文原文更新。 */
  onRollback: () => void;
  /** 确认经办。 */
  onConfirm: () => void;
  /** 复制当前原文。 */
  onCopy: () => void;
  /** 打印当前原文。 */
  onPrint: () => void;
  /** 提交审批。 */
  onApproval: (next: boolean) => void;
}

export default PanelAction;
