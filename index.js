// 引用linebot套件
import linebot from 'linebot'
// 引用dotenv套件
import dotenv from 'dotenv'
// 引用resquest 套件
import rp from 'request-promise'
// 讀取emv檔
dotenv.config()
// 宣告機器人的資訊
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

const getMonth = async (month) => {
  let arr = []
  let msg = ''
  try {
    const data = await rp({ uri: 'https://bangumi.bilibili.com/web_api/timeline_global', json: true })
    for (const d of data.result) {
      const mon = d.date.split('-')[0]
      if (mon === month) {
        for (const s of d.seasons) {
          if (!arr.includes(s.title)) arr.push(s.title)
        }
      }
    }
    msg = arr.join('\n')
  } catch (error) {
    msg = '發生錯誤'
  }

  return msg
}
let search = ''
let re = {}
const getImg = async (event) => {
  let msg = ''
  try {
    const data = await rp({ uri: 'https://bangumi.bilibili.com/web_api/timeline_global', json: true })
    for (let i = 0; i < data.result.length; i++) {
      for (let j = 0; j < data.result[i].seasons.length; j++) {
        if (data.result[i].seasons[j].title === search) {
          // re = {
          //   type: 'image',
          //   originalContentUrl: data.result[i].seasons[j].cover,
          //   previewImageUrl: data.result[i].seasons[j].cover
          // }
          re = {
            type: 'text',
            text: data.result[i].seasons[j].url
          }
        }
      }
    }
  } catch (error) {
    msg = '發生錯誤'
  }
  // return re
  // console.log(re)
}
// getImg()
// 當收到訊息時
bot.on('message', async (event) => {
  search = event.message.text
  let msg = ''
  if (event.message.type === 'text') {
    // const text = event.message.text
    if (search.includes('月')) {
      msg = await getMonth(search.substr(0, 1))
    } else {
      await getImg()
      msg = re
    }
  }
  console.log(msg)
  event.reply(msg)
})

// 在port 啟動
bot.listen('/', process.env.PORT, () => {
  console.log('機器人啟動')
})
