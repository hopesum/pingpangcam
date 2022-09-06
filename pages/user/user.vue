<template>
	<view>
		<uni-card v-for="(user,index) in userList" :key="index" :title="user.nickname" :thumbnail="user.avatar_file.url"
			:extra="user.role">
			{{user._id}}
			<template v-slot:actions>
				<view class="btn-container">
					<button class="uni-button btn" size="mini" type="default"
						@click.stop="cancleAdmin(user)">取消管理</button>
					<button class="uni-button btn" size="mini" type="primary" @click.stop="setAdmin(user)">设为管理</button>
					<button class="uni-button btn" size="mini" type="warn" @click.stop="deleteUser(user)">删除</button>
				</view>
			</template>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userList: []
			}
		},
		onLoad() {
			this.initialize()
		},
		async onPullDownRefresh() {
			await this.initialize()
			uni.stopPullDownRefresh()
		},
		methods: {
			async initialize() {
				let that = this
				await uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'getUserList'
					},
					success(res) {
						that.userList = res.result.data
					}
				})
			},
			cancleAdmin(user) {
				let that = this
				uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'updateUser',
						params:{
							...user,
							role:[]
						}
					},
					success() {
						that.initialize()
					}
				})
			},
			setAdmin(user) {
				let that = this
				uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'updateUser',
						params:{
							...user,
							role:['admin']
						}
					},
					success() {
						that.initialize()
					}
				})
			},
			deleteUser(user) {//TODO:unicloud bug , _vm.deleteUser is not a function，无法删除
				let that = this
				uniCloud.callFunction({
					name: 'user',
					data: {
						action: 'deleteUser',
						params:user
					},
					success() {
						that.initialize()
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.btn-container {
		text-align: right;

		.btn {
			margin-left: 4px;
		}
	}
</style>
