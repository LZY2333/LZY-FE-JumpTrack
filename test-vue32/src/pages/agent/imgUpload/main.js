import { createApp } from 'vue'
import Antd from 'ant-design-vue';
import App from './views/imgUpload.vue'
import 'ant-design-vue/dist/antd.less';

const app = createApp(App);

app.use(Antd).mount('#app');
