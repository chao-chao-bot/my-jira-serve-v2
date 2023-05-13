const db = require('../db/index')
const { connectToDatabase } = require('../db/index')
//获取 user_id 所在团队的 leader 列表  项目的负责人就是团队leader 首先找到和自己有关的团队 通过团队获取到 leader 这里的通过团队是两种身份一种是队员 一种是leader
exports.getTeamLeader = async (req, res) => {
  const db = await connectToDatabase()
  const user_id = req.user_id
  const memberSql = `select team_id from team_members where user_id = ${user_id}`
  const [members] = await db.query(memberSql)
  const leaderSQl = `select distinct team_leader_id from teams where team_leader_id = ${user_id}`
  const [leaders] = await db.query(leaderSQl)
  const team_leaders = [...leaders]
  for (let i = 0; i < members.length; i++) {
    const sql = `select  team_leader_id from teams where team_id = ${members[i].team_id}`
    const [res] = await db.query(sql)
    team_leaders.push(res[0])
  }
  const uniqueArr = []
  const seen = {}
  for (let i = 0; i < team_leaders.length; i++) {
    const item = team_leaders[i]
    const id = item.team_leader_id
    if (!seen[id]) {
      uniqueArr.push(item)
      seen[id] = true
    }
  }
  const result = []
  for (let i = 0; i < uniqueArr.length; i++) {
    const sql = `select user_id as team_leader_id,username as leader_name from users where users.user_id = ${uniqueArr[i].team_leader_id}`
    const [res] = await db.query(sql)
    result.push(res[0])
  }
  res.ssend(result)
  await db.end()
}
