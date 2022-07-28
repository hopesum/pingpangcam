<template>
	<view class="divContainer">
		
		<uni-calendar :selected="signRecordList" :showMonth="false" @change="handleChange"></uni-calendar>
		<uni-card v-if="currentInfo.createTime" :extra="currentInfo.userName"
			:title="dateFormat(currentInfo.createTime,true)">
			<view>经度：{{currentInfo.latitude}}</view>
			<view>纬度：{{currentInfo.longitude}}</view>
			<view>距离：{{currentInfo.distance}}</view>
			<view>地点：{{currentInfo.address}}</view>
		</uni-card>
		<uni-grid :column="3" :show-border="true" :square="true" @change="change">
			<uni-grid-item v-for="(item ,index) in userList" :index="index" :key="index">
				<view class="grid-item-box">
					<image class="image"
						:src="item.avatar||item.avatar_file.url||'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg'"
						mode="aspectFill" />
					<text class="text">{{item.nickname||'傻子'}}</text>
				</view>
			</uni-grid-item>
		</uni-grid>
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
				signRecordList: [],
				userList:[]
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin'
			})
		},
		onLoad() {
			this.getSignRecord()
			this.getUserList()
		},
		async onPullDownRefresh() {
			await this.getSignRecord()
			uni.stopPullDownRefresh()
		},
		methods: {
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
			async getSignRecord(userId=this.$store.state.user.info._id) {
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
						})||{}
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
					title:this.userList[index].nickname + '出勤日历'
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
</style>
