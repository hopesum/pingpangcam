<template>
	<view class="divContainer">
		<uni-row :gutter="20">
			<uni-col :span="12" v-for="(item,index) in redBagList" :key="index">
				<view :class="['red-bag',item.isOpen?'red-bag-active':'',item.isSelected?'selected-bag':'']"
					@click.once="handleRedBag(item,index)">
					<transition name="bounce">
						<view :class="['text',item.isOpen?'text-active':'']" v-if="item.isOpen">
							{{item.integral}}
						</view>
						<view class="no-text" v-else>
							奖
						</view>
					</transition>
				</view>
			</uni-col>
		</uni-row>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	class GLRandom {
		/**
		 * 构造函数
		 * @param {number} min  最小整数值
		 * @param {number} max  最大整数值
		 * @param {Map} percentage 概率数 [值,百分比]
		 */
		constructor(min, max, percentage = new Map()) {
			this.min = Math.trunc(min);
			this.max = Math.trunc(max);
			this.MATH_RANGE = 100; // 分成100份
			this.percentage = percentage;
		}

		get percentage() {
			if (!this._percentage) {
				this._percentage = new Map();
			}
			return this._percentage;
		}

		/**
		 * 分配比例
		 * @param {Map} map 设置 值-百分比
		 */
		set percentage(map) {
			let result = Array.from(map.values()).reduce((p, v, a) => {
				return p - v;
			}, 1);
			for (let i = this.min; i < this.max; i++) {
				if (map.has(i)) {
					this.percentage.set(i, map.get(i));
				} else {
					this.percentage.set(i, result / (this.max - this.min - map.size));
				}
			}
		}

		/**
		 * 根据比例生成取值范围
		 */
		range() {
			let [start, random, keys] = [0, this.MATH_RANGE, Array.from(this.percentage.keys())];
			for (let i = 0; i < keys.length; i++) {
				let temp = this.percentage.get(keys[i]);
				this.percentage.set(keys[i], [start, start += temp * random]);
			}
		}

		/**
		 * 生成随机数
		 */
		create() {
			let num = Math.random() * this.MATH_RANGE;
			for (let data of this.percentage.entries()) {
				if (num >= data[1][0] && num < data[1][1]) {
					return data[0];
				}
			}
			return null;
		}
	}
	export default {
		data() {
			return {
				redBagList: [{
						isOpen: false,
						isSelected:false,
						integral: 0
					},
					{
						isOpen: false,
						isSelected:false,
						integral: 0
					},
					{
						isOpen: false,
						isSelected:false,
						integral: 0
					},
					{
						isOpen: false,
						isSelected:false,
						integral: 0
					},
					{
						isOpen: false,
						isSelected:false,
						integral: 0
					},
					{
						isOpen: false,
						isSelected:false,
						integral: 0
					}
				]
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin',
				userInfo: 'user/info'
			})
		},
		mounted() {
			this.getSettings()
		},
		methods: {
			async getSettings() {
				let fn = uniCloud.importObject('settings')
				let baseIntegral = await fn.getBaseRandom()
				let reward = await fn.getReward()
				let random = new GLRandom(0, baseIntegral);

				// 调整概率
				random.percentage = new Map(reward);

				// 生成值区间
				random.range();


				this.redBagList.forEach(item => {
					item.integral = random.create()
					// item.integral = Math.ceil(Math.floor(Math.random() * (baseIntegral * 1 + 1)) * (Math.floor(
					// 	0.5 + Math.random() * (1 - 0.5 + 1))))
				})
			},
			handleRedBag(item, index) {
				let that = this
				this.$set(item, 'isSelected', true)
				this.redBagList.forEach(el => {
					el.isOpen = true
				})
				const postData = {
					type: 'SIGN',
					createTime: new Date(),
					createUser: this.userInfo._id,
					matchId: '',
					matchBaseScore: 0,
					winner: {
						win: 0,
						userId: this.userInfo._id,
						nickname: this.userInfo.nickname,
						avatar: this.userInfo.avatar_file.url,
						tag: '补分',
						integral: item.integral
					},
					loser: {
						userId: '62964b049b54e30001fbe69c',
						win: 0,
						avatar: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg',
						tag: '补分',
						nickname: '补分选手',
						integral: 0
					}
				}
				uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'addSection',
						params: postData
					},
					success(res) {
						that.setctionId = res.result.id
						uni.showToast({
							icon: "none",
							title: '恭喜获得积分  ' + item.integral
						})
						that.confirm(item.integral)
					}
				})
			},
			confirm(integral) {
				// let data = {
				// 	"touser": "@all",
				// 	"msgtype": "news",
				// 	"agentid": 1000003,
				// 	"news": {
				// 		"articles": [{
				// 			"title": `中奖通知`,
				// 			"description": `时间：${this.dateFormat(new Date())} \n\n恭喜${this.userInfo.nickname} !!!!!!!! \n\n打卡抽中 ${integral} 积分`,
				// 			"picurl": `${this.userInfo.avatar_file.url}`
				// 		}]
				// 	},
				// }
				let data = {
					"touser": "@all",
					"msgtype": "text",
					"agentid": 1000003,
					"text": {
						"content": `中奖通知 \n\n时间：${this.dateFormat(new Date())} \n恭喜${this.userInfo.nickname} !!!!!!!! \n打卡抽中 ${integral} 积分`
					},
				}
				this.sendQYWX(data)
			},
			sendQYWX(params) {
				let that = this
				uniCloud.callFunction({
					name: 'xcxcontact',
					data: {
						action: 'sendQYWX',
						params: params
					},
					// success() {
					// 	setTimeout(() => {
					// 		uni.navigateBack()
					// 	}, 5000)
					// }
				})
			},
			dateFormat(time, flag) {
				let date = new Date(time);
				let year = date.getFullYear();
				// 在日期格式中，月份是从0开始的，因此要加0，使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
				let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
				let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
				let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
				let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
				let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
				// 拼接
				// return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
				// return year + "-" + month + "-" + day;
				if (flag) {
					return year + "-" + month + "-" + day
				}
				return year + "-" + month + "-" + day + ' ' + hours + ":" + minutes + ":" + seconds;
			},
		},
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		padding: 0 20px;

		.red-bag {
			margin: 20px 0;
			height: 200px;
			position: relative;
			perspective: 1000px;
			transition: all 3s;
			transform-style: preserve-3d;
			display: flex;
			justify-content: center;
			align-items: center;
			background: #ffdbc5;

			.text {
				transform: rotateY(0deg);
				opacity: 0;
				font-size: 0;
				// transition: all 3s;

			}

			.text-active {
				transform: rotateY(180deg);
				opacity: 1;
				font-size: 48px;
			}

			.no-text {
				font-size: 48px;
			}
		}

		.red-bag-active {
			transform: rotateY(180deg);
		}

		.selected-bag {
			color: #F56C6C;
			border: 2px solid #409EFF;
			box-sizing: border-box;
			background:#fff;
		}
	}

	.bounce-enter-active {
		animation: bounce-in 0.5s;
	}

	.bounce-leave-active {
		animation: bounce-in 0.5s reverse;
	}

	@keyframes bounce-in {
		0% {
			transform: scale(0) rotateX(180deg);
		}

		50% {
			// transform: scale(1.5);
		}

		100% {
			transform: scale(1) rotateX(0);
		}
	}
</style>
