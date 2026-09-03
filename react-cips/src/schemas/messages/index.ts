import type { ISchema } from '@formily/react';
import basicInfoSchema from './common/basic-info.json';
import billSchema from './cips/bill.json';
import paymentSchema from './cips/payment.json';
import querySchema from './cips/query.json';
import otherSchema from './cips/other.json';
import { MessageBusinessType } from '@/types/enums';

/** 公共基本信息 Schema，不随具体报文类型变化。 */
export const messageBasicInfoSchema = basicInfoSchema as ISchema;

/** 业务类型：BUSINESS_TYPE；四类均为已知类型，基础信息中同时展示分类。 */
const messageSchemaRegistry: Readonly<Record<MessageBusinessType, ISchema>> = {
  [MessageBusinessType.Payment]: paymentSchema as ISchema,
  [MessageBusinessType.Bill]: billSchema as ISchema,
  [MessageBusinessType.Query]: querySchema as ISchema,
  [MessageBusinessType.Other]: otherSchema as ISchema,
};

/** 根据数据库 BUSINESS_TYPE 选择业务信息 Schema。 */
export const getMessageSchema = (businessType?: MessageBusinessType | null) =>
  businessType ? messageSchemaRegistry[businessType] : undefined;
