'use strict';
const db = uniCloud.database()
let collection = db.collection('signRecord')
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let params = event.params || {}
	let res = {}
	const count = await collection.count()
	let pageSize = 100
	let pageTotalNum = Math.ceil(count.total / pageSize)
	switch (event.action) {
		case 'addSignRecord':
			res = await collection.add(params)
			break
		case 'getSignRecordInfo':
			res = await collection.where({
				_id: params._id
			}).get()
			break
		case 'getSignRecordListAdmin':
			let res3 = []
			for (let i = 0; i < pageTotalNum; i++) {
				let list = await collection.orderBy('createTime', 'desc').skip(i * pageSize).get()
				res3 = [...res3, ...list.data]
			}
			res.data = res3
			break
		case 'getSignRecordList':
			let res2 = []
			for (let i = 0; i < pageTotalNum; i++) {
				let list = await collection.where({
					userId: params.userId
				}).orderBy('createTime', 'desc').skip(i * pageSize).get()
				res2 = [...res2, ...list.data]
			}
			res.data = res2
			break
		case 'deleteSignRecord':
			res = await collection.doc(params._id).remove()
			break
		case 'updateSignRecord':
			const postData = Object.assign({}, params)
			delete postData._id
			res = await collection.doc(params._id).update(postData)
		default:
			break
			return res
	}
	//返回数据给客户端
	return res
};
