<template>
	<view class="divContainer">
		<uni-card class="card" v-for="(match,index) in matchList" :key="index" :title="match.name"
			cover="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg" @click="handleMatchDetail(match)">
			<view class="title">
				<view class="name">
					<text>{{match.desc}}</text>
				</view>
			</view>
			<template v-slot:actions>
				<view class="btn-container">
					<button class="uni-button btn" size="mini" type="primary" @click.stop="editMatch(match)">编辑</button>
					<button class="uni-button btn" size="mini" type="warn" @click.stop="deleteMatch(match)">删除</button>
				</view>
			</template>
		</uni-card>
		<uni-fab ref="fab" horizontal="right" vertical="bottom" @fabClick="fabClick" />
		<uni-popup ref="popup" type="bottom">
			<view class="form-container">
				<view class="form-header">
					<uni-icons type="closeempty" color="#409EFF" size="30" @click="handleClose"></uni-icons>
					<uni-icons type="checkmarkempty" color="#67C23A" size="30" @click="handleAdd"></uni-icons>
				</view>
				<uni-forms :modelValue="formData">
					<uni-forms-item required label="名称" name="name">
						<uni-easyinput type="text" v-model="formData.name" />
					</uni-forms-item>
					<uni-forms-item required label="描述" name="desc">
						<uni-easyinput type="text" v-model="formData.desc" />
					</uni-forms-item>
				</uni-forms>
			</view>
		</uni-popup>
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirm">
				<view class="desc">
					删除后数据将无法恢复，请谨慎操作！
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				matchList: [],
				formData: {
					name: '',
					desc: '',
					createTime: new Date()
				},
				deleteMatchInfo: {}
			}
		},
		onLoad() {
			this.getMatchList()
		},
		async onPullDownRefresh(){
			await this.getMatchList()
			uni.stopPullDownRefresh()
		},
		methods: {
			async getMatchList() {
				let that = this
				await uniCloud.callFunction({
					name: 'match',
					data: {
						action: 'getMatchList'
					},
					success(res) {
						that.matchList = res.result.data.sort((a, b) => {
							return b.createTime - a.createTime
						})
					}
				})
			},
			addMatch() {
				let that = this
				if (this.formData._id) {
					uniCloud.callFunction({
						name: 'match',
						data: {
							action: 'updateMatch',
							params: this.formData
						},
						success(res) {
							that.$refs.popup.close()
							that.getMatchList()
						}
					})
				} else {
					uniCloud.callFunction({
						name: 'match',
						data: {
							action: 'addMatch',
							params: this.formData
						},
						success(res) {
							that.$refs.popup.close()
							that.getMatchList()
						}
					})
				}

			},
			updateMatch() {},
			editMatch(match) {
				this.formData = match
				this.$refs.popup.open()
			},
			deleteMatch(match) {
				this.deleteMatchInfo = match
				this.$refs.dialog.open()
			},
			confirm() {
				let that = this
				uniCloud.callFunction({
					name: 'match',
					data: {
						action: 'deleteMatch',
						params: this.deleteMatchInfo
					},
					success(res) {
						that.$refs.dialog.close()
						that.getMatchList()
					}
				})
			},
			fabClick() {
				this.formData = {
					name: '',
					desc: '',
					createTime: new Date()
				}
				this.$refs.popup.open()
			},
			handleClose() {
				this.$refs.popup.close()
			},
			handleAdd() {
				if (this.formData.name && this.formData.desc) {
					this.addMatch()
				}
			},
			handleMatchDetail(match) {
				uni.navigateTo({
					url: `/pages/match/detail?matchId=${match._id}&matchName=${match.name}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.divContainer {
		font-size: 16px;
	}

	.card {
		position: relative;

		.fire {
			position: absolute;
			top: 20px;
			right: 20px;
		}
	}

	.title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;

		.match-delete {
			position: absolute;
			top: -40px;
			right: 0px;
		}

		.name {
			display: flex;
			align-items: center;
		}
	}

	.desc {
		font-size: 12px;
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
	.btn-container {
		text-align: right;
		.btn{
			margin-left: 4px;
		}
	}
</style>
