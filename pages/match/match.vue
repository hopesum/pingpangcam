<template>
	<view class="divContainer">
		<!-- <uni-nav-bar height="120rpx" title=" " backgroundColor="#57b65a"></uni-nav-bar> -->
		<uni-notice-bar scrollable showIcon :speed="30" :text="notice"></uni-notice-bar>
		<swiper class="swiper" circular :indicator-dots="false"
			:autoplay="true" :interval="4000" :duration="500">
			<swiper-item class="swiper-item" v-for="(item,index) in bannerList" :key="index">
				<view :class="['user-container']">
					<view class="user-left">
						<image class="banner-img" :src="item.avatar" mode="aspectFill" :draggable="false"></image>
					</view>
					<view class="user-right">
						<view>
							<view class="user-title">
								<!-- <uni-icons type="medal-filled" size="48" color="gold"></uni-icons> -->
								<text class="title-name">{{item.nickname}}</text>
							</view>
							<view v-if="index===0" class="user-info">
								<uni-tag class="tag" text="积分 NO.1" type="success"></uni-tag>
								<view class="text">{{Number(item.integral)+Number(matchList[0].baseScore)}}</view>
							</view>
							<view v-if="index===1" class="user-info">
								<uni-tag class="tag" text="胜率 NO.1" type="error"></uni-tag>
								<view class="text">{{item.rate+'%'}}</view>
							</view>
							<view v-if="index===2" class="user-info">
								<uni-tag class="tag" text="KD NO.1" type="warning"></uni-tag>
								<view class="text">{{item.KD}}</view>
							</view>
						</view>
						<!-- <view>积分：{{item.integral}}</view>
						<view>胜率：{{item.rate}}</view>
						<view>KD：{{item.KD}}</view>
						<view>胜场：{{item.win}}</view> -->
					</view>
				</view>
			</swiper-item>
			<!-- <view class="rain" :style="[rain(rainIndex)]" v-for="rainIndex in rainNum" :key="rainIndex"></view> -->
		</swiper>
		<view class="menu-list">
			<view class="menu-item" v-if="hasLogin&&uniIDHasRole('admin')" @click="fabClick">
				<uni-icons color="gold" type="medal-filled" size="30"></uni-icons>
				<text>添加赛事</text>
			</view>
			<view class="menu-item" @click="handleBoard">
				<uni-icons color="#e61f49" type="vip-filled" size="30"></uni-icons>
				<text>积分榜单</text>
			</view>
			<view class="menu-item" @click="handleSection">
				<uni-icons color="#4eb0fa" type="staff-filled" size="30"></uni-icons>
				<text>对战记录</text>
			</view>
			<view class="menu-item" @click="handleMall">
				<uni-icons color="#ff7a45" type="shop-filled" size="30"></uni-icons>
				<text>积分商城</text>
			</view>
			<view class="menu-item" @click="hanldeSignBoard">
				<uni-icons color="#16c4af" type="calendar-filled" size="30"></uni-icons>
				<text>出勤排行</text>
			</view>
		</view>
		<view class="divContent">
			<!-- <uni-section title="比赛列表" type="line" class="match-list"></uni-section> -->
			<!-- <view class="board-btn" @click="handleBoard">排行榜</view> -->
			<uni-card class="card" v-for="(match,index) in matchList" :key="index" :title="match.name"
				:extra="dateFormat(match.createTime)" @click="handleMatchDetail(match)">
				<view class="title">
					<view class="name">
						<text class="desc">{{match.desc}}</text>
					</view>
				</view>
				<image width="100%" mode="aspectFill"
					:src="match.image||'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-76ce2c5e-31c7-4d81-8fcf-ed1541ecbc6e/b88a7e17-35f0-4d0d-bc32-93f8909baf03.jpg'">
				</image>
				<template v-slot:actions>
					<view v-if="hasLogin&&uniIDHasRole('admin')" class="btn-container">
						<button class="uni-button btn" size="mini" type="primary"
							@click.stop="editMatch(match)">编辑</button>
						<button class="uni-button btn" size="mini" type="warn"
							@click.stop="deleteMatch(match)">删除</button>
					</view>
				</template>
			</uni-card>
		</view>
		<!-- <uni-fab v-if="hasLogin&&uniIDHasRole('admin')" ref="fab" horizontal="right" vertical="bottom"
			@fabClick="fabClick" /> -->
		<uni-popup ref="popup" type="bottom" background-color="#fff">
			<view class="form-container">
				<view class="form-header">
					<uni-icons type="closeempty" color="#409EFF" size="30" @click="handleClose"></uni-icons>
					<uni-icons type="checkmarkempty" color="#67C23A" size="30" @click="handleAdd"></uni-icons>
				</view>
				<scroll-view scroll-y="true" class="scroll-Y">
					<uni-forms :modelValue="formData">
						<uni-forms-item required label="名称" name="name">
							<uni-easyinput type="text" v-model="formData.name" />
						</uni-forms-item>
						<uni-forms-item required label="描述" name="desc">
							<uni-easyinput type="textarea" v-model="formData.desc" />
						</uni-forms-item>
						<uni-forms-item required label="图片" name="image">
							<cloud-image @click="uploadAvatarImg" v-if="formData.image" :src="formData.image"
								width="75px" height="40px"></cloud-image>
							<view v-else class="chooseAvatar">
								<uni-icons @click="uploadAvatarImg" type="plusempty" size="30" color="#dddddd">
								</uni-icons>
							</view>
						</uni-forms-item>
						<uni-forms-item required label="底分" name="baseScore">
							<uni-easyinput type="number" v-model="formData.baseScore" />
						</uni-forms-item>
						<uni-forms-item required label="同级胜">
							<uni-easyinput type="number" v-model="formData.rules.sameRuleWin" />
						</uni-forms-item>
						<uni-forms-item required label="同级败">
							<uni-easyinput type="number" v-model="formData.rules.sameRuleFail" />
						</uni-forms-item>
						<uni-forms-item required label="一级胜">
							<uni-easyinput type="number" v-model="formData.rules.unSameRuleHighLevelWin" />
						</uni-forms-item>
						<uni-forms-item required label="一级败">
							<uni-easyinput type="number" v-model="formData.rules.unSameRuleHighLevelFail" />
						</uni-forms-item>
						<uni-forms-item required label="二级胜">
							<uni-easyinput type="number" v-model="formData.rules.unSameRuleLowLevelWin" />
						</uni-forms-item>
						<uni-forms-item required label="二级败">
							<uni-easyinput type="number" v-model="formData.rules.unSameRuleLowLevelFail" />
						</uni-forms-item>
					</uni-forms>
				</scroll-view>
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
	import {
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				notice: '打卡奖励开启，每日只能获取一次奖励积分，最高可随机获取40积分，获取的积分将计入总积分，快来打卡参与吧！',
				rainNum: 40,
				matchList: [],
				bannerList: [],
				formData: {
					baseScore: 0,
					name: '',
					desc: '',
					image: '',
					createTime: new Date(),
					rules: {
						// baseIntegral: 500,
						sameRuleWin: 100,
						sameRuleFail: -80,
						unSameRuleLowLevelWin: 200,
						unSameRuleLowLevelFail: -80,
						unSameRuleHighLevelWin: 100,
						unSameRuleHighLevelFail: -100,
					}
				},
				deleteMatchInfo: {}
			}
		},
		computed: {
			...mapGetters({
				hasLogin: 'user/hasLogin'
			})
		},
		async onLoad() {
			await this.checkToken()
			this.getMatchList()
			this.getSettings()
		},
		async onPullDownRefresh() {
			await this.checkToken()
			await this.getMatchList()
			uni.stopPullDownRefresh()
		},
		onShareAppMessage(res) {
			let pages = getCurrentPages()
			let fullPath = pages[pages.length-1].$page.fullPath
			return {
				title: '赛事大厅',
				path: fullPath
			}
		},
		methods: {
			async getSettings() {
				let fn = uniCloud.importObject('settings')
				this.notice = await fn.getNotice()
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
			handleBoard() {
				uni.navigateTo({
					url: '/pages/match/board'
				})
			},
			handleSection(){
				uni.navigateTo({
					url:'/pages/section/section'
				})
			},
			async checkToken() {
				let now = new Date().getTime()
				let tokenExpired = this.$store.state.user.info?.tokenExpired || 0
				if (tokenExpired - now < 0) {
					uni.navigateTo({
						url: '/pages/ucenter/login-page/index/index'
					})
				}
			},
			rain(index) {
				return {
					left: (Math.random() * 2000) + 'px',
					animationDelay: Math.random() * -5 + 's',
					animationDuration: 1 + Math.random() * 5 + 's',
					background: `linear-gradient(transparent, rgb(${255*Math.random()},${255*Math.random()},${255*Math.random()}))`
				}
			},
			handleBanner() {
				uni.navigateTo({
					url: '/pages/match/board'
				})
				// uni.navigateTo({
				// 	url: `/pages/match/board?matchId=${this.matchList[0]._id}&matchName=${this.matchList[0].name}`
				// })
			},
			uploadAvatarImg(res) {
				const crop = {
					quality: 100,
					width: 750,
					height: 400,
					resize: true
				};
				uni.chooseImage({
					count: 1,
					crop,
					success: async (res) => {
						console.log(res);
						let tempFile = res.tempFiles[0],
							matchImage,
							filePath = res.tempFilePaths[0]
						// #ifndef APP-PLUS
						//非app端用前端组件剪裁头像，app端用内置的原生裁剪
						filePath = await new Promise((callback) => {
							uni.navigateTo({
								url: '/pages/ucenter/userinfo/cropImage?path=' + filePath +
									`&options=${JSON.stringify(crop)}`,
								animationType: "fade-in",
								events: {
									success: url => {
										callback(url)
									}
								}
							});
						})
						// #endif
						let cloudPath = 'updateTime' + Date.now()
						uni.showLoading({
							title: '上传中',
							mask: true
						});
						let {
							fileID
						} = await uniCloud.uploadFile({
							filePath,
							cloudPath,
							fileType: "image"
						});
						// console.log(result)
						matchImage = fileID
						this.formData.image = matchImage
						// this.$forceUpdate()
						uni.hideLoading()
						// this.setAvatarFile(matchImage)
					}
				})
			},
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
						if (that.matchList.length) {
							that.getBanner()
						}
					}
				})
			},
			async getBanner() {
				let that = this
				let matchId = this.matchList[0]._id
				await uniCloud.callFunction({
					name: 'section',
					data: {
						// action: 'getSectionList',
						action: 'getAllSectionList',
						params: {
							matchId
						}
					},
					success(res) {
						let sectionList = res.result.data
						// let matchBaseScore = Number(res.result.data[0]?.matchBaseScore)
						let winnerList = sectionList.map(el => el.winner)
						let loserList = sectionList.map(el => el.loser)
						let users = {}
						winnerList.forEach(el => {
							if (users[el.userId]) {
								users[el.userId].winMatch += el.tag == '补分' ? 0 : 1
								users[el.userId].win += el.tag == '补分' ? 0 : Number(el.win)
								users[el.userId].fail += el.tag == '补分' ? 0 : Number(el.fail)
								users[el.userId].integral += Number(el.integral)
							} else {
								users[el.userId] = {
									userId: el.userId,
									nickname: el.nickname,
									avatar: el.avatar,
									level: el.level,
									score: el.score,
									winMatch: el.tag == '补分' ? 0 :1,
									failMatch: 0,
									win: el.tag == '补分' ? 0 : Number(el.win),
									fail: el.tag == '补分' ? 0 : Number(el.fail),
									integral: Number(el.integral)
								}
							}
						})
						loserList.forEach(el => {
							if (users[el.userId]) {
								users[el.userId].failMatch += el.tag == '补分' ? 0 : 1
								users[el.userId].win += el.tag == '补分' ? 0 : Number(el.win)
								users[el.userId].fail += el.tag == '补分' ? 0 : Number(el.fail)
								users[el.userId].integral += Number(el.integral)
							} else {
								users[el.userId] = {
									userId: el.userId,
									nickname: el.nickname,
									avatar: el.avatar,
									level: el.level,
									score: el.score,
									winMatch: 0,
									failMatch: el.tag == '补分' ? 0 :1,
									win: el.tag == '补分' ? 0 : Number(el.win),
									fail: el.tag == '补分' ? 0 : Number(el.fail),
									integral: Number(el.integral)
								}
							}
						})

						Object.keys(users).forEach((userId) => {
							let fight = {};
							res.result.data.forEach((el) => {
								if (el.winner.nickname !== '补分选手' && el.loser.nickname !==
									'补分选手') {
									if (el.winner.userId === userId) { //如果是胜者
										if (fight[el.loser.userId]) { //之前计算过胜利
											fight[el.loser.userId].win += el.winner.win * 1
											fight[el.loser.userId].fail += el.winner.fail * 1
											if (fight[el.loser.userId].winMatchNum) {
												fight[el.loser.userId].winMatchNum += 1;
											} else {
												fight[el.loser.userId].winMatchNum = 1;
											}
										} else { //没有计算过胜利
											fight[el.loser.userId] = {
												userId: el.loser.userId,
												nickname: el.loser.nickname,
												avatar: el.loser.avatar,
												win: el.winner.win * 1,
												fail: el.winner.fail * 1,
												winMatchNum: 1,
											};
										}
									}
									if (el.loser.userId === userId) {
										if (fight[el.winner.userId]) {
											fight[el.winner.userId].win += el.loser.win * 1
											fight[el.winner.userId].fail += el.loser.fail * 1
											if (fight[el.winner.userId].failMatchNum) {
												fight[el.winner.userId].failMatchNum += 1;
											} else {
												fight[el.winner.userId].failMatchNum = 1;
											}
										} else {
											fight[el.winner.userId] = {
												userId: el.winner.userId,
												nickname: el.winner.nickname,
												avatar: el.winner.avatar,
												fail: el.loser.fail * 1,
												win: el.loser.win * 1,
												failMatchNum: 1
											};
										}
									}
								}
							});
							users[userId].fight = fight
						});
						// that.users = users
						// that.$set(that, 'users', users)
						// console.log(that.users, '*******');
						if (!Object.keys(users).length) {
							return []
						}
						let tempList = Object.keys(users).map(key => users[key])
						console.log('tempList', tempList);
						let bufenIndex = tempList.findIndex(el => el.nickname === '补分选手')
						if (bufenIndex !== -1) {
							tempList.splice(bufenIndex, 1)
						}
						tempList = tempList.map(user => {
							return {
								avatar: user.avatar,
								nickname: user.nickname,
								integral: user.integral,
								rate: Math.ceil(((user.winMatch || 0) / (((user.winMatch || 0) + (user.failMatch || 0))>0?((user.winMatch || 0) + (user.failMatch || 0)):1)) *
									100),
								KD: Number((user.win || 0) / (user.fail || 1)).toFixed(2),
								winMatch: user.winMatch,
								failMatch: user.failMatch,
								win: user.win,
								fail: user.fail,
								fight: user.fight
							}
						})
						
						let integralFirst = tempList.sort((a, b) => {
							return b.integral - a.integral
						})[0]
						let rateFirst = tempList.sort((a, b) => {
							return b.rate - a.rate
						})[0]
						let KDFirst = tempList.sort((a, b) => {
							return b.KD - a.KD
						})[0]
						that.bannerList = [integralFirst, rateFirst, KDFirst]
						console.log(that.bannerList);
					}
				})
			},
			addMatch() {
				let that = this
				console.log(this.formData, 'formData');
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
				this.formData = Object.assign({}, this.formData, match)
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
					baseScore: 0,
					name: '',
					desc: '',
					image: '',
					createTime: new Date(),
					rules: {
						// baseIntegral: 500,
						sameRuleWin: 100,
						sameRuleFail: -80,
						unSameRuleLowLevelWin: 100,
						unSameRuleLowLevelFail: -40,
						unSameRuleHighLevelWin: 80,
						unSameRuleHighLevelFail: -100,
					}
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
				console.log(match, 'match');
				uni.navigateTo({
					url: `/pages/match/detail?matchBaseInfo=${encodeURIComponent(JSON.stringify(match))}`
				})
			},
			handleMall(){
				uni.navigateTo({
					url: '/pages/mall/home'
				})
			},
			hanldeSignBoard(){
				uni.navigateTo({
					url: '/pages/sign/board'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	@keyframes bannerImageScale {

		0%,
		100% {
			transform: scale(1);
		}

		50% {
			transform: scale(0.98);
		}
	}

	@keyframes move {
		from {
			transform: rotateZ(360deg);
		}

		to {
			transform: rotateZ(0deg);
		}
	}

	@keyframes textShake {
		25% {
			transform: translateX(-4px) rotate(-5deg);
		}

		50%,
		0%,
		100% {
			transform: translateX(0px) rotate(0deg);
		}

		75% {
			transform: translateX(4px) rotate(5deg);
		}

	}

	.divContainer {
		font-size: 16px;
		// background-color: #57b65a;
	}

	.divContent {
		// background: -webkit-linear-gradient(right, #409EFF, transparent, transparent, transparent, transparent, transparent, transparent, #F56C6C);
	}

	.card {
		position: relative;

		// margin-top: 10px;
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
		height: 80vh;

		.form-header {
			display: flex;
			justify-content: space-between;
			background: #ffffff;
			padding: 10px;
			position: sticky;
			top: 0;
		}

		.scroll-Y {
			height: 100%;
			padding: 10px 20px 40px;
			box-sizing: border-box;
		}
	}

	.btn-container {
		text-align: right;

		.btn {
			margin-left: 4px;
		}
	}

	.user-container {
		display: flex;
		height: 100%;
		width: 100%;
		// background: linear-gradient(145deg,  #41d8DD, #F5CCF6);
		position: absolute;
		z-index: 3;

		.user-left {
			flex: 1;
			height: 100%;
			display: flex;
			flex-direction: column;
			z-index: 2;
			position: relative;

			.banner-img {
				padding: 4px;
				width: 100%;
				height: 100%;
				// border: 2px solid #ffd700;
				box-sizing: border-box;
				margin: 8px;
				// box-shadow: 2px 2px 6px #666;
				border-radius: 4px;
				position: relative;
				z-index: 2;

				// animation: bannerImageScale 4s infinite;
				&::after {
					content: '';
					position: absolute;
					left: 50%;
					top: 50%;
					width: 100%;
					height: 100%;
					background: linear-gradient(180deg, #409EFF, #F56C6C);
					animation: move 3s linear infinite;
					transform-origin: 0 0;
					z-index: -2;
				}

				&::before {
					content: '';
					width: calc(100% - 4px);
					height: calc(100% - 4px);
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					background-color: #fff;
					z-index: -1;
				}
			}
		}

		.user-right {
			flex: 1;
			height: 100%;
			padding: 40px 10px 10px;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			justify-content: center;
			position: relative;
			z-index: 2;
			// align-items: center;			
		}
	}

	.user-title {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.title-name {
		// color: #ffd700;
		animation: bannerImageScale 4s infinite;
		color: #ffd700;
		font-size: 35px;
		text-shadow: 2px 2px 4px #fff;
	}

	.user-info {
		display: flex;
		align-items: center;
		justify-content: space-around;
	}

	.title {
		// color: #409EFF;
	}

	.tag {
		position: absolute;
		top: 8px;
		right: 8px;
	}

	.text {
		margin-top: 8px;
		color: #333;
		// text-shadow: 2px 2px #F56C6C;
		font-size: 30px;
		// background: linear-gradient(145deg, #409EFF, #F56C6C);
		// -webkit-background-clip: text;
		// -webkit-text-fill-color: transparent;
		// text-shadow: 2px 2px 2px #aaa;
		// animation: textShake 300ms infinite ;
	}

	.swiper {
		// padding: 15px;
		background: #f5f5f5;

		.swiper-item {
			position: absolute;
			background-color: rgba(85, 170, 255, 0.1);
			z-index: 2;
			// background: #ffffff;
		}
	}

	.desc {
		color: #cccccc;
	}

	.chooseAvatar {
		border: dotted 1px #ddd;
		border-radius: 10px;
		text-align: center;
		width: 75px;
		height: 40px;
		line-height: 40px;
	}


	// 雨滴特效
	.rain {
		position: absolute;
		width: 5px;
		height: 60px;
		border-radius: 0 0 5px 5px;
		animation: dropRain 5s linear infinite;
		z-index: 1;
	}

	.rain:nth-child(3n+1) {
		background: linear-gradient(transparent, deeppink);
	}

	.rain:nth-child(3n+2) {
		background: linear-gradient(transparent, gold);
	}

	.rain:nth-child(3n+3) {
		background: linear-gradient(transparent, skyblue);
	}

	@keyframes dropRain {
		0% {
			transform: translateY(-200px);
		}

		100% {
			transform: translateY(300px);
		}
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
	.menu-list{
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		padding: 16px 0;
		color: #333;
		.menu-item{
			font-size: 24rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>
