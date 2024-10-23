const { SlashCommandBuilder, EmbedBuilder, ChannelType, GuildExplicitContentFilter } = require('discord.js');
 
module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName('server')
    .setDescription('Use this command to check server information'),
  async execute(interaction) {
    const serwer = interaction.guild;
    const owner = await serwer.fetchOwner().catch(() => null);
    const onlineMembers = serwer.members.cache.filter((member) => member.presence?.status === 'online');
    const { channels, roles } = serwer;
    const sortowaneRole = roles.cache.map(role => role).slice(1, roles.cache.size).sort((a, b) => b.position - a.position);
    const roleUserów = sortowaneRole.filter(role => !role.managed);
    const roleManaged = sortowaneRole.filter(role => role.managed);
    const BoosterCount = serwer.members.cache.filter(member => member.roles.cache.has('816662965352398848')).size; // Set booster ID role
 
    const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
      let totalLength = 0;
      const result = [];
 
      for (const role of roles) {
        const roleString = `<@&${role.id}>`;
 
        if (roleString.length + totalLength > maxFieldLength) break;
 
        totalLength += roleString.length + 1;
        result.push(roleString);
      }
 
      return result.length;
    };
 
    const allRolesCount = roles.cache.size - 1;
    const getChannelTypeSize = type => channels.cache.filter(channel => type.includes(channel.type)).size;
    const totalChannels = getChannelTypeSize([ChannelType.GuildText, ChannelType.GuildNews, ChannelType.GuildVoice, ChannelType.GuildStageVoice, ChannelType.GuildForum]);
    const verificationLevelMap = {
      [GuildExplicitContentFilter.Disabled]: 'Low',
      [GuildExplicitContentFilter.MembersWithoutRoles]: 'Medium',
      [GuildExplicitContentFilter.AllMembers]: 'Hard',
    };
    const verificationLevel = verificationLevelMap[serwer.explicitContentFilter] || 'Unknown';
 
    const embed = new EmbedBuilder()
      .setColor('#009937')
      .setAuthor({ name: serwer.name, iconURL: serwer.iconURL({ dynamic: true }) })
      .addFields(
        { name: `<:icona_hex:1117897164279005314> Server ID:`, value: `└ ${serwer.id}`, inline: true },
        { name: `<:icona_kalendarz:1164231980502757428> Create Date:`, value: `└ <t:${Math.floor(serwer.createdTimestamp / 1000)}:R>`, inline: true },
        { name: `<:icona_owner:1124451512119201804> Owner:`, value: `└ ${owner?.user?.toString() || 'Nie znaleziono właściciela'}`, inline: true },
        { name: `<:icona_ludzie:1126128125017866280> Members (${serwer.memberCount})`, value: `└ **${onlineMembers.size}** Online <:online:1119312813689671780>\n└ **${BoosterCount}** Boosters 💜`, inline: true },
        { name: `<:icona_chat:1117429341698142302> Channels (${totalChannels})`, value: `└ **${getChannelTypeSize([ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildNews])}** Text\n└ **${getChannelTypeSize([ChannelType.GuildVoice, ChannelType.GuildStageVoice])}** Voice`, inline: true },
        { name: `<:icona_serwer:1117744506104721518> Other:`, value: `└ Verification level: **${verificationLevel}**`, inline: true },
        { name: `\`🔐\` Role (${allRolesCount})`, value: `└ **${maxDisplayRoles(roleUserów)}** Normal roles\n└  **${maxDisplayRoles(roleManaged)}** Admin roles` }
      )
      .setThumbnail(serwer.iconURL({ dynamic: true }))
      .setFooter({ text: `Invoked by: ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
      .setTimestamp();
 
    await interaction.reply({ embeds: [embed] });
  },
};