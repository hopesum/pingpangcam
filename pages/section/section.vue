<template>
	<view class="divContainer">
		<uni-card v-for="(item,index) in sectionList" :extra="item.createUserName" :key="index"
			:title="dateFormat(item.createTime)">
			<view class="battle-user">
				<view class="left">
					<view class="name">
						{{item.winner.nickname}}
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
					<view class="name">
						{{item.loser.nickname}}
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
					<!-- <button class="uni-button btn" size="mini" type="primary" @click.stop="editSection(item)">编辑</button> -->
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
		<uni-popup ref="popup" type="bottom">
			<view class="form-container">
				<view class="form-header">
					<uni-icons type="closeempty" color="#409EFF" size="30" @click="handleClose"></uni-icons>
					<uni-icons type="checkmarkempty" color="#67C23A" size="30" @click="handleAdd"></uni-icons>
				</view>
				<uni-forms :modelValue="formData">
					<view class="winner-container">
						<uni-forms-item disabled required label="胜者">
							<uni-easyinput type="text" v-model="formData.winner.nickname" />
						</uni-forms-item>
						<uni-forms-item disabled required label="胜场">
							<uni-easyinput type="number" v-model="formData.winner.win" />
						</uni-forms-item>
						<uni-forms-item disabled required label="败场">
							<uni-easyinput type="number" v-model="formData.winner.fail" />
						</uni-forms-item>
						<uni-forms-item disabled required label="获得积分">
							<uni-easyinput type="number" v-model="formData.winner.integral" />
						</uni-forms-item>
					</view>
					<view class="loser-container">
						<uni-forms-item disabled required label="败者">
							<uni-easyinput type="text" v-model="formData.loser.nickname" />
						</uni-forms-item>
						<uni-forms-item disabled required label="胜场">
							<uni-easyinput type="number" v-model="formData.loser.win" />
						</uni-forms-item>
						<uni-forms-item disabled required label="败场">
							<uni-easyinput type="number" v-model="formData.loser.fail" />
						</uni-forms-item>
						<uni-forms-item disabled required label="获得积分">
							<uni-easyinput type="number" v-model="formData.loser.integral" />
						</uni-forms-item>
					</view>

				</uni-forms>
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
				sectionList: [],
				oprateSection: {},
				formData: {}
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin',
				userInfo: 'user/info'
			})
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
			await this.initialize()
			uni.stopPullDownRefresh()
		},
		methods: {
			handleClose() {
				this.$refs.popup.close()
			},
			async handleAdd() {
				let that = this
				await uniCloud.callFunction({
					name: 'section',
					data: {
						action: 'updateSection',
						params: that.formData
					},
					success() {
						that.$refs.popup.close()
						that.initialize()
					}
				})
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
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		.battle-user {
			display: flex;

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
		padding: 10px;
		overflow-y: auto;
		height: 80vh;

		.form-header {
			display: flex;
			justify-content: space-between;
			background: #ffffff;
			padding: 10px;
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
</style>
