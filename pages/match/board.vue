<template>
	<view class="divContainer">
		<uni-notice-bar @getmore="getMore" showGetMore showIcon :speed="20" scrollable :text="notice.content">
		</uni-notice-bar>
		<view>
			<uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" styleType="button"
				activeColor="#409EFF"></uni-segmented-control>
			<view class="content">
				<view v-show="current === 0">
					<uni-card v-for="(user,index) in tableData" :key="index" :title="user.nickname"
						:extra="'NO.'+String(++index)" :thumbnail="user.avatar">
						<view id="box">
							<qiun-data-charts type="2d" :opts="opts" id="charts" type="radar" :chartData="chartData(user)" background="none"
								:resshow="true" />
						</view>
						<uni-row>
							<uni-col :span="8">
								<view class="item">总积分：{{user.integral+matchBaseScore}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">胜率：{{user.rate}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">KD：{{user.KD}}</view>
							</uni-col>
						</uni-row>
					</uni-card>
				</view>
				<view v-show="current === 1">
					<uni-card v-for="(user,index) in tableData" :key="index" :title="user.nickname"
						:extra="'NO.'+String(++index)" :thumbnail="user.avatar">
						<uni-row>
							<uni-col :span="8">
								<view class="item">胜率：{{user.rate}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">总积分：{{user.integral+matchBaseScore}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">KD：{{user.KD}}</view>
							</uni-col>
						</uni-row>
					</uni-card>
				</view>
				<view v-show="current === 2">
					<uni-card v-for="(user,index) in tableData" :key="index" :title="user.nickname"
						:extra="'NO.'+String(++index)" :thumbnail="user.avatar">
						<uni-row>
							<uni-col :span="8">
								<view class="item">KD：{{user.KD}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">胜率：{{user.rate}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">总积分：{{user.integral+matchBaseScore}}</view>
							</uni-col>
						</uni-row>
					</uni-card>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				notice: {},
				current: 0,
				items: ['积分榜', '胜率榜', 'KD榜'],
				matchInfo: {},
				sectionList: [],
				users: {},
				matchBaseScore: 0,
				opts: {
					color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4",
						"#ea7ccc"
					],
					padding: [5, 5, 5, 5],
					dataLabel: true,
					// dataPointShape: false,
					legend: {
						show: false,
						position: "right",
						lineHeight: 25
					},
					extra: {
						radar: {
							gridType: "circle",
							gridColor: "#CCCCCC",
							gridCount: 3,
							opacity: 1,
							max: 100,
							linearType: "custom",
							border: false
						}
					}
				}
			}
		},
		computed: {
			tableData() {
				if (!Object.keys(this.users).length) {
					return []
				}
				let tempList = Object.keys(this.users).map(key => this.users[key])
				tempList = tempList.map(user => {
					return {
						avatar: user.avatar,
						nickname: user.nickname,
						integral: user.integral,
						rate: Math.ceil(((user.winMatch || 0) / ((user.winMatch || 0) + (user.failMatch || 0))) *
							100),
						KD: Number((user.win || 0) / (user.fail || 1)).toFixed(2),
						winMatch: user.winMatch,
						failMatch: user.failMatch,
						win: user.win,
						fail: user.fail,
						fight: user.fight
					}
				})
				switch (this.current) {
					case 0:
						tempList.forEach(el => {
							el.rate = el.rate + '%'
						})
						return tempList.sort((a, b) => {
							return b.integral - a.integral
						})
						break;
					case 1:
						tempList = tempList.sort((a, b) => {
							return b.rate - a.rate
						})
						tempList.forEach(el => {
							el.rate = el.rate + '%'
						})
						return tempList
						break;
					case 2:
						tempList = tempList.sort((a, b) => {
							return b.KD - a.KD
						})
						tempList.forEach(el => {
							el.rate = el.rate + '%'
						})
						return tempList
						break;
					default:
						break;
				}
			}
		},
		onLoad(params) {
			this.matchInfo = params
			this.getSectionList()
			this.getNotice()
		},
		async onPullDownRefresh() {
			await this.getSectionList()
			await this.getNotice()
			uni.stopPullDownRefresh()
		},
		methods: {
			chartData(user) {
				let fight = user.fight
				let categories = Object.keys(fight)
				let data = categories.map(userId => {
					let userData = user.fight[userId]
					return Math.ceil(((Number(userData.win || 0) / (Number(userData.win || 0) + Number(userData.fail ||
						0)) || 0) * 100))
				})
				let res = {
					categories: categories.map(userId => {
						return user.fight[userId].nickname
					}),
					series: [{
						name: "对战",
						data: data
					}]
				}
				return JSON.parse(JSON.stringify(res))
			},
			onClickItem(e) {
				if (this.current != e.currentIndex) {
					this.current = e.currentIndex;
				}
			},
			async getNotice() {
				let that = this
				await uniCloud.callFunction({
					name: 'notice',
					data: {
						action: 'getNoticeList',
						params: this.matchInfo
					},
					success(res) {
						that.notice = res.result.data[0]
					}
				})
			},
			getMore() {
				uni.navigateTo({
					url: '/pages/notice/notice?matchId=' + this.matchInfo.matchId
				})
			},
			async getSectionList() {
				let that = this
				await uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'getSectionList',
						params: this.matchInfo
					},
					success(res) {
						that.sectionList = res.result.data
						that.matchBaseScore = Number(res.result.data[0]?.matchBaseScore)
						let winnerList = that.sectionList.map(el => el.winner)
						let loserList = that.sectionList.map(el => el.loser)
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

						Object.keys(users).forEach((userId) => {
							let fight = {};
							res.result.data.forEach((el) => {
								if (el.winner.userId === userId) {
									if (fight[el.loser.userId]) {
										if (fight[el.loser.userId].win) {
											fight[el.loser.userId].win += 1;
										} else {
											fight[el.loser.userId].win = 1;
										}
									} else {
										fight[el.loser.userId] = {
											userId: el.loser.userId,
											nickname: el.loser.nickname,
											avatar: el.loser.avatar,
											win: 1,
										};
									}
								}
								if (el.loser.userId === userId) {
									if (fight[el.winner.userId]) {
										if (fight[el.winner.userId].fail) {
											fight[el.winner.userId].fail += 1;
										} else {
											fight[el.winner.userId].fail = 1;
										}
									} else {
										fight[el.winner.userId] = {
											userId: el.winner.userId,
											nickname: el.winner.nickname,
											avatar: el.winner.avatar,
											fail: 1,
										};
									}
								}
							});
							users[userId].fight = fight
						});
						that.users = users
						that.$set(that, 'users', users)
						console.log(that.users, '*******');
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		padding: 10px;

		.item {
			text-align: center;
		}

		.form-container {
			background: #ffffff;
			padding: 10px 20px 100px 20px;

			.form-header {
				display: flex;
				justify-content: space-between;
				background: #ffffff;
				padding: 10px;
			}
		}
	}

</style>
