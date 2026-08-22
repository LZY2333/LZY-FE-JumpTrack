import type { IncomingMessage, ServerResponse } from 'node:http';
import type { MessageQuery, MessageQueryConditions } from '@/api/messages';
import type { MessageDetail, MessageProcessingRecord, MessageRecord } from '@/types';
import { BusinessStatus, BusinessType, MessageDirection, ResCode, TransmissionStatus } from '@/types/enums';

// 报文类型覆盖当前已注册的四个 CIPS Schema；状态和业务类型始终复用 types 中的统一枚举。
const MESSAGE_TYPES = ['pacs.008.001.01', 'pacs.009.001.01', 'camt.054.001.08', 'admi.002.001.01'];
const SEND_INSTS = ['CMBCCNBJ', 'ICBKCNBJ', 'PCBCCNBJ', 'ABOCCNBJ'];
const RECV_INSTS = ['WUBAHKHH', 'BKCHCNBJ', 'CITIUS33', 'HSBCHKHH'];
const TRANSMISSION_STATUSES = Object.values(TransmissionStatus);
const BUSINESS_STATUSES = Object.values(BusinessStatus);
const BUSINESS_TYPES = Object.values(BusinessType);

// 集中处理 Mock 数据的二选一规则，避免生成函数被大量条件表达式淹没。
const choose = <T, F>(condition: boolean, whenTrue: T, whenFalse: F): T | F => (condition ? whenTrue : whenFalse);

// 一条记录代表一份物理报文；固定 40 条便于验证分页、筛选、排序和空值展示。
interface MockMessageDetail extends MessageDetail {
  processingRecords: MessageProcessingRecord[];
}

const messages: MockMessageDetail[] = Array.from({ length: 40 }, (_, index) => createMessage(index));

/** 生成列表与详情共用的报文元数据，并附带处理轨迹。 */
function createMessage(index: number): MockMessageDetail {
  const sequence = String(index + 1).padStart(6, '0');
  const msgDirection = choose(index % 2 === 0, MessageDirection.In, MessageDirection.Out);
  const msgType = MESSAGE_TYPES[index % MESSAGE_TYPES.length];
  const messageTime = new Date(
    Date.UTC(2026, 7, 22 - Math.floor(index / 6), 9 + (index % 8), index % 60, 0),
  ).toISOString();
  const msgId = `CIPS${msgDirection}20260822${sequence}`;

  return {
    msgId,
    msgDirection,
    businessType: BUSINESS_TYPES[index % BUSINESS_TYPES.length],
    msgRecvDate: choose(msgDirection === MessageDirection.In, messageTime, null),
    mainMsgId: choose(index % 5 === 0, null, `MAIN20260822${String(Math.ceil((index + 1) / 2)).padStart(6, '0')}`),
    msgChannel: choose(index % 3 === 0, 'SWIFT', 'CIPS'),
    msgType,
    msgBusinessNo: `TXN20260822${sequence}`,
    msgRelatedId: choose(index % 4 === 0, `REL20260822${sequence}`, null),
    msgEndId: choose(index % 3 === 0, `E2E20260822${sequence}`, null),
    msgUetr: choose(index % 6 === 0, null, `9f1c3f0e-${String(index + 1).padStart(4, '0')}-4b68-8e8a-9e6f8a1c2d3e`),
    msgSendTime: choose(msgDirection === MessageDirection.Out, messageTime, null),
    msgSendInst: SEND_INSTS[index % SEND_INSTS.length],
    msgRecvInst: RECV_INSTS[index % RECV_INSTS.length],
    remark: choose(index % 7 === 0, `Mock 报文备注 ${index + 1}`, null),
    createUser: choose(index % 5 === 0, null, `A${String(90000 + index)}`),
    createBrno: `BR${String(100000 + (index % 8)).slice(1)}`,
    authorUser: choose(index % 4 === 0, null, 'SYSTEM'),
    authorBrno: choose(index % 4 === 0, null, 'SYSTEM'),
    createTime: messageTime,
    updateTime: new Date(Date.parse(messageTime) + 90_000).toISOString(),
    messageTime,
    transmissionStatus: TRANSMISSION_STATUSES[index % TRANSMISSION_STATUSES.length],
    businessStatus: BUSINESS_STATUSES[index % BUSINESS_STATUSES.length],
    formData: createFormData({ index, msgId, msgType, messageTime }),
    processingRecords: [
      {
        recordId: `${msgId}-01`,
        processTime: messageTime,
        node: choose(msgDirection === MessageDirection.In, '报文接收', '报文生成'),
        status: '成功',
        resultSummary: '报文进入处理队列',
        operator: 'SYSTEM',
      },
      {
        recordId: `${msgId}-02`,
        processTime: new Date(Date.parse(messageTime) + 30_000).toISOString(),
        node: '格式校验',
        status: choose(index % 9 === 0, '失败', '成功'),
        resultSummary: choose(index % 9 === 0, 'Mock：字段格式校验失败', 'CIPS 报文格式校验通过'),
        operator: 'SYSTEM',
      },
      {
        recordId: `${msgId}-03`,
        processTime: new Date(Date.parse(messageTime) + 90_000).toISOString(),
        node: '业务处理',
        status: BUSINESS_STATUSES[index % BUSINESS_STATUSES.length],
        resultSummary: '业务状态已更新',
        operator: choose(index % 3 === 0, null, `A${String(90000 + index)}`),
      },
    ],
  };
}

interface MockFormDataContext {
  index: number;
  msgId: string;
  msgType: string;
  messageTime: string;
}

/** 按完整 MSG_TYPE 生成与前端静态 Formily Schema 一一对应的结构化值。 */
function createFormData({ index, msgId, msgType, messageTime }: MockFormDataContext): Record<string, unknown> {
  const sequence = String(index + 1).padStart(8, '0');
  const amount = Number((1000 + index * 238.75).toFixed(2));
  const businessDate = messageTime.slice(0, 10);

  switch (msgType) {
    case 'pacs.008.001.01':
      return {
        instructionId: `INSTR-${sequence}`,
        transactionId: `TRANS-${sequence}`,
        settlementMethod: choose(index % 2 === 0, 'CLRG', 'INDA'),
        chargeBearer: 'SLEV',
        settlementAmount: amount,
        currency: 'CNY',
        debtorName: `付款客户 ${index + 1}`,
        debtorAccount: `621700${String(1000000000 + index)}`,
        creditorName: `收款客户 ${index + 1}`,
        creditorAccount: `622202${String(2000000000 + index)}`,
        purposeCode: choose(index % 2 === 0, 'GDDS', 'SUPP'),
        remittanceInformation: choose(index % 5 === 0, null, `报文 ${msgId} 的 Mock 附言`),
      };
    case 'pacs.009.001.01':
      return {
        instructionId: `FI-INSTR-${sequence}`,
        transactionId: `FI-TRANS-${sequence}`,
        settlementMethod: 'CLRG',
        clearingSystemCode: 'CIPS',
        settlementAmount: amount,
        currency: 'CNY',
        interbankSettlementDate: businessDate,
        debtorAgent: SEND_INSTS[index % SEND_INSTS.length],
        creditorAgent: RECV_INSTS[index % RECV_INSTS.length],
        serviceLevelCode: 'URGP',
        localInstrumentCode: 'CIPS',
        remittanceInformation: `金融机构间转账 ${msgId}`,
      };
    case 'camt.054.001.08':
      return {
        notificationId: `NTF-${sequence}`,
        accountServicerReference: `ASR-${sequence}`,
        entryReference: `ENTRY-${sequence}`,
        accountId: `CIPS-ACCT-${String(100000 + index)}`,
        accountCurrency: 'CNY',
        creditDebitIndicator: choose(index % 2 === 0, 'CRDT', 'DBIT'),
        entryStatus: 'BOOK',
        bookingDate: businessDate,
        valueDate: businessDate,
        amount,
        currency: 'CNY',
        transactionCode: 'PMNT-RCDT-ESCT',
        relatedReference: `REL-${sequence}`,
      };
    case 'admi.002.001.01':
      return {
        eventCode: choose(index % 2 === 0, 'CIPS-E001', 'CIPS-W001'),
        eventName: choose(index % 2 === 0, '报文校验失败', '系统处理延迟'),
        eventSeverity: choose(index % 2 === 0, 'ERROR', 'WARNING'),
        eventTime: messageTime,
        sourceSystem: 'CIPS-GATEWAY',
        affectedService: 'MESSAGE-PROCESSING',
        originalMessageId: `ORIG-${msgId}`,
        originalMessageType: 'pacs.008.001.01',
        errorCode: choose(index % 2 === 0, 'FMT-001', 'TIMEOUT-001'),
        errorReason: choose(index % 2 === 0, '报文格式校验未通过', '下游系统响应超时'),
        suggestedAction: '核对报文内容后重新处理',
        acknowledgmentRequired: '是',
        eventDescription: `Mock 系统事件 ${index + 1}`,
      };
    default:
      return {};
  }
}

interface MockMessageQuery extends Omit<MessageQuery, 'current' | 'pageSize'> {
  current?: number | string;
  pageSize?: number | string;
}

/** 模拟后端筛选；未指定前端排序时统一按 messageTime 倒序返回。 */
const filterMessages = (query: MessageQueryConditions = {}) => {
  let list = [...messages];
  const exactFilters: Array<[keyof MessageRecord, unknown]> = [
    ['msgId', query.msgId],
    ['msgBusinessNo', query.msgBusinessNo],
    ['msgType', query.msgType],
    ['msgDirection', query.msgDirection],
    ['transmissionStatus', query.transmissionStatus],
    ['businessStatus', query.businessStatus],
    ['businessType', query.businessType],
    ['msgChannel', query.msgChannel],
    ['mainMsgId', query.mainMsgId],
    ['msgRelatedId', query.msgRelatedId],
    ['msgEndId', query.msgEndId],
    ['msgUetr', query.msgUetr],
  ];

  exactFilters.forEach(([field, expected]) => {
    if (expected === undefined || expected === null || expected === '') return;
    const normalized = String(expected).toLowerCase();
    list = list.filter((record) => String(record[field] ?? '').toLowerCase() === normalized);
  });

  if (query.msgSendInst) {
    const keyword = query.msgSendInst.toLowerCase();
    list = list.filter((record) => (record.msgSendInst ?? '').toLowerCase().includes(keyword));
  }
  if (query.msgRecvInst) {
    const keyword = query.msgRecvInst.toLowerCase();
    list = list.filter((record) => (record.msgRecvInst ?? '').toLowerCase().includes(keyword));
  }
  if (query.messageTimeFrom) list = list.filter((record) => record.messageTime >= query.messageTimeFrom!);
  if (query.messageTimeTo) list = list.filter((record) => record.messageTime <= query.messageTimeTo!);

  const sortField = query.sortField ?? 'messageTime';
  const sortOrder = query.sortOrder ?? 'desc';
  const direction = sortOrder === 'asc' ? 1 : -1;
  list.sort((left, right) => left[sortField].localeCompare(right[sortField]) * direction);
  return list;
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

const cloneMessage = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const notFound = (msgId: string) => ({
  returnCode: 'ERR0404',
  errorMsg: `报文 ${msgId} 不存在`,
});

const createRawXml = (message: MessageDetail) => `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:${message.msgType}">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${escapeXml(message.msgId)}</MsgId>
      <CreDtTm>${escapeXml(message.messageTime)}</CreDtTm>
      <InstgAgt>${escapeXml(message.msgSendInst ?? '')}</InstgAgt>
      <InstdAgt>${escapeXml(message.msgRecvInst ?? '')}</InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>${escapeXml(String(message.formData.instructionId ?? ''))}</InstrId>
        <EndToEndId>${escapeXml(message.msgEndId ?? '')}</EndToEndId>
        <UETR>${escapeXml(message.msgUetr ?? '')}</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="CNY">${escapeXml(String(message.formData.settlementAmount ?? ''))}</IntrBkSttlmAmt>
      <Dbtr>${escapeXml(String(message.formData.debtorName ?? ''))}</Dbtr>
      <Cdtr>${escapeXml(String(message.formData.creditorName ?? ''))}</Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const readJsonBody = async (req: IncomingMessage) => {
  let body = '';
  await new Promise<void>((resolve) => {
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve());
  });
  return body ? (JSON.parse(body) as MessageQueryConditions) : {};
};

const writeDownloadHeaders = (res: ServerResponse, fileName: string, contentType: string) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
};

export default [
  {
    url: '/api/example/v1/messages/query',
    method: 'post',
    response: (option: { body: MockMessageQuery }) => {
      const { current = 1, pageSize = 10, ...conditions } = option.body || {};
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
    url: '/api/example/v1/messages/export',
    method: 'post',
    rawResponse: async (req: IncomingMessage, res: ServerResponse) => {
      const conditions = await readJsonBody(req);
      const workbook = createXlsx(filterMessages(conditions));
      writeDownloadHeaders(res, 'messages.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.end(workbook);
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
    url: '/api/example/v1/messages/:messageId/download',
    method: 'get',
    rawResponse: (req: IncomingMessage, res: ServerResponse) => {
      const msgId = messageIdBeforeAction(req.url);
      const record = findMessage(msgId);
      if (!record) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      writeDownloadHeaders(res, `${msgId}.xml`, 'application/xml; charset=utf-8');
      res.end(createRawXml(record));
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
  formData: _formData,
  processingRecords: _processingRecords,
  ...record
}: MockMessageDetail): MessageRecord => record;

const stripProcessingRecords = ({
  processingRecords: _processingRecords,
  ...detail
}: MockMessageDetail): MessageDetail => detail;

/** 生成一个仅包含内联字符串的最小有效 XLSX，避免 Mock 引入额外 Excel 依赖。 */
function createXlsx(records: MessageRecord[]) {
  const rows = [
    [
      '报文标识号',
      '收发标志',
      '报文类型编码',
      '交易流水号',
      '发报机构',
      '收报机构',
      '收发状态',
      '业务状态',
      '统一报文时间',
    ],
    ...records.map((record) => [
      record.msgId,
      record.msgDirection,
      record.msgType,
      record.msgBusinessNo ?? '',
      record.msgSendInst ?? '',
      record.msgRecvInst ?? '',
      record.transmissionStatus,
      record.businessStatus,
      record.messageTime,
    ]),
  ];
  const sheetRows = rows
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row
          .map(
            (cell, columnIndex) =>
              `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(
                String(cell),
              )}</t></is></c>`,
          )
          .join('')}</row>`,
    )
    .join('');

  const files: Record<string, string> = {
    '[Content_Types].xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="报文列表" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`,
  };
  return createStoredZip(files);
}

const columnName = (index: number) => {
  let value = index + 1;
  let result = '';
  while (value > 0) {
    result = String.fromCharCode(65 + ((value - 1) % 26)) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
};

function createStoredZip(files: Record<string, string>) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  Object.entries(files).forEach(([name, value]) => {
    const nameBuffer = Buffer.from(name, 'utf8');
    const dataBuffer = Buffer.from(value, 'utf8');
    const checksum = crc32(dataBuffer);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(dataBuffer.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localParts.push(localHeader, nameBuffer, dataBuffer);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(dataBuffer.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + dataBuffer.length;
  });

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

const crc32 = (buffer: Buffer) => {
  let value = 0xffffffff;
  for (const byte of buffer) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
};
