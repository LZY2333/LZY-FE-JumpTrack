import type { LcwBatchRetryRequest, LcwQuery, PagedLcwRecords } from '@/api/lcw';
import type { LcwRecord } from '@/types';
import { LcwInitialStatus, MessageBusinessType, MessageChannel, MessageDirection, ResCode } from '@/types/enums';

interface MockRequestOption<Body> {
  /** vite-plugin-mock 解析后的 JSON 请求体。 */
  body?: Body;
}

interface MockStatusDetail {
  /** LCW 服务响应编码。 */
  resCode: string;
  /** LCW 服务响应信息。 */
  resMessage: string;
}

const MOCK_RECORD_COUNT = 28;
const DEFAULT_CURRENT = 1;
const DEFAULT_PAGE_SIZE = 10;
const MOCK_EXCEPTION_STATUSES = [
  LcwInitialStatus.Timeout,
  LcwInitialStatus.Unavailable,
  LcwInitialStatus.DataMissing,
  LcwInitialStatus.InvocationFailed,
] as const;
const MOCK_EXCEPTION_STATUS_SET = new Set<LcwInitialStatus>(MOCK_EXCEPTION_STATUSES);
const MOCK_CHANNELS = Object.values(MessageChannel);
const MOCK_BUSINESS_TYPES = Object.values(MessageBusinessType);
const MOCK_STATUS_DETAILS: Record<(typeof MOCK_EXCEPTION_STATUSES)[number], MockStatusDetail> = {
  [LcwInitialStatus.Timeout]: {
    resCode: 'AML_TIMEOUT',
    resMessage: 'LCW scan timed out before a response was received.',
  },
  [LcwInitialStatus.Unavailable]: {
    resCode: 'AML_SERVICE_UNAVAILABLE',
    resMessage: 'LCW service is temporarily unavailable.',
  },
  [LcwInitialStatus.DataMissing]: {
    resCode: 'AML_DATA_NOT_FOUND',
    resMessage: 'Required LCW scan data does not exist.',
  },
  [LcwInitialStatus.InvocationFailed]: {
    resCode: 'AML_INVOCATION_FAILED',
    resMessage: 'LCW service invocation failed.',
  },
};

let lcwRecords: LcwRecord[] | undefined;

/** 分页查询 LCW 异常任务。 */
const handleQuery = ({ body: query }: MockRequestOption<LcwQuery>) => {
  if (!query?.msgDirection || !Object.values(MessageDirection).includes(query.msgDirection)) {
    return { returnCode: 'ERR0400', errorMsg: 'Please select Direction.' };
  }
  const current = normalizePositiveInteger(query.current, DEFAULT_CURRENT);
  const pageSize = normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE);
  const filteredRecords = filterRecords(getLcwRecords(), query);
  const pageStart = (current - 1) * pageSize;
  const body: PagedLcwRecords = {
    list: filteredRecords.slice(pageStart, pageStart + pageSize).map(cloneRecord),
    current,
    pageSize,
    total: filteredRecords.length,
  };

  return { returnCode: ResCode.Success, body };
};

/** 批量提交 LCW 异常任务重试。 */
const handleBatchRetry = ({ body: request }: MockRequestOption<LcwBatchRetryRequest>) => {
  const msgIds = Array.isArray(request?.msgIds) ? request.msgIds : [];
  msgIds.forEach(retryRecord);
  return { returnCode: ResCode.Success };
};

export default [
  {
    url: '/cips/manager/amlPatchStatus/getAmlMsgByInitialStatus',
    method: 'post',
    response: handleQuery,
  },
  {
    url: '/cips/manager/amlPatchStatus/pushPatchAmlMsgByMsgid',
    method: 'post',
    response: handleBatchRetry,
  },
];

/** 延迟创建可变数据集，保证批量提交后的状态能被后续查询观察到。 */
const getLcwRecords = () => {
  if (lcwRecords) return lcwRecords;
  lcwRecords = createLcwRecords();
  return lcwRecords;
};

/** 生成方向、通道和四种异常状态交错分布的 LCW 记录。 */
const createLcwRecords = (): LcwRecord[] => {
  const today = new Date();
  return Array.from({ length: MOCK_RECORD_COUNT }, (_, index) => {
    const msgDirection = index % 2 === 0 ? MessageDirection.In : MessageDirection.Out;
    const directionPairIndex = Math.floor(index / 2);
    const lcwInitialStatus = MOCK_EXCEPTION_STATUSES[directionPairIndex % MOCK_EXCEPTION_STATUSES.length];
    const statusDetail = MOCK_STATUS_DETAILS[lcwInitialStatus];
    const messageDate = createMockMessageDate(today, index);
    const msgDate = messageDate.toISOString();
    const sequence = String(index + 1).padStart(6, '0');

    return {
      msgId: `CIPS${msgDirection}${formatMessageIdDate(messageDate)}${sequence}`,
      msgDirection,
      businessType: MOCK_BUSINESS_TYPES[directionPairIndex % MOCK_BUSINESS_TYPES.length],
      msgDate,
      msgChannel: MOCK_CHANNELS[directionPairIndex % MOCK_CHANNELS.length],
      lcwInitialStatus,
      resCode: statusDetail.resCode,
      resMessage: statusDetail.resMessage,
      lcwInitialTime: new Date(Date.parse(msgDate) + ((index % 5) + 1) * 60_000).toISOString(),
    };
  });
};

/** 应用 LCW 页面全部精确条件和日期闭区间。 */
const filterRecords = (records: LcwRecord[], query: LcwQuery) => {
  return records.filter((record) => {
    if (record.msgDirection !== query.msgDirection) return false;
    if (!MOCK_EXCEPTION_STATUS_SET.has(record.lcwInitialStatus)) return false;
    if (!matchesExactText(record.msgId, query.msgId)) return false;
    if (query.channel?.length && !query.channel.includes(record.msgChannel)) return false;
    if (!matchesDateRange(record.msgDate, query.msgDateFrom, query.msgDateTo)) return false;
    return true;
  });
};

/** 提交单条重试；查询接口返回的记录均允许提交。 */
const retryRecord = (msgId: string) => {
  const record = getLcwRecords().find((item) => item.msgId === msgId);
  if (!record) return;

  record.lcwInitialStatus = LcwInitialStatus.ManualRetry;
};

/** 文本筛选采用不区分大小写的完整匹配。 */
const matchesExactText = (actual: string | null, expected?: string) => {
  if (!expected) return true;
  return (actual ?? '').toLowerCase() === expected.toLowerCase();
};

/** 日期条件为闭区间；关联不到收发报时间的记录不匹配日期条件。 */
const matchesDateRange = (actual: string | null, dateFrom?: string, dateTo?: string) => {
  if (!dateFrom && !dateTo) return true;
  if (!actual) return false;
  const actualDate = actual.slice(0, 10);
  if (dateFrom && actualDate < dateFrom) return false;
  if (dateTo && actualDate > dateTo) return false;
  return true;
};

/** 分页参数异常时回退默认值。 */
const normalizePositiveInteger = (value: number, fallback: number) => {
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
};

/** 按本地自然日生成当天及此前数日的 Mock 报文时间。 */
const createMockMessageDate = (today: Date, index: number) => {
  const messageDate = new Date(today);
  messageDate.setDate(today.getDate() - Math.floor(index / 6));
  messageDate.setHours(9 + (index % 8), index % 60, 0, 0);
  return messageDate;
};

/** 将报文日期格式化为报文标识中的 yyyyMMdd 片段。 */
const formatMessageIdDate = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((value) => String(value).padStart(2, '0')).join('');

/** 隔离响应对象，避免调用方意外修改 Mock 内部状态。 */
const cloneRecord = (record: LcwRecord): LcwRecord => ({ ...record });
