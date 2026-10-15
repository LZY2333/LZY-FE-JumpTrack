import type {
  BasicConfigOptionItem,
  BasicConfigOptionQueryBody,
  BasicConfigOptionQueryRequest,
} from '@/api/basicConfigOption';
import { ResCode } from '@/types/enums';
import dictionaryOptions from '../src/store/dictionaryOptions.json';

/** 字典 Mock 请求 */
interface MockDictionaryRequest {
  /** 请求的字典类型 */
  body?: BasicConfigOptionQueryRequest;
}

export default [
  {
    url: '/pssst/manager/basicConfigOption/queryOptions',
    method: 'post',
    response: ({ body }: MockDictionaryRequest) => {
      const options: BasicConfigOptionQueryBody = {};
      for (const configType of body?.configType ?? []) {
        const values = dictionaryOptions[configType];
        if (!values) return { returnCode: 'ERR0400', errorMsg: 'Unknown dictionary type.' };
        options[configType] = values.map(
          ({ label, value }): BasicConfigOptionItem => ({
            configType,
            configKey: label,
            configVal: value,
            configDesc: '',
          }),
        );
      }
      return { returnCode: ResCode.Success, body: options };
    },
  },
];
