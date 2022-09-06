<template>
	<view class="divContainer">
		<uni-card class="time-container" v-for="(item,index) in signRecordList" :extra="item.userName" :key="index"
			:title="dateFormat(item.createTime)">
			<view>经度：{{item.latitude}}</view>
			<view>纬度：{{item.longitude}}</view>
			<view>距离：{{(item.distance*100000).toFixed(2)}}米</view>
			<view>地点：{{item.address}}</view>
		</uni-card>
		<!-- <uni-fab  ref="fab" horizontal="right" vertical="bottom" @fabClick="fabClick" /> -->
		<view class="board-btn" @click="fabClick">出勤日历</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'

	export default {
		data() {
			return {
				signRecordList: []
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin'
			})
		},
		onLoad() {
			this.getSignRecord()
		},
		async onPullDownRefresh() {
			await this.getSignRecord()
			uni.stopPullDownRefresh()
		},
		methods: {
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
			async getSignRecord() {
				let that = this
				// await uniCloud.callFunction({
				// 	name: 'signRecord',
				// 	data: {
				// 		action: 'getSignRecordList',
				// 		params: {
				// 			userId: this.$store.state.user.info._id,
				// 		}
				// 	},
				// 	success(res) {
				// 		that.signRecordList = res.result.data
				// 	}
				// })
				await uniCloud.callFunction({
					name: 'signRecord',
					data: {
						action: 'getSignRecordListAdmin',
						params: {}
					},
					success(res) {
						that.signRecordList = res.result.data
					}
				})
			},
			fabClick() {
				// let that = this
				// uniCloud.callFunction({
				// 	name: 'signRecord',
				// 	data: {
				// 		action: 'getSignRecordListAdmin',
				// 		params: {}
				// 	},
				// 	success(res) {
				// 		that.signRecordList = res.result.data
				// 	}
				// })
				uni.navigateTo({
					url:'/pages/sign/calendar'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.time-container {
		margin-top: 20px;
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
		// font-weight: 600;
	}
</style>
