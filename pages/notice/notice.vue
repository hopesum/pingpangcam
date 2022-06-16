<template>
	<view class="divContainer">
		<uni-card v-for="(notice,index) in noticeList" :key="index" :title="dateFormat(notice.createTime)" note="Tips">
			<text class="text">{{notice.content}}</text>
			<template v-slot:actions>
				<uni-row>
					<uni-col :span="24">
						<view v-if="hasLogin&&uniIDHasRole('admin')" class="btn-container">
							<button class="uni-button btn" size="mini" type="primary"
								@click="handleEdit(notice)">修改</button>
							<button class="uni-button btn" size="mini" type="warn"
								@click="handleDelete(notice)">删除</button>
						</view>
					</uni-col>
				</uni-row>
			</template>
		</uni-card>
		<uni-fab ref="fab" v-if="hasLogin&&uniIDHasRole('admin')" horizontal="right" vertical="bottom"
			@fabClick="handleAddNotice" />
		<uni-popup ref="popup" type="bottom" background-color="#fff">
			<view class="form-container">
				<view class="form-header">
					<uni-icons type="closeempty" color="#409EFF" size="30" @click="handleClose"></uni-icons>
					<uni-icons type="checkmarkempty" color="#67C23A" size="30" @click="addNotice"></uni-icons>
				</view>
				<scroll-view scroll-y="true" class="scroll-Y">
					<uni-forms :modelValue="formData">
						<uni-forms-item required label="内容" name="content">
							<uni-easyinput :maxlength="-1" autoHeight type="textarea" v-model="formData.content" />
						</uni-forms-item>
					</uni-forms>
				</scroll-view>
			</view>
		</uni-popup>
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirm">
				<view class="desc">
					数据删除后无法恢复，是否删除？
				</view>
			</uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="redialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirms">
				<view class="popup-win">
					<!-- <view class="tips">加入钉钉：44663557获取通知</view> -->
					<view class="tips">加入企业微信获取通知</view>
					<view class="winner-container">
						<image class="image" src="/static/images/qywx.png" mode="aspectFill" />
					</view>
					<uni-easyinput v-model="customMsg" placeholder="" />
					<view class="desc">
						公告发布成功，是否通知各位？
					</view>
				</view>
			</uni-popup-dialog>
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
				matchInfo: {},
				oprateNotice: {},
				noticeList: [],
				formData: {
					createTime: new Date(),
					content: ''
				},
				customMsg: '速来围观'
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin'
			})
		},
		onLoad(params) {
			this.matchInfo = params
			this.getNotice()
		},
		async onPullDownRefresh() {
			await this.getNotice()
			uni.stopPullDownRefresh()
		},
		methods: {
			handleDelete(notice) {
				this.oprateNotice = notice
				this.$refs.dialog.open()
			},
			confirm() {
				let that = this
				uniCloud.callFunction({
					name: 'notice',
					data: {
						action: 'deleteNotice',
						params: this.oprateNotice
					},
					success() {
						that.getNotice()
					}
				})
			},
			handleEdit(notice) {
				this.formData = Object.assign({}, notice)
				this.$refs.popup.open()
			},
			dateFormat(time) {
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
				return year + "-" + month + "-" + day + " " + hours + ":" + minutes
			},

			handleAddNotice() {
				this.formData = {
					matchId: this.matchInfo.matchId,
					createTime: new Date(),
					content: ''
				}
				this.$refs.popup.open()
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
						that.noticeList = res.result.data
					}
				})
			},
			handleClose() {
				this.$refs.popup.close()
			},
			addNotice() {
				let that = this
				if (!this.formData.content) {
					return
				}
				if (this.formData._id) {
					uniCloud.callFunction({
						name: 'notice',
						data: {
							action: 'updateNotice',
							params: this.formData
						},
						success() {
							that.$refs.popup.close()
							that.getNotice()
						}
					})
				} else {
					uniCloud.callFunction({
						name: 'notice',
						data: {
							action: 'addNotice',
							params: this.formData
						},
						success() {
							that.$refs.popup.close()
							that.getNotice()
							that.$refs.redialog.open()
						}
					})
				}
			},
			confirms() {
				let data = {
					"touser": "@all",
					"msgtype": "text",
					"agentid": 1000003,
					"text": {
						"content": `今日要闻:${this.formData.content}\n${this.customMsg}`
					},
				}
				this.sendQYWX(data)
			},
			sendQYWX(params) {
				let that = this
				uniCloud.callFunction({
					name: 'xcxcontact',
					data: {
						action: 'sendQYWX',
						params: params
					},
					success() {
						that.$refs.redialog.close()
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		padding: 10px;

		.item {
			text-align: center;
		}

		.form-container {
			background: #ffffff;
			height: 80vh;
			position: relative;

			.scroll-Y {
				height: 100%;
				padding: 10px 20px 40px;
				box-sizing: border-box;
			}

			.form-header {
				display: flex;
				justify-content: space-between;
				background: #ffffff;
				padding: 10px;
				position: sticky;
				top: 0;
			}
		}
	}

	.text {
		white-space: pre-wrap;
	}

	.btn-container {
		text-align: right;

		.btn {
			margin-left: 4px;
		}
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
</style>
