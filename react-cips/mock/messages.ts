import type { MessageQuery, MessageQueryConditions } from '@/api/messages';
import type { MessageAuditTrailRecord, MessageDetail, MessageRecord } from '@/types';
import { MessageBusinessType, MessageDirection, MsgRecvStatus, MsgSendStatus, ResCode } from '@/types/enums';

// 报文类型用于模拟多种 CIPS 报文，BUSINESS_TYPE 决定三类业务信息 Schema。
const MESSAGE_TYPES = ['pacs.008.001.01', 'camt.054.001.08', 'camt.029.001.09', 'admi.002.001.01'];
const MESSAGE_BUSINESS_TYPES = [
  MessageBusinessType.Payment,
  MessageBusinessType.Bill,
  MessageBusinessType.Query,
  MessageBusinessType.Other,
];
const SEND_INSTS = ['CMBCCNBJ', 'ICBKCNBJ', 'PCBCCNBJ', 'ABOCCNBJ'];
const RECV_INSTS = ['WUBAHKHH', 'BKCHCNBJ', 'CITIUS33', 'HSBCHKHH'];
const MSG_OWNER_DEPTS = ['CIPS-OPS', 'PAYMENT-OPS', 'TREASURY', 'COMPLIANCE'];
const MSG_OWNER_GROUPS = ['GROUP-A', 'GROUP-B', 'GROUP-C'];
const MSG_RECV_STATUSES = Object.values(MsgRecvStatus);
// 发报状态采用前端临时枚举，等待正式后端代码表确认。
const MSG_SEND_STATUSES = Object.values(MsgSendStatus);
const MESSAGE_COUNT = 40;
const RELATED_MESSAGE_GROUP_SIZE = 2;

// 集中处理 Mock 数据的二选一规则，避免生成函数被大量条件表达式淹没。
const choose = <T, F>(condition: boolean, whenTrue: T, whenFalse: F): T | F => (condition ? whenTrue : whenFalse);

/** 按列表统一规则生成真实报文标识，关联字段只能引用由此生成的列表记录。 */
const createMessageId = (index: number) => {
  const direction = choose(index % 2 === 0, MessageDirection.In, MessageDirection.Out);
  return `CIPS${direction}20260822${String(index + 1).padStart(6, '0')}`;
};

// 一条记录代表一份物理报文；固定 40 条便于验证分页、筛选、排序和空值展示。
interface MockMessageDetail extends MessageDetail {
  /** 原文中的机构信息，只用于生成原始 XML，不进入查询或详情响应。 */
  rawInstitutions: {
    /** 原文发起机构。 */
    sender: string;
    /** 原文接收机构。 */
    receiver: string;
  };
  /** 报文处理轨迹。 */
  processingRecords: MessageAuditTrailRecord[];
}

const messages: MockMessageDetail[] = Array.from({ length: MESSAGE_COUNT }, (_, index) => createMessage(index));

/** 生成列表与详情共用的报文元数据，并附带处理轨迹。 */
function createMessage(index: number): MockMessageDetail {
  const sequence = String(index + 1).padStart(6, '0');
  const msgDirection = choose(index % 2 === 0, MessageDirection.In, MessageDirection.Out);
  const typeIndex = Math.floor(index / 2) % MESSAGE_BUSINESS_TYPES.length;
  // 保留尚未分类的记录，验证未指定业务类型时不会遗漏这类报文。
  const businessType = choose(index >= MESSAGE_COUNT - 2, null, MESSAGE_BUSINESS_TYPES[typeIndex]);
  const msgType = choose(businessType === null, '', MESSAGE_TYPES[typeIndex]);
  const relatedGroupStartIndex = index - (index % RELATED_MESSAGE_GROUP_SIZE);
  const relatedMessageIndex = index === relatedGroupStartIndex ? index + 1 : relatedGroupStartIndex;
  const messageTime = new Date(
    Date.UTC(2026, 7, 22 - Math.floor(index / 6), 9 + (index % 8), index % 60, 0),
  ).toISOString();
  const msgId = createMessageId(index);
  const amount = Number((1000 + index * 238.75).toFixed(2));
  const hasPaymentDetail = businessType === MessageBusinessType.Payment;
  const hasGpiDetail = businessType === MessageBusinessType.Query && Math.floor(index / 8) % 2 === 0;
  const hasAmount = hasPaymentDetail || businessType === MessageBusinessType.Bill || hasGpiDetail;
  const received = msgDirection === MessageDirection.In;

  return {
    msgId,
    msgDirection,
    businessType,
    msgDate: messageTime,
    mainMsgId: choose(index === relatedGroupStartIndex, null, createMessageId(relatedGroupStartIndex)),
    msgChannel: choose(index % 3 === 0, 'SWIFT', 'CIPS'),
    msgType,
    msgBusinessNo: `TXN20260822${sequence}`,
    amount: choose(hasAmount, amount.toFixed(2), null),
    currency: choose(hasAmount, 'CNY', null),
    tranId: choose(hasPaymentDetail, `REF20-${sequence}`, null),
    msgOwnerDept: choose(received, MSG_OWNER_DEPTS[index % MSG_OWNER_DEPTS.length], null),
    msgOwnerGroup: choose(received, MSG_OWNER_GROUPS[index % MSG_OWNER_GROUPS.length], null),
    nonStpReason: choose(index % 4 === 0, 'Manual processing required', null),
    msgRelatedId: createMessageId(relatedMessageIndex),
    msgEndId: choose(index % 3 === 0, `E2E20260822${sequence}`, null),
    msgUetr: choose(index % 6 === 0, null, `9f1c3f0e-${String(index + 1).padStart(4, '0')}-4b68-8e8a-9e6f8a1c2d3e`),
    msgSendTime: choose(msgDirection === MessageDirection.Out, messageTime, null),
    rawInstitutions: {
      sender: SEND_INSTS[index % SEND_INSTS.length],
      receiver: RECV_INSTS[index % RECV_INSTS.length],
    },
    msgRecvStatus: choose(received, MSG_RECV_STATUSES[index % MSG_RECV_STATUSES.length], null),
    msgSendStatus: choose(received, null, MSG_SEND_STATUSES[Math.floor(index / 2) % MSG_SEND_STATUSES.length]),
    remark: choose(index % 7 === 0, `Mock message remark ${index + 1}`, null),
    createUser: choose(index % 5 === 0, null, `A${String(90000 + index)}`),
    createBrno: `BR${String(100000 + (index % 8)).slice(1)}`,
    authorUser: choose(index % 4 === 0, null, 'SYSTEM'),
    authorBrno: choose(index % 4 === 0, null, 'SYSTEM'),
    createTime: messageTime,
    updateTime: new Date(Date.parse(messageTime) + 90_000).toISOString(),
    formData: createFormData({ index, msgId, businessType, messageTime }),
    processingRecords: [
      {
        logId: `LOGS20260822${String(index * 3 + 1).padStart(6, '0')}`,
        refNo: msgId,
        taskId: `TASK20260822${sequence}`,
        serviceModule: choose(msgDirection === MessageDirection.In, 'RECEVICE_SERVICE', 'SEND_SERVICE'),
        eventCode: 'M0001',
        eventDetail: choose(msgDirection === MessageDirection.In, 'Message received', 'Message generated'),
        remark: null,
        eventUser: 'SYSTEM',
        eventTime: messageTime,
        createTime: messageTime,
      },
      {
        logId: `LOGS20260822${String(index * 3 + 2).padStart(6, '0')}`,
        refNo: msgId,
        taskId: `TASK20260822${sequence}`,
        serviceModule: choose(msgDirection === MessageDirection.In, 'RECEVICE_SERVICE', 'SEND_SERVICE'),
        eventCode: choose(index % 9 === 0, 'M0003', 'M0002'),
        eventDetail: choose(index % 9 === 0, 'Message format validation failed', 'Message format validated'),
        remark: null,
        eventUser: 'SYSTEM',
        eventTime: new Date(Date.parse(messageTime) + 30_000).toISOString(),
        createTime: new Date(Date.parse(messageTime) + 30_000).toISOString(),
      },
      {
        logId: `LOGS20260822${String(index * 3 + 3).padStart(6, '0')}`,
        refNo: msgId,
        taskId: `TASK20260822${sequence}`,
        serviceModule: 'TASK_SERVICE',
        eventCode: 'M0004',
        eventDetail: 'Business processing completed',
        remark: null,
        eventUser: choose(index % 3 === 0, 'SYSTEM', `A${String(90000 + index)}`),
        eventTime: new Date(Date.parse(messageTime) + 90_000).toISOString(),
        createTime: new Date(Date.parse(messageTime) + 90_000).toISOString(),
      },
    ],
  };
}

interface MockFormDataContext {
  index: number;
  msgId: string;
  businessType: MessageBusinessType | null;
  messageTime: string;
}

/** 按 BUSINESS_TYPE 生成与数据库类型信息表、属性表一一对应的结构化值。 */
function createFormData({ index, msgId, businessType, messageTime }: MockFormDataContext): Record<string, unknown> {
  const sequence = String(index + 1).padStart(8, '0');
  const amount = Number((1000 + index * 238.75).toFixed(2));
  const businessDate = messageTime.slice(0, 10);
  const auditFields = {
    createUser: `A${String(90000 + index)}`,
    createBrno: `BR${String(100000 + (index % 8)).slice(1)}`,
    authorUser: 'SYSTEM',
    authorBrno: 'SYSTEM',
    createTime: messageTime,
    updateTime: new Date(Date.parse(messageTime) + 90_000).toISOString(),
  };

  switch (businessType) {
    case MessageBusinessType.Query:
      return {
        queryInfo: {
          content: `Query / response content for ${msgId}`,
          ...auditFields,
        },
        queryGpi: choose(
          Math.floor(index / 8) % 2 === 0,
          {
            msgUetr: `9f1c3f0e-${String(index + 1).padStart(4, '0')}-4b68-8e8a-9e6f8a1c2d3e`,
            gpiMsgDate: messageTime,
            gpiMsgStatus: choose(index % 2 === 0, 'ACSP', 'ACCC'),
            gpiMsgStatusReson: choose(index % 2 === 0, 'G000', 'G001'),
            gpiOriginatorBic: SEND_INSTS[index % SEND_INSTS.length],
            gpiForwardedBic: RECV_INSTS[index % RECV_INSTS.length],
            gpiSettleMethod: choose(index % 2 === 0, 'CLRG', 'INDA'),
            gpiClearingSys: 'CIPS',
            gpiCcy: 'CNY',
            gpiAmount: amount.toFixed(2),
            gpiChargeDetails: 'SLEV',
            gpiOriginalCcy: 'USD',
            gpiTargetCcy: 'CNY',
            gpiExchangeRate: '7.1200',
            gpiChargeFee: '10.00',
            createTime: messageTime,
          },
          undefined,
        ),
      };
    case MessageBusinessType.Bill:
      return {
        billInfo: {
          billSec: choose(index % 2 === 0, 'CIPS_01', 'CIPS_02'),
          billAccount: `CIPS-ACCT-${String(100000 + index)}`,
          billDate: businessDate,
          billCcy: 'CNY',
          nettingAmount: amount.toFixed(2),
          creditCount: 12 + index,
          creditAmount: (amount * 1.7).toFixed(2),
          debitCount: 8 + index,
          debitAmount: (amount * 0.7).toFixed(2),
          createTime: messageTime,
        },
        billDetails: [0, 1].map((detailIndex) => ({
          txnRef: `BILL-TXN-${sequence}-${detailIndex + 1}`,
          seqNo: String(detailIndex + 1),
          remitBankBic: SEND_INSTS[(index + detailIndex) % SEND_INSTS.length],
          remitCcy: 'CNY',
          remitAmt: (amount + detailIndex * 100).toFixed(2),
          creditType: choose(detailIndex === 0, 'C', 'D'),
          valueDate: businessDate,
          createTime: messageTime,
        })),
      };
    case MessageBusinessType.Payment:
      return {
        paymentInfo: {
          settlementMethod: choose(index % 2 === 0, 'CLRG', 'INDA'),
          categoryPurpose: 'SUPP',
          tranId: `REF20-${String(index + 1).padStart(6, '0')}`,
          remitCcy: 'CNY',
          remitAmount: amount.toFixed(2),
          valueDate: businessDate,
          settlemtnTime: messageTime,
          settlePriority: choose(index % 2 === 0, 'NORM', 'HIGH'),
          instructedCcy: 'USD',
          instructedAmt: (amount / 7.12).toFixed(2),
          exchangeRate: '7.1200',
          chargeType: 'SLEV',
          remitInfo: `Payment remittance information for ${msgId}`,
          instrForCdtrAgt: 'Credit beneficiary account after settlement',
          instrForNextAgt: null,
          ...auditFields,
        },
        paymentParties: [
          {
            partyType: 'DBTR',
            partyAcct: `621700${String(1000000000 + index)}`,
            partyName: `Debtor Customer ${index + 1}`,
            idType: 'ORGID',
            idNum: `DBTR-${sequence}`,
            agentBic: SEND_INSTS[index % SEND_INSTS.length],
            agentLei: null,
            agentClrSys: 'CIPS',
            agentClrMmBid: `CIPS-SEND-${sequence}`,
            agentBranchId: `SEND-BR-${sequence}`,
            addrDept: 'Treasury Department',
            addrSubDept: null,
            addrStrNm: 'Finance Street',
            addrBidgNb: '88',
            addrBidgNm: 'CIPS Tower',
            addrFloor: '18',
            addrPstBx: null,
            addrRoom: '1801',
            addrPstCd: '200120',
            addrTwnNm: 'Shanghai',
            addrTwnLctNm: 'Pudong',
            addrDstrctNm: 'Pudong New Area',
            addrCtrySubDvsn: 'Shanghai',
            addrCtryCode: 'CN',
            addrLine: 'Room 1801, CIPS Tower, 88 Finance Street',
            createTime: messageTime,
            updateTime: auditFields.updateTime,
          },
          {
            partyType: 'CDTR',
            partyAcct: `622202${String(2000000000 + index)}`,
            partyName: `Creditor Customer ${index + 1}`,
            idType: 'ORGID',
            idNum: `CDTR-${sequence}`,
            agentBic: RECV_INSTS[index % RECV_INSTS.length],
            agentLei: null,
            agentClrSys: 'CIPS',
            agentClrMmBid: `CIPS-RECV-${sequence}`,
            agentBranchId: `RECV-BR-${sequence}`,
            addrDept: 'Settlement Department',
            addrSubDept: null,
            addrStrNm: 'Harbour Road',
            addrBidgNb: '1',
            addrBidgNm: 'Clearing Centre',
            addrFloor: '9',
            addrPstBx: null,
            addrRoom: '901',
            addrPstCd: '999077',
            addrTwnNm: 'Hong Kong',
            addrTwnLctNm: 'Wan Chai',
            addrDstrctNm: 'Wan Chai',
            addrCtrySubDvsn: 'Hong Kong',
            addrCtryCode: 'HK',
            addrLine: 'Room 901, Clearing Centre, 1 Harbour Road',
            createTime: messageTime,
            updateTime: auditFields.updateTime,
          },
        ],
      };
    default:
      return {};
  }
}

interface MockMessageQuery extends Omit<Partial<MessageQuery>, 'current' | 'pageSize'> {
  current?: number | string;
  pageSize?: number | string;
}

/** 模拟后端筛选；未指定前端排序时统一按记录创建时间倒序返回。 */
const filterMessages = (query: Partial<MessageQueryConditions>) => {
  let list = [...messages];
  const exactFilters: Array<[keyof MessageRecord, unknown]> = [
    ['msgId', query.msgId],
    ['msgBusinessNo', query.msgBusinessNo],
    ['msgType', query.msgType],
    ['msgDirection', query.msgDirection],
    ['businessType', query.businessType],
    ['mainMsgId', query.mainMsgId],
    ['msgRelatedId', query.msgRelatedId],
    ['msgEndId', query.msgEndId],
    ['msgUetr', query.msgUetr],
    ['tranId', query.tranId],
    ['currency', query.currency],
  ];

  exactFilters.forEach(([field, expected]) => {
    if (expected === undefined || expected === null || expected === '') return;
    const normalized = String(expected).toLowerCase();
    list = list.filter((record) => String(record[field] ?? '').toLowerCase() === normalized);
  });

  if (query.channel?.length) {
    list = list.filter((record) => query.channel?.some((channel) => channel === record.msgChannel));
  }
  list = filterByDirectionStatus(list, query);
  list = filterByText(list, 'msgOwnerDept', query.msgOwnerDept);
  list = filterByText(list, 'msgOwnerGroup', query.msgOwnerGroup);
  list = filterByAmountRange(list, query.amountFrom, query.amountTo);
  list = filterByDateRange(list, query.msgDateFrom, query.msgDateTo);

  const sortField = query.sortField ?? 'createTime';
  const sortOrder = query.sortOrder ?? 'desc';
  const direction = sortOrder === 'asc' ? 1 : -1;
  list.sort((left, right) => String(left[sortField] ?? '').localeCompare(String(right[sortField] ?? '')) * direction);
  return list;
};

/** 方向已通过请求校验，只筛选对应主表的状态，不再合并收发两表。 */
const filterByDirectionStatus = (records: MockMessageDetail[], query: Partial<MessageQueryConditions>) =>
  records.filter((record) => {
    const received = record.msgDirection === MessageDirection.In;
    const expected = received ? query.msgRecvStatus : query.msgSendStatus;
    if (!expected) return true;

    const actual = received ? record.msgRecvStatus : record.msgSendStatus;
    return actual?.toLowerCase() === expected.toLowerCase();
  });

/** 对指定文本字段执行不区分大小写的包含查询。 */
const filterByText = (records: MockMessageDetail[], field: 'msgOwnerDept' | 'msgOwnerGroup', keyword?: string) => {
  if (!keyword) return records;

  const normalized = keyword.toLowerCase();
  return records.filter((record) => (record[field] ?? '').toLowerCase().includes(normalized));
};

/** 按业务类型映射后的金额过滤区间，未提供金额的业务记录不匹配。 */
const filterByAmountRange = (records: MockMessageDetail[], amountFrom?: number, amountTo?: number) => {
  if (amountFrom === undefined && amountTo === undefined) return records;

  return records.filter((record) => {
    if (record.amount === null) return false;

    const amount = Number(record.amount);
    if (!Number.isFinite(amount)) return false;
    if (amountFrom !== undefined && amount < amountFrom) return false;
    if (amountTo !== undefined && amount > amountTo) return false;
    return true;
  });
};

/** 按数据库日期字段过滤闭区间，空日期不参与匹配。 */
const filterByDateRange = (records: MockMessageDetail[], dateFrom?: string, dateTo?: string) => {
  if (!dateFrom && !dateTo) return records;

  return records.filter((record) => {
    const value = record.msgDate;
    if (!value) return false;
    if (dateFrom && value < dateFrom) return false;
    if (dateTo && value > dateTo) return false;
    return true;
  });
};

const lastPathSegment = (url: string) => {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] || '');
};

const messageIdBeforeAction = (url = '') => {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 2] || '');
};

const findMessage = (msgId: string) => messages.find((record) => record.msgId === msgId);

/** 根据报文号、主报文号和关联流水号的交集查找同一业务链路中的其他报文。 */
const findRelatedMessages = (record: MessageRecord) => {
  const relationKeys = new Set(messageRelationKeys(record));
  return messages.filter(
    (candidate) =>
      candidate.msgId !== record.msgId && messageRelationKeys(candidate).some((key) => relationKeys.has(key)),
  );
};

const messageRelationKeys = ({ msgId, mainMsgId, msgRelatedId }: MessageRecord) =>
  [msgId, mainMsgId, msgRelatedId].filter((value): value is string => Boolean(value));

const cloneMessage = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const notFound = (msgId: string) => ({
  returnCode: 'ERR0404',
  errorMsg: `Message ${msgId} does not exist`,
});

/** 将未知业务值安全收敛为字段对象。 */
const asBusinessRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/** 将未知业务值安全收敛为子表记录列表。 */
const asBusinessRecords = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value) ? value.map(asBusinessRecord) : [];

/** 按节点类型查找支付参与方。 */
const findPaymentParty = (parties: Array<Record<string, unknown>>, partyType: string) =>
  parties.find((party) => party.partyType === partyType) ?? {};

/** 将可空业务值转换为 XML 安全文本。 */
const toXmlText = (value: unknown) => escapeXml(String(value ?? ''));

const createRawXml = (message: MockMessageDetail) => {
  const paymentInfo = asBusinessRecord(message.formData.paymentInfo);
  const paymentParties = asBusinessRecords(message.formData.paymentParties);
  const debtor = findPaymentParty(paymentParties, 'DBTR');
  const creditor = findPaymentParty(paymentParties, 'CDTR');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:${message.msgType}">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${escapeXml(message.msgId)}</MsgId>
      <CreDtTm>${escapeXml(resolveMessageCreationTime(message))}</CreDtTm>
      <InstgAgt>${toXmlText(message.rawInstitutions.sender)}</InstgAgt>
      <InstdAgt>${toXmlText(message.rawInstitutions.receiver)}</InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>${toXmlText(paymentInfo.tranId)}</InstrId>
        <EndToEndId>${toXmlText(message.msgEndId)}</EndToEndId>
        <UETR>${toXmlText(message.msgUetr)}</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${toXmlText(paymentInfo.remitCcy)}">${toXmlText(paymentInfo.remitAmount)}</IntrBkSttlmAmt>
      <Dbtr>${toXmlText(debtor.partyName)}</Dbtr>
      <Cdtr>${toXmlText(creditor.partyName)}</Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
};

/** 原文创建时间优先取方向对应的业务日期，再回退记录创建时间。 */
const resolveMessageCreationTime = ({ msgDate, createTime }: MessageDetail) => msgDate || createTime;

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default [
  {
    url: '/api/example/v1/messages/query',
    method: 'post',
    response: (option: { body: MockMessageQuery }) => {
      const { current = 1, pageSize = 10, ...conditions } = option.body || {};
      // 必须先确定收报或发报数据来源，Mock 不执行跨方向查询。
      if (!conditions.msgDirection || !Object.values(MessageDirection).includes(conditions.msgDirection)) {
        return { returnCode: 'ERR0400', errorMsg: 'Please select Direction.' };
      }
      const list = filterMessages(conditions);
      const currentPage = Number(current);
      const size = Number(pageSize);
      return {
        returnCode: ResCode.Success,
        body: {
          list: list
            .slice((currentPage - 1) * size, currentPage * size)
            .map((record) => cloneMessage(stripDetail(record))),
          current: currentPage,
          pageSize: size,
          total: list.length,
        },
      };
    },
  },
  {
    url: '/api/example/v1/messages/:messageId/processing-records',
    method: 'get',
    timeout: 500,
    response: (option: { url: string }) => {
      const msgId = messageIdBeforeAction(option.url);
      const record = findMessage(msgId);
      return record ? { returnCode: ResCode.Success, body: cloneMessage(record.processingRecords) } : notFound(msgId);
    },
  },
  {
    url: '/api/example/v1/messages/:messageId/related-messages',
    method: 'get',
    timeout: 500,
    response: (option: { url: string }) => {
      const msgId = messageIdBeforeAction(option.url);
      const record = findMessage(msgId);
      return record
        ? {
            returnCode: ResCode.Success,
            body: cloneMessage(findRelatedMessages(record).map(stripDetail)),
          }
        : notFound(msgId);
    },
  },
  {
    url: '/api/example/v1/messages/:messageId/raw',
    method: 'get',
    timeout: 800,
    response: (option: { url: string }) => {
      const msgId = messageIdBeforeAction(option.url);
      const record = findMessage(msgId);
      return record
        ? {
            returnCode: ResCode.Success,
            body: { content: createRawXml(record), contentType: 'application/xml', fileName: `${msgId}.xml` },
          }
        : notFound(msgId);
    },
  },
  {
    url: '/api/example/v1/messages/:messageId',
    method: 'get',
    timeout: 300,
    response: (option: { url: string }) => {
      const msgId = lastPathSegment(option.url);
      const record = findMessage(msgId);
      return record
        ? { returnCode: ResCode.Success, body: cloneMessage(stripProcessingRecords(record)) }
        : notFound(msgId);
    },
  },
];

const stripDetail = ({
  rawInstitutions: _rawInstitutions,
  formData: _formData,
  processingRecords: _processingRecords,
  ...record
}: MockMessageDetail): MessageRecord => record;

const stripProcessingRecords = ({
  rawInstitutions: _rawInstitutions,
  processingRecords: _processingRecords,
  ...detail
}: MockMessageDetail): MessageDetail => detail;
