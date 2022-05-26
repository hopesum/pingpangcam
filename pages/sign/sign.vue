<template>
	<view class="divContainer">
		<view :class="['tip-btn',isCanSign?'can-sign':'cant-sign']" @click="handleSign">
			<text>{{dateFormat(time)}}</text>
			<text>{{isCanSign?'打卡':'无法打卡'}}</text>
		</view>
		<view v-if="!isCanSign" class="err-content">
			latitude: {{latitude}},
			longitude: {{longitude}},
			address: {{address}},
			currentLatitude: {{currentLatitude}},
			currentLongitude: {{currentLongitude}},
			currentAddress: {{currentAddress}},
		</view>
		<view class="divFooter">
			<button class="uni-button cus-btn " type="primary" @click="handleSignRecord">打卡记录</button>
			<button v-if="isAdmin" class="uni-button cus-btn" plain type="primary" @click="handleRule">规则设置</button>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'

	export default {
		data() {
			return {
				lastSign: null,
				timer: null,
				time: new Date(),
				ruleId: '',
				latitude: '',
				longitude: '',
				address: '',
				currentLatitude: '',
				currentLongitude: '',
				currentAddress: '',
			}
		},
		computed: {
			...mapState({
				role: state => state.user.info.role || []
			}),
			isAdmin() {
				if (this.role.indexOf('admin') !== -1) {
					return true
				}
				return false
			},
			isCanSign() {
				let x = this.latitude - this.currentLatitude
				let y = this.longitude - this.currentLongitude
				let d = Math.sqrt((Math.pow(x, 2) + Math.pow(y, 2)))
				console.log(d, '******');
				// 0.001  100m
				if (d <= 0.02) {
					return true
				}
				return false
			}
		},
		mounted() {
			let _this = this;
			this.timer = setInterval(function() {
				_this.time = new Date()
			}, 1000);
		},
		beforeDestroy() {
			if (this.timer) {
				clearInterval(this.timer)
				this.timer = null
			}
		},
		onLoad() {
			this.getRules()
			this.getLocation()
			this.getSignRecord()
		},
		async onPullDownRefresh() {
			await this.getLocation()
			await this.getRules()
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
				if (flag) {
					return year + "-" + month + "-" + day
				}
				return hours + ":" + minutes + ":" + seconds;
			},
			handleRule() {
				this.chooseLocation()
			},
			chooseLocation() {
				let that = this
				uni.chooseLocation({
					success: function(res) {
						console.log('位置名称：' + res.name);
						console.log('详细地址：' + res.address);
						console.log('纬度：' + res.latitude);
						console.log('经度：' + res.longitude);
						that.latitude = res.latitude
						that.longitude = res.longitude
						that.address = res.address
						that.addRule()
					}
				});
			},
			async getLocation() {
				let that = this
				uni.getLocation({
					type: 'wgs84',
					geocode: true, //设置该参数为true可直接获取经纬度及城市信息
					success: function(res) {
						that.currentLatitude = res.latitude
						that.currentLongitude = res.longitude
						console.log('that.currentLatitude  x', that.currentLatitude);
						console.log('that.currentLongitude  y', that.currentLongitude);
					},
					fail: function() {
						uni.showToast({
							title: '获取地址失败，将导致部分功能不可用',
							icon: 'none'
						});
					}
				});
			},
			async getRules() {
				let that = this
				await uniCloud.callFunction({
					name: 'sign',
					data: {
						action: 'getSignList'
					},
					success(res) {
						that.ruleId = res.result?.data[0]?._id
						that.latitude = res.result?.data[0]?.latitude
						that.longitude = res.result?.data[0]?.longitude
						that.address = res.result?.data[0]?.address
						console.log(that.latitude, 'x');
						console.log(that.longitude, 'y');
						console.log(that.address);
					}
				})
			},
			addRule() {
				let that = this
				if (this.ruleId) {
					uniCloud.callFunction({
						name: 'sign',
						data: {
							action: 'updateSign',
							params: {
								_id: that.ruleId,
								latitude: that.latitude,
								longitude: that.longitude,
								address: that.address
							}
						},
						success() {
							uni.showToast({
								icon: 'none',
								title: '保存成功'
							})
						}
					})
				} else {
					uniCloud.callFunction({
						name: 'sign',
						data: {
							action: 'addSign',
							params: {
								latitude: that.latitude,
								longitude: that.longitude,
								address: that.address,
							}
						},
						success() {
							uni.showToast({
								icon: 'none',
								title: '保存成功'
							})
						}
					})
				}
			},
			handleSign() {
				let that = this
				if (!this.isCanSign) {
					uni.showToast({
						icon: 'none',
						title: '无法打卡'
					})
					return
				}
				// 当天打卡可以无限次数更新
				let oprate = 'add'
				let currentDay = this.dateFormat(new Date(), true)
				if (this.lastSign) {
					let newCreateTime = this.dateFormat(this.lastSign.createTime, true)
					if (newCreateTime === currentDay) {
						oprate = 'update'
					}
				}
				if (oprate === 'add') {
					uniCloud.callFunction({
						name: 'signRecord',
						data: {
							action: 'addSignRecord',
							params: {
								userId: this.$store.state.user.info._id,
								userName: this.$store.state.user.info.nickname,
								createTime: new Date(),
								latitude: this.currentLatitude,
								longitude: this.currentLongitude
							}
						},
						success() {
							uni.showToast({
								icon: 'none',
								title: '打卡成功'
							})
							that.getSignRecord()
						}
					})
				} else {
					uniCloud.callFunction({
						name: 'signRecord',
						data: {
							action: 'updateSignRecord',
							params: {
								_id: that.lastSign._id,
								userId: this.$store.state.user.info._id,
								userName: this.$store.state.user.info.nickname,
								createTime: new Date(),
								latitude: this.currentLatitude,
								longitude: this.currentLongitude
							}
						},
						success() {
							uni.showToast({
								icon: 'none',
								title: '打卡成功'
							})
							that.getSignRecord()
						}
					})
				}
			},
			async getSignRecord() {
				let that = this
				await uniCloud.callFunction({
					name: 'signRecord',
					data: {
						action: 'getSignRecordList',
						params: {
							userId: this.$store.state.user.info._id,
						}
					},
					success(res) {
						that.lastSign = res.result?.data[0] || {}
					}
				})
			},
			handleSignRecord() {
				uni.navigateTo({
					url: '/pages/sign/record'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		position: relative;
		padding-bottom: 2px;
		display: flex;
		justify-content: center;

		.tip-btn {
			margin-top: 100px;
			width: 150px;
			height: 150px;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			flex-direction: column;
			align-items: center;
			font-size: 20px;
			box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
		}

		.can-sign {
			background: radial-gradient(#41C7AF, #54E38E);
			color: #ffffff;
		}

		.cant-sign {
			background: radial-gradient(#FDEB82, #E6A23C);
			color: #eeeeee;
		}
	}

	.divFooter {
		box-sizing: border-box;
		position: fixed;
		bottom: 0;
		width: 100%;
		padding: 10px;
		display: flex;

		.cus-btn {
			flex: 1;
			margin: 4px;
		}
	}
	.err-content{
		position: fixed;
		top: 0;
		font-size: 12px;
		color: #E6A23C;
	}
</style>
