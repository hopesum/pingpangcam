<template>
	<view class="divContainer">
		<view class="divContent">
			<view class="scores">
				我的积分：
				<text class="price">{{totalScore}}</text>
			</view>
			<uni-grid :column="3" :show-border="true" :square="true" @change="change" class="grid-box">
				<uni-grid-item v-for="(item ,index) in goodsList" :index="index" :key="index">
					<view class="grid-item-box">
						<image class="image" :src="item.url" mode="aspectFill" />
						<text class="text">{{item.title||'商品名称'}}</text>
						<text class="text-price">
							<text>价格：</text>
							<text class="price">{{item.price||'商品价格'}}</text>
						</text>
						<view v-if="selected(item)" class="grid-dot">
							<uni-icons size="20" color="#F56C6C" type="checkbox-filled"></uni-icons>
						</view>
					</view>
				</uni-grid-item>
			</uni-grid>
			<!-- <view class="good-list">
				<view class="good-item">
					1111
				</view>
			</view> -->
		</view>
		<view class="divFooter">
			<button v-if="selectedGood.id" class="cus-btn" type="primary" @click="handleExchange">立即兑换</button>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				totalScore: 0,
				goodsList: [],
				selectedGood: {},
				sectionList: []
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin',
				userInfo: 'user/info'
			})
		},
		onLoad() {
			this.getSettings()
			this.getScore()
		},
		methods: {
			getScore() {
				let that = this
				uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'getUserAllSectionList',
						params: {
							userId: this.userInfo._id
						}
					},
					success(res) {
						that.sectionList = res.result.data
						let winnerList = that.sectionList.map(el => el.winner)
						let loserList = that.sectionList.map(el => el.loser)
						let winUserList = winnerList.filter(el => el.userId === that.userInfo._id)
						let loseUserList = loserList.filter(el => el.userId === that.userInfo._id)
						let sum = 0
						winUserList.forEach(el => {
							sum += Number(el.integral) * 1
						})
						loseUserList.forEach(el => {
							sum += Number(el.integral) * 1
						})
						that.totalScore = sum
					}
				})
			},
			change(e) {
				let {
					index
				} = e.detail
				this.selectedGood = Object.assign({}, this.goodsList[index])
			},
			async getSettings() {
				let fn = uniCloud.importObject('settings')
				this.goodsList = await fn.getGoodsList()
			},
			selected(item) {
				return item.id === this.selectedGood.id
			},
			handleExchange() {
				let that = this
				let price = this.selectedGood.price
				if (price > this.totalScore) {
					uni.showToast({
						icon: 'error',
						title: '积分不足'
					})
					return
				}

				const postData = {
					type: 'EXCHANGE',
					status:'1',//请求审核
					createTime: new Date(),
					createUser: this.userInfo._id,
					matchId: '',
					matchBaseScore: 0,
					winner: {
						good:this.selectedGood,
						win: 0,
						userId: this.userInfo._id,
						nickname: this.userInfo.nickname,
						avatar: this.userInfo.avatar_file.url,
						tag: '补分',
						integral: 0 - price
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
				uni.showLoading()
				uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'addSection',
						params: postData
					},
					success(res) {
						that.getScore()
						uni.hideLoading()
						uniCloud.callFunction({
							name: 'exchange',
							data: {
								action: 'addExchange',
								params: {
									userId: that.userInfo._id,
									...that.selectedGood
								}
							},
							success() {
								uni.showToast({
									icon: 'success',
									title: '兑换成功，请联系管理员核销'
								})
								console.log(that.selectedGood,'**********');
								let data = {
									"touser": "@all",
									"msgtype": "news",
									"agentid": 1000003,
									"news": {
										"articles": [{
											"title": `${that.userInfo.nickname}兑换通知`,
											"description": `当前时间\n${that.dateFormat(new Date())} \n${that.userInfo.nickname} !!!!!!!! \n消耗 ${price} 积分，申请兑换${that.selectedGood.title}`,
											"picurl": `${that.selectedGood.url}`
										}]
									},
								}
								that.sendQYWX(data)
							}
						})
					},
					fail() {
						uni.hideLoading()
					}
				})
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
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		position: relative;
		padding-bottom: 60px;

		.divContent {
			padding: 10px 20px;
			margin-bottom: 60px;
		}

		.divFooter {
			box-sizing: border-box;
			position: fixed;
			bottom: 0;
			width: 100%;
			padding: 10px;
			display: flex;
			background: #ffffff;
			z-index: 10;

			.cus-btn {
				font-size: 14px;
				flex: 1;
				margin: 4px;
			}
		}
	}

	.scores {
		line-height: 32px;
		height: 32px;
		font-size: 12px;
		text-align: right;
		padding: 0 16px;
		background-color: #f5f5f5;
	}

	.grid-dynamic-box {
		margin-bottom: 15px;
	}

	.grid-box {
		padding: 24px;
	}

	.grid-item-box {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.grid-item-box-row {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}

	.grid-dot {
		position: absolute;
		top: 5px;
		right: 15px;
	}

	.image {
		width: 60px;
		height: 60px;
		border-radius: 4px;
	}

	.text {
		font-size: 12px;
		margin-top: 5px;
	}

	.text-price {
		font-size: 16rpx;
	}

	.price {
		color: orangered;
	}
</style>
