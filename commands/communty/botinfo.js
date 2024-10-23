const { EmbedBuilder } = require("discord.js");
const os = require("os");
const moment = require("moment");
const cpuStat = require("cpu-stat");

module.exports = {
  data: {
    name: "botinfo",
    description: "Displays information about the bot.",
  },
  async execute(interaction) {
    const { client } = interaction;
    const member = interaction.member;

    // Check if the member has the required roles
    const requiredRoles = ['YouStafrol'];
    if (!requiredRoles.some(role => member.roles.cache.has(role))) {
      await interaction.reply({ content: 'You do not have the required roles to use this command.', ephemeral: true });
      return;
    }

    // Uptime calculation
    const days = Math.floor(client.uptime / 86400000);
    const hours = Math.floor(client.uptime / 3600000) % 24;
    const minutes = Math.floor(client.uptime / 60000) % 60;
    const seconds = Math.floor(client.uptime / 1000) % 60;

    cpuStat.usagePercent(function (error, percent) {
      if (error) {
        console.error(error);
        interaction.reply({ content: 'There was an error retrieving CPU statistics.', ephemeral: true });
        return;
      }

      const node = process.version;
      const memoryUsage = formatBytes(process.memoryUsage().heapUsed);
      const CPU = percent.toFixed(2);
      const CPUModel = os.cpus()[0].model;
      const cores = os.cpus().length;

      const botinfoEmbed = new EmbedBuilder()
        .setAuthor({
          name: "Bot Info",
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setColor("Random")
        .addFields(
          { name: `**Bot Name:**`, value: `${client.user.username}`, inline: true },
          { name: `**Bot ID:**`, value: `${client.user.id}`, inline: true },
          { name: `**Bot Created At:**`, value: `${moment.utc(client.user.createdAt).format("LLLL")}`, inline: true },
          { name: `**Bot Joined At:**`, value: `${moment.utc(interaction.guild.joinedAt).format("LLLL")}`, inline: true },
          { name: `**Total Server(s):**`, value: `${client.guilds.cache.size}`, inline: true },
          { name: `**Total Member(s):**`, value: `${client.users.cache.size}`, inline: true },
          { name: `**Total Channel(s):**`, value: `${client.channels.cache.size.toLocaleString()}`, inline: true },
          { name: `**Uptime:**`, value: `\`${days}\` Days \`${hours}\` Hours \`${minutes}\` Minutes \`${seconds}\` Seconds`, inline: true },
          { name: `**Ping:**`, value: `API Latency: ${client.ws.ping}ms`, inline: true },
          { name: `**NodeJS Version:**`, value: `${node}`, inline: true },
          { name: `**Memory Usage:**`, value: `${memoryUsage}`, inline: true },
          { name: `**CPU Usage:**`, value: `${CPU}%`, inline: true },
          { name: `**CPU Model:**`, value: `${CPUModel}`, inline: true },
          { name: `**Cores:**`, value: `${cores}`, inline: true }
        );

      interaction.reply({ embeds: [botinfoEmbed] });
    });

    function formatBytes(a, b) {
      let c = 1024;
      let d = b || 2;
      let e = ["B", "KB", "MB", "GB", "TB"];
      let f = Math.floor(Math.log(a) / Math.log(c));

      return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    }
  }
};
