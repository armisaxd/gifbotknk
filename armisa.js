const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const { botToken, botPrefix } = require("./src/config.json");
const { ppLog_ChannelID, emojiLog_ChannelID, svPPLog_ChannelID, logChannelID } = require("./src/settings.json");
const database = require("orio.db");

client.on('ready', () => {
    console.log(`Komutlar Yüklendi Giriş Yapıldı Knk
    ${client.user.tag} Aktif`);
    client.user.setActivity('Armisa', { type: 'WATCHING' })
});

client.on("message", async message => {
    if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(botPrefix)) return;
    let args = message.content.split(' ').slice(1);
    let command = message.content.split(' ')[0].slice(botPrefix.length);

    if (command === "info") {
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        let gif = await database.get(`armisa.${member.id}.gif`);
        let fotoğraf = await database.get(`armisa.${member.id}.fotoğraf`);
        let fpp = fotoğraf || 0;
        let gpp = gif || 0;

        const embed = new MessageEmbed()
            .setAuthor(`${message.guild.name} Info`, message.guild.iconURL({ dynamic: true }))
            .addField(`Detaylı Bilgiler`, `Şuana kadar ${gpp} tane GIF, ${fpp} tane fotoğraf, toplamda ${gpp + fpp} dosya gönderdi.`)
            .setColor("GREEN")
            .setFooter(`${member.user.username}`, member.user.avatarURL({ dynamic: true }))
            .setTimestamp()
        message.channel.send(embed)
    }

    if (command === "top") {
        let databases = await database.get(`armisa`) || 0;
        let armising = Object.keys(databases);
        let liste = armising.filter(x => message.guild.members.cache.has(x)).sort((a, b) => Number((databases[b].gif || 0) + (databases[b].fotoğraf || 0)) - Number((databases[a].gif) + (databases[a].fotoğraf))).map((value, index) => `\`${index + 1}.\` ${message.guild.members.cache.get(value)} adlı üyenin toplam **${(databases[value].gif || 0) + (databases[value].fotoğraf || 0)}** (\`${databases[value].gif || 0}\` gif, \`${databases[value].fotoğraf || 0}\` fotoğraf)`).splice(0, 10).join("\n");

        const embed = new MessageEmbed()
            .setAuthor(`${message.guild.name} Top`, message.guild.iconURL({ dynamic: true }))
            .setDescription(liste || "Top 10 Verisi Bulunamadı!")
            .setColor("GREEN")
            .setFooter(`Bu komut ${message.author.username} tarafından kullanıldı.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
            .setTimestamp()
        message.channel.send(embed)
    }
})

client.on("emojiCreate", async emoji => {
    const entry = await emoji.guild.fetchAuditLogs({ limit: 1, type: 'EMOJI_CREATE' }).then(x => x.entries.first());
    const kanal = emojiLog_ChannelID;

    const embed = new MessageEmbed()
        .setDescription(`[Emoji Linki İçin Tıkla](${emoji.url})`)
        .setImage(emoji.url)
        .setColor("GREEN")
        .setFooter(`© ${entry.executor.id}`)
    client.channels.cache.get(kanal).send(embed)
})

client.on("guildUpdate", async (oldGuild, newGuild) => {
    if (oldGuild.iconURL() === newGuild.iconURL()) return;

    const entry = await newGuild.fetchAuditLogs({ limit: 1, type: 'GUILD_UPDATE' }).then(x => x.entries.first());
    const kanal = svPPLog_ChannelID;

    const embed = new MessageEmbed()
        .setDescription(`[Fotoğraf Linki İçin Tıkla](${newGuild.iconURL({ format: "png", dynamic: true })})`)
        .setImage(newGuild.iconURL({ format: "png", dynamic: true }))
        .setColor("GREEN")
        .setFooter(`© ${entry.executor.id}`)
    client.channels.cache.get(kanal).send(embed)
})

client.on("userUpdate", async (oldUser, newUser) => {
    if (oldUser.avatarURL() === newUser.avatarURL()) return;

    const kanal = ppLog_ChannelID;

    const embed = new MessageEmbed()
        .setDescription(`[PP Linki İçin Tıkla](${newUser.avatarURL({ dynamic: true })})`)
        .setImage(newUser.avatarURL({ dynamic: true }))
        .setColor("GREEN")
        .setFooter(`© ${newUser.id}`)
    client.channels.cache.get(kanal).send(embed)
})

client.on("message", message => {
    if (message.author.bot) return;
    message.attachments.forEach(armisa => {
        if (armisa.url.endsWith('.webp') || armisa.url.endsWith('.png') || armisa.url.endsWith('.jpeg') || armisa.url.endsWith('.jpg')) {
            database.add(`armisa.${message.author.id}.fotoğraf`, 1)
            database.add(`armising.${message.author.id}.fotoğraf`, 1)
        }
        if (armisa.url.endsWith('.gif')) {
            database.add(`armisa.${message.author.id}.gif`, 1)
            database.add(`armising.${message.author.id}.gif`, 1)
        }
    })
})

client.on("message", async message => {
    let kanal = logChannelID;
    let gif = await database.get(`armisa.${message.author.id}.gif`);
    let fotoğraf = await database.get(`armisa.${message.author.id}.fotoğraf`);
    let fpp = fotoğraf || 0;
    let gpp = gif || 0;

    let gifs = await database.get(`armising.${message.author.id}.gif`);
    let fotoğrafs = await database.get(`armising.${message.author.id}.fotoğraf`);
    let fpps = fotoğrafs || 0;
    let gpps = gifs || 0;

    if (message.author.bot) return;
    message.attachments.forEach(armisa => {
        if (armisa.url.endsWith('.webp') || armisa.url.endsWith('.png') || armisa.url.endsWith('.jpeg') || armisa.url.endsWith('.jpg')) {
            const embed = new MessageEmbed()
                .setAuthor(`${message.guild.name} - Log`, message.guild.iconURL({ dynamic: true }))
                .setDescription(`${message.author}, ${message.channel} kanalına ${fpps} fotoğraf gönderdi!`)
                .addField(`Detaylı Bilgiler`, `Şuana kadar ${gpp} tane GIF, ${fpp} tane fotoğraf, toplamda ${gpp + fpp} dosya gönderdi.`)
                .setColor("GREEN")
                .setFooter(`${message.author.username}`, message.author.avatarURL({ dynamic: true }))
                .setTimestamp()
            client.channels.cache.get(kanal).send(embed)
            setTimeout(() => { 
                database.delete(`armising.${message.author.id}.fotoğraf`, 1)
            }, 0020);
        }
        if (armisa.url.endsWith('.gif')) {
            const embed = new MessageEmbed()
                .setAuthor(`${message.guild.name} - Log`, message.guild.iconURL({ dynamic: true }))
                .setDescription(`${message.author}, ${message.channel} kanalına ${gpps} gif gönderdi!`)
                .addField(`Detaylı Bilgiler`, `Şuana kadar ${gpp} tane GIF, ${fpp} tane fotoğraf, toplamda ${gpp + fpp} dosya gönderdi.`)
                .setColor("GREEN")
                .setFooter(`${message.author.username}`, message.author.avatarURL({ dynamic: true }))
                .setTimestamp()
            client.channels.cache.get(kanal).send(embed)
            setTimeout(() => {
                database.delete(`armising.${message.author.id}.gif`, 1)
            }, 0020);
        };
    });
});

client.login(botToken);

