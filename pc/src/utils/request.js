import axios from 'axios';
import {
	Notification,
	MessageBox,
	Message,
	Loading
} from 'element-ui';
import {
	tansParams
} from "@/utils/ruoyi";
import {
	getToken
} from '@/utils/auth';
import cache from '@/utils/cache';
import errorCode from '@/utils/errorCode';
import store from '@/store';

let downloadLoadingInstance;
// 是否显示重新登录
export let isRelogin = {
	show: false
};

let timeout = 30000;

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';

const service = axios.create({
	// axios中请求配置有baseURL选项，表示请求URL公共部分
	baseURL: process.env.VUE_APP_BASE_API,
	// 超时
	timeout
})
// request拦截器
service.interceptors.request.use(config => {
	// 是否需要设置 token
	// const isToken = (config.headers || {}).isToken === false;
	// 是否需要加载中蒙版
	const isMask = (config.headers || {}).isMask === false;
	// if (!isToken) {
	// 	let token = store.state.vuex_token;
	// 	if (token) {
	// 		config.headers['Authorization'] = 'Bearer ' + token;
	// 	}
	// }
	// get请求映射params参数
	if (config.method === 'get' && config.params) {
		let url = config.url + '?' + tansParams(config.params);
		url = url.slice(0, -1);
		config.params = {};
		config.url = url;
	}
	store.commit('$uStore', {
		name: 'vuex_onRequest',
		value: true
	})
	// 100ms内没有获得响应，则出现加载蒙版
	if (!isMask) {
		setTimeout(function() {
			if (store.state.vuex_onRequest) {
				store.commit('$uStore', {
					name: 'vuex_loading',
					value: true
				})
			}
		}, 100);
	}


	return config;
}, error => {
	console.log(error);
	Promise.reject(error);
})

// 响应拦截器
service.interceptors.response.use(res => {
		store.commit('$uStore', {
			name: 'vuex_onRequest',
			value: false
		})
		store.commit('$uStore', {
			name: 'vuex_loading',
			value: false
		})
		// 未设置状态码则默认成功状态
		const code = res.data.code || 200;
		// 获取错误信息
		const msg = errorCode[code] || res.data.msg || errorCode['default'];
		// 二进制数据则直接返回
		if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
			return res;
		}
		
		if (code === 401) {
			if (!isRelogin.show && store.state.vuex_currentPath != '/' && store.state.vuex_currentPath != '/login') {
				isRelogin.show = true;
				MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
					confirmButtonText: '重新登录',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					isRelogin.show = false;
					store.commit('$uStore', {
						name: 'vuex_token',
						value: null
					})
					store.commit('$uStore', {
						name: 'vuex_userInfo',
						value: null
					})
					location.href = '/login';
				}).catch(() => {
					isRelogin.show = false;
				});
			}
			return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
		} else if (code === 500) {
			Message({
				message: msg,
				type: 'error'
			})
			return Promise.reject(new Error(msg));
		} else if (code !== 200) {
			Notification.error({
				title: msg
			})
			return Promise.reject('error');
		} else {
			return res.data;
		}
	},
	error => {
		store.commit('$uStore', {
			name: 'vuex_onRequest',
			value: false
		})
		store.commit('$uStore', {
			name: 'vuex_loading',
			value: false
		})
		console.log('err' + error);
		let {
			message
		} = error;
		if (message == "Network Error") {
			message = "后端接口连接异常";
		} else if (message.includes("timeout")) {
			message = "系统接口请求超时";
		} else if (message.includes("Request failed with status code")) {
			message = "系统接口" + message.substr(message.length - 3) + "异常";
		}
		Message({
			message: message,
			type: 'error',
			duration: 5 * 1000
		})
		return Promise.reject(error);
	}
)

export default service
