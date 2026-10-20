import { useEffect, useState } from 'react';
import { Alert, App as AntdApp, Button, Card, Descriptions, Flex } from 'antd';
import { getPartyLoginStatus, submitPartyLogin } from '@/api/partyLogin';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import useUserStore from '@/store/useUserStore';
import { PartyLoginStatusEnum } from '@/types/enums';

/** 登录登出页面查询状态 */
interface PartyLoginPageState {
  /** 当前登录状态 */
  loginSts?: PartyLoginStatusEnum;
  /** 查询失败提示 */
  error?: string;
}

const PARTY_LOGIN_STATUS_LABELS: Record<PartyLoginStatusEnum, string> = {
  [PartyLoginStatusEnum.LoggedIn]: 'Logged In',
  [PartyLoginStatusEnum.LoggedOut]: 'Logged Out',
};
const PARTY_LOGIN_QUERY_ERROR = 'Unable to load login status. Please try again.';

/** 本行登录登出页 */
const PartyLogin = () => {
  const { message } = AntdApp.useApp();
  const userId = useUserStore((state) => state.user?.userId);
  const [pageState, setPageState] = useState<PartyLoginPageState>({});
  const { loginSts, error } = pageState;

  /** 刷新 */
  const refresh = async () => {
    try {
      const status = await getPartyLoginStatus();
      setPageState({ loginSts: status?.loginSts });
      return status?.loginSts;
    } catch {
      setPageState({ error: PARTY_LOGIN_QUERY_ERROR });
    }
  };

  /** 登录登出 */
  const handleChange = async (targetLoginSts: PartyLoginStatusEnum) => {
    if (!userId) {
      message.warning('Please log in first.');
      return;
    }

    const stopGlobalLoading = startGlobalLoading();
    try {
      const currentLoginSts = await refresh();
      if (currentLoginSts === targetLoginSts) {
        message.warning(
          targetLoginSts === PartyLoginStatusEnum.LoggedIn ? 'Already logged in.' : 'Already logged out.',
        );
        return;
      }

      await submitPartyLogin({ loginSts: targetLoginSts });
      message.success(targetLoginSts === PartyLoginStatusEnum.LoggedIn ? 'Login success' : 'Logout success');
      await refresh();
    } finally {
      stopGlobalLoading();
    }
  };

  const handleLogin = () => handleChange(PartyLoginStatusEnum.LoggedIn);
  const handleLogout = () => handleChange(PartyLoginStatusEnum.LoggedOut);

  useEffect(() => {
    if (!userId) return;

    const stopGlobalLoading = startGlobalLoading();
    refresh().finally(stopGlobalLoading);

    return stopGlobalLoading;
  }, [userId]);

  return (
    <Card size='small' title='CIPS Login/Logout' className='h-full'>
      <Flex vertical gap='small'>
        <Descriptions size='small' column={1}>
          <Descriptions.Item label='Current Login Status'>
            <span role='status'>{loginSts ? PARTY_LOGIN_STATUS_LABELS[loginSts] : '--'}</span>
          </Descriptions.Item>
        </Descriptions>
        <Flex gap='small'>
          <Button size='small' type='primary' onClick={handleLogin}>
            Login
          </Button>
          <Button size='small' type='primary' onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
        {error && <Alert type='error' message={error} />}
      </Flex>
    </Card>
  );
};

export default PartyLogin;
