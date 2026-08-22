import type { ISchema } from '@formily/react';
import basicInfoSchema from './common/basic-info.json';
import pacs00800101Schema from './cips/pacs.008.001.01.json';
import pacs00900101Schema from './cips/pacs.009.001.01.json';
import camt05400108Schema from './cips/camt.054.001.08.json';
import admi00200101Schema from './cips/admi.002.001.01.json';

/** 公共基本信息 Schema，不随具体报文类型变化。 */
export const messageBasicInfoSchema = basicInfoSchema as ISchema;

/**
 * 报文类型到静态 Formily Schema 的注册表。
 * MSG_TYPE 已包含协议版本号，因此一期直接使用完整 MSG_TYPE 作为键。
 * 新增类型时只需增加对应 JSON、导入文件并在此登记，不改动详情页渲染逻辑。
 */
const messageSchemaRegistry: Readonly<Record<string, ISchema>> = {
  'pacs.008.001.01': pacs00800101Schema as ISchema,
  'pacs.009.001.01': pacs00900101Schema as ISchema,
  'camt.054.001.08': camt05400108Schema as ISchema,
  'admi.002.001.01': admi00200101Schema as ISchema,
};

export const getMessageSchema = (msgType?: string) => (msgType ? messageSchemaRegistry[msgType] : undefined);
