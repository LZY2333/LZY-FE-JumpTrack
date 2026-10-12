import { useEffect, useState } from 'react';
import { Alert, App as AntdApp, Button, Divider, Form, Result } from 'antd';
import type { FormInstance } from 'antd';
import { CheckOutlined, CloseOutlined, CommentOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { getIRForm, postIRApprove } from '@/api/iop';
import { getMessage } from '@/api/messages';
import CardCollapse from '@/components/CardCollapse';
import IopPageShell from '@/components/IopPageCommon';
import {
  IopTaskContent,
  IopTaskMsgRelatedId,
  IopTaskMsgRecvCipsCode,
  IopTaskMsgType,
} from '@/components/IopPageCommon/formItem';
import { buildInquiryReplyPayload } from '@/components/IopPageCommon/inquiryReplyUtil';
import type { IopInquiryReplyFormFields } from '@/components/IopPageCommon/inquiryReplyUtil';
import PanelMessageDetail from '@/components/MessageInfo/PanelMessageDetail';
import type { IopTaskData } from '@/router/iop-routes/useIopGuard';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import { IOP_TASK_NODE_LABELS, IopInquiryReplyMsgType, IopTaskNode } from '@/types/enums';
import { openModalInquiryReplyApprove, openModalInquiryReplyReject } from './ModalApproval';
import { openModalInquiryReply } from './ModalInquiryReply';

/** 非初始经办环节的查询查复内容面板属性 */
interface PanelReplyContentProps {
  /** 当前任务及来源报文信息 */
  task: IopTaskData;
  /** 查询查复内容表单 */
  form: FormInstance<IopInquiryReplyFormFields>;
  /** 返工环节提交查询查复内容 */
  onSubmit: (fields: IopInquiryReplyFormFields) => Promise<void>;
}

const MAKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.MakerStage, IopTaskNode.MakerRework]);
const CHECKER_TASK_NODES = new Set<IopTaskNode>([IopTaskNode.Checker1Stage, IopTaskNode.Checker2Stage]);
const SUPPORTED_TASK_NODES = new Set<IopTaskNode>([...MAKER_TASK_NODES, ...CHECKER_TASK_NODES, IopTaskNode.Approved]);
const FORM_QUERY_TASK_NODES = new Set<IopTaskNode>([
  IopTaskNode.MakerRework,
  ...CHECKER_TASK_NODES,
  IopTaskNode.Approved,
]);
const INQUIRY_REPLY_HIGH_LIGHT_FIELDS = ['content'] as const;
// 展开时解除折叠卡片的高度限制，由页面内容区统一滚动。
const REPLY_CONTENT_EXPANDED_BODY_CLASS_NAME = '[&>div]:max-h-none [&>div]:overflow-visible';

/** 查询查复 IOP 业务页面。 */
const IopInquiryReply = () => {
  const task = useOutletContext<IopTaskData>();
  const { message, modal } = AntdApp.useApp();
  const [inquiryReplyForm] = Form.useForm<IopInquiryReplyFormFields>();
  const isMakerStage = task.taskNode === IopTaskNode.MakerStage;
  const isCheckerNode = CHECKER_TASK_NODES.has(task.taskNode);

  /** 返工、审批及已审批节点查询之前填写的查询查复内容。 */
  useEffect(() => {
    if (!FORM_QUERY_TASK_NODES.has(task.taskNode)) return;
    inquiryReplyForm.resetFields();

    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    getIRForm(task.taskId)
      .then((fields) => {
        if (active && fields) inquiryReplyForm.setFieldsValue(fields);
      })
      .catch(() => undefined)
      .finally(stopGlobalLoading);

    return () => {
      active = false;
      stopGlobalLoading();
    };
  }, [inquiryReplyForm, task.taskId, task.taskNode]);

  // 【Submit】
  const handleSubmit = async (fields: IopInquiryReplyFormFields) => {
    if (fields.msgType === IopInquiryReplyMsgType.Type302 && !task.mainMsgId) {
      message.warning('Main message ID is unavailable for the inquiry reply');
      return;
    }

    const stopGlobalLoading = startGlobalLoading();
    try {
      await postIRApprove({
        taskId: task.taskId,
        taskNode: task.taskNode,
        ...buildInquiryReplyPayload({
          fields,
          sourceMsgId: task.busRefNo,
          sourceMainMsgId: task.mainMsgId,
          forceMsgId: true,
        }),
        userId: task.userId,
        orgId: task.orgId,
        iopWkiId: task.iopWkiId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        next: true,
      });
      message.success('Inquiry reply submitted');
    } finally {
      stopGlobalLoading();
    }
  };

  /** Maker Stage 使用来源报文校验查询查复内容并提交经办 */
  const handleInquiryReply = async () => {
    if (!task.busRefNo) {
      message.warning('Message information is unavailable.');
      return;
    }

    const stopGlobalLoading = startGlobalLoading();
    const detail = await getMessage(task.busRefNo).finally(stopGlobalLoading);
    if (!detail) {
      message.warning('Message information is unavailable.');
      return;
    }

    const submitted = await openModalInquiryReply(modal, {
      task,
      sourceMessage: detail.msgBasicInfo,
    });
    if (submitted) message.success('Inquiry reply submitted');
  };

  // 【Reject】 【Approve】
  const handleApproval = async (next: boolean) => {
    const approvalResult = next ? await openModalInquiryReplyApprove(modal) : await openModalInquiryReplyReject(modal);
    if (!approvalResult) return;

    const stopGlobalLoading = startGlobalLoading();
    try {
      const rejectReason = typeof approvalResult === 'string' ? approvalResult : undefined;
      await postIRApprove({
        taskId: task.taskId,
        taskNode: task.taskNode,
        msgId: task.busRefNo,
        userId: task.userId,
        orgId: task.orgId,
        iopWkiId: task.iopWkiId,
        iopNodNam: task.iopNodNam,
        iopWfTaskId: task.iopWfTaskId,
        next,
        rejectReason,
      });
      message.success(next ? 'Task approved' : 'Task rejected');
    } finally {
      stopGlobalLoading();
    }
  };

  if (!SUPPORTED_TASK_NODES.has(task.taskNode)) {
    return (
      <IopPageShell title='Inquiry Reply' taskNode={task.taskNode}>
        <Result
          status='warning'
          title='Task unavailable at the current stage'
          subTitle={`Current stage: ${IOP_TASK_NODE_LABELS[task.taskNode as IopTaskNode] ?? task.taskNode}`}
        />
      </IopPageShell>
    );
  }

  return (
    <IopPageShell title='Inquiry Reply' taskNode={task.taskNode}>
      {isMakerStage && (
        <Button size='small' className='mb-3' type='primary' icon={<CommentOutlined />} onClick={handleInquiryReply}>
          Inquiry Reply
        </Button>
      )}

      {task.taskNode === IopTaskNode.MakerRework && (
        <Button
          size='small'
          className='mb-3'
          type='primary'
          icon={<CommentOutlined />}
          onClick={() => inquiryReplyForm.submit()}
        >
          Submit
        </Button>
      )}

      {isCheckerNode && (
        <div className='mb-3 flex gap-2'>
          <Button size='small' type='primary' icon={<CheckOutlined />} onClick={() => handleApproval(true)}>
            Approve
          </Button>
          <Button size='small' danger icon={<CloseOutlined />} onClick={() => handleApproval(false)}>
            Reject
          </Button>
        </div>
      )}

      {task.taskNode === IopTaskNode.MakerRework && (
        <Alert
          className='mb-3'
          type='warning'
          showIcon
          message='Reject Reason'
          description={task.rejectReason || 'No reject reason provided.'}
        />
      )}

      {task.taskNode === IopTaskNode.Approved && (
        <Alert
          className='mb-3'
          type='success'
          showIcon
          message='Task Approved'
          description='This task has been approved.'
        />
      )}

      {!isMakerStage && <PanelReplyContent task={task} form={inquiryReplyForm} onSubmit={handleSubmit} />}
      <PanelMessageDetail
        temp={!isMakerStage}
        highLightFields={INQUIRY_REPLY_HIGH_LIGHT_FIELDS}
        msgId={task.busRefNo}
      />
    </IopPageShell>
  );
};

/** 展示返工、审批及已审批环节的查询查复内容 */
const PanelReplyContent = ({ task, form, onSubmit }: PanelReplyContentProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <CardCollapse
        size='small'
        title='Reply Content'
        collapsed={collapsed}
        classNames={{ body: collapsed ? undefined : REPLY_CONTENT_EXPANDED_BODY_CLASS_NAME }}
        onCollapsedChange={setCollapsed}
      >
        <Form form={form} layout='vertical' disabled={task.taskNode !== IopTaskNode.MakerStage} onFinish={onSubmit}>
          <div className='mb-3 flex gap-3 '>
            <IopTaskMsgType className='mb-0 min-w-0 flex-1' />
            <IopTaskMsgRecvCipsCode className='mb-0 min-w-0 flex-1' />
            <IopTaskMsgRelatedId className='mb-0 min-w-0 flex-1' />
          </div>
          <IopTaskContent textAreaReadOnly={!MAKER_TASK_NODES.has(task.taskNode)} />
        </Form>
      </CardCollapse>

      <Divider className='my-3' orientation='left'>
        Current Message: {task.busRefNo || '--'}
      </Divider>
    </>
  );
};

export default IopInquiryReply;

/**
 * InquiryReply 本地 Mock URL（使用 `npm run dev:mock` 启动）：
 *
 * Maker：
 * http://localhost:5173/iop?flwiid=ST15-MAKER-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST15-MAKER-001&wkiid=WKI-MAKER-001&nodnam=MAKER&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Maker Rework：
 * http://localhost:5173/iop?flwiid=ST15-REWORK-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST15-REWORK-001&wkiid=WKI-REWORK-001&nodnam=MAKER_REWORK&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 1：
 * http://localhost:5173/iop?flwiid=ST15-CHECKER1-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST15-CHECKER1-001&wkiid=WKI-CHECKER1-001&nodnam=CHECKER1&userid=USER001&orgid=ORG001&userName=Tester
 *
 * Checker 2：
 * http://localhost:5173/iop?flwiid=ST15-CHECKER2-FLWI-001&applicationid=APP-DEMO-001&taskid=WFT-ST15-CHECKER2-001&wkiid=WKI-CHECKER2-001&nodnam=CHECKER2&userid=USER001&orgid=ORG001&userName=Tester
 */
