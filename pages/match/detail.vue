<template>
	<view class="divContaienr">
		<view class="divContent">
			<view class="title">
				请选择对战双方
			</view>
			<uni-grid :column="3" :show-border="true" :square="true" @change="change">
				<uni-grid-item v-for="(item ,index) in userList" :index="index" :key="index">
					<view class="grid-item-box">
						<image class="image"
							:src="item.avatar||item.avatar_file.url||'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg'"
							mode="aspectFill" />
						<text class="text">{{item.nickname||'傻子'}}</text>
						<view v-if="selected(item)" class="grid-dot">
							<uni-icons size="20" color="#F56C6C" type="checkbox-filled"></uni-icons>
						</view>
					</view>
				</uni-grid-item>
			</uni-grid>
		</view>
		<view class="divFooter">
			<button class="uni-button cus-btn" plain type="warn" @click="handleSection">对战记录</button>
			<button class="uni-button cus-btn" plain type="primary" @click="handleBoard">排行榜</button>
			<button v-if="battleUser.length>=2" class="uni-button cus-btn" type="primary"
				@click="handleSure">开始比赛</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				matchId: '',
				matchName: '',
				matchBaseScore: 0,
				userList: [],
				battleUser: []
			}
		},
		onLoad(params) {
			this.matchBaseInfo = JSON.parse(decodeURIComponent(params.matchBaseInfo));
			this.matchId = this.matchBaseInfo._id
			this.matchName = this.matchBaseInfo.name
			this.matchBaseScore = this.matchBaseInfo.baseScore
			uni.setNavigationBarTitle({
				title: this.matchBaseInfo.name
			})
			this.getUserList()
		},
		async onPullDownRefresh() {
			await this.getUserList()
			uni.stopPullDownRefresh()
		},
		methods: {
			handleSure() {
				const postData = {
					matchId: this.matchId,
					matchBaseScore: this.matchBaseScore,
					matchRules: this.matchBaseInfo.rules,
					battleUser: this.battleUser.map(el => {
						for (var i = 0; i < this.userList.length; i++) {
							if (el === this.userList[i]._id) {
								return {
									userId: el,
									nickname: this.userList[i].nickname || '傻子',
									avatar: this.userList[i].avatar || this.userList[i]?.avatar_file?.url ||
										'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg'
								}
							}
						}
					})
				}
				uni.navigateTo({
					url: '/pages/match/section?matchBaseInfo=' + encodeURIComponent(JSON.stringify(postData))
				})
			},
			selected(item) {
				if (this.battleUser.indexOf(item._id) !== -1) {
					return true
				}
				return false
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
			change(e) {
				let {
					index
				} = e.detail
				let userId = this.userList[index]._id
				let battleIndex = this.battleUser.indexOf(userId)
				if (battleIndex !== -1) {
					this.battleUser.splice(battleIndex, 1)
				} else {
					if (this.battleUser.length < 2) {
						this.battleUser.push(userId)
					}
				}
			},
			handleBoard() {
				uni.navigateTo({
					url: `/pages/match/board?matchId=${this.matchId}&matchName=${this.matchName}`
				})
			},
			handleSection() {
				uni.navigateTo({
					url: `/pages/section/section?matchId=${this.matchId}&matchName=${this.matchName}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.divContaienr {
		position: relative;
		padding-bottom: 60px;

		.divContent {
			padding: 10px 20px;
			margin-bottom: 60px;
		}

		.divFooter {
			box-sizing: border-box;
			position: fixed;
			bottom: 0;
			width: 100%;
			padding: 10px;
			display: flex;
			background: #ffffff;
			z-index: 10;

			.cus-btn {
				font-size: 14px;
				flex: 1;
				margin: 4px;
			}
		}

		.title {
			text-align: center;
			margin: 10px 0;
		}
	}

	.image {
		width: 60px;
		height: 60px;
		border-radius: 4px;
	}

	.text {
		font-size: 14px;
		margin-top: 5px;
	}

	.example-body {
		/* #ifndef APP-NVUE */
		// display: block;
		/* #endif */
	}

	.grid-dynamic-box {
		margin-bottom: 15px;
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

	.grid-item-box-row {
		flex: 1;
		// position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}

	.grid-dot {
		position: absolute;
		top: 5px;
		right: 15px;
	}
</style>
