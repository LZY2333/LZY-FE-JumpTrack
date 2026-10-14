import type {
  BasicConfigOptionItem,
  BasicConfigOptionQueryBody,
  BasicConfigOptionQueryRequest,
} from '@/api/basicConfigOption';
import { DictionaryOptionsEnum, ResCode } from '@/types/enums';

/** 字典 Mock 请求 */
interface MockDictionaryRequest {
  /** 请求的字典类型 */
  body?: BasicConfigOptionQueryRequest;
}

const DICTIONARY_VALUES: Record<DictionaryOptionsEnum, Array<[string, string]>> = {
  [DictionaryOptionsEnum.SystemId]: [
    ['COL', 'Collection System'],
    ['CIPS', 'CIPS System'],
    ['PAYMENT-HUB', 'Payment Hub'],
    ['TREASURY-HUB', 'Treasury Hub'],
    ['SWIFT-GATEWAY', 'SWIFT Gateway'],
  ],
  [DictionaryOptionsEnum.Dept]: [
    ['OPS', 'Operations'],
    ['CIPS-OPS', 'CIPS Operations'],
    ['PAYMENT-OPS', 'Payment Operations'],
    ['TREASURY', 'Treasury'],
    ['COMPLIANCE', 'Compliance'],
  ],
  [DictionaryOptionsEnum.Group]: [
    ['PAYMENT', 'Payment Group'],
    ['GROUP-A', 'Group A'],
    ['GROUP-B', 'Group B'],
    ['GROUP-C', 'Group C'],
  ],
};

export default [
  {
    url: '/pssst/manager/basicConfigOption/queryOptions',
    method: 'post',
    response: ({ body }: MockDictionaryRequest) => {
      const options: BasicConfigOptionQueryBody = {};
      for (const configType of body?.configType ?? []) {
        const values = DICTIONARY_VALUES[configType];
        if (!values) return { returnCode: 'ERR0400', errorMsg: 'Unknown dictionary type.' };
        options[configType] = values.map(
          ([configKey, configVal]): BasicConfigOptionItem => ({ configType, configKey, configVal, configDesc: '' }),
        );
      }
      return { returnCode: ResCode.Success, body: options };
    },
  },
];
