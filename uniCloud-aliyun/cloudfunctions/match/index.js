'use strict';
const db = uniCloud.database()
let collection = db.collection('match')
exports.main = async (event, context) => {
	//event为客户端上传的参数
	  let params = event.params || {}
		let res
	switch (event.action) {
		case 'addMatch':
		res = await collection.add(params)
		break
		case 'getMatchInfo':
		res = await collection.where({_id: params._id}).get()
		break
		case 'getMatchList':
		res = await collection.orderBy('createTime', 'desc').get()
		break
		case 'deleteMatch':
		res = await collection.doc(params._id).remove()
		break
		case 'updateMatch':
		const postData = Object.assign({},params)
		delete postData._id
		res = await collection.doc(params._id).update(postData)
		default:
		break
		return res
	}
	//返回数据给客户端
	return res
};

