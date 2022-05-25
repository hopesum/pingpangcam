<template>
	<view class="divContaienr">
		<view class="divContent">
		<view class="title">
			对战双方
		</view>
		<uni-grid :column="3" :show-border="true" :square="true" @change="change">
			<uni-grid-item v-for="(item ,index) in userList" :index="index" :key="index">
				<view class="grid-item-box">
					<image class="image" :src="item.avatar||item.avatar_file.url" mode="aspectFill" />
					<text class="text">{{item.nickname}}</text>
					<view v-if="selected(item)" class="grid-dot">
						<uni-icons size="20" color="#F56C6C" type="checkbox-filled"></uni-icons>
					</view>
				</view>
			</uni-grid-item>
		</uni-grid>
		</view>
		<view class="divFooter">
			<button class="uni-button cus-btn" plain type="primary" @click="handleBoard">排行榜</button>
			<button :disabled="battleUser.length<2" class="uni-button cus-btn" type="primary" @click="handleSure">开始比赛</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				matchId: '',
				matchName: '',
				userList: [],
				battleUser: []
			}
		},
		onLoad(params) {
			this.matchId = params.matchId
			this.matchName = params.matchName
			uni.setNavigationBarTitle({
				title: params.matchName
			})
			this.getUserList()
		},
		methods: {
			handleSure() {
				const postData = {
					matchId:this.matchId,
					battleUser:this.battleUser.map(el=>{
						for (var i = 0; i < this.userList.length; i++) {
							if(el===this.userList[i]._id){
								return {
									userId:el,
									nickname:this.userList[i].nickname,
									avatar:this.userList[i].avatar||this.userList[i].avatar_file.url
								}
							}
						}
					})
				}
				uni.navigateTo({
					url:'/pages/match/section?matchBaseInfo='+encodeURIComponent(JSON.stringify(postData))
				})
			},
			selected(item) {
				if (this.battleUser.indexOf(item._id) !== -1) {
					return true
				}
				return false
			},
			getUserList() {
				uniCloud.callFunction({
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
				console.log(battleIndex);
				if (battleIndex !== -1) {
					this.battleUser.splice(battleIndex, 1)
				} else {
					if (this.battleUser.length < 2) {
						this.battleUser.push(userId)
					}
				}
			},
			handleBoard(){
				uni.navigateTo({
					url:`/pages/match/board?matchId=${this.matchId}&matchName=${this.matchName}`
				})
			}	
		}
	}
</script>

<style lang="scss" scoped>
	.divContaienr {
		position: relative;
		.divContent{
			padding: 10px 20px;
			margin-bottom: 60px;
		}
		.divFooter{
			box-sizing: border-box;
			position: fixed;
			bottom: 0;
			width: 100%;
			padding: 10px;
			display: flex;
			.cus-btn{
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
