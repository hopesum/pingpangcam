'use strict';
const db = uniCloud.database()
let collection = db.collection('notice')
exports.main = async (event, context) => {
	//event为客户端上传的参数
	  let params = event.params || {}
		let res
	switch (event.action) {
		case 'addNotice':
		res = await collection.add(params)
		break
		case 'getNoticeInfo':
		res = await collection.where({_id: params._id}).get()
		break
		case 'getNoticeList':
		res = await collection.where({matchId: params.matchId}).orderBy('createTime', 'desc').get()
		break
		case 'deleteNotice':
		res = await collection.doc(params._id).remove()
		break
		case 'updateNotice':
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

