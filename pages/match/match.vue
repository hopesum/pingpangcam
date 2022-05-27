<template>
	<view class="divContainer">
		<swiper v-if="matchList.length&&bannerList.length" class="swiper" circular :indicator-dots="true"
			:autoplay="true" :interval="2000" :duration="500">
			<swiper-item class="swiper-item" v-for="(item,index) in bannerList" :key="index">
				<view class="user-container">
					<view class="user-left">
						<image class="banner-img" :src="item.avatar" mode="aspectFill" :draggable="false"></image>
					</view>
					<view class="user-right">
						<view>
							<view class="user-title">
								<uni-icons type="medal-filled" size="48" color="gold"></uni-icons>
								<text class="title-name">{{item.nickname}}</text>
							</view>
							<view v-if="index===0" class="user-info">
								<text class="title">积分王</text>
								<view class="text">{{item.integral}}</view>
							</view>
							<view v-if="index===1" class="user-info">
								<text class="title">胜率王</text>
								<view class="text">{{item.rate}}</view>
							</view>
							<view v-if="index===2" class="user-info">
								<text class="title">KD王</text>
								<view class="text">{{item.KD}}</view>
							</view>
						</view>
						<!-- <view>积分：{{item.integral}}</view>
						<view>胜率：{{item.rate}}</view>
						<view>KD：{{item.KD}}</view>
						<view>胜场：{{item.win}}</view> -->
					</view>
				</view>
			</swiper-item>
		</swiper>
		<uni-card class="card" v-for="(match,index) in matchList" :key="index" :title="match.name"
			cover="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg"
			@click="handleMatchDetail(match)">
			<view class="title">
				<view class="name">
					<text>{{match.desc}}</text>
				</view>
			</view>
			<template v-slot:actions>
				<view v-if="hasLogin&&uniIDHasRole('admin')" class="btn-container">
					<button class="uni-button btn" size="mini" type="primary" @click.stop="editMatch(match)">编辑</button>
					<button class="uni-button btn" size="mini" type="warn" @click.stop="deleteMatch(match)">删除</button>
				</view>
			</template>
		</uni-card>
		<uni-fab v-if="hasLogin&&uniIDHasRole('admin')" ref="fab" horizontal="right" vertical="bottom"
			@fabClick="fabClick" />
		<uni-popup ref="popup" type="bottom">
			<view class="form-container">
				<view class="form-header">
					<uni-icons type="closeempty" color="#409EFF" size="30" @click="handleClose"></uni-icons>
					<uni-icons type="checkmarkempty" color="#67C23A" size="30" @click="handleAdd"></uni-icons>
				</view>
				<uni-forms :modelValue="formData">
					<uni-forms-item required label="名称" name="name">
						<uni-easyinput type="text" v-model="formData.name" />
					</uni-forms-item>
					<uni-forms-item required label="底分" name="baseScore">
						<uni-easyinput type="text" v-model="formData.baseScore" />
					</uni-forms-item>
					<uni-forms-item required label="描述" name="desc">
						<uni-easyinput type="text" v-model="formData.desc" />
					</uni-forms-item>
				</uni-forms>
			</view>
		</uni-popup>
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirm">
				<view class="desc">
					删除后数据将无法恢复，请谨慎操作！
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				matchList: [],
				bannerList: [],
				formData: {
					baseScore: 0,
					name: '',
					desc: '',
					createTime: new Date()
				},
				deleteMatchInfo: {}
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin'
			})
		},
		onLoad() {
			this.getMatchList()
		},
		async onPullDownRefresh() {
			await this.getMatchList()
			uni.stopPullDownRefresh()
		},
		methods: {
			async getMatchList() {
				let that = this
				await uniCloud.callFunction({
					name: 'match',
					data: {
						action: 'getMatchList'
					},
					success(res) {
						that.matchList = res.result.data.sort((a, b) => {
							return b.createTime - a.createTime
						})
						if (that.matchList.length) {
							that.getBanner()
						}
					}
				})
			},
			async getBanner() {
				let that = this
				let matchId = this.matchList[0]._id
				await uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'getSectionList',
						params: {
							matchId
						}
					},
					success(res) {
						let sectionList = res.result.data
						console.log(res.result.data);
						that.matchBaseScore = Number(res.result.data[0]?.matchBaseScore)
						let winnerList = sectionList.map(el => el.winner)
						let loserList = sectionList.map(el => el.loser)
						let users = {}

						winnerList.forEach(el => {
							if (users[el.userId]) {
								users[el.userId].winMatch += 1
								users[el.userId].win += el.win
								users[el.userId].integral += el.integral
							} else {
								users[el.userId] = {
									userId: el.userId,
									nickname: el.nickname,
									avatar: el.avatar,
									level: el.level,
									score: el.score,
									winMatch: 1,
									failMatch: 0,
									win: el.win,
									fail: el.fail,
									integral: el.integral
								}
							}
						})
						loserList.forEach(el => {
							if (users[el.userId]) {
								users[el.userId].failMatch += 1
								users[el.userId].fail += el.fail
								users[el.userId].integral += el.integral
							} else {
								users[el.userId] = {
									userId: el.userId,
									nickname: el.nickname,
									avatar: el.avatar,
									level: el.level,
									score: el.score,
									winMatch: 0,
									failMatch: 1,
									win: el.win,
									fail: el.fail,
									integral: el.integral
								}
							}
						})
						if (!Object.keys(users).length) {
							return []
						}
						let tempList = Object.keys(users).map(key => users[key])
						tempList = tempList.map(user => {
							return {
								avatar: user.avatar,
								nickname: user.nickname,
								integral: user.integral,
								rate: Math.ceil(((user.winMatch || 0) / ((user.winMatch || 0) + (user
										.failMatch || 0))) *
									100),
								KD: Number((user.win || 0) / (user.fail || 1)).toFixed(2),
								winMatch: user.winMatch,
								failMatch: user.failMatch,
								win: user.win,
								fail: user.fail
							}
						})
						let integralFirst = tempList.sort((a, b) => {
							return b.integral - a.integral
						})[0]
						let rateFirst = tempList.sort((a, b) => {
							return b.rate - a.rate
						})[0]
						let KDFirst = tempList.sort((a, b) => {
							return b.KD - a.rate
						})[0]
						that.bannerList = [integralFirst, rateFirst, KDFirst]
						console.log(that.bannerList);
					}
				})
			},
			addMatch() {
				let that = this
				if (this.formData._id) {
					uniCloud.callFunction({
						name: 'match',
						data: {
							action: 'updateMatch',
							params: this.formData
						},
						success(res) {
							that.$refs.popup.close()
							that.getMatchList()
						}
					})
				} else {
					uniCloud.callFunction({
						name: 'match',
						data: {
							action: 'addMatch',
							params: this.formData
						},
						success(res) {
							that.$refs.popup.close()
							that.getMatchList()
						}
					})
				}

			},
			updateMatch() {},
			editMatch(match) {
				this.formData = match
				this.$refs.popup.open()
			},
			deleteMatch(match) {
				this.deleteMatchInfo = match
				this.$refs.dialog.open()
			},
			confirm() {
				let that = this
				uniCloud.callFunction({
					name: 'match',
					data: {
						action: 'deleteMatch',
						params: this.deleteMatchInfo
					},
					success(res) {
						that.$refs.dialog.close()
						that.getMatchList()
					}
				})
			},
			fabClick() {
				this.formData = {
					baseScore: 0,
					name: '',
					desc: '',
					createTime: new Date()
				}
				this.$refs.popup.open()
			},
			handleClose() {
				this.$refs.popup.close()
			},
			handleAdd() {
				if (this.formData.name && this.formData.desc) {
					this.addMatch()
				}
			},
			handleMatchDetail(match) {
				uni.navigateTo({
					url: `/pages/match/detail?matchId=${match._id}&matchName=${match.name}&matchBaseScore=${match.baseScore}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		font-size: 16px;
		background: #f5f5f5;
	}

	.card {
		position: relative;

		.fire {
			position: absolute;
			top: 20px;
			right: 20px;
		}
	}

	.title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;

		.match-delete {
			position: absolute;
			top: -40px;
			right: 0px;
		}

		.name {
			display: flex;
			align-items: center;
		}
	}

	.desc {
		font-size: 12px;
	}

	.form-container {
		background: #ffffff;
		padding: 10px 20px 100px 20px;
		overflow-y: auto;
		height: 80vh;

		.form-header {
			display: flex;
			justify-content: space-between;
			background: #ffffff;
			padding: 10px;
		}
	}

	.btn-container {
		text-align: right;

		.btn {
			margin-left: 4px;
		}
	}

	.user-container {
		display: flex;
		height: 100%;

		.user-left {
			flex: 1;
			height: 100%;
			// border: 1px solid red;
			display: flex;
			flex-direction: column;

			.banner-img {
				width: 100%;
				height: 100%;
			}
		}

		.user-right {
			flex: 1;
			height: 100%;
			padding: 10px;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			justify-content: center;
			// align-items: center;
		}
	}

	.user-title {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.title-name {
		color: #ffd700;
	}

	.user-info {
		display: flex;
		align-items: center;
		justify-content: space-around;
	}

	.title {
		color: #409EFF;
	}

	.text {
		color: #409EFF;
		text-shadow: 2px 2px #F56C6C;
		font-size: 30px;
		transform: rotate(10deg);

	}
	.swiper{
		// box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		// border: 1px solid #409EFF;
		padding: 10px;
		background: #f5f5f5;
		// background-image: url('https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg');
		.swiper-item{
			background: #ffffff;
		}
	}
</style>
