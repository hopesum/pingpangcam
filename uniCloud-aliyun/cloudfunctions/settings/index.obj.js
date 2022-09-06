'use strict';
let showVideo = false
let baseRandom = 100
let reward = [
	[40, 0.1],
	[20, 0.1],
	[30, 0.1],
	[45, 0.1],
]
let notice = '打卡奖励开启，每日只能获取一次奖励积分，最高可随机获取100积分，获取的积分将计入总积分，快来打卡参与吧！'
let baseWeight = 500
let goodsList = [
		{id:'0',title:'可乐*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/可乐.2c10znbzvdno.jpeg',price:baseWeight*3*10},
		{id:'1',title:'雪碧*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/雪碧.1tzjh802f2e.jpeg',price:baseWeight*3*10},
		{id:'2',title:'怡宝*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/怡宝.iea9p5f7bg8.jpeg',price:baseWeight*2*10},
		{id:'3',title:'农夫山泉*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/农夫山泉.7b5fnxyezkg0.jpeg',price:baseWeight*2*10},
		{id:'4',title:'普狂3*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/普狂.3h7w8g7utxi0.jpeg',price:baseWeight*90*10},
		{id:'5',title:'橙省狂3*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/橙省狂.5jd22p10n440.jpeg',price:baseWeight*150*10},
		{id:'6',title:'蓝省狂3*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/蓝省狂.2ouj0o2o2bw0.jpeg',price:baseWeight*180*10},
		{id:'7',title:'CJ8000*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/草鸡八千.2m23f4rg9di0.jpeg',price:baseWeight*50*10},
		{id:'8',title:'DOCIN F1*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/多尼克f1.6o04u0o4j5w0.jpeg',price:baseWeight*170*10},
		{id:'9',title:'ROZENA套胶*1',url:'https://cdn.staticaly.com/gh/yuguaa/images@master/rozena.6ug45n93cww0.jpeg',price:baseWeight*190*10},
	]
module.exports = {
	getSettings() {
		return showVideo
	},
	getBaseRandom() {
		return baseRandom
	},
	getNotice() {
		return notice
	},
	getReward() {
		return reward
	},
	getGoodsList(){
		return goodsList
	}
}
