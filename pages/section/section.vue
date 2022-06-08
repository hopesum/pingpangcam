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
			<view class="battle-user">
				<view class="left">
					<view class="">
						<image class="avatar" :src="item.winner.avatar" mode="aspectFill" :draggable="false"></image>
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
						<image class="avatar" :src="item.loser.avatar" mode="aspectFill" :draggable="false"></image>
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
			<template v-slot:actions>
				<view v-if="(hasLogin&&uniIDHasRole('admin'))||(userInfo._id===item.createUser)" class="btn-container">
					<button class="uni-button btn" size="mini" type="warn" @click.stop="deleteSection(item)">删除</button>
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
				<scroll-view scroll-y="true" class="scroll-Y">
					<!-- <view class="form-header">
					<uni-icons type="closeempty" color="#409EFF" size="30" @click="handleClose"></uni-icons>
					<uni-icons type="checkmarkempty" color="#67C23A" size="30" @click="handleAdd"></uni-icons>
				</view> -->
					<view v-if="userList.length">
						<view class="user-dialog" v-for="(user,index) in userList" :key="index"
							@click="handleSearchUser(user)">
							<image class="avatar" :src="user.avatar" mode="aspectFill" :draggable="false"></image>
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
				matchId: '',
				currentUser: {},
				sectionList: [],
				oprateSection: {},
				formData: {},
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
			uni.stopPullDownRefresh()
		},
		methods: {
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
							that.sectionList = res.result.data
							res.result.data.forEach(el => {
								let templistUserIds = that.userList.map(el => el.userId)
								if (templistUserIds.indexOf(el.winner.userId || el.loser.userId) === -1) {
									that.userList.push(el.winner || el.loser)
								}
							})
						}
					})
				} else {
					uniCloud.callFunction({
						name: 'section',
						data: {
							action: 'getAllSectionList'
						},
						success(res) {
							that.sectionList = res.result.data
							res.result.data.forEach(el => {
								let templistUserIds = that.userList.map(el => el.userId)
								if (templistUserIds.indexOf(el.winner.userId || el.loser.userId) === -1) {
									that.userList.push(el.winner || el.loser)
								}
							})
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
							that.sectionList = res.result.data
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
							that.sectionList = res.result.data
						}
					})
				}
			},
			handleBoard(){
				uni.navigateTo({
					url:'/pages/match/board'
				})
			}
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
	.board-btn{
		position: fixed;
		bottom: 60px;
		right: 30px;
		z-index: 1;
		width: 52px;
		height: 52px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 14px;
		background: #007aff;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		color: #ffffff;
		font-weight: 600;
	}
</style>
