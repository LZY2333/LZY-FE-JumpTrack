import { BrowserRouter } from 'react-router-dom';
import { AliveScope } from 'react-activation';
import { App as AntdApp, ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import enUS from 'antd/locale/en_US';
import GlobalLoading from '@/components/GlobalLoading';
import AppRoutes from '@/router';

// 保持主色不变，以同一暖红色相组织交互色、浅色背景和表格专用层级。
const THEME_COLORS = {
  primary: '#e26b66',
  hover: '#ea817c',
  active: '#c5544f',
  bg: '#fff4f2',
  bgHover: '#ffebe8',
  border: '#f1b7b2',
  borderHover: '#e9827c',
  text: '#bd514c',
  textHover: '#a7443f',
  textActive: '#8f3935',
  tableHeader: '#fff1ef',
  tableHeaderText: '#a7443f',
  tableSort: '#fff8f6',
  tableSortActive: '#ffe9e6',
  tableSplit: '#efbbb6',
  tableRowHover: '#fff9f8',
  tableSelected: '#fff2ef',
  tableSelectedHover: '#ffebe8',
} as const;

const APP_THEME: ThemeConfig = {
  cssVar: true,
  token: {
    colorPrimary: THEME_COLORS.primary,
    colorPrimaryBg: THEME_COLORS.bg,
    colorPrimaryBgHover: THEME_COLORS.bgHover,
    colorPrimaryBorder: THEME_COLORS.border,
    colorPrimaryBorderHover: THEME_COLORS.borderHover,
    colorPrimaryHover: THEME_COLORS.hover,
    colorPrimaryActive: THEME_COLORS.active,
    colorPrimaryText: THEME_COLORS.text,
    colorPrimaryTextHover: THEME_COLORS.textHover,
    colorPrimaryTextActive: THEME_COLORS.textActive,
  },
  components: {
    Form: {
      itemMarginBottom: 0,
    },
    Table: {
      headerBg: THEME_COLORS.tableHeader,
      headerColor: THEME_COLORS.tableHeaderText,
      headerSortActiveBg: THEME_COLORS.tableSortActive,
      headerSortHoverBg: THEME_COLORS.tableSort,
      fixedHeaderSortActiveBg: THEME_COLORS.tableSortActive,
      headerFilterHoverBg: THEME_COLORS.tableSort,
      headerSplitColor: THEME_COLORS.tableSplit,
      bodySortBg: THEME_COLORS.tableSort,
      rowHoverBg: THEME_COLORS.tableRowHover,
      rowSelectedBg: THEME_COLORS.tableSelected,
      rowSelectedHoverBg: THEME_COLORS.tableSelectedHover,
    },
  },
};

const App = () => (
  <ConfigProvider locale={enUS} theme={APP_THEME}>
    <AntdApp>
      <GlobalLoading />
      <BrowserRouter>
        <AliveScope>
          <AppRoutes />
        </AliveScope>
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>
);

export default App;
