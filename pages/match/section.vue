<template>
	<view class="divContainer">
		<view class="divContent">
			<view class="step">
				<uni-segmented-control :current="current" :values="items" style-type="button" active-color="#1aad19"
					@clickItem="onClickItem" />
			</view>
			<view class="header">
				<view :class="['user',index==0?'user-left':'user-right',(index%2!=0&&order)?'order-left':'order-right']"
					v-for="(user,index) in matchBaseInfo.battleUser" :key="index">
					<view class="step">
						<uni-segmented-control :current="currentLevel[index]" :values="levels" style-type="button"
							active-color="#1aad19" @clickItem="onClickLevel($event,user)" />
					</view>
					<view class="user-content" @click="handleUserContent(user)">
						<view class="user-score">
							<text :class="index%2===0?'left':'right'">{{user.score||0}}</text>
							<text :class="[index%2===0?'left':'right','text-section']">{{user.win||0}}</text>
						</view>
					</view>
					<view
						:class="['user-header',(showBall==='left'&&index===0)?'left-ball':'',(showBall==='right'&&index===1)?'right-ball':'']"
						@click="handleUserHeader(user)">
						<image class="image" :src="user.avatar" mode="aspectFill" />
						<view class="user-name">
							<text class="text">{{user.nickname}}</text>
							<input v-if="user.nickname==='补分选手'" type="text" v-model="user.realname" placeholder="真名"
								style="width: 50px;font-size: 12px;border: 1px #eee solid;margin-top: 4px;" />
						</view>
						<view
							:class="['left-ball-empty',(showBall==='left'&&index===0)?'left-ball-o':'',(showBall==='right'&&index===1)?'right-ball-o':'']"
							type="smallcircle-filled" size="20"></view>
					</view>
				</view>
			</view>
		</view>
		<view class="">
			<uni-grid :column="3" :show-border="true" :square="true">
				<uni-grid-item v-for="(item ,index) in videoList" :index="index" :key="index">
					<view v-if="item" class="grid-item-box">
						<video :src="item"></video>
					</view>
					<view class="del-container" @click="handleDeleteVideo(item,index)">
						<uni-icons color="#F56C6C" size="15" type="trash" class="icon-delete"></uni-icons>
					</view>
				</uni-grid-item>
			</uni-grid>
			<view class="btn-container">
				<button class="uni-button" size="mini" type="warn" plain @click="changePosition">切换位置</button>
				<button class="uni-button ml-10" size="mini" type="primary" @click="uploadVideo">上传视频</button>
			</view>
		</view>
		<uni-card class="card-container" title="积分规则">
			<view>1.所有参赛选手底分{{matchBaseInfo.matchBaseScore}}；</view>
			<view>2.同级别选手之间胜者{{rules.sameRuleWin}}分，负者{{rules.sameRuleFail}}分；</view>
			<view>3.第二级别选手与第一级别选手交战时：</view>
			<view class="rule-box">
				<view class="indent-text">
					若第一级别胜，胜者积分{{rules.unSameRuleHighLevelWin}}分，负者积分{{rules.unSameRuleLowLevelFail}}分；</view>
				<view class="indent-text">
					若第二级别胜，胜者积分{{rules.unSameRuleLowLevelWin}}分，负者积分{{rules.unSameRuleHighLevelFail}}分。</view>
			</view>
			<view>4.赛制可以双方协商采用7局4胜，5局3胜，3局2胜均可。</view>
			<view class="card-edit" v-if="hasLogin&&uniIDHasRole('admin')" @click="handleEditRule">
				<uni-icons type="compose" size="20" color="#999"></uni-icons>
			</view>
		</uni-card>
		<uni-popup ref="dialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirm">
				<view class="popup-win">
					<view class="winner-container">
						<image lazy-load class="image" :src="winner.avatar" mode="aspectFill" />
						<text class="text">{{winner.nickname+(winner.realname?winner.realname:'')}}</text>
					</view>
					<view class="desc">
						恭喜获胜，是否上传积分数据
					</view>
				</view>
			</uni-popup-dialog>
		</uni-popup>
		<uni-popup ref="popup" type="bottom">
			<view class="form-container">
				<uni-forms :modelValue="rules">
					<!-- 	<uni-forms-item required label="底分" name="baseIntegral">
						<uni-easyinput type="number" v-model="rules.baseIntegral" />
					</uni-forms-item> -->
					<uni-forms-item required label="同级胜" name="sameRuleWin">
						<uni-easyinput type="number" v-model="rules.sameRuleWin" />
					</uni-forms-item>
					<uni-forms-item required label="同级败" name="sameRuleFail">
						<uni-easyinput type="number" v-model="rules.sameRuleFail" />
					</uni-forms-item>
					<uni-forms-item required label="一级胜" name="unSameRuleHighLevelWin">
						<uni-easyinput type="number" v-model="rules.unSameRuleHighLevelWin" />
					</uni-forms-item>
					<uni-forms-item required label="一级败" name="unSameRuleHighLevelFail">
						<uni-easyinput type="number" v-model="rules.unSameRuleHighLevelFail" />
					</uni-forms-item>
					<uni-forms-item required label="二级胜" name="unSameRuleLowLevelWin">
						<uni-easyinput type="number" v-model="rules.unSameRuleLowLevelWin" />
					</uni-forms-item>
					<uni-forms-item required label="二级败" name="unSameRuleLowLevelFail">
						<uni-easyinput type="number" v-model="rules.unSameRuleLowLevelFail" />
					</uni-forms-item>
				</uni-forms>
			</view>
		</uni-popup>
		<uni-popup ref="reDialog" type="dialog">
			<uni-popup-dialog :duration="2000" @confirm="confirm">
				<view class="popup-win">
					<view class="winner-container">
						<image class="image" :src="winner.avatar" mode="aspectFill" />
						<text class="text">{{winner.nickname}}</text>
					</view>
					<view class="desc">
						是否修订积分？
					</view>
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
						对战上传成功，是否通知各位围观？
					</view>
				</view>
			</uni-popup-dialog>
		</uni-popup>
		<view v-if="setctionId" class="divFooter">
			<button class="uni-button cus-btn" plain type="primary" @click="handleBoard">排行榜</button>
			<button class="uni-button cus-btn" type="primary" @click="handleResubmit">订正积分</button>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	export default {
		data() {
			return {
				setctionId: '',
				showBall: '',
				matchBaseInfo: {},
				winner: {},
				current: 0,
				currentLevel: [0, 0],
				items: ['三局两胜', '五局三胜', '七局四胜'],
				levels: ['一级选手', '二级选手'],
				customMsg: '速来围观！！！！',
				rules: {
					// baseIntegral: 500,
					sameRuleWin: 100,
					sameRuleFail: -20,
					unSameRuleLowLevelWin: 200,
					unSameRuleLowLevelFail: -20,
					unSameRuleHighLevelWin: 100,
					unSameRuleHighLevelFail: -80,
				},
				cacheSection: {},
				order: false,
				videoList: []
			}
		},
		watch: {
			matchBaseInfo: {
				handler(val) {
					let sectionNum = 0
					let sectionScore = 0
					let userScoreMinus = 0
					let usera, userb
					this?.matchBaseInfo?.battleUser?.forEach(user => {
						sectionNum += user.win || 0
						sectionScore += user.score || 0
					})
					if (this?.matchBaseInfo?.battleUser?.length) {
						usera = this?.matchBaseInfo?.battleUser[0]
						userb = this?.matchBaseInfo?.battleUser[1]
						userScoreMinus = Math.abs(Number(usera.score) - Number(userb.score))
					}
					if (usera?.score >= 10 && userb?.score >= 10) {
						if (sectionNum % 2 === 0) { //左侧选手先手发球
							if (sectionScore % 2 === 0) {
								this.showBall = 'left'
							} else {
								this.showBall = 'right'
							}
						} else {
							if (sectionScore % 2 === 0) {
								this.showBall = 'right'
							} else {
								this.showBall = 'left'
							}
						}
					} else {
						if (sectionNum % 2 === 0) { //左侧选手先手发球
							if (sectionScore % 4 === 0 || (sectionScore - 1) % 4 === 0) {
								this.showBall = 'left'
							} else {
								this.showBall = 'right'
							}
						} else {
							if (sectionScore % 4 === 0 || (sectionScore - 1) % 4 === 0) {
								this.showBall = 'right'
							} else {
								this.showBall = 'left'
							}
						}
					}
				},
				deep: true,
				immediate: true
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin',
				userInfo: 'user/info'
			}),
			maxSection() {
				return this.current + 2
			}
		},
		onLoad(option) {
			this.matchBaseInfo = JSON.parse(decodeURIComponent(option.matchBaseInfo));
			console.log(this.matchBaseInfo);
			this.rules = this.matchBaseInfo.matchRules
			console.log(this.rules);
			this.matchBaseInfo.battleUser.forEach(user => {
				this.$set(user, 'level', 0)
			})
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
				return year + "-" + month + "-" + day + ' ' + hours + ":" + minutes + ":" + seconds;
			},
			handleBoard() {
				uni.navigateTo({
					url: `/pages/match/board?matchId=${this.matchBaseInfo.matchId}&matchName=${this.matchBaseInfo.matchName}`
				})
			},
			handleEditRule() {
				this.$refs.popup.open()
			},
			changePosition() {
				this.order = !this.order
			},
			onClickItem(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex
				}
			},
			onClickLevel(e, user) {
				user.level = e.currentIndex
			},
			handleUserContent(user) {
				if (!user.score) {
					this.$set(user, 'score', 0)
				}
				if (!user.win) {
					this.$set(user, 'win', 0)
				}
				if (user.score > 0) {
					user.score--
				} else {
					if (user.win > 0) {
						user.score = 11
						user.win--
					}
				}
			},
			handleUserHeader(user) {
				if (!user.score) {
					this.$set(user, 'score', 0)
				}
				if (!user.win) {
					this.$set(user, 'win', 0)
				}
				if (user.win >= this.maxSection) {
					return
				}
				if (user.score >= 11) {
					const loser = this.matchBaseInfo.battleUser.find(el => el.userId !== user.userId)

					if (loser.score < 10) {
						user.win++
						user.score = 0
						loser.score = 0
						if (user.win >= this.maxSection) {
							this.handleWin(user)
						}
					} else {
						if (Math.abs(Number(loser.score) - Number(user.score)) < 2) {
							user.score++
						} else {
							user.win++
							user.score = 0
							loser.score = 0
							if (user.win >= this.maxSection) {
								this.handleWin(user)
							}
						}
					}

				} else {
					user.score++
				}
			},
			handleWin(user) {
				this.winner = user
				this.$refs.dialog.open()
			},
			confirm() {
				let that = this
				let loser = this.matchBaseInfo.battleUser.find(el => {
					return el.userId !== this.winner.userId
				})
				if (this.winner.level <= loser.level) { //同级别或者是第一级别胜利
					this.winner.integral = this.rules.sameRuleWin
					loser.integral = this.rules.sameRuleFail
				} else {
					this.winner.integral = this.rules.unSameRuleLowLevelWin
					loser.integral = this.rules.unSameRuleHighLevelFail
				}
				if (!loser.win) {
					loser.win = 0
				}
				if (!loser.score) {
					loser.score = 0
				}
				// integral
				const postData = {
					createTime: new Date(),
					createUser: this.userInfo._id,
					matchId: this.matchBaseInfo.matchId,
					matchBaseScore: this.matchBaseInfo.matchBaseScore,
					winner: {
						...this.winner,
						fail: loser.win
					},
					loser: {
						...loser,
						fail: this.winner.win
					},
					videoList: this.videoList
				}
				if (this.setctionId) {
					if (this.winner.nickname === '补分选手' || loser.nickname === '补分选手') {
						Object.assign(postData, {
							winner: {
								...this.winner,
								tag: '补分'
							},
							loser: {
								...loser,
								tag: '补分'
							}
						})
					}
					uniCloud.callFunction({
						name: 'section',
						data: {
							action: 'updateSection',
							params: {
								...postData,
								_id: this.setctionId
							}
						},
						success(res) {
							console.log(res);
							uni.showToast({
								icon: "none",
								title: '保存成功'
							})
						}
					})
				} else {
					if (this.winner.nickname === '补分选手' || loser.nickname === '补分选手') {
						Object.assign(postData, {
							winner: {
								...this.winner,
								tag: '补分'
							},
							loser: {
								...loser,
								tag: '补分'
							}
						})
					}
					uniCloud.callFunction({
						name: 'section',
						data: {
							action: 'addSection',
							params: {
								...postData,
								createUserName: this.userInfo.nickname
							}
						},
						success(res) {
							that.setctionId = res.result.id
							uni.showToast({
								icon: "none",
								title: '保存成功'
							})
							that.cacheSection = Object.assign({}, {
								...postData,
								createUserName: that.userInfo.nickname
							})
							that.$refs.redialog.open()
						}
					})
				}
			},
			confirms() {
				let data = {
					"touser": "@all",
					"agentid": 1000003,
					"msgtype": "news",
					"news": {
						"articles": [{
							"title": `恭喜${this.cacheSection.winner.nickname+(this.cacheSection.winner.realname||'')}取得胜利，获得积分${this.cacheSection.winner.integral}`,
							"description": `比赛时间：${this.dateFormat(this.cacheSection.createTime)} \n裁判：${this.cacheSection.createUserName} \n对战双方：${this.cacheSection.winner.nickname+(this.cacheSection.winner.realname||'')} vs ${this.cacheSection.loser.nickname+(this.cacheSection.loser.realname||'')}  \n比分：${this.cacheSection.winner.win} : ${this.cacheSection.loser.win} \n${this.cacheSection.winner.nickname+(this.cacheSection.winner.realname||'')}取得胜利，获得积分${this.cacheSection.winner.integral} \n${this.cacheSection.loser.nickname+(this.cacheSection.loser.realname||'')}遗憾告负，获得积分${this.cacheSection.loser.integral} \n \n ${this.cacheSection.videoList.length?'精彩视频可到小程序对战列表中查看':''} \n \n${this.customMsg} `,
							"picurl": `${this.cacheSection.winner.avatar}`
						}]
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
			handleResubmit() {
				this.$refs.reDialog.open()
			},
			uploadVideo() {
				let self = this
				uni.chooseVideo({
					// sourceType: ['camera', 'album'],
					success: async (res) => {
						let filePath = res.tempFilePath
						let cloudPath = 'video' + Date.now()
						uni.showLoading({
							title: '上传中',
							mask: true
						});
						let video = await uniCloud.uploadFile({
							filePath,
							cloudPath,
							fileType: "video"
						});
						uni.hideLoading()
						console.log(video);
						this.videoList.push(video.fileID)
					}
				});
			},
			handleDeleteVideo(item, index) {
				this.videoList.splice(index, 1)
			}
		}
	}
</script>


<style lang="scss" scoped>
	.divContainer {
		font-size: 12px;
		line-height: 24px;
		position: relative;
		padding-bottom: 40px;

		.form-container {
			background: #ffffff;
			padding: 20px 40px;
			overflow-y: auto;
			height: 80vh;
		}

		.card-container {
			position: relative;

			.card-edit {
				position: absolute;
				right: 10px;
				top: 10px;
			}
		}


		.divFooter {
			box-sizing: border-box;
			position: fixed;
			bottom: 0;
			width: 100%;
			padding: 10px;
			display: flex;
			background-color: #ffffff;

			.cus-btn {
				font-size: 14px;
				flex: 1;
				margin: 4px;
			}
		}

		.divContent {
			padding: 20px;
			// margin-bottom: 60px;

			.step {
				margin: 4px;
			}

			.header {
				display: flex;
				justify-content: space-between;
				// margin: 20px 0;

				.user {
					flex: 1;
					text-align: center;
					box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.08);
					margin: 20px 4px;
					border-radius: 4px;

					.user-header {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						position: relative;
						padding: 50px 0;
					}

					.user-score {
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 40px;
					}

					.user-content {
						background: #f5f5f5;
						font-size: 20px;
						padding: 40px 0;
						line-height: 40px;
						position: relative;
					}
				}

				.image {
					width: 90px;
					height: 90px;
				}

				.text {
					font-size: 14px;
					margin-top: 5px;
				}
			}
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

	.winner-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border: 1px solid gold;
		color: goldenrod;
		width: 100px;
		height: 100px;
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

	.left {
		color: #409EFF;
	}

	.right {
		color: #F56C6C;
	}

	.text-section {
		font-size: 20px;
		position: absolute;
		top: 0;
		left: 4px;
	}

	.left-ball {
		// border: 2px solid #409EFF;
		box-sizing: border-box;
	}

	.right-ball {
		// border: 2px solid #F56C6C;
		box-sizing: border-box;
	}

	.left-ball-empty {
		display: none;
		position: absolute;
		right: 5px;
		top: 5px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: radial-gradient(transparent, #E6A23C);
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
	}

	.left-ball-o {
		display: block;
	}

	.right-ball-o {
		display: block;
	}

	.rule-box {
		padding: 4px;
		background-color: #f5f5f5;
		box-sizing: border-box;
		border-radius: 4px;

		.indent-text {
			transform: scale(0.8);
			white-space: nowrap;
		}
	}

	.user-left {
		border: 1px solid #409EFF;
	}

	.user-right {
		border: 1px solid #F56C6C;
	}

	.user-name {
		display: flex;
		justify-content: center;
		align-items: center;
		white-space: nowrap;
	}

	.tips {
		font-size: 12px
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
		position: relative;

		.icon-delete {
			position: absolute;
			top: 5px;
			right: 5px;
		}
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

	video {
		object-fit: contain;
		width: 100%;
		height: 100%;
	}

	.ml-10 {
		margin-left: 10px;
	}

	.del-container {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(#F56C6C, 0.5);
	}

	.header {
		position: relative;
	}

	.change {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.order-left {
		order: 0;
	}

	.order-right {
		order: 1;
	}
	.btn-container{
		text-align: right;
		padding: 0 20px;
	}
</style>
