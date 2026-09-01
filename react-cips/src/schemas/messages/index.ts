import type { ISchema } from '@formily/react';
import basicInfoSchema from './common/basic-info.json';
import billSchema from './cips/bill.json';
import paymentSchema from './cips/payment.json';
import querySchema from './cips/query.json';
import { MessageBusinessType } from '@/types/enums';

/** 公共基本信息 Schema，不随具体报文类型变化。 */
export const messageBasicInfoSchema = basicInfoSchema as ISchema;

/**
 * BUSINESS_TYPE 到静态 Formily Schema 的注册表。
 * BUSINESS_TYPE 仅用于系统判断解析结果对应的业务信息表，不作为用户展示字段。
 */
const messageSchemaRegistry: Readonly<Record<string, ISchema>> = {
  [MessageBusinessType.Query]: querySchema as ISchema,
  [MessageBusinessType.Bill]: billSchema as ISchema,
  [MessageBusinessType.Payment]: paymentSchema as ISchema,
};

/** 根据数据库 BUSINESS_TYPE 选择业务信息 Schema。 */
export const getMessageSchema = (businessType?: string) =>
  businessType ? messageSchemaRegistry[businessType.toUpperCase()] : undefined;
