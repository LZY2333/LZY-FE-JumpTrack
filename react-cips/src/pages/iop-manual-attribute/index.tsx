import { App as AntdApp, Button, Form, Input, Result, Space } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { postMAHandling } from '@/api/iop/iop-manual-attribute';
import type { IopManualAttributeHandlingRequest } from '@/api/iop/iop-manual-attribute';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopTaskNode } from '@/types/enums';

/** 手工归属经办填写字段。 */
type ManualAttributionFields = Pick<IopManualAttributeHandlingRequest, 'targeSysId' | 'msgOwnerDept' | 'msgOwnerGroup'>;

/** IOP手工归属 */
const IopManualAttribute = () => {
  const task = useOutletContext<IopTaskData>();
  const { message } = AntdApp.useApp();
  const [attributionForm] = Form.useForm<ManualAttributionFields>();
  /** Maker节点。 */
  const isMakerNode = task.taskNode === IopTaskNode.MakerStage;
  /** 手工归属仅支持经办和完成状态。 */
  const isSupportedNode = isMakerNode || task.taskNode === IopTaskNode.Approved;

  // 【Assign】
  const handleAttribution = async (fields: ManualAttributionFields) => {
    const stopGlobalLoading = startGlobalLoading();
    try {
      await postMAHandling({
        msgId: task.busRefNo,
        taskId: task.taskId,
        userId: task.userId,
        orgId: task.orgId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        iopWkiId: task.iopWkiId ?? task.iopWfTaskId,
        targeSysId: fields.targeSysId?.trim() || undefined,
        msgOwnerDept: fields.msgOwnerDept?.trim() || undefined,
        msgOwnerGroup: fields.msgOwnerGroup?.trim() || undefined,
      });
      attributionForm.resetFields();
      message.success('Message attribution submitted');
    } finally {
      stopGlobalLoading();
    }
  };

  if (!isSupportedNode) {
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
      <h1 className='mb-3 mt-0 shrink-0 text-xl font-semibold leading-7'>Manual Attribution</h1>

      {isMakerNode && (
        <Form
          form={attributionForm}
          size='small'
          layout='inline'
          className='mb-3 shrink-0'
          initialValues={{ targeSysId: '', msgOwnerDept: '', msgOwnerGroup: '' }}
          onFinish={handleAttribution}
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
              Assign
            </Button>
          </Form.Item>
        </Form>
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

export default IopManualAttribute;

/**
 * ManualAttribute 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST11-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Approved：
 * http://localhost:5173/iop?flwiid=FLWI-DEMO-001&applicationid=CIPSIN20260822000001&wkiid=ST11-APPROVED-001&nodnam=APPROVED&userid=USER001&orgid=ORG001&userName=Tester
 */
