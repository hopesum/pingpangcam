<template>
	<view class="divContainer">
		<view class="filter" @click="handleFilter">
			<text>筛选</text>
			<view v-if="currentUser.nickname" class="filter-name" @click.stop="handleDeleteFilter">
				<text class="filter-name-text">{{currentUser.nickname}}({{sectionList.length+'场'}})</text>
				<uni-icons type="closeempty" size="12" color="#F56C6C"></uni-icons>
			</view>
		</view>
		<view v-if="!matchId" class="board-btn" @click="handleBoard">排行榜</view>
		<uni-card v-for="(item,index) in sectionList" :extra="item.createUserName" :key="index"
			:title="dateFormat(item.createTime)">
			<view v-if="item.type&&item.type==='SIGN'" class="battle-user">
				<view class="left sign">
					<view class="sign-text">
						奖
					</view>
					<view class="left">
						<image class="avatar reward-avatar" lazy-load :src="item.winner.avatar" mode="aspectFill"
							:draggable="false"></image>
						<view>打卡奖励</view>
					</view>
					<view class="right">
						<view class="name">
							{{item.winner.nickname+(item.winner.realname?item.winner.realname:'')}}
						</view>
						<view class="integral">
							奖励积分：{{item.winner.integral}}
						</view>
					</view>
				</view>
			</view>
			<view v-else-if="item.type&&item.type==='EXCHANGE'" class="battle-user">
				<view class="left sign exchange">
					<view class="sign-text">
						兑
					</view>
					<view class="exchange-watermark">
						<text v-if="item.status==1">审核中</text>
						<text v-else-if="item.status==2">已通过</text>
						<text v-else>未知状态</text>
					</view>
					<view class="left">
						<image class="avatar reward-avatar" lazy-load :src="item.winner.avatar" mode="aspectFill"
							:draggable="false"></image>
						<view>兑换奖励</view>
					</view>
					<view class="right exchange-right">
						<view class="name">
							{{item.winner.nickname+(item.winner.realname?item.winner.realname:'')}}
						</view>
						<view class="integral">
							扣除积分：{{item.winner.integral}}
						</view>
						<view class="integral">
							兑换商品：{{item.winner.good.title}}
						</view>
					</view>
				</view>
			</view>
			<view v-else class="battle-user">
				<view class="left">
					<view class="">
						<image class="avatar" lazy-load :src="item.winner.avatar" mode="aspectFill" :draggable="false">
						</image>
					</view>
					<view class="name">
						{{item.winner.nickname+(item.winner.realname?item.winner.realname:'')}}
					</view>
					<view class="section">
						胜局：{{item.winner.win}}
					</view>
					<view class="integral">
						积分：{{item.winner.integral}}
					</view>
				</view>
				<view class="middle">
					<text class="win">V</text>
					<text class="fail">S</text>
				</view>
				<view class="right">
					<view class="">
						<image class="avatar" lazy-load :src="item.loser.avatar" mode="aspectFill" :draggable="false">
						</image>
					</view>
					<view class="name">
						{{item.loser.nickname+(item.loser.realname?item.loser.realname:'')}}
					</view>
					<view class="section">
						胜局：{{item.loser.win}}
					</view>
					<view class="integral">
						积分：{{item.loser.integral}}
					</view>
				</view>
			</view>
			<view v-if="showVideo">
				<uni-grid :column="3" :show-border="true" :square="true">
					<uni-grid-item v-for="(video ,index1) in item.videoList" :index="index1" :key="index1">
						<view v-if="video" class="grid-item-box">
							<!-- <video :src="video"></video> -->
							<div @click="handleVideo(video)">视频{{index1+1}}</div>
						</view>
					</uni-grid-item>
				</uni-grid>
			</view>
			<template v-slot:actions>
				<view class="btn-container">
					<button v-if="showVideo" size="mini" class="uni-button btn" type="primary"
						@click="uploadVideo(item)">上传视频</button>
					<button v-if="item.status==='1'&&(hasLogin&&uniIDHasRole('admin'))" size="mini" class="uni-button btn" type="primary"
						@click="approve(item)">审核</button>
					<button
						v-if="((hasLogin&&uniIDHasRole('admin'))||(userInfo._id===item.createUser))&&(item.status!='2')"
						class="uni-button btn" size="mini" type="warn" @click.stop="deleteSection(item)">删除</button>
				</view>
			</template>
		</uni-card>
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirm">
				<view class="desc">
					删除后数据将无法恢复，请谨慎操作！
				</view>
			</uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popup" type="bottom" background-color="#fff">
			<view class="form-container">
				<!-- <view class="form-header">
					<uni-icons type="closeempty" color="#409EFF" size="30" @click="handleClose"></uni-icons>
					<uni-icons type="checkmarkempty" color="#67C23A" size="30" @click="handleAdd"></uni-icons>
				</view> -->
				<scroll-view scroll-y="true" class="scroll-Y">
					<view v-if="userList.length">
						<view class="user-dialog" v-for="(user,index) in userList" :key="index"
							@click="handleSearchUser(user)">
							<image class="avatar" lazy-load :src="user.avatar" mode="aspectFill" :draggable="false">
							</image>
							<text>{{user.nickname}}</text>
						</view>
					</view>
				</scroll-view>
			</view>
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
				showVideo: false,
				matchId: '',
				currentUser: {},
				sectionList: [],
				oprateSection: {},
				formData: {},
				videoList: [],
				userList: []
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin',
				userInfo: 'user/info'
			})
			// userList() {
			// 	let templist = []
			// 	this.sectionList.forEach(el => {
			// 		let templistUserIds = templist.map(el => el.userId)
			// 		if (templistUserIds.indexOf(el.winner.userId || el.loser.userId) === -1) {
			// 			templist.push(el.winner || el.loser)
			// 		}
			// 	})
			// 	return templist
			// }
		},
		onLoad(params) {
			this.getSettings()
			this.matchId = params.matchId || ''
			this.matchName = params.matchName || ''
			if (this.matchName) {
				uni.setNavigationBarTitle({
					title: this.matchName + '对战记录'
				})
			}
			this.initialize()
		},
		async onPullDownRefresh() {
			if (this.currentUser?.nickname) {
				await this.getList()
			} else {
				await this.initialize()
			}
			this.getSettings()
			uni.stopPullDownRefresh()
		},
		methods: {
			async getSettings() {
				let fn = uniCloud.importObject('settings')
				this.showVideo = await fn.getSettings()
			},
			handleVideo(video) {
				uni.navigateTo({
					url: '/pages/section/play?video=' + video
				})
			},
			uploadVideo(section) {
				let self = this
				uni.chooseVideo({
					// sourceType: ['camera', 'album'],
					success: async (res) => {
						let filePath = res.tempFilePath
						let cloudPath = 'video' + Date.now()
						uni.showLoading({
							title: '上传中',
							mask: true
						});
						let video = await uniCloud.uploadFile({
							filePath,
							cloudPath,
							fileType: "video"
						});
						uni.hideLoading()
						console.log(video);
						if (!section.videoList) {
							section.videoList = []
						}
						section.videoList.push(video.fileID)
						uniCloud.callFunction({
							name: 'section',
							data: {
								action: 'updateSection',
								params: section
							},
							success(ress) {
								console.log(ress);
								uni.showToast({
									icon: "none",
									title: '视频保存成功'
								})
							}
						})
					}
				});
			},
			approve(section) {
				let that = this
				section.status = 2
				uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'updateSection',
						params: section
					},
					success(ress) {
						uni.showToast({
							icon: "none",
							title: '审核成功'
						})
						that.initialize()
						let data = {
							"touser": "@all",
							"msgtype": "news",
							"agentid": 1000003,
							"news": {
								"articles": [{
									"title": `${section.winner.nickname}兑换审核通知`,
									"description": `当前时间\n${that.dateFormat(new Date())} \n${section.winner.nickname} !!!!!!!! \n消耗 ${section.winner.integral} 积分，申请兑换${section.winner.good.title}\n管理员审批通过，请联系管理员领取兑换奖品`,
									"picurl": `${section.winner.good.url}`
								}]
							},
						}
						that.sendQYWX(data)
					}
				})
			},
			handleClose() {
				this.$refs.popup.close()
			},
			handleAdd() {

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
				return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
			},
			editSection(item) {
				this.formData = Object.assign({}, item)
				console.log(this.formData)
				this.$refs.popup.open()
			},
			async deleteSection(item) {
				this.oprateSection = Object.assign({}, item)
				this.$refs.dialog.open()
			},
			async confirm() {
				let that = this
				await uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'deleteSection',
						params: that.oprateSection
					},
					success() {
						that.initialize()
					}
				})
			},
			initialize() {
				let that = this
				uni.showLoading()
				if (this.matchId) {
					uniCloud.callFunction({
						name: 'section',
						data: {
							action: 'getSectionList',
							params: {
								matchId: this.matchId
							}
						},
						success(res) {
							uni.hideLoading()
							that.sectionList = res.result.data
							res.result.data.forEach(el => {
								let templistUserIds = that.userList.map(el => el.userId)
								if (templistUserIds.indexOf(el.winner.userId || el.loser.userId) === -1) {
									that.userList.push(el.winner || el.loser)
								}
							})
						},
						fail() {
							uni.hideLoading()
						}
					})
				} else {
					uniCloud.callFunction({
						name: 'section',
						data: {
							action: 'getAllSectionList'
						},
						success(res) {
							uni.hideLoading()
							that.sectionList = res.result.data
							res.result.data.forEach(el => {
								let templistUserIds = that.userList.map(el => el.userId)
								if (templistUserIds.indexOf(el.winner.userId || el.loser.userId) === -1) {
									that.userList.push(el.winner || el.loser)
								}
							})
						},
						fail() {
							uni.hideLoading()
						}
					})
				}
			},
			handleFilter() {
				this.$refs.popup.open()
			},
			handleSearchUser(user) {
				this.currentUser = user
				this.$refs.popup.close()
				this.getList()

			},
			handleDeleteFilter() {
				this.currentUser = {}
				this.initialize()
			},
			getList() {
				let that = this
				uni.showLoading()
				if (this.matchId) {
					uniCloud.callFunction({
						name: 'section',
						data: {
							action: 'getUserSectionList',
							params: {
								matchId: this.matchId,
								userId: this.currentUser.userId
							}
						},
						success(res) {
							uni.hideLoading()
							that.sectionList = res.result.data
						},
						fail() {
							uni.hideLoading()
						}
					})
				} else {
					uniCloud.callFunction({
						name: 'section',
						data: {
							action: 'getUserAllSectionList',
							params: {
								userId: this.currentUser.userId
							}
						},
						success(res) {
							uni.hideLoading()
							that.sectionList = res.result.data
						},
						fail() {
							uni.hideLoading()
						}
					})
				}
			},
			handleBoard() {
				uni.navigateTo({
					url: '/pages/match/board'
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
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		.battle-user {
			display: flex;

			.avatar {
				width: 50px;
				height: 50px;
				border-radius: 4px;
			}

			.left {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}

			.sign {
				flex-direction: row;
				padding: 20px 0;
				border: 1px dotted #F56C6C;
				background: rgba(#F56C6C, 0.1);
				position: relative;

				.sign-text {
					position: absolute;
					color: red;
					top: 0;
					right: 8px;
					font-size: 12px;
				}
				.exchange-watermark{
					position: absolute;
					color: #F56C6C;
					top: 8px;
					left: 8px;
					font-size: 12px;
					transform: rotate(-30deg);
				}

				.left {
					flex: 1;
				}

				.right {
					flex: 1;
				}
			}

			.middle {
				display: flex;
				// flex-direction: column;
				justify-content: center;
				align-items: center;

				.win {
					color: #F56C6C;
				}

				.fail {
					color: #409EFF;
				}
			}

			.right {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}
		}
	}

	.btn-container {
		text-align: right;

		.btn {
			margin-left: 4px;
		}
	}

	.form-container {
		background: #ffffff;
		padding: 0 10px;
		height: 80vh;

		.scroll-Y {
			// height: calc(100% - 80px);
			height: 100%;
		}

		.form-header {
			display: flex;
			justify-content: space-between;
			background: #ffffff;
			padding: 10px;
			position: sticky;
			top: 0;
		}

		.winner-container {
			border: 1px solid #F56C6C;
			background-color: rgba(#F56C6C, 0.1);
			padding: 10px;
			margin: 10px;
			border-radius: 4px;
		}

		.loser-container {
			border: 1px solid #409EFF;
			background-color: rgba(#409EFF, 0.1);
			padding: 10px;
			margin: 10px;
			border-radius: 4px;
		}
	}

	.desc {
		font-size: 12px;
	}

	.filter {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px;
		margin: 0 10px;
		background: #f5f5f5;
		color: #999999;
		font-size: 12px;
		position: sticky;
		top: 0;
		z-index: 1;

		.filter-name {
			display: flex;
			justify-content: center;
			align-items: center;
			color: #F56C6C;
			border: 1px solid #409EFF;
			padding: 2px 4px;
			border-radius: 4px;
			background: #ffffff;

			.filter-name-text {
				margin-right: 4px;
			}
		}
	}

	.user-dialog {
		border: 1px solid #409EFF;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		margin: 8px 0;

		&:nth-of-type(2n) {
			border: 1px solid #F56C6C;
		}

		.avatar {
			width: 50px;
			height: 50px;
			border-radius: 4px;
		}
	}

	.board-btn {
		position: fixed;
		bottom: 90px;
		right: 16px;
		z-index: 1;
		width: 52px;
		height: 52px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 12px;
		background: #57b65a;
		box-shadow: 2px 2px 10px rgba(#387539, 1);
		border-radius: 50%;
		color: #ffffff;
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
		position: relative;

		.icon-delete {
			position: absolute;
			top: 5px;
			right: 5px;
		}
	}

	video {
		object-fit: contain;
		width: 100%;
		height: 100%;
	}

	.mt-10 {
		margin-top: 10px;
	}

	.reward-avatar {
		padding: 4px;
		width: 100%;
		height: 100%;
		// border: 2px solid #ffd700;
		box-sizing: border-box;
		// box-shadow: 2px 2px 6px #666;
		border-radius: 4px;
		position: relative;
		z-index: 2;

		// animation: bannerImageScale 4s infinite;
		&::after {
			content: '';
			position: absolute;
			left: 50%;
			top: 50%;
			width: 100%;
			height: 100%;
			background: linear-gradient(180deg, #409EFF, #F56C6C);
			animation: move 3s linear infinite;
			transform-origin: 0 0;
			z-index: -2;
		}

		&::before {
			content: '';
			width: calc(100% - 4px);
			height: calc(100% - 4px);
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			background-color: #fff;
			z-index: -1;
		}

	}

	.exchange {
		background-color: rgba(#409EFF, 0.1) !important;
	}

	.exchange-right {
		font-size: 12px;
	}

	@keyframes move {
		from {
			transform: rotateZ(360deg);
		}

		to {
			transform: rotateZ(0deg);
		}
	}
</style>
