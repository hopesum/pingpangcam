<template>
	<view class="user-container">
		<view class="action-btn">
			<button class="uni-button btn" size="mini" type="warn" @click="refreshHorse">刷新马匹</button>
		</view>
		<uni-card v-for="(user,index) in userList" :key="index" :title="user.nickname" :thumbnail="user.avatar_file.url"
			:extra="user.role">
			<view>
				<view class="mt-16">
					id:{{user._id}}
				</view>
				<view class="mt-16">
					级别：{{getUserHorse(user)}}
				</view>
			</view>
			<template v-slot:actions>
				<view class="btn-container">
					<view>
						<button class="uni-button btn" size="mini" type="default"
							@click.stop="setHorse(user,1)">上等马</button>
						<button class="uni-button btn" size="mini" type="primary"
							@click.stop="setHorse(user,2)">中等马</button>
						<button class="uni-button btn" size="mini" type="warn"
							@click.stop="setHorse(user,3)">下等马</button>
					</view>
					<view class="mt-16">
						<button class="uni-button btn" size="mini" type="default"
							@click.stop="cancleAdmin(user)">取消管理</button>
						<button class="uni-button btn" size="mini" type="primary"
							@click.stop="setAdmin(user)">设为管理</button>
						<button class="uni-button btn" size="mini" type="warn"
							@click.stop="deleteUser(user)">删除</button>
					</view>
				</view>
			</template>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userList: [],
				horseSetting: {}
			}
		},
		onLoad() {
			this.getSettings()
			this.initialize()
		},
		async onPullDownRefresh() {
			await this.initialize()
			uni.stopPullDownRefresh()
		},
		methods: {
			getUserHorse(user) {
				const statusMap = {
					1: '上等马',
					2: '中等马',
					3: '下等马'
				}
				return statusMap[user.horse] || '野马'
			},
			async initialize() {
				let that = this
				await uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'getUserList'
					},
					success(res) {
						that.userList = res.result.data
					}
				})
			},
			getDate() {
				const currentDate = new Date()
				const millisecond = 1000 * 60 * 60 * 24
				const day = this.horseSetting.limitDay||365
				const startTime = new Date(currentDate.getTime() - day * millisecond)
				return startTime
			},
			async refreshHorse() {
				uni.showLoading()
				let that = this
				let data = {
					action: 'getLimitHorseAllSectionList',
					params: {
						startTime: this.getDate(),
						endTime: new Date()
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
									winMatch: el.tag == '补分' ? 0 : 1,
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
									failMatch: el.tag == '补分' ? 0 : 1,
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
						if (!Object.keys(users).length) {
							return []
						}
						let tempList = Object.keys(users).map(key => users[key])
						console.log('tempList', tempList);
						let bufenIndex = tempList.findIndex(el => el.nickname === '补分选手')
						if (bufenIndex !== -1) {
							tempList.splice(bufenIndex, 1)
						}
						tempList = tempList.map(user => {
							return {
								userId: user.userId,
								avatar: user.avatar,
								nickname: user.nickname,
								integral: user.integral,
								rate: Math.ceil(((user.winMatch || 0) / (((user.winMatch || 0) + (user
										.failMatch || 0)) > 0 ? ((user.winMatch || 0) + (
										user.failMatch || 0)) : 1)) *
									100),
								KD: Number((user.win || 0) / (user.fail || 1)).toFixed(2),
								winMatch: user.winMatch,
								failMatch: user.failMatch,
								win: user.win,
								fail: user.fail,
								fight: user.fight
							}
						})
						// let integralFirst = tempList.sort((a, b) => {
						// 	return b.integral - a.integral
						// })
						// 场数限制，低于该场数限制不参与评马，人工赋马
						let hasTicketList = tempList.filter(el => (el.winMatch + el.failMatch) > that
							.horseSetting
							.limitSection)
						let rateList = hasTicketList.sort((a, b) => {
							return b.rate - a.rate
						})
						// let KDFirst = tempList.sort((a, b) => {
						// 	return b.KD - a.KD
						// })
						// fineHorse
						// moderateHorse
						that.userList.forEach(user => {
							//有效对局用户正常赋马，没有的改成野马，horse置为''
							let index = rateList.findIndex(el => el.userId === user._id)
							if (index < 0) { //没有对局的用户
								user.horse = ''
							} else {
								console.log('index',index);
								if (index < that.horseSetting.fineHorse) {
									user.horse = 1
								} else if (index < (that.horseSetting.moderateHorse+that.horseSetting.fineHorse)) {
									user.horse = 2
								} else {
									user.horse = 3
								}
							}
							that.updateUser(user)
						})
            that.$forceUpdate()
						uni.hideLoading()
					}
				})
			},
			async getSettings() {
				let fn = uniCloud.importObject('settings')
				this.horseSetting = await fn.getHorseSetting()
			},
			cancleAdmin(user) {
				let that = this
				uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'updateUser',
						params: {
							...user,
							role: []
						}
					},
					success() {
						that.initialize()
					}
				})
			},
			setAdmin(user) {
				let that = this
				uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'updateUser',
						params: {
							...user,
							role: ['admin']
						}
					},
					success() {
						that.initialize()
					}
				})
			},
			setHorse(user, range) {
				let that = this
				uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'updateUser',
						params: {
							...user,
							horse: range
						}
					},
					success() {
						that.initialize()
					}
				})
			},
			updateUser(user) {
				let that = this
				uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'updateUser',
						params: user
					},
					success() {
						that.initialize()
					}
				})
			},
			deleteUser(user) { //TODO:unicloud bug , _vm.deleteUser is not a function，无法删除
				let that = this
				uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'deleteUser',
						params: user
					},
					success() {
						that.initialize()
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.btn-container {
		text-align: right;

		.btn {
			margin-left: 4px;
		}
	}

	.mt-16 {
		margin-top: 16px;
	}

	.user-container {
		position: relative;

		.action-btn {
			background: #f5f5f5;
			text-align: right;
			padding: 8px 4px 4px;
		}
	}
</style>
