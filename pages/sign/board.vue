<template>
	<view class="divContainer">
		<view class="chart-switch">
			<switch @change="switchChange($event)" style="transform:scale(0.7)">切换</switch>
		</view>
		<uni-card margin="20px 0px" padding="0px" class="card" v-for="(user, index) in tableData" :key="index"
			:title="user.nickname" :extra="'NO.' + String(++index)" :thumbnail="user.avatar">
			<view class="divContent">
				<view v-if="show" class="charts-box">
					<qiun-data-charts type="arcbar" :opts="opts(user.data)" :chartData="user.chartData" />
				</view>
				<view v-else class="calendar-box">
					<uni-calendar :selected="user.signRecordList" :showMonth="false"></uni-calendar>
				</view>
			</view>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: false,
				tableData: [],
			};
		},
		onLoad() {
			this.getRecord();
		},
		methods: {
			opts(data) {
				let textcolor =
					data > 0.75 ? "#3CA272" : data > 0.5 ? "#FAC858" : "#F56C6C";
				return {
					color: [
						"#1890FF",
						"#91CB74",
						"#FAC858",
						"#EE6666",
						"#73C0DE",
						"#3CA272",
						"#FC8452",
						"#9A60B4",
						"#ea7ccc",
					],
					padding: undefined,
					title: {
						name: "出勤率",
						color: "#666666",
					},
					subtitle: {
						name: data,
						fontSize: 40,
						color: textcolor
					},
					extra: {
						arcbar: {
							type: "circle",
							width: 2,
							backgroundColor: "#E9E9E9",
							startAngle: 1.5,
							endAngle: 0.25,
							gap: 2,
						},
					},
				}
			},
			switchChange(e) {
				this.show = e.detail.value
			},
			getDate() {
				const currentDate = new Date();
				const millisecond = 1000 * 60 * 60 * 24;
				const day = currentDate.getDate() || 30;
				const startTime = new Date(currentDate.getTime() - day * millisecond);
				return startTime;
			},
			dateFormat(time, flag) {
				let date = new Date(time);
				let year = date.getFullYear();
				let month =
					date.getMonth() + 1 < 10 ?
					"0" + (date.getMonth() + 1) :
					date.getMonth() + 1;
				let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
				let hours =
					date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
				let minutes =
					date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
				let seconds =
					date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
				if (flag) {
					return (
						year +
						"-" +
						month +
						"-" +
						day +
						" " +
						hours +
						":" +
						minutes +
						":" +
						seconds
					);
				}
				return year + "-" + month + "-" + day;
			},
			getRecord() {
				uni.showLoading();
				let that = this;
				let data = {
					action: "getSignMonthList",
					params: {
						startTime: this.getDate(),
						endTime: new Date(),
					},
				};
				uniCloud.callFunction({
					name: "signRecord",
					data,
					success(res) {
						uni.hideLoading();
						//对res返回的数据通过userId进行分组
						let data = res.result.data;
						let groupData = {};
						data.forEach((item) => {
							if (groupData[item.userId]) {
								groupData[item.userId].push(item);
							} else {
								groupData[item.userId] = [item];
							}
						});
						let date = new Date();
						let year = date.getFullYear();
						let month = date.getMonth() + 1;
						let day = new Date(year, month, 0).getDate();
						Object.keys(groupData).forEach((key) => {
							let user = groupData[key][groupData[key].length - 1];
							let signCount = groupData[key].length;
							let signDays = groupData[key].map((item) => item.createTime);
							let data = (signCount / day).toFixed(2) * 1;
							let color =
								data > 0.75 ? "#3CA272" : data > 0.5 ? "#FAC858" : "#F56C6C";
							let res1 = {
								series: [{
									name: "出勤率",
									color,
									data,
								}, ],
							};

							let chartData = JSON.parse(JSON.stringify(res1));

							that.tableData.push({
								avatar: user.avatar ||
									"https://w.wallhaven.cc/full/v9/wallhaven-v9w635.jpg",
								nickname: user.userName,
								signCount,
								signDays,
								data,
								chartData,
								signRecordList: signDays.map((el) => {
									return {
										date: that.dateFormat(el),
									};
								}),
							});
							that.tableData.sort((a, b) => b.data - a.data);
						});
					},
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
	.divContainer {
		.chart-switch {
			height: 80rpx;
			line-height: 80rpx;
			background-color: #f5f5f5;
			text-align: right;
		}
		.charts-box{
			padding: 40px;
		}
	}
</style>
