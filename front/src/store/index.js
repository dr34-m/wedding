import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

let lifeData = {};

try {
	// 尝试获取本地是否存在lifeData变量，第一次启动APP时是不存在的
	lifeData = uni.getStorageSync('lifeData');
} catch (e) {

}

// 需要永久存储，且下次APP启动需要取出的，在state中的变量名
let saveStateKeys = ['vuex_hangStopFlag', 'vuex_hadGetCj', 'vuex_cjData'];

// 保存变量到本地存储中
const saveLifeData = function(key, value) {
	// 判断变量名是否在需要存储的数组中
	if (saveStateKeys.indexOf(key) != -1) {
		// 获取本地存储的lifeData对象，将变量添加到对象中
		let tmp = uni.getStorageSync('lifeData');
		// 第一次打开APP，不存在lifeData变量，故放一个{}空对象
		tmp = tmp ? tmp : {};
		tmp[key] = value;
		// 执行这一步后，所有需要存储的变量，都挂载在本地的lifeData对象中
		uni.setStorageSync('lifeData', tmp);
	}
}
const store = new Vuex.Store({
	state: {
		vuex_url: 'https://mp-1252906577.cos.ap-nanjing.myqcloud.com/',
		vuex_text2: '“I love three things in this world.<br>Sun,moon and you.<br>Sun for morning,moon for night,<br>and you forever”<br><br>浮世三千，吾爱有三<br>日月与卿<br>日为朝，月为暮<br>卿为朝朝暮暮<br>...',
		vuex_text3: 'you are as romantic as the star<br><br>每个人都是一座孤岛，只是有的人<br>在海啸来临前，找到了与之共鸣的那片海域',
		vuex_mucName: 'Stay With Me',
		vuex_mucAuther: '찬열/펀치',
		vuex_mucDetail: '词：지훈，曲：이승주/로코베리',
		vuex_hangStopFlag: lifeData.vuex_hangStopFlag ? lifeData.vuex_hangStopFlag : false,
		vuex_mucFlag: false,
		vuex_hadGetCj: lifeData.vuex_hadGetCj ? lifeData.vuex_hadGetCj : false,
		// vuex_hadGetCj: lifeData.vuex_hadGetCj ? lifeData.vuex_hadGetCj : true,
		vuex_cjData: lifeData.vuex_cjData ? lifeData.vuex_cjData : null
		// vuex_cjData: lifeData.vuex_cjData ? lifeData.vuex_cjData : {
		// openId: 'xxxxxx',
		// 	num: 'A001',
		// 	status: 1,
		// 	reword: 1
		// }
	},
	mutations: {
		$uStore(state, payload) {
			// 判断是否多层级调用，state中为对象存在的情况，诸如user.info.score = 1
			let nameArr = payload.name.split('.');
			let saveKey = '';
			let len = nameArr.length;
			if (nameArr.length >= 2) {
				let obj = state[nameArr[0]];
				for (let i = 1; i < len - 1; i++) {
					obj = obj[nameArr[i]];
				}
				obj[nameArr[len - 1]] = payload.value;
				saveKey = nameArr[0];
			} else {
				// 单层级变量，在state就是一个普通变量的情况
				state[payload.name] = payload.value;
				saveKey = payload.name;
			}
			// 保存变量到本地，见顶部函数定义
			saveLifeData(saveKey, state[saveKey])
		}
	}
})

export default store
