'use strict';
const db = uniCloud.database()
let collection = db.collection('uni-id-users')
exports.main = async (event, context) => {
	//event为客户端上传的参数
	  let params = event.params || {}
		let res
	switch (event.action) {
		case 'addUser':
		res = await collection.add(params)
		break
		case 'getUserInfo':
		res = await collection.where({_id: params._id}).get()
		break
		case 'getUserList':
		res = await collection.get()
		break
		case 'deleteUser':
		res = await collection.doc(params._id).remove()
		break
		case 'updateUser':
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

