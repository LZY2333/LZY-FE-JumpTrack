/** IOP 任务表对前端返回的数据，字段对应 PSSST_TRN_TASK_INFO。 */
export interface IopTaskInfo {
  /** 本系统任务编号：TASK_ID。 */
  taskId: string;
  /** 任务流编号：TASK_FLOW_NO。 */
  taskFlowNo: string;
  /** 任务流名称：TASK_FLOW_NAME。 */
  taskFlowName: string;
  /** 业务流水号：BUS_REF_NO；报文任务中对应 MSG_ID。 */
  busRefNo: string;
  /** 挂起状态：TASK_HOLD_STATUS。 */
  taskHoldStatus: string;
  /** 当前环节：TASK_NODE。 */
  taskNode: string;
  /** 期望完成日期：TARGET_COMPELETE_DATE。 */
  targetCompeleteDate?: string | null;
  /** 操作类型：OPERATION_CODE。 */
  operationCode?: string | null;
  /** IOP 工作流实例编号：IOP_FLWI_ID。 */
  iopFlwiId?: string | null;
  /** IOP 工作流任务编号：IOP_WF_TASK_ID。 */
  iopWfTaskId?: string | null;
  /** IOP 工作流节点编号：IOP_WKI_ID。 */
  iopWkiId?: string | null;
  /** IOP 工作流节点描述：IOP_NODNAM。 */
  iopNodnam?: string | null;
  /** IOP 返回编码：IOP_RETURN_CODE。 */
  iopReturnCode?: string | null;
  /** IOP 返回信息：IOP_RETURN_MSG。 */
  iopReturnMsg?: string | null;
  /** 任务备注：REMARK。 */
  remark?: string | null;
  /** 审批拒绝原因：REJECT_REASON。 */
  rejectReason?: string | null;
  /** 取消原因编号：CANCEL_CODE。 */
  cancelCode?: string | null;
  /** 取消原因说明：CANCEL_REASON。 */
  cancelReason?: string | null;
  /** 经办柜员号：INPUT_ID。 */
  inputId?: string | null;
  /** 经办时间：INPUT_TIME。 */
  inputTime?: string | null;
  /** 经办机构号：INPUT_BRNO。 */
  inputBrno?: string | null;
  /** 授权柜员号：AUTHOR_ID。 */
  authorId?: string | null;
  /** 授权时间：AUTHOR_TIME。 */
  authorTime?: string | null;
  /** 授权机构号：AUTHOR_BRNO。 */
  authorBrno?: string | null;
  /** 创建时间：CREATE_TIME。 */
  createTime?: string;
  /** 更新时间：UPDATE_TIME。 */
  updateTime?: string;
}
