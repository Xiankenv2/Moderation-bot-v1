const { SlashCommandBuilder } = require(`@discordjs/builders`);
const { EmbedBuilder } = require(`discord.js`);

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`whois`)
        .setDescription(`User Information`)
        .addUserOption(option => option.setName(`user`).setDescription('The user you want to get information on.').setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        // Check if the user is a member of the guild
        const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(err => null);
        if (!member) {
            return interaction.reply({ content: `User is not a member of this server.`, ephemeral: true });
        }

        const icon = user.displayAvatarURL();
        const tag = user.tag;
        const botStatus = user.bot ? 'Yes' : 'No';
        const badges = user.flags.toArray().join(', ') || 'None'; // Ensure there’s a default value for badges
        let invites = await interaction.guild.invites.fetch();
        let userInv = invites.filter(u => u.inviter && u.inviter.id === user.id);

        let inviteCount = 0;
        userInv.forEach(inv => inviteCount += inv.uses);

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setAuthor({ name: tag, iconURL: icon })
            .setThumbnail(icon)
            .addFields(
                { name: "Member", value: `${user}`, inline: false },
                { name: "Server Roles", value: member.roles.cache.size ? `${member.roles.cache.map(r => r).join(', ')}` : "Not part of the server", inline: false },
                { name: "Joined Server", value: `<t:${parseInt(member.joinedAt / 1000)}:R>`, inline: false },
                { name: "Joined Discord", value: `<t:${parseInt(user.createdAt / 1000)}:R>`, inline: false },
                { name: "User ID", value: `${user.id}`, inline: false },
                { name: "Icon", value: icon, inline: false },
                { name: "Boosted Server?", value: member.premiumSince ? 'Yes' : 'No', inline: false },
                { name: "Bot?", value: botStatus, inline: false },
                { name: "Badges", value: badges, inline: false },
                { name: "Server Invites", value: `${inviteCount}`, inline: false }
            )
            .setFooter({ text: `Command Requested By: ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
