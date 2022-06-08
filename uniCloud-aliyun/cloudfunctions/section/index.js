'use strict';
const db = uniCloud.database()
let collection = db.collection('section')
exports.main = async (event, context) => {
	//event为客户端上传的参数
	  let params = event.params || {}
		let res
	switch (event.action) {
		case 'addSection':
		res = await collection.add(params)
		break
		case 'getSectionInfo':
		res = await collection.where({_id: params._id}).get()
		break
		case 'getSectionList':
		res = await collection.where({matchId: params.matchId}).orderBy('createTime', 'desc').get()
		break
		case 'getUserSectionList':
		let res1 = await collection.where({matchId: params.matchId,winner:{userId:params.userId}}).orderBy('createTime', 'desc').get()
		let res2 = await collection.where({matchId: params.matchId,loser:{userId:params.userId}}).orderBy('createTime', 'desc').get()
		res = {data:[...res1.data,...res2.data].sort((a,b)=>{return b.createTime-a.createTime})}
		break
		case 'getUserAllSectionList':
		let res11 = await collection.where({winner:{userId:params.userId}}).orderBy('createTime', 'desc').get()
		let res22 = await collection.where({loser:{userId:params.userId}}).orderBy('createTime', 'desc').get()
		res = {data:[...res11.data,...res22.data].sort((a,b)=>{return b.createTime-a.createTime})}
		break
		case 'getAllSectionList':
		res = await collection.orderBy('createTime', 'desc').get()
		break
		case 'deleteSection':
		res = await collection.doc(params._id).remove()
		break
		case 'updateSection':
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

