/**
  * @INFO
  * @github https://github.com/Tae5609
  * @author ᴛᴀᴇ5609シ#2855
  */

const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const mongoose = require('mongoose');
const chalk = require('chalk');
const delay = require('delay');
const moment = require('moment-timezone');
const { letterTrans } = require('custom-translate');
const { Client } = require('unb-api');
const unb_client = new Client('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiI5MDI3NTMwMTA5NTcwMjU2NDQiLCJpYXQiOjE2MzUzMDM0OTB9.ZkFl14MgK2yvxjv1EaydZqCNGfxEVQBl3DT0JKT1Y70');
const dictionary = {
    "0": "0️⃣",
    "1": "1️⃣",
    "2": "2️⃣",
    "3": "3️⃣",
    "4": "4️⃣",
    "5": "5️⃣",
    "6": "6️⃣",
    "7": "7️⃣",
    "8": "8️⃣",
    "9": "9️⃣"
};

global.user_db = require('./models/user.js');
global.lottery_db = require('./models/lottery.js');

const disbut = require('discord-buttons');
disbut(client);

mongoose.connect(config.db_url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => {
    console.log(chalk.hex('#7dffa0')('[DATABASE] DataBase Connected!'));
    client.login(config.token);
});

client.on('ready', () => {
    console.log(chalk.hex('#96e0ff')(`[BOT] Login as ${client.user.tag}!`));
});

client.on('message', async msg => {
    if (msg.channel.id === config.topup.ch) {
        if (msg.author.bot) return;

        if (!msg.content.startsWith(config.topup.prefix)) return;


        const args = msg.content.slice(config.topup.prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();

        if (command === "pay") {
            if (!args[0] || !args[1]) return;
            if (isNaN(args[1])) return;

            if (args[0].includes(client.user.id)) {
                var msg_collect = await msg.channel.awaitMessages(res => res.author.id === config.topup.bot, {
                    max: 1,
                    time: 60000
                });

                if (!msg_collect.size) return;

                var embed_des = msg_collect.first().embeds[0].description;
                if (!embed_des.includes(config.topup.keyword)) return;

                var embed_des_fresh = embed_des.replace('<:check:773218860840648725>', '').replace('<a:Coin:850678439572537365>', '').replace(client.user.id, '');
                var numbers_amout = embed_des_fresh.match(/\d/g);
                numbers_amout = parseInt(numbers_amout.join(""));

                if (isNaN(numbers_amout)) return;

                let user_c = await user_db.findOne({ guild: msg.guild.id, user: msg.author.id });
                if (!user_c) {
                    let data_save = new user_db({ _id: new mongoose.Types.ObjectId(), guild: msg.guild.id, user: msg.author.id });
                    data_save.save();
                    await delay(1200);
                };

                await user_db.findOne({ guild: msg.guild.id, user: msg.author.id }, function (err, userDoc) {
                    if (err) {
                        return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                    } else {
                        if (!userDoc || userDoc == null) return msg.channel.send({ content: `\`[❌]\` \`|\` เกิดข้อผิดพลาดกรุณาติดต่อแอดมินเพื่อเพิ่มเงิน\n\nระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)` });

                        userDoc.money += numbers_amout;
                        userDoc.save(function (err) {
                            if (err) {
                                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                            };
                        });
                    };
                });

                return msg.reply(`[\`✅\`] \`|\` ระบบได้ทำการเติมเงินเรียบร้อยแล้วจำนวน \`${new Intl.NumberFormat('en').format(numbers_amout)}\` ${config.emoji.money}\n\nระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)`);
            };
        };
    };

    if (msg.author.bot) return;

    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;

    const args = msg.content.slice(config.prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (command === "withdrawn") {
        let not_number = new Discord.MessageEmbed()
            .setDescription(`\`[⚠️]\` \`|\` กรุณาใส่จำนวนเงินด้วย (1 - 10000000 ${config.emoji.money})`)
            .setColor('#fcfa72')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
        if (isNaN(args[0])) return msg.channel.send(not_number);
        if (args[0] < 1 || args[0] > 10000000) return msg.channel.send(not_number);

        var user_money_unb = await unb_client.getUserBalance(msg.guild.id, msg.author.id);
        if (!user_money_unb) {
            let no_bal = new Discord.MessageEmbed()
                .setDescription(`\`[⚠️]\` \`|\` ไม่พบกระเป๋าเงินของคุณ`)
                .setColor('#fcfa72')
                .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
            return msg.channel.send(no_bal);
        };

        let user_c = await user_db.findOne({ guild: msg.guild.id, user: msg.author.id });
        if (!user_c) {
            let data_save = new user_db({ _id: new mongoose.Types.ObjectId(), guild: msg.guild.id, user: msg.author.id })
            data_save.save();
            await delay(1200);
        };

        var user_money = await user_db.findOne({ guild: msg.guild.id, user: msg.author.id });

        if (user_money.money < args[0]) {
            let no_bal = new Discord.MessageEmbed()
                .setDescription(`\`[⚠️]\` \`|\` คุณมีเงินในระบบไม่พอ`)
                .setColor('#fcfa72')
                .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
            return msg.channel.send(no_bal);
        };

        unb_client.editUserBalance(msg.guild.id, msg.author.id, { cash: args[0], bank: 0 }, `เพิ่มเงินจากระบบหวย ${args[0]}`);

        await user_db.findOne({ guild: msg.guild.id, user: msg.author.id }, function (err, userDoc) {
            if (err) {
                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
            } else {
                if (!userDoc || userDoc == null) return msg.channel.send({ content: `\`[❌]\` \`|\` เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง` });

                userDoc.money -= parseInt(args[0]);
                userDoc.save(function (err) {
                    if (err) {
                        return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                    };
                });
            };
        });

        let embed_done = new Discord.MessageEmbed()
            .setDescription(`\`[✅]\` \`|\` ถอนเงินจำนวน ${new Intl.NumberFormat('en').format(args[0])} ${config.emoji.money} เข้ากระเป๋าตังของบอท UnbelievaBoat เรียบร้อยแล้ว`)
            .setColor('#8bff87')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
        return msg.channel.send(embed_done)
    } else if (command === "addmoney") {
        let status = false;
        config.admin.forEach(id => { if (id === msg.author.id) status = true });

        if (status === false) {
            let nopermission = new Discord.MessageEmbed()
                .setDescription(`\`[⚠️]\` \`|\` คุณไม่มีความสามารถพอที่จะทำ`)
                .setColor('#fcfa72')
            return msg.channel.send(nopermission)
        };

        var user = msg.mentions.members.first();

        let no_target = new Discord.MessageEmbed()
            .setDescription(`\`[⚠️]\` \`|\` กรุณาแท็คคนที่จะเพิ่มเงิน`)
            .setColor('#fcfa72')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
        let not_number = new Discord.MessageEmbed()
            .setDescription(`\`[⚠️]\` \`|\` กรุณาใส่จำนวนเงินด้วย (1 - 10000000 ${config.emoji.money})`)
            .setColor('#fcfa72')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')

        if (!user) return msg.channel.send(no_target);
        if (isNaN(args[1])) return msg.channel.send(not_number);
        if (args[1] < 1 || args[1] > 10000000) return msg.channel.send(not_number);

        let user_c = await user_db.findOne({ guild: msg.guild.id, user: user.id });
        if (!user_c) {
            let data_save = new user_db({ _id: new mongoose.Types.ObjectId(), guild: msg.guild.id, user: user.id })
            data_save.save();
            await delay(1200);
        };

        await user_db.findOne({ guild: msg.guild.id, user: user.id }, function (err, userDoc) {
            if (err) {
                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
            } else {
                if (!userDoc || userDoc == null) return msg.channel.send({ content: `\`[❌]\` \`|\` เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง` });

                userDoc.money += parseInt(args[1]);
                userDoc.save(function (err) {
                    if (err) {
                        return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                    };
                });
            };
        });

        let embed_done = new Discord.MessageEmbed()
            .setDescription(`\`[✅]\` \`|\` เพิ่มเงินจำนวน ${new Intl.NumberFormat('en').format(args[1])} ${config.emoji.money} ให้กับ ${user} เรียบร้อยแล้ว`)
            .setColor('#8bff87')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
        return msg.channel.send(embed_done)
    } else if (command === "delmoney") {
        let status = false;
        config.admin.forEach(id => { if (id === msg.author.id) status = true });

        if (status === false) {
            let nopermission = new Discord.MessageEmbed()
                .setDescription(`\`[⚠️]\` \`|\` คุณไม่มีความสามารถพอที่จะทำ`)
                .setColor('#fcfa72')
            return msg.channel.send(nopermission)
        };

        var user = msg.mentions.members.first();

        let no_target = new Discord.MessageEmbed()
            .setDescription(`\`[⚠️]\` \`|\` กรุณาแท็คคนที่จะเพิ่มเงิน`)
            .setColor('#fcfa72')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
        let not_number = new Discord.MessageEmbed()
            .setDescription(`\`[⚠️]\` \`|\` กรุณาใส่จำนวนเงินด้วย (1 - 10000000 ${config.emoji.money})`)
            .setColor('#fcfa72')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')

        if (!user) return msg.channel.send(no_target);
        if (isNaN(args[1])) return msg.channel.send(not_number);
        if (args[1] < 1 || args[1] > 10000000) return msg.channel.send(not_number);

        let user_c = await user_db.findOne({ guild: msg.guild.id, user: user.id });
        if (!user_c) {
            let data_save = new user_db({ _id: new mongoose.Types.ObjectId(), guild: msg.guild.id, user: user.id })
            data_save.save();
            await delay(1200);
        };

        await user_db.findOne({ guild: msg.guild.id, user: user.id }, function (err, userDoc) {
            if (err) {
                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
            } else {
                if (!userDoc || userDoc == null) return msg.channel.send({ content: `\`[❌]\` \`|\` เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง` });

                userDoc.money -= parseInt(args[1]);
                userDoc.save(function (err) {
                    if (err) {
                        return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                    };
                });
            };
        });

        let embed_done = new Discord.MessageEmbed()
            .setDescription(`\`[✅]\` \`|\` ลดเงินจำนวน ${new Intl.NumberFormat('en').format(args[1])} ${config.emoji.money} ให้กับ ${user} เรียบร้อยแล้ว`)
            .setColor('#8bff87')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
        return msg.channel.send(embed_done);
    } else if (command === "checkmoney") {
        var user = msg.mentions.users.first() || msg.author;

        let user_c = await user_db.findOne({ guild: msg.guild.id, user: user.id });
        if (!user_c) {
            let data_save = new user_db({ _id: new mongoose.Types.ObjectId(), guild: msg.guild.id, user: user.id })
            data_save.save();
            await delay(1200);
        };

        var avatar_url = user.avatarURL();
        if (avatar_url === null || avatar_url === undefined) avatar_url = config.no_avatar_link
        else avatar_url += "?size=512";

        var author_avatar_url = msg.author.avatarURL()
        if (author_avatar_url === null || author_avatar_url === undefined) author_avatar_url = config.no_avatar_link
        else author_avatar_url += "?size=512";

        let user_data = await user_db.findOne({ guild: msg.guild.id, user: user.id });
        let moneyEmbed = new Discord.MessageEmbed()
            .setColor('#dd87ff')
            .setAuthor('จำนวนเงินของ ' + user.tag, avatar_url)
            .setDescription(`${new Intl.NumberFormat('en').format(user_data.money)} ${config.emoji.money}`)
            .setFooter(`ขอร้องโดยนายท่าน ${msg.author.tag} | ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)`, author_avatar_url);
        msg.channel.send(moneyEmbed);
    } else if (command === "leaderboard") {
        await user_db.find({ guild: msg.guild.id }, function (err, userDoc) {
            if (err) {
                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
            } else {
                let all_data = userDoc.filter(u => u.money > 0).sort((a, b) => b.money - a.money).slice(0, 10);
                let data_to_show = [];

                if (all_data.length < 1) {
                    let embedErrorUserDoc = new Discord.MessageEmbed()
                        .setColor('#fcfa72')
                        .setDescription(`\`[⚠️]\` \`|\` ไม่พบข้อมูลสำหรับเซิร์ฟเวอร์นี้`)
                        .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
                    return message.channel.send(embedErrorUserDoc)
                };

                all_data.forEach((userData, i) => data_to_show.push({ index: i + 1, user_id: userData.user, all_money: userData.money }));

                let text = [];
                data_to_show.forEach((d) => {
                    text.push(`**${d.index})** <@${d.user_id}> (${new Intl.NumberFormat('en').format(d.all_money)} ${config.emoji.money})`);
                });

                let embedToShow = new Discord.MessageEmbed()
                    .setAuthor(`${msg.guild.name} LEADERBOARD`, 'https://media.discordapp.net/attachments/810376269232996364/835413434564608000/podium.png')
                    .setDescription(text.join('\n\n'))
                    .setColor('#8fff9c')
                    .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
                return msg.channel.send(embedToShow);
            };
        });
    } else if (command === "new_stock") {
        let status = false;
        config.admin.forEach(id => { if (id === msg.author.id) status = true });

        if (status === false) {
            let nopermission = new Discord.MessageEmbed()
                .setDescription(`\`[⚠️]\` \`|\` คุณไม่มีความสามารถพอที่จะทำ`)
                .setColor('#fcfa72')
            return msg.channel.send(nopermission)
        };

        let not_number = new Discord.MessageEmbed()
            .setDescription(`\`[⚠️]\` \`|\` กรุณาใส่จำนวนสลากที่จะเปิดขาย (1 - 300)`)
            .setColor('#fcfa72')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
        if (isNaN(args[0])) return msg.channel.send(not_number);
        if (args[0] < 1 || args[0] > 300) return msg.channel.send(not_number);

        let process_embed = new Discord.MessageEmbed()
            .setDescription(`\`[🕥]\` \`|\` ระบบกำลังดำเนินการเพิ่มสลาก`)
            .setColor('#fcfa72')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
        var process_msg = await msg.channel.send(process_embed);
        var lottery_list = [];
        for (i = 1; i <= args[0]; i++) {
            setTimeout(async () => {
                var number = await random_number(6);
                var number_last3 = number.slice(-3);
                var number_last2 = number.slice(-2);

                let data_save = new lottery_db({
                    _id: new mongoose.Types.ObjectId(),
                    guild: msg.guild.id,
                    user: 'none',
                    number: number,
                    last3: number_last3,
                    last2: number_last2,
                    buyDate: 'none'
                });

                lottery_list.push(number);

                data_save.save();
            }, i * 200);
        };

        let process_done = new Discord.MessageEmbed()
            .setDescription(`\`[✅]\` \`|\` ระบบได้ทำการสร้างสลากเรียบร้อยทั้งหมด \`${args[0]}\` ใบ\n\n${lottery_list.join('\n')}`)
            .setColor('#8fff9c')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
        process_msg.edit(process_done);
    } else if (command === "buy_lottery") {
        var user = msg.author;

        let user_c = await user_db.findOne({ guild: msg.guild.id, user: user.id });
        if (!user_c) {
            let data_save = new user_db({ _id: new mongoose.Types.ObjectId(), guild: msg.guild.id, user: user.id })
            data_save.save();
            await delay(1200);
        };

        var user_data = await user_db.findOne({ guild: msg.guild.id, user: user.id });

        let no_money = new Discord.MessageEmbed()
            .setDescription(`\`[❌]\` \`|\` คุณมีเงินไม่พอซื้อสลากกินแบ่ง (${config.price.per_lottery})`)
            .setColor('#ff9696')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
        if (user_data.money < config.price.per_lottery) return msg.channel.send(no_money);

        await lottery_db.find({ guild: msg.guild.id }, async function (err, lotteryList) {
            if (err) {
                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
            } else {
                var fresh_list = lotteryList.filter(d => d.user === 'none');
                var arr_obj = [];
                fresh_list.forEach((data, id) => {
                    arr_obj.push({
                        id: id + 1,
                        number: data.number
                    });
                });

                if (fresh_list.length < 1) {
                    let no_more_lot = new Discord.MessageEmbed()
                        .setDescription(`\`[❌]\` \`|\` ขณะนี้ไม่มีสลากกินแบ่งเหลือแล้วกรุณารอทีมงานเติมสลากอีกครั้ง`)
                        .setColor('#ff9696')
                        .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
                    return msg.channel.send(no_more_lot);
                };

                var i0 = 0;
                var i1 = 15;
                let page = 1;

                let description_main = `สลากทั้งหมด : \`${new Intl.NumberFormat('en').format(arr_obj.length)}\` ใบ\n\n` +
                    arr_obj
                        .map(r => `**${r.id})** ${r.number}`)
                        .slice(0, 15)
                        .join("\n\n");

                var embed_lottery = new Discord.MessageEmbed()
                    .setAuthor(`เลือกซื้อสลากกินแบ่ง ${msg.guild.name}`, msg.guild.iconURL())
                    .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย) | กรุณาหมายเลขที่ท่านต้องการซื้อเช่น 1 (ภายใน 60 วินาที)')
                    .setTitle(`หน้า : ${page}/${Math.ceil(arr_obj.length / 15)}`)
                    .setColor('#a19cff')
                    .setDescription(description_main);

                var left = new disbut.MessageButton()
                    .setStyle("green")
                    .setLabel("<")
                    .setID('left')
                var right = new disbut.MessageButton()
                    .setStyle("green")
                    .setLabel(">")
                    .setID('right')

                const msg_lottery = await msg.channel.send({ buttons: [left, right], embed: embed_lottery })

                const collector = msg_lottery.createButtonCollector((button) => button.clicker.user.id === msg.author.id, { time: 60000 });

                collector.on("collect", (b) => {
                    b.reply.defer();

                    if (b.id == "left") {
                        i0 = i0 - 15;
                        i1 = i1 - 15;
                        page = page - 1;

                        if (page <= 1) {
                            page = Math.ceil(arr_obj.length / 15);
                            i1 = arr_obj.length;
                            i0 = i1 - 15;
                        };

                        description = `สลากทั้งหมด : \`${new Intl.NumberFormat('en').format(arr_obj.length)}\` ใบ\n\n` +
                            arr_obj
                                .map(r => `**${r.id})** ${r.number} `)
                                .slice(i0, i1)
                                .join("\n\n");

                        embed_lottery
                            .setTitle(`หน้า : ${page}/${Math.ceil(arr_obj.length / 15)}`)
                            .setDescription(description);
                        return msg_lottery.edit({ buttons: [left, right], embed: embed_lottery })
                    } else if (b.id == "right") {
                        i0 = i0 + 15;
                        i1 = i1 + 15;
                        page = page + 1;

                        if (page >= (Math.ceil(arr_obj.length / 15) + 1)) {
                            page = 1;
                            i0 = 0;
                            i1 = 15;
                        };

                        description = `สลากทั้งหมด : \`${new Intl.NumberFormat('en').format(arr_obj.length)}\` ใบ\n\n` +
                            arr_obj
                                .map(r => `**${r.id})** ${r.number}`)
                                .slice(i0, i1)
                                .join("\n\n");

                        embed_lottery
                            .setTitle(`หน้า : ${page}/${Math.ceil(arr_obj.length / 15)}`)
                            .setDescription(description);
                        return msg_lottery.edit({ buttons: [left, right], embed: embed_lottery })
                    };
                })
                collector.on('end', (b) => {
                    left.setDisabled()
                    right.setDisabled()
                    return msg_lottery.edit({ buttons: [left, right], embed: embed_lottery })
                })

                var msg_collect = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
                    max: 1,
                    time: 60000
                });

                if (!msg_collect.size) {
                    let noresponse = new Discord.MessageEmbed()
                        .setDescription(`[\`❌\`] \`|\` <@${msg.author.id}> ไม่เลือกสลากภายใน 60 วินาที`)
                        .setColor('#ff9696')
                        .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
                    return msg.channel.send(noresponse);
                };

                if (isNaN(msg_collect.first().content)) {
                    let is_not_number = new Discord.MessageEmbed()
                        .setDescription(`[\`❌\`] \`|\` <@${msg.author.id}> กรุณาระบุเป็นตัวเลข`)
                        .setColor('#ff9696')
                        .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
                    return msg.channel.send(is_not_number);
                };

                var buy_id = parseInt(msg_collect.first().content);

                if (buy_id > arr_obj.length || buy_id <= 0) {
                    let nover = new Discord.MessageEmbed()
                        .setDescription(`[\`❌\`] \`|\` <@${msg.author.id}> คุณระบุเลขไอดีไม่ถูกต้อง`)
                        .setColor('#ff9696')
                        .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
                    return msg.channel.send(nover);
                };

                var gonna_buy_number;

                arr_obj.forEach(data => {
                    if (data.id === buy_id) gonna_buy_number = data.number;
                });

                if (!gonna_buy_number) {
                    let invalid_id = new Discord.MessageEmbed()
                        .setDescription(`[\`❌\`] \`|\` <@${msg.author.id}> ไม่พบเลขดังกล่าว กรุณาลองใหม่`)
                        .setColor('#ff9696')
                        .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
                    return msg.channel.send(invalid_id);
                };

                await lottery_db.findOne({ guild: msg.guild.id, number: gonna_buy_number }, async function (err, lottery_get) {
                    if (err) {
                        return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                    } else {
                        if (!lottery_get || lottery_get == null) {
                            let invalid_lot = new Discord.MessageEmbed()
                                .setDescription(`[\`❌\`] \`|\` <@${msg.author.id}> ไม่พบสลากกินแบ่งดังกล่าว กรุณาลองใหม่อีกครั้ง`)
                                .setColor('#ff9696')
                                .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
                            return msg.channel.send(invalid_lot);
                        } else if (lottery_get.user !== 'none') {
                            let already_buy_lot = new Discord.MessageEmbed()
                                .setDescription(`[\`❌\`] \`|\` <@${msg.author.id}> เสียใจด้วย คุณซื้อสลากกินแบ่งใบนี้ไม่ได้แล้วเนื่องจากมีคนซื้อก่อนคุณเรียบร้อย`)
                                .setColor('#ff9696')
                                .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
                            return msg.channel.send(already_buy_lot);
                        } else {
                            let utc_datetime = moment().tz('Asia/Bangkok').format();
                            let utc_date = utc_datetime.slice(0, 10).split('-')
                            let time = utc_datetime.split('T')[1].replace('+07:00', '');

                            lottery_get.user = msg.author.id;
                            lottery_get.buyDate = `${utc_date[2] + '/' + utc_date[1] + '/' + utc_date[0]} (${time})`
                            lottery_get.save(function (err) {
                                if (err) {
                                    return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                                };
                            });

                            await user_db.findOne({ guild: msg.guild.id, user: msg.author.id }, function (err, userDoc) {
                                if (err) {
                                    return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                                } else {
                                    if (!userDoc || userDoc == null) return msg.channel.send({ content: `\`[❌]\` \`|\` เกิดข้อผิดพลาดในการหักเงิน กรุณาลองใหม่อีกครั้ง` });

                                    userDoc.money -= config.price.per_lottery;
                                    userDoc.save(function (err) {
                                        if (err) {
                                            return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                                        };
                                    });
                                };
                            });

                            let embed_done = new Discord.MessageEmbed()
                                .setDescription(`\`[✅]\` \`|\` คุณ ${msg.author.username} ได้ทำการซื้อสลากกินแบ่งหมายเลข \`${gonna_buy_number}\` เรียบร้อยเเล้ว เมื่อเวลา \`${utc_date[2] + '/' + utc_date[1] + '/' + utc_date[0]} (${time})\``)
                                .setColor('#8fff9c')
                                .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
                            return msg.channel.send(embed_done);
                        };
                    };
                });
            };
        });
    } else if (command === "draw_lottery") {
        let status = false;
        config.admin.forEach(id => { if (id === msg.author.id) status = true });

        if (status === false) {
            let nopermission = new Discord.MessageEmbed()
                .setDescription(`\`[⚠️]\` \`|\` คุณไม่มีความสามารถพอที่จะทำ`)
                .setColor('#fcfa72')
            return msg.channel.send(nopermission)
        };

        await lottery_db.find({ guild: msg.guild.id }, async function (err, lotteryList) {
            if (err) {
                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
            } else {
                var embed_des = '';
                var fresh_list = [];
                lotteryList.forEach(d => fresh_list.push(d))
                var already_sold = fresh_list.filter(lot => lot.user !== 'none')

                var all_match_random = await randomNum(0, already_sold.length);
                var match3_random = await randomNum(0, already_sold.length);
                var match2_random = await randomNum(0, already_sold.length);

                var all_match = already_sold[all_match_random];
                var match3 = already_sold[match3_random];
                var match2 = already_sold[match2_random];
                var winner = [];


                //type1 = match_all type2 = match_3 type3 = match_2

                embed_des += `**🥇 รางวัลที่ 1 : \`${letterTrans(all_match.number, dictionary)}\`**\n\n**🥈 เลขท้าย 3 ตัว : \`${letterTrans(match3.last3, dictionary)}\`**\n\n**🥉 เลขท้าย 2 ตัว : \`${letterTrans(match2.last2, dictionary)}\`**`;

                winner.push({
                    type: "match_all",
                    money: config.price.match_all,
                    user_id: all_match.user
                });

                var last_match_3 = already_sold.filter(d => d.last3 === match3.last3);
                last_match_3.forEach(d => {
                    winner.push({
                        type: "match_3",
                        money: config.price.match_last3,
                        user_id: d.user
                    });
                });

                var last_match_2 = already_sold.filter(d => d.last2 === match2.last2);
                last_match_2.forEach(d => {
                    winner.push({
                        type: "match_2",
                        money: config.price.match_last2,
                        user_id: d.user
                    });
                });

                winner.forEach((data, i) => {
                    setTimeout(async () => {
                        await user_db.findOne({ guild: msg.guild.id, user: data.user_id }, function (err, userDoc) {
                            if (err) {
                                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                            } else {
                                if (!userDoc || userDoc == null) msg.channel.send({ content: `\`[❌]\` \`|\` เกิดข้อผิดพลาดในการเพิ่มเงินจำนวน \`${data.money}\` ให้ <@${data.user_id}>` });

                                userDoc.money += data.money;
                                userDoc.save(function (err) {
                                    if (err) {
                                        return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
                                    };
                                });
                            };
                        });
                    }, (i + 1) * 200)
                });

                var win_1 = [];
                var win_2 = [];
                var win_3 = [];

                winner.forEach(data => {
                    if (data.type === "match_all") {
                        win_1.push(data.user_id);
                    } else if (data.type === "match_2") {
                        win_2.push(data.user_id);
                    } else {
                        win_3.push(data.user_id);
                    }
                })

                embed_des += `\n\n**🥇 ผู้ชนะ รางวัลที่ 1 (\`${config.price.match_all}\` ${config.emoji.money})**\n=> <@${win_1}>\n\n**🥈 ผู้ชนะ เลขท้าย 3 ตัว (\`${config.price.match_last3}\` ${config.emoji.money})**`;
                win_2.forEach(d => embed_des += `\n=> <@${d}>`);

                embed_des += `\n\n**🥉 ผู้ชนะ เลขท้าย 2 ตัว (\`${config.price.match_last2}\` ${config.emoji.money})**`;
                win_3.forEach(d => embed_des += `\n=> <@${d}>`);

                let utc_datetime = moment().tz('Asia/Bangkok').format();
                let utc_date = utc_datetime.slice(0, 10).split('-');

                await lottery_db.deleteMany({ guild: msg.guild.id });

                var embed_draw_success = new Discord.MessageEmbed()
                    .setAuthor(`ผลสลากกินแบ่งงวดวันที่ ${utc_date[2] + '/' + utc_date[1] + '/' + utc_date[0]}`, 'https://media.discordapp.net/attachments/855829803454562325/902511028317880350/lottery.png')
                    .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)')
                    .setColor('#91bbff')
                    .setDescription(embed_des += `\n\n**หากไม่ได้รับเงินตามที่ระบุด้านบนกรุณาติดต่อทีมงาน**`)
                return msg.channel.send(embed_draw_success);
            };
        });
    } else if (command === "check") {
        var user = msg.mentions.members.first() || msg.author;

        await lottery_db.find({ guild: msg.guild.id, user: user.id }, function (err, lotDoc) {
            if (err) {
                return console.log(chalk.hex('#ff9696')(`[DATABASE] ERROR : ${err}`));
            } else {
                if (lotDoc.length < 1) {
                    let embedErrorlotDoc = new Discord.MessageEmbed()
                        .setColor('#fcfa72')
                        .setDescription(`\`[⚠️]\` \`|\` ไม่พบข้อมูล`)
                        .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
                    return msg.channel.send(embedErrorlotDoc)
                } else {
                    let data_to_show = [];
                    lotDoc.forEach((u, i) => data_to_show.push({ index: i + 1, number: u.number, bd: u.buyDate }));

                    let text = [];
                    data_to_show.forEach((d) => {
                        text.push(`${d.index}) \`${d.number}\` (\`${d.bd}\`)`);
                    });

                    var array_chunk = Array(Math.ceil(text.length / 30)).fill().map((_, index) => index * 30).map(begin => text.slice(begin, begin + 30));
                    array_chunk.forEach(arr => {
                        var embed_arr = new Discord.MessageEmbed()
                            .setAuthor(`สลากกินแบ่งของ ${user.username}`)
                            .setDescription(arr.join('\n'))
                            .setColor('#a8ffbf')
                            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
                        msg.channel.send(embed_arr);
                    });
                };
            };
        });
    } else if (command === "help") {
        var prefix = config.prefix;
        var help = new Discord.MessageEmbed()
            .setAuthor(`${client.user.tag}'s Command`)
            .setDescription(`**สนใจซื้อระบบติดต่อ ᴛᴀᴇ5609シ#2855**`)
            .addField(`${prefix}checkmoney`, `เช็คเงิน`)
            .addField(`${prefix}withdrawn`, `ถอนเงินไปที่บอท UnbelievaBoat `)
            .addField(`${prefix}leaderboard`, `ดูอันดับเงิน`)
            .addField(`${prefix}buy_lottery`, `ซื้อสลากกินแบ่ง`)
            .addField(`${prefix}check`, `เช็คสลากกินแบ่ง`)
            .addField(`${prefix}new_stock`, `เพิ่มสลากกินแบ่ง (สำหรับแอดมิน)`)
            .addField(`${prefix}draw_lottery`, `สุ่มสลากกินแบ่ง (สำหรับแอดมิน)`)
            .addField(`${prefix}addmoney`, `เพิ่มเงิน (สำหรับแอดมิน)`)
            .addField(`${prefix}delmoney`, `หักเงิน (สำหรับแอดมิน)`)
            .setColor('#a8ffbf')
            .setFooter('ระบบโดย ᴛᴀᴇ5609シ#2855 | สนใจติดต่อ DM (มีค่าใช้จ่าย)');
        return msg.channel.send(help);
    }
});

function randomNum(min, max) {
    let random = Math.floor(Math.random() * (max - min)) + min;
    return random;
};

async function random_number(length) {
    var number_list = [];

    for (let i = 0; i < length; i++) {
        let random_number = Math.floor(Math.random() * 10);
        number_list.push(random_number);
    };

    var final = number_list.join('');

    return final;
};