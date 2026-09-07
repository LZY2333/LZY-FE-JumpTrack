import type { LcwInitialStatus, MessageChannel, MessageDirection } from './enums';

/** LCW 列表记录。 */
export interface LcwRecord {
  /** 报文标识号：MSG_ID。 */
  msgId: string;
  /** 报文收发标志：MSG_DIRECTION。 */
  msgDirection: MessageDirection;
  /** 收发报时间：IN.MSG_RECV_DATE / OU.MSG_SEND_DATE。 */
  msgDate: string | null;
  /** 收发报通道：MSG_CHANNEL。 */
  msgChannel: MessageChannel;
  /** LCW 初次判定状态：LCW_INITIAL_STATUS。 */
  lcwInitialStatus: LcwInitialStatus;
  /** LCW 接口响应编码：RES_CODE。 */
  resCode: string | null;
  /** LCW 接口响应信息：RES_MESSAGE。 */
  resMessage: string | null;
  /** LCW 初次判定完成时间：LCW_INITIAL_TIME。 */
  lcwInitialTime: string | null;
}
