<template>
	<view class="divContainer">
		<uni-card v-for="(notice,index) in noticeList" :key="index" :title="dateFormat(notice.createTime)" note="Tips">
			<text class="text">{{notice.content}}</text>
			<template v-slot:actions>
				<uni-row>
					<uni-col :span="24">
						<view class="btn-container">
							<button class="uni-button btn" size="mini" type="primary" @click="handleEdit(notice)">修改</button>
							<button class="uni-button btn" size="mini" type="warn" @click="handleDelete(notice)">删除</button>
						</view>
					</uni-col>
				</uni-row>
			</template>
		</uni-card>
		<uni-fab ref="fab" horizontal="right" vertical="bottom" @fabClick="handleAddNotice" />
		<uni-popup ref="popup" type="bottom">
			<view class="form-container">
				<view class="form-header">
					<uni-icons type="closeempty" color="#409EFF" size="30" @click="handleClose"></uni-icons>
					<uni-icons type="checkmarkempty" color="#67C23A" size="30" @click="addNotice"></uni-icons>
				</view>
				<uni-forms :modelValue="formData">
					<uni-forms-item required label="内容" name="content">
						<uni-easyinput :maxlength="-1" type="textarea" v-model="formData.content" />
					</uni-forms-item>
				</uni-forms>
			</view>
		</uni-popup>
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirm">
				<view class="desc">
					数据删除后无法恢复，是否删除？
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
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
			}
		},
		onLoad(params) {
			this.matchInfo = params
			this.getNotice()
		},
		methods: {
			handleDelete(notice) {
				this.oprateNotice = notice
				this.$refs.dialog.open()
			},
			confirm() {
				uniCloud.callFunction({
					name: 'notice',
					data: {
						action: 'deleteNotice',
						params: this.oprateNotice
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
			getNotice() {
				let that = this
				uniCloud.callFunction({
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
						}
					})
				}

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
			padding: 10px 20px 100px 20px;

			.form-header {
				display: flex;
				justify-content: space-between;
				background: #ffffff;
				padding: 10px;
			}
		}
	}
	.text{
		white-space: pre-wrap;
	}
	.btn-container {
		text-align: right;
		.btn{
			margin-left: 4px;
		}
	}
</style>
