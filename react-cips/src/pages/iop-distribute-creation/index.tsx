import { Alert, App as AntdApp, Button, Form, Input, Result, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { postDCApprove, postDCHandling } from '@/api/iop/iop-distribute-creation';
import type { IopDistributeCreationHandlingRequest } from '@/api/iop/iop-distribute-creation';
import type { IopWorkflowRequest } from '@/api/iop/iop';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';
import { openModalDistributeCreationApprove, openModalDistributeCreationReject } from './ModalApproval';

/** 创建分发任务经办填写字段。 */
type DistributionCreationFields = Pick<
  IopDistributeCreationHandlingRequest,
  'targeSysId' | 'msgOwnerDept' | 'msgOwnerGroup'
>;

/** 创建分发任务 IOP 业务页面。 */
const IopDistributeCreation = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  const [distributionCreationForm] = Form.useForm<DistributionCreationFields>();
  /** Maker节点。 */
  const isMakerNode = task.taskNode === IopTaskNode.MakerStage || task.taskNode === IopTaskNode.MakerRework;
  /** Checker1节点。 */
  const isCheckerNode = task.taskNode === IopTaskNode.Checker1Stage || task.taskNode === IopTaskNode.Approved;
  /** Approved节点。 */
  const approvalDisabled = task.taskNode === IopTaskNode.Approved;

  // 【Create】
  const handleDistributionCreation = async (fields: DistributionCreationFields) => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postDCHandling({
        ...buildWorkflowRequest(task),
        ...normalizeDistributionCreationFields(fields),
      });
      distributionCreationForm.resetFields();
      message.success('Distribution creation submitted');
    } finally {
      stopGlobalLoading();
    }
  };

  // 【Reject】 【Approve】
  const handleApproval = async (next: boolean) => {
    const approvalResult = next
      ? await openModalDistributeCreationApprove()
      : await openModalDistributeCreationReject();
    if (!approvalResult) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      await postDCApprove({
        ...buildWorkflowRequest(task),
        next,
        rejectReason: typeof approvalResult === 'string' ? approvalResult : '',
      });
      message.success(next ? 'Task approved' : 'Task rejected');
    } finally {
      stopGlobalLoading();
    }
  };

  if (!isMakerNode && !isCheckerNode) {
    return (
      <Result
        status='warning'
        title='Task unavailable at the current stage'
        subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode as IopTaskNode] ?? task.taskNode}`}
      />
    );
  }

  return (
    <div className='flex h-full flex-col overflow-hidden p-4'>
      <h1 className='mb-3 mt-0 shrink-0 text-xl font-semibold leading-7'>Distribution Creation</h1>

      <div className='mb-3 shrink-0'>
        {isMakerNode && (
          <Form
            form={distributionCreationForm}
            size='small'
            layout='inline'
            initialValues={{ targeSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}
            onFinish={handleDistributionCreation}
          >
            <Form.Item name='targeSysId' label='Target System ID' className='mb-0'>
              <Input className='w-40' maxLength={10} placeholder='Enter target system ID' />
            </Form.Item>
            <Form.Item label='Owner By' className='mb-0'>
              <Space.Compact block>
                <Form.Item name='msgOwnerDept' noStyle>
                  <Input className='min-w-0 flex-1' allowClear maxLength={10} placeholder='Department' />
                </Form.Item>
                <Form.Item name='msgOwnerGroup' noStyle>
                  <Input className='min-w-0 flex-1' allowClear maxLength={10} placeholder='Group' />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
            <Form.Item className='mb-0'>
              <Button size='small' type='primary' htmlType='submit'>
                Create
              </Button>
            </Form.Item>
          </Form>
        )}

        {isCheckerNode && (
          <div className='flex gap-2'>
            <Button
              size='small'
              danger
              icon={<CloseOutlined />}
              disabled={approvalDisabled}
              onClick={() => handleApproval(false)}
            >
              Reject
            </Button>
            <Button
              size='small'
              type='primary'
              icon={<CheckOutlined />}
              disabled={approvalDisabled}
              onClick={() => handleApproval(true)}
            >
              Approve
            </Button>
          </div>
        )}
      </div>

      {task.taskNode === IopTaskNode.MakerRework && (
        <Alert
          className='mb-3 shrink-0'
          type='warning'
          showIcon
          message='Reject Reason'
          description={task.rejectReason || 'No reject reason provided.'}
        />
      )}

      <div className='min-h-0 flex-1 overflow-hidden'>
        <PanelMessageDetail
          temp
          msgId={task.busRefNo}
          msgDirection={task.msgDirection}
          businessType={task.businessType}
        />
      </div>
    </div>
  );
};

export default IopDistributeCreation;

/**
 * DistributeCreation 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST12-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Maker Rework：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST12-REWORK-001&nodnam=MAKER_REWORK&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 1：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST12-CHECKER1-001&nodnam=CHECKER1&userid=USER001&orgid=ORG001&userName=Tester
 */

/** 构造创建分发任务接口共用的任务与工作流字段。 */
const buildWorkflowRequest = (task: IopTaskData): IopWorkflowRequest => ({
  msgId: task.busRefNo,
  taskId: task.taskId,
  userId: task.userId,
  orgId: task.orgId,
  iopNodNam: task.iopNodNam,
  iopWfTaskId: task.iopWfTaskId,
  iopWkiId: task.iopWkiId ?? task.iopWfTaskId,
});

/** 清理创建分发任务经办字段空白。 */
const normalizeDistributionCreationFields = (fields: DistributionCreationFields): DistributionCreationFields => ({
  targeSysId: fields.targeSysId?.trim() || undefined,
  msgOwnerDept: fields.msgOwnerDept?.trim() || undefined,
  msgOwnerGroup: fields.msgOwnerGroup?.trim() || undefined,
});
