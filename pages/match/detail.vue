<template>
	<view class="divContainer">
		<view class="divContent">
			<view class="title">
				请选择对战双方
			</view>
			<uni-grid :column="3" :show-border="true" :square="true" @change="change">
				<uni-grid-item v-for="(item ,index) in userList" :index="index" :key="index">
					<view :class="{'grid-item-box':true,'limit':item.matchTime>=limitTime}">
						<image class="image"
							:src="item.avatar||item.avatar_file.url||'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg'"
							mode="aspectFill" />
						<text class="text">{{item.nickname||'傻子'}}</text>
						<view v-if="selected(item)" class="grid-dot">
							<uni-icons size="20" color="#F56C6C" type="checkbox-filled"></uni-icons>
						</view>
					</view>
				</uni-grid-item>
			</uni-grid>
		</view>
		<view class="divFooter">
			<button class="uni-button cus-btn" plain type="warn" @click="handleSection">对战记录</button>
			<button class="uni-button cus-btn" plain type="primary" @click="handleBoard">排行榜</button>
			<button v-if="battleUser.length>=2" class="uni-button cus-btn" type="primary"
				@click="handleSure">开始比赛</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				matchId: '',
				matchName: '',
				matchBaseScore: 0,
				userList: [],
				battleUser: [],
				playList: [],
				limitTime: 0
			}
		},
		onLoad(params) {
			this.matchBaseInfo = JSON.parse(decodeURIComponent(params.matchBaseInfo));
			this.matchId = this.matchBaseInfo._id
			this.matchName = this.matchBaseInfo.name
			this.matchBaseScore = this.matchBaseInfo.baseScore
			uni.setNavigationBarTitle({
				title: this.matchBaseInfo.name
			})
			this.getUserList()
			this.getPlayList()
			this.getSettings()
		},
		async onPullDownRefresh() {
			await this.getUserList()
			await this.getPlayList()
			uni.stopPullDownRefresh()
		},
		methods: {
			async getSettings() {
				uni.showLoading()
				let fn = uniCloud.importObject('settings')
				this.limitTime = await fn.getLimitTime()
				uni.hideLoading()
			},
			async getPlayList() {
				let postData = this.getCurrentWeek()
				let that = this
				uni.showLoading()
				await uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'getDateList',
						params: postData
					},
					success(res) {
						that.playList = res.result.data
						uni.hideLoading()
					},
					fail() {
						uni.hideLoading()
					}
				})
			},
			getCurrentWeek() {
				//获取当前时间
				const currentDate = new Date()
				//返回date是一周中的某一天
				const week = currentDate.getDay()
				//一天的毫秒数
				const millisecond = 1000 * 60 * 60 * 24
				//减去的天数
				const minusDay = week != 0 ? week - 1 : 6
				//本周 周一
				const monday = new Date(currentDate.getTime() - minusDay * millisecond)
				//本周 周日
				const sunday = new Date(monday.getTime() + 6 * millisecond)
				return {
					startTime: monday,
					endTime: sunday
				}
			},
			handleSure() {
				console.log(this.matchBaseInfo);
				const postData = {
					matchId: this.matchId,
					matchBaseScore: this.matchBaseScore,
					matchRules: this.matchBaseInfo.rules,
					battleUser: this.battleUser.map(el => {
						for (var i = 0; i < this.userList.length; i++) {
							if (el === this.userList[i]._id) {
								return {
									userId: el,
									nickname: this.userList[i].nickname || '傻子',
									horse:this.userList[i].horse,
									avatar: this.userList[i].avatar || this.userList[i]?.avatar_file?.url ||
										'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg'
								}
							}
						}
					})
				}
				uni.navigateTo({
					url: '/pages/match/section?matchBaseInfo=' + encodeURIComponent(JSON.stringify(postData))
				})
			},
			selected(item) {
				if (this.battleUser.indexOf(item._id) !== -1) {
					return true
				}
				return false
			},
			async getUserList() {
				uni.showLoading()
				await uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'getUserList',
						params: {}
					},
					success: (res) => {
						this.userList = res.result.data
						uni.hideLoading()
					},
					fail() {
						uni.hideLoading()
					}
				})
			},
			change(e) {
				let {
					index
				} = e.detail
				let userId = this.userList[index]._id
				let battleIndex = this.battleUser.indexOf(userId)
				if (battleIndex !== -1) {
					this.battleUser.splice(battleIndex, 1)
				} else {
					if(this.battleUser.length<1){
						this.battleUser.push(userId)
					}
					else if (this.battleUser.length < 2) {
						let otherOne = this.userList.find(el=>el._id==userId)
						if(otherOne.matchTime>=this.limitTime){
							uni.showToast({
								icon:"error",
								title:'本周对战已完成'
							})
							return
						}
						this.battleUser.push(userId)
					}
				}
				this.checkHasMatch()
			},
			checkHasMatch() {
				if (this.battleUser.length == 1) {
					let userId = this.battleUser[0]
					//与当前选中用户关联的数据
					let connectList = this.playList.filter(item => item.winner.userId == userId || item.loser.userId ==
						userId)
					//记录匹配用户
					let mapUser = {}
					connectList.forEach(item => {
						// 如果对战胜利
						if (item.winner.userId == userId) {
							if (mapUser[item.loser.userId]) {
								mapUser[item.loser.userId]++
							} else {
								mapUser[item.loser.userId] = 1
							}
						}
						if (item.loser.userId == userId) {
							if (mapUser[item.winner.userId]) {
								mapUser[item.winner.userId]++
							} else {
								mapUser[item.winner.userId] = 1
							}
						}
					})
					this.userList.forEach(user => {
						if (mapUser[user._id]) {
							user.matchTime = mapUser[user._id]
						}
					})
				}
				else{
					this.userList.forEach(user=>{
						user.matchTime = 0
					})
				}
			},
			handleBoard() {
				uni.navigateTo({
					url: `/pages/match/board?matchId=${this.matchId}&matchName=${this.matchName}`
				})
			},
			handleSection() {
				uni.navigateTo({
					url: `/pages/section/section?matchId=${this.matchId}&matchName=${this.matchName}`
				})
			}
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

		.title {
			text-align: center;
			margin: 10px 0;
		}
	}

	.image {
		width: 60px;
		height: 60px;
		border-radius: 4px;
	}

	.text {
		font-size: 14px;
		margin-top: 5px;
	}

	.example-body {
		/* #ifndef APP-NVUE */
		// display: block;
		/* #endif */
	}

	.grid-dynamic-box {
		margin-bottom: 15px;
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
	.limit{
		opacity: 0.1;
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
</style>
