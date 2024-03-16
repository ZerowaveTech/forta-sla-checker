const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron')
const token = process.env.TOKEN_TELEGRAM


const fetchSLA = async (scanneraddress,startTime, endTime) => {
    let response
    if (startTime && endTime){
        response = await fetch(`https://api.forta.network/stats/sla/scanner/${scanneraddress}?startTime=${endTime}&endTime=${startTime}&showMinutes=true`,)
        const data = await response.json()
        return data
    }
    response = await fetch(`https://api.forta.network/stats/sla/scanner/${scanneraddress}`)
    const data = await response.json()
    return data
}

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, () => {
    bot.sendMessage(msg.chat.id, 
        'Welcome to Checker for Forta Node Scanner\nFor Help "\help"\nFor Monitor Scanner Node : \monitor')
})

bot.onText(/\/monitor/, async (msg) => {
    const scannerAddress = msg.text.split(' ')[1]
    cron.schedule('*/20 * * * * *', async () => {
        const getSla = await fetchSLA(scannerAddress)
        const slaScrore = getSla.statistics.avg
        if(slaScrore <= 0.85){
            bot.sendMessage(msg.chat.id, `${new Date().toISOString()} : ${scannerAddress} SLA Score ${slaScrore} Please check your scanner node`)
            return
        }
        bot.sendMessage(msg.chat.id, `${new Date().toISOString()} : ${scannerAddress} SLA Score ${slaScrore}`)
    })
})