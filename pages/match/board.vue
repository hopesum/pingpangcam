<template>
	<view class="divContainer">
		<uni-notice-bar v-if="matchInfo.matchId" @click="getMore" scrollable showIcon :speed="30"
			:text="notice.content">
		</uni-notice-bar>
		<view>
			<uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" styleType="button"
				activeColor="#409EFF"></uni-segmented-control>
			<view class="content">
				<view v-show="current === 0">
					<uni-card v-for="(user,index) in tableData" :key="index" :title="user.nickname"
						:extra="'NO.'+String(++index)" :thumbnail="user.avatar">
						<view class="chart-container">
							<view class="chart-switch">
								<switch @change="switchChange($event,user)" style="transform:scale(0.7)">展示实际胜率</switch>
							</view>
							<view class="box">
								<qiun-data-charts :opts="opts" id="charts" type="radar" :chartData="chartData(user)"
									background="none" :resshow="true" />
							</view>
						</view>
						<uni-row>
							<uni-col :span="8">
								<view class="item">
									总积分：{{matchInfo.matchId?(Number(user.integral)+Number(matchBaseScore)):Number(user.integral)}}
								</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">胜率：{{user.rate}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">KD：{{user.KD}}</view>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="8">
								<view class="item">总场数：{{(Number(user.winMatch) || 0) + (Number(user.failMatch) || 0)}}
								</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">胜场：{{Number(user.winMatch) || 0}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">负场：{{Number(user.failMatch) || 0}}</view>
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
								<view class="item">
									总积分：{{matchInfo.matchId?(Number(user.integral)+Number(matchBaseScore)):Number(user.integral)}}
								</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">KD：{{user.KD}}</view>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="8">
								<view class="item">总场数：{{(Number(user.winMatch) || 0) + (Number(user.failMatch) || 0)}}
								</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">胜场：{{Number(user.winMatch) || 0}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">负场：{{Number(user.failMatch) || 0}}</view>
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
								<view class="item">
									总积分：{{matchInfo.matchId?(Number(user.integral)+Number(matchBaseScore)):Number(user.integral)}}
								</view>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="8">
								<view class="item">总场数：{{(Number(user.winMatch) || 0) + (Number(user.failMatch) || 0)}}
								</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">胜场：{{Number(user.winMatch) || 0}}</view>
							</uni-col>
							<uni-col :span="8">
								<view class="item">负场：{{Number(user.failMatch) || 0}}</view>
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
					color: ["#1890FF", "#EE6666", "#FAC858", "#91CB74", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4",
						"#ea7ccc"
					],
					xAxis: {
						boundaryGap: "justify",
						disableGrid: false,
						min: 0,
						axisLine: false,
						max: 200
					},
					padding: [0, 0, 0, 0],
					dataLabel: {
						show: true,
						color: ["#1890FF", "#EE6666", "#FAC858", "#91CB74", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4",
							"#ea7ccc"
						],
					},
					// dataPointShape: false,
					legend: {
						show: true,
						position: "bottom",
						// lineHeight: 20
					},
					extra: {
						bar: {
							type: "stack",
							width: 30,
							meterBorde: 1,
							meterFillColor: "#FFFFFF",
							activeBgColor: "#000000",
							activeBgOpacity: 0.08,
							categoryGap: 2
						},
						radar: {
							gridType: "circle",
							gridColor: "#CCCCCC",
							gridCount: 3,
							opacity: 0.2,
							max: 100,
							linearType: "custom",
							border: true,
							gridEval: 2,
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
				console.log(this.users, '12456');
				let tempList = Object.keys(this.users).map(key => this.users[key])
				console.log('tempList', tempList);
				let bufenIndex = tempList.findIndex(el => el.nickname === '补分选手')
				if (bufenIndex !== -1) {
					tempList.splice(bufenIndex, 1)
				}
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
			if (this.matchInfo.matchName) {
				uni.setNavigationBarTitle({
					title: '赛事对战榜单'
				})
			} else {
				uni.setNavigationBarTitle({
					title: '总对战榜单'
				})
			}
			this.getSectionList()
			if (this.matchInfo.matchId) {
				this.getNotice()
			}
		},
		async onPullDownRefresh() {
			await this.getSectionList()
			if (this.matchInfo.matchId) {
				await this.getNotice()
			}
			uni.stopPullDownRefresh()
		},
		methods: {
			switchChange(e, user) {
				this.$set(user, 'showRealRate', e.detail.value)
				this.$forceUpdate()
			},
			chartData(user) {
				let fight = user.fight
				let categories = Object.keys(fight)
				let data = categories.map(userId => {
					let userData = user.fight[userId]
					return Math.round(((Number(userData.win || 0) / (Number(userData.win || 0) + Number(userData
						.fail ||
						0)) || 0) * 100))
				})
				let data2 = categories.map(userId => {
					let userData = user.fight[userId]
					return Math.round(((Number(userData.winMatchNum || 0) / (Number(userData.winMatchNum || 0) +
						Number(userData
							.failMatchNum ||
							0)) || 0) * 100))
				})
				let res = {
					categories: categories.map(userId => {
						return user.fight[userId].nickname
					}),
					series: [{
						name: "期望胜率",
						data: data
					}]
				}
				let res2 = {
					name: "实际胜率",
					data: data2
				}
				if (user.showRealRate) {
					res.series.push(res2)
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
				let data
				if (this.matchInfo.matchId) {
					data = {
						action: 'getSectionList',
						params: this.matchInfo
					}
				} else {
					data = {
						action: 'getAllSectionList'
					}
				}
				await uniCloud.callFunction({
					name: 'section',
					data,
					success(res) {
						that.sectionList = res.result.data
						that.matchBaseScore = Number(res.result.data[0]?.matchBaseScore)
						let winnerList = that.sectionList.map(el => el.winner)
						let loserList = that.sectionList.map(el => el.loser)
						let users = {}
						winnerList.forEach(el => {
							if (users[el.userId]) {
								users[el.userId].winMatch += el.tag == '补分' ? 0 : 1
								users[el.userId].win += el.tag == '补分' ? 0 : Number(el.win)
								users[el.userId].fail += el.tag == '补分' ? 0 : Number(el.fail)
								users[el.userId].integral += Number(el.integral)
							} else {
								users[el.userId] = {
									userId: el.userId,
									nickname: el.nickname,
									avatar: el.avatar,
									level: el.level,
									score: el.score,
									winMatch: 1,
									failMatch: 0,
									win: el.tag == '补分' ? 0 : Number(el.win),
									fail: el.tag == '补分' ? 0 : Number(el.fail),
									integral: Number(el.integral)
								}
							}
						})
						loserList.forEach(el => {
							if (users[el.userId]) {
								users[el.userId].failMatch += el.tag == '补分' ? 0 : 1
								users[el.userId].win += el.tag == '补分' ? 0 : Number(el.win)
								users[el.userId].fail += el.tag == '补分' ? 0 : Number(el.fail)
								users[el.userId].integral += Number(el.integral)
							} else {
								users[el.userId] = {
									userId: el.userId,
									nickname: el.nickname,
									avatar: el.avatar,
									level: el.level,
									score: el.score,
									winMatch: 0,
									failMatch: 1,
									win: el.tag == '补分' ? 0 : Number(el.win),
									fail: el.tag == '补分' ? 0 : Number(el.fail),
									integral: Number(el.integral)
								}
							}
						})
						
						Object.keys(users).forEach((userId) => {
							let fight = {};
							res.result.data.forEach((el) => {
								if (el.winner.nickname !== '补分选手' && el.loser.nickname !==
									'补分选手') {
									if (el.winner.userId === userId) { //如果是胜者
										if (fight[el.loser.userId]) { //之前计算过胜利
											fight[el.loser.userId].win += el.winner.win * 1
											fight[el.loser.userId].fail += el.winner.fail * 1
											if (fight[el.loser.userId].winMatchNum) {
												fight[el.loser.userId].winMatchNum += 1;
											} else {
												fight[el.loser.userId].winMatchNum = 1;
											}
										} else { //没有计算过胜利
											fight[el.loser.userId] = {
												userId: el.loser.userId,
												nickname: el.loser.nickname,
												avatar: el.loser.avatar,
												win: el.winner.win * 1,
												fail: el.winner.fail * 1,
												winMatchNum: 1,
											};
										}
									}
									if (el.loser.userId === userId) {
										if (fight[el.winner.userId]) {
											fight[el.winner.userId].win += el.loser.win * 1
											fight[el.winner.userId].fail += el.loser.fail * 1
											if (fight[el.winner.userId].failMatchNum) {
												fight[el.winner.userId].failMatchNum += 1;
											} else {
												fight[el.winner.userId].failMatchNum = 1;
											}
										} else {
											fight[el.winner.userId] = {
												userId: el.winner.userId,
												nickname: el.winner.nickname,
												avatar: el.winner.avatar,
												fail: el.loser.fail * 1,
												win: el.loser.win * 1,
												failMatchNum: 1
											};
										}
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
			text-align: left;
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

	.chart-switch {
		float: right;
	}
</style>
