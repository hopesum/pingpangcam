'use strict';
let ID = 'wwde066e39a63d0765'
let SECRET = 'Qj3HjrIzMYG7q2A7ojYPbn0kMbdNFO4Ils_AstskNew'
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let params = event.params || {}
	let res
	switch (event.action) {
		case 'sendDDMsg':
			res = await uniCloud.httpclient.request(
				'https://oapi.dingtalk.com/robot/send?access_token=a965b04df505a3bd696a896636b4696f308575d057f76302405e6a5266918e2a', {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					dataType: "json",
					data: params
				})
			break
		case 'sendQYWXMsg':
			res = await uniCloud.httpclient.request(
				`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=3302ee8f-5ced-4881-8176-d2d961723524`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					dataType: "json",
					data: params
				})
			break
		case 'sendQYWX':
			let res1 = await uniCloud.httpclient.request(
				`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${ID}&corpsecret=${SECRET}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json"
					},
					dataType: "json"
				})
			let ACCESS_TOKEN = res1.data.access_token
			res = await uniCloud.httpclient.request(
				`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${ACCESS_TOKEN}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					dataType: "json",
					data: params
				})
			break
		default:
			break
			return res
	}
	//返回数据给客户端
	return res
};
