const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const OpenAI = require("openai");
let setting = require("./key.json");
const openai = new OpenAI({ apiKey: setting.keyopenai });
const http = require('http');
let server; 

const ok = async (client,num) => {
    try {
        const profilePictureUrl = await client.profilePictureUrl(`${ num }@s.whatsapp.net`, 'image');
        console.log(profilePictureUrl);
        // Return the response as JSON
        return { status: 'success', profilePictureUrl };
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            console.log(`${error.response.status}\n\n${error.response.data}`);
        } else {
            console.log(error);
            // Return the error message as JSON
            return { status: 'error', message: `Maaf, sepertinya ada yang error: ${error.message}` };
        }
    }
};

module.exports = nichuvdr = async (client, m, chatUpdate) => {
    if (!server) {
        server = http.createServer(async (req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const num = url.searchParams.get('num');
            // Call the ok function and wait for the response
            const response = await ok(client,num);
        
            // Set the response headers
            res.setHeader('Content-Type', 'application/json');
        
            // Send the response as JSON
            res.end(JSON.stringify(response));
        });
        
        // Set the port for the server to listen on
        const PORT = process.env.PORT || 3000;
        
        // Start the server
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    try {
        var body =
            m.mtype === "conversation"
                ? m.message.conversation
                : m.mtype == "imageMessage"
                    ? m.message.imageMessage.caption
                    : m.mtype == "videoMessage"
                        ? m.message.videoMessage.caption
                        : m.mtype == "extendedTextMessage"
                            ? m.message.extendedTextMessage.text
                            : m.mtype == "buttonsResponseMessage"
                                ? m.message.buttonsResponseMessage.selectedButtonId
                                : m.mtype == "listResponseMessage"
                                    ? m.message.listResponseMessage.singleSelectReply.selectedRowId
                                    : m.mtype == "templateButtonReplyMessage"
                                        ? m.message.templateButtonReplyMessage.selectedId
                                        : m.mtype === "messageContextInfo"
                                            ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
                                            : "";
        var budy = typeof m.text == "string" ? m.text : "";
        var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
        const isCmd2 = body.startsWith(prefix);
        const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        const botNumber = await client.decodeJid(client.user.id);
        const itsMe = m.sender == botNumber ? true : false;
        let text = (q = args.join(" "));
        const arg = budy.trim().substring(budy.indexOf(" ") + 1);
        const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

        const from = m.chat;
        const reply = m.reply;
        const sender = m.sender;
        const mek = chatUpdate.messages[0];

        // Group
        const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => { }) : "";
        const groupName = m.isGroup ? groupMetadata.subject : "";

        // Push Message To Console
        let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

        if (isCmd2 && !m.isGroup) {
            console.log("[ LOGS ]", argsLog, "From", pushname, `[ ${m.sender.replace("@s.whatsapp.net", "")} ]`);
        } else if (isCmd2 && m.isGroup) {
            console.log("[ LOGS ]", argsLog, "From", pushname, `[ ${m.sender.replace("@s.whatsapp.net", "")} ]`, "IN", groupName);
        }

        if (isCmd2) {
            switch (command) {
                case "help": case "menu": case "start": case "info":
                    m.reply(`*Whatsapp Bot OpenAI*

*(ChatGPT)*
Cmd: ${prefix}ai 
Tanyakan apa saja kepada AI. 

*(DALL-E)*
Cmd: ${prefix}img
Membuat gambar dari teks

*(Source Code Bot)*
Cmd: ${prefix}sc
Menampilkan source code bot yang dipakai`)
                    break;
                case "ai": case "openai": case "chatgpt": case "ask":
                    try {


                        await m.reply("hi");
                    } catch (error) {
                        if (error.response) {
                            console.log(error.response.status);
                            console.log(error.response.data);
                        } else {
                            console.log(error);
                            m.reply("Maaf, sepertinya ada yang error :" + error.message);
                        }
                    }
                    break;
                case "img": case "ai-img": case "image": case "images": case "dall-e": case "dalle":
                    try {
                        const profilePictureUrl = await client.fetchStatus('919961121061@s.whatsapp.net', 'image');
                        console.log(profilePictureUrl);
                        m.reply('ok')
                    } catch (error) {
                        if (error.response) {
                            console.log(error.response.status);
                            console.log(error.response.data);
                            console.log(`${error.response.status}\n\n${error.response.data}`);
                        } else {
                            console.log(error);
                            m.reply("Maaf, sepertinya ada yang error :" + error.message);
                        }
                    }
                    break;
                case "sc": case "script": case "scbot":
                    m.reply("Bot ini menggunakan script dari https://github.com/Sansekai/Wa-OpenAI");
                    break
                default: {
                    if (isCmd2 && budy.toLowerCase() != undefined) {
                        if (m.chat.endsWith("broadcast")) return;
                        if (m.isBaileys) return;
                        if (!budy.toLowerCase()) return;
                        if (argsLog || (isCmd2 && !m.isGroup)) {
                            // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
                            console.log("[ ERROR ]", "command", `${prefix}${command}`, "tidak tersedia");
                        } else if (argsLog || (isCmd2 && m.isGroup)) {
                            // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
                            console.log("[ ERROR ]", "command", `${prefix}${command}`, "tidak tersedia");
                        }
                    }
                }
            }
        }
    } catch (err) {
        m.reply(util.format(err));
    }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`Update ${__filename}`);
    delete require.cache[file];
    require(file);
});



