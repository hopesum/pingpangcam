<template>
	<view class="divContainer">
		<view :class="['tip-btn',isCanSign?'can-sign':'cant-sign']" @click="handleSign">
			<text>{{dateFormat(time,true)}}</text>
			<text>{{dateFormat(time)}}</text>
			<text>{{isCanSign?'打卡':'无法打卡'}}</text>
		</view>
		<view class="ad">
			{{currentAddress}}
		</view>
		<!-- <view v-if="!isCanSign" class="err-content">
			latitude: {{latitude}},
			longitude: {{longitude}},
			address: {{address}},
			currentLatitude: {{currentLatitude}},
			currentLongitude: {{currentLongitude}},
			currentAddress: {{currentAddress}},
		</view> -->
		<view class="divFooter">
			<view class="distance">{{(distance*100000).toFixed(2)}}米</view>
			<button class="uni-button cus-btn " type="warn" plain @click="handleSignCalendar">出勤日历</button>
			<button class="uni-button cus-btn " type="primary" @click="handleSignRecord">所有记录</button>
			<button class="uni-button cus-btn " type="warn" @click="handleSendAddress">位置通知</button>
			<button v-if="hasLogin&&uniIDHasRole('admin')" class="uni-button cus-btn" plain type="primary"
				@click="handleRule">规则设置</button>
		</view>
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirm">
				<view class="popup-win">
					<!-- <view class="tips">加入钉钉：44663557获取通知</view> -->
					<view class="tips">加入企业微信获取通知</view>
					<view class="winner-container">
						<image class="image" src="/static/images/qywx.png" mode="aspectFill" />
					</view>
					<uni-easyinput v-model="customMsg" placeholder="" />
					<view class="desc">
						更新打卡成功，是否通知各位？
					</view>
				</view>
			</uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="redialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirmDistance">
				<uni-easyinput type="number" v-model="distanceRule" placeholder="" />
			</uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="medialog" type="dialog">
			<uni-popup-dialog :duration="2000">
				<view>发送成功</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	var amapFile = require('./libs/amap-wx.js')
	export default {
		data() {
			return {
				baseSuperIntegral: 10,
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
				distance: 0,
				customMsg: '我打卡了，赶紧来',
				distanceRule: 0
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin',
				userInfo: 'user/info'
			}),
			isCanSign() {
				let x = this.latitude - this.currentLatitude
				let y = this.longitude - this.currentLongitude
				let d = Math.sqrt((Math.pow(x, 2) + Math.pow(y, 2)))
				this.distance = d
				// 0.001  100m
				if (d <= this.distanceRule && d > 0 && this.hasLogin) {
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
			uni.showToast({
				icon: 'loading',
				title: '',
				duration: 4000,
				mask: true
			})
			this.getRules()
			this.getLocation()
			this.getSignRecord()
		},
		async onPullDownRefresh() {
			uni.showToast({
				icon: 'loading',
				title: '',
				duration: 4000,
				mask: true
			})
			await this.getLocation()
			await this.getRules()
			await this.getSignRecord()
			uni.stopPullDownRefresh()
		},
		onShareAppMessage(res) {
			let pages = getCurrentPages()
			let fullPath = pages[pages.length - 1].$page.fullPath
			return {
				title: '打卡考勤',
				path: fullPath
			}
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
						that.latitude = res.latitude
						that.longitude = res.longitude
						that.address = res.address
						that.$refs.redialog.open()
					}
				});
			},
			confirmDistance() {
				this.addRule()
			},
			async getLocation() {
				var that = this;
				var myAmapFun = new amapFile.AMapWX({
					key: '2cb5a0de8824b9bae96b4f25889fe053'
				});
				uni.showLoading()
				myAmapFun.getRegeo({
					success: function(data) {
						let res = data[0]
						that.currentLatitude = res.latitude
						that.currentLongitude = res.longitude
						that.currentAddress = res.regeocodeData.formatted_address
						uni.hideLoading()
						//成功回调
					},
					fail: function(info) {
						uni.hideLoading()
						//失败回调
						console.log(info)
					}
				})
			},
			async getRules() {
				let that = this
				uni.showLoading()
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
						that.distanceRule = res.result?.data[0]?.distanceRule || 0
						uni.hideLoading()
					},
					fail() {
						uni.hideLoading()
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
								address: that.address,
								distanceRule: that.distanceRule
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
								distanceRule: that.distanceRule
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
				let data = {
					"touser": "@all",
					"msgtype": "text",
					"agentid": 1000003,
					"text": {
						"content": `打卡规则变动 \n\n打卡位置：${this.address}\n打卡距离：${this.distanceRule}`
					},
				}
				this.sendQYWX(data)
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
				uni.showToast({
					icon: 'loading',
					title: '',
					duration: 4000,
					mask: true
				})
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
					uni.showLoading()
					uniCloud.callFunction({
						name: 'signRecord',
						data: {
							action: 'addSignRecord',
							params: {
								userId: this.userInfo._id,
								avatar:this.userInfo.avatar_file.url||'https://w.wallhaven.cc/full/v9/wallhaven-v9w635.jpg',
								userName: this.userInfo.nickname,
								createTime: new Date(),
								address: this.currentAddress,
								latitude: this.currentLatitude,
								longitude: this.currentLongitude,
								distance: this.distance
							}
						},
						success() {
							uni.hideLoading()
							// uni.showToast({
							// 	icon: 'none',
							// 	title: '打卡成功'
							// })
							// 第一次打卡进入抽奖页
							uni.navigateTo({
								url: '/pages/sign/reward'
							})
							that.getSignRecord()
							that.confirm(false)
							// that.$refs.dialog.open()
						},
						fail() {
							uni.hideLoading()
						}
					})
				} else {
					uni.showLoading()
					uniCloud.callFunction({
						name: 'signRecord',
						data: {
							action: 'updateSignRecord',
							params: {
								_id: that.lastSign._id,
								userId: this.userInfo._id,
								avatar:this.userInfo.avatar_file.url||'https://w.wallhaven.cc/full/v9/wallhaven-v9w635.jpg',
								userName: this.userInfo.nickname,
								createTime: new Date(),
								latitude: this.currentLatitude,
								longitude: this.currentLongitude,
								distance: this.distance,
								address: this.currentAddress
							}
						},
						success() {
							// uni.showToast({
							// 	icon: 'none',
							// 	title: '打卡成功'
							// })
							uni.hideLoading()
							that.getSignRecord()
							that.$refs.dialog.open()
						},
						fail() {
							uni.hideLoading()
						}
					})
				}

			},
			handleSendAddress() {
				// uni.navigateTo({
				// 	url:'/pages/sign/reward'
				// })
				// return
				let data = {
					"touser": "@all",
					"msgtype": "news",
					"agentid": 1000003,
					"news": {
						"articles": [{
							"title": `${this.userInfo.nickname}位置通知`,
							"description": `当前时间\n${this.dateFormat(new Date(), true)} ${this.dateFormat(new Date())}\n我目前的位置是\n${this.currentAddress}\n距离打卡位置：${(this.distance*100000).toFixed(2)}米`,
							"picurl": `${this.userInfo.avatar_file.url}`
						}]
					},
				}
				this.sendQYWX(data)
			},
			confirm(flag = true) {
				let params = {
					"msgtype": "markdown",
					"markdown": {
						"title": "打卡提醒",
						"text": `#### ${this.userInfo.nickname}打卡提醒 \n > 时间：${this.dateFormat(new Date(), true)}\n >经度：${this.currentLongitude}\n >纬度：${this.currentLatitude}\n >距离：${(this.distance*100000).toFixed(2)}米\n > ![screenshot](${this.userInfo.avatar_file.url})\n > ### ${this.customMsg} \n`,
						"content": `#### ${this.userInfo.nickname}打卡提醒 \n > 时间：${this.dateFormat(new Date(), true)}\n >经度：${this.currentLongitude}\n >纬度：${this.currentLatitude}\n >距离：${(this.distance*100000).toFixed(2)}米\n > ![screenshot](${this.userInfo.avatar_file.url})\n > ### ${this.customMsg} \n`
					},
					"at": {
						"isAtAll": true
					}
				}
				// this.sendDDmsg(params)
				let data = {
					"touser": "@all",
					"msgtype": "news",
					"agentid": 1000003,
					"news": {
						"articles": [{
							"title": `${this.userInfo.nickname}打卡提醒`,
							"description": `时间：${this.dateFormat(new Date(), true)} ${this.dateFormat(new Date())} \n经度：${this.currentLongitude} \n纬度：${this.currentLatitude} \n距离：${(this.distance*100000).toFixed(2)}米\n位置：${this.currentAddress} \n${this.customMsg}`,
							"picurl": `${this.userInfo.avatar_file.url}`
						}]
					},
				}
				this.sendQYWX(data, flag)
			},
			sendQYWX(params, flag) {
				let that = this
				uniCloud.callFunction({
					name: 'xcxcontact',
					data: {
						action: 'sendQYWX',
						params: params
					},
					success() {
						if (flag) {
							that.$refs.dialog.close()
							that.$refs.medialog.open()
						}
					}
				})
			},
			sendDDmsg(params) {
				let that = this
				uniCloud.callFunction({
					name: 'xcxcontact',
					data: {
						action: 'sendDDMsg',
						params: params
					},
					success() {
						that.$refs.dialog.close()
					}
				})
				// uniCloud.callFunction({
				// 	name: 'xcxcontact',
				// 	data: {
				// 		action: 'sendQYWXMsg',
				// 		params: params
				// 	},
				// 	success() {
				// 		that.$refs.dialog.close()
				// 	}
				// })
			},
			async getSignRecord() {
				let that = this
				uni.showLoading()
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
						uni.hideLoading()
					},
					fail() {
						uni.hideLoading()
					}
				})
			},
			handleSignRecord() {
				uni.navigateTo({
					url: '/pages/sign/record'
				})
			},
			handleSignCalendar() {
				uni.navigateTo({
					url: '/pages/sign/calendar'
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		position: relative;
		padding-bottom: 2px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

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
			font-size: 16px;
			line-height: 24px;
		}

		.cant-sign {
			background: radial-gradient(#cebf6a, #f1aa3e);
			color: #ffffff;
			font-size: 12px;
			line-height: 24px;
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
			font-size: 12px;
			flex: 1;
			margin: 4px;
		}
	}

	.err-content {
		position: fixed;
		top: 0;
		font-size: 12px;
		color: #E6A23C;
	}

	.distance {
		position: absolute;
		top: -20px;
		width: 100%;
		text-align: center;
		font-size: 12px;
		color: #e64340;
	}

	.winner-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		border: 1px solid gold;
		color: goldenrod;
		width: 100px;
		height: 100px;
		margin: 8px 0;

		.image {
			width: 100px;
			height: 100px;
		}
	}

	.popup-win {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.desc {
		margin-top: 8px;
		text-align: center;
	}

	.tips {
		font-size: 12px
	}

	.ad {
		font-size: 12px;
		color: #cccccc;
		text-align: center;
		margin-top: 10px;
	}
</style>
