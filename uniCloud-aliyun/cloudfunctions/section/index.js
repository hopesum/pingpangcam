'use strict';
const db = uniCloud.database()
let collection = db.collection('section')
let usersCollection = db.collection('uni-id-users')
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let params = event.params || {}
	let res = {}
	let userListRes = await usersCollection.get()
	let userList = userListRes.data
	const count = await collection.count()
	let pageSize = 100
	let pageTotalNum = Math.ceil(count.total / pageSize)
	switch (event.action) {
		case 'addSection':
			res = await collection.add(params)
			break
		case 'getSectionInfo':
			res = await collection.where({
				_id: params._id
			}).get()
			break
		case 'getSectionList':
			res = await collection.where({
				matchId: params.matchId
			}).orderBy('createTime', 'desc').get()
			res.data.forEach(section => {
				let judge = userList.find(user => user._id === section.createUser)
				section.createUserName = judge.nickname
				let winner = userList.find(user => user._id === section.winner.userId)
				let loser = userList.find(user => user._id === section.loser.userId)
				section.winner.nickname = winner.nickname
				winner.avatar_file.url ? section.winner.avatar = winner.avatar_file.url : ''
				section.loser.nickname = loser.nickname
				loser.avatar_file.url ? section.loser.avatar = loser.avatar_file.url : ''
			})
			break
		case 'getUserSectionList':
			let res1 = []
			let res2 = []
			for (let i = 0; i < pageTotalNum; i++) {
				let winList = await collection.where({
					winner: {
						userId: params.userId
					}
				}).orderBy('createTime', 'desc').skip(i * pageSize).get()
				let loseList = await collection.where({
					loser: {
						userId: params.userId
					}
				}).orderBy('createTime', 'desc').skip(i * pageSize).get()
				res1 = [...res1, ...winList.data]
				res2 = [...res2, ...loseList.data]
			}
			res = {
				data: [...res1, ...res2].sort((a, b) => {
					return b.createTime - a.createTime
				})
			}
			res.data.forEach(section => {
				let judge = userList.find(user => user._id === section.createUser)
				section.createUserName = judge.nickname
				let winner = userList.find(user => user._id === section.winner.userId)
				let loser = userList.find(user => user._id === section.loser.userId)
				section.winner.nickname = winner.nickname
				winner.avatar_file.url ? section.winner.avatar = winner.avatar_file.url : ''
				section.loser.nickname = loser.nickname
				loser.avatar_file.url ? section.loser.avatar = loser.avatar_file.url : ''
			})
			break
		case 'getUserAllSectionList':
			let res11 = []
			let res22 = []
			for (let i = 0; i < pageTotalNum; i++) {
				let winList = await collection.where({
					winner: {
						userId: params.userId
					}
				}).orderBy('createTime', 'desc').skip(i * pageSize).get()
				let loseList = await collection.where({
					loser: {
						userId: params.userId
					}
				}).orderBy('createTime', 'desc').skip(i * pageSize).get()
				res11 = [...res11, ...winList.data]
				res22 = [...res22, ...loseList.data]
			}
			res = {
				data: [...res11, ...res22].sort((a, b) => {
					return b.createTime - a.createTime
				})
			}
			res.data.forEach(section => {
				let judge = userList.find(user => user._id === section.createUser)
				section.createUserName = judge.nickname
				let winner = userList.find(user => user._id === section.winner.userId)
				let loser = userList.find(user => user._id === section.loser.userId)
				section.winner.nickname = winner.nickname
				winner.avatar_file.url ? section.winner.avatar = winner.avatar_file.url : ''
				section.loser.nickname = loser.nickname
				loser.avatar_file.url ? section.loser.avatar = loser.avatar_file.url : ''
			})
			break
		case 'getAllSectionList':
			let res3 = []
			for (let i = 0; i < pageTotalNum; i++) {
				let list = await collection.orderBy('createTime', 'desc').skip(i * pageSize).get()
				res3 = [...res3, ...list.data]
			}
			res.data = res3
			res.data.forEach(section => {
				let judge = userList.find(user => user._id === section.createUser)
				section.createUserName = judge.nickname
				let winner = userList.find(user => user._id === section.winner.userId)
				let loser = userList.find(user => user._id === section.loser.userId)
				section.winner.nickname = winner.nickname
				winner.avatar_file.url ? section.winner.avatar = winner.avatar_file.url : ''
				section.loser.nickname = loser.nickname
				loser.avatar_file.url ? section.loser.avatar = loser.avatar_file.url : ''
			})
			break
		case 'deleteSection':
			res = await collection.doc(params._id).remove()
			break
		case 'updateSection':
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
