<template>
	<view class="divContainer">
		<view class="filter" @click="handleFilter">
			<text>筛选</text>
			<view class="filter-name">
				<text class="filter-name-text">{{currentUser.nickname}}</text>
			</view>
		</view>
		<uni-calendar :selected="signRecordList" :showMonth="false" @change="handleChange"></uni-calendar>
		<uni-card v-if="currentInfo.createTime" :extra="currentInfo.userName"
			:title="dateFormat(currentInfo.createTime,true)">
			<view>经度：{{currentInfo.latitude}}</view>
			<view>纬度：{{currentInfo.longitude}}</view>
			<view>距离：{{(currentInfo.distance*100000).toFixed(2)}}米</view>
			<view>地点：{{currentInfo.address}}</view>
		</uni-card>
<!-- 		<uni-grid :column="3" :show-border="true" :square="true" @change="change">
			<uni-grid-item v-for="(item ,index) in userList" :index="index" :key="index">
				<view class="grid-item-box">
					<image class="image"
						:src="item.avatar||item.avatar_file.url||'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg'"
						mode="aspectFill" />
					<text class="text">{{item.nickname||'傻子'}}</text>
				</view>
			</uni-grid-item>
		</uni-grid> -->
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
							<image class="avatar" lazy-load :src="user.avatar_file.url" mode="aspectFill" :draggable="false">
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
	} from 'vuex'

	export default {
		data() {
			return {
				currentInfo: {},
				currentUser: {},
				signRecordList: [],
				userList: []
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin'
			})
		},
		onLoad() {
			this.currentUser = this.$store.state.user.info
			this.getSignRecord()
			this.getUserList()
		},
		async onPullDownRefresh() {
			await this.getSignRecord()
			uni.stopPullDownRefresh()
		},
		methods: {
			handleFilter() {
				this.$refs.popup.open()
			},
			handleSearchUser(user) {
				console.log(user);
				this.currentUser = Object.assign({}, user)
				this.getSignRecord(user._id)
				uni.setNavigationBarTitle({
					title: user.nickname + '出勤日历'
				})
				this.$refs.popup.close()

			},
			async getUserList() {
				await uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'getUserList',
						params: {}
					},
					success: (res) => {
						this.userList = res.result.data
					}
				})
			},
			dateFormat(time, flag) {
				let date = new Date(time);
				let year = date.getFullYear();
				let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
				let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
				let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
				let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
				let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
				if (flag) {
					return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds
				}
				return year + "-" + month + "-" + day
			},
			async getSignRecord(userId = this.$store.state.user.info._id) {
				let that = this
				await uniCloud.callFunction({
					name: 'signRecord',
					data: {
						action: 'getSignRecordList',
						params: {
							userId,
						}
					},
					success(res) {
						that.signRecordList = res.result.data.map(el => {
							return {
								date: that.dateFormat(el.createTime),
								info: '已签到',
								data: el
							}
						})
						that.currentInfo = res.result.data.find(el => {
							return that.dateFormat(el.createTime) == that.dateFormat(new Date())
						}) || {}
					}
				})
			},
			handleChange(e) {
				if (e.extraInfo.data) {
					this.currentInfo = e.extraInfo.data
				} else {
					this.currentInfo = {}
				}

			},
			change(e) {
				let {
					index
				} = e.detail
				let userId = this.userList[index]._id
				this.getSignRecord(userId)
				uni.setNavigationBarTitle({
					title: this.userList[index].nickname + '出勤日历'
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.time-container {
		margin-top: 20px;
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

	.image {
		width: 60px;
		height: 60px;
		border-radius: 4px;
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

	.form-container {
		background: #ffffff;
		padding: 0 10px;
		height: 80vh;

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
</style>
