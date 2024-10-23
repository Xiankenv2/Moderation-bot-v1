// commands/warn/warnc.js
const { EmbedBuilder } = require("discord.js");
const warningSchema = require("../../schema/warnSchema");
const Logclearwarn1 = 'logchanne;l';

module.exports = {
    data: {
        name: "warnc",
        description: "Clear all warnings for a user",
        options: [
            {
                type: 6, // USER
                name: "user",
                description: "The user to clear all warnings for",
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const targetUserId = interaction.options.getUser("user").id;
        await clearWarns(interaction, targetUserId); // Changed from clearAllWarns to clearWarns
    },
};



async function clearWarns(interaction, targetUserId) {

    const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const options = interaction.options;

        // Check if the moderator has the required roles
        const requiredRoles = ['Staffrol', 'Staffrol'];
        if (!requiredRoles.some(role => moderator.roles.cache.has(role))) {
            await interaction.followUp({ content: 'You do not have the required roles to use this command.', ephemeral: true });
            return;
        }

        const logChannelId = 'Log ID';

        if (!user) {
            await interaction.followUp({ content: "User not found in the guild.", ephemeral: true });
            return;
        }

        // Check if the user to be banned has certain roles
        if (user.roles.cache.has('Staffrol')) {
            await interaction.followUp({ content: 'You cannot ban a user with the role "Staff team"!', ephemeral: true });
            return;
        }
      
        // Check if the moderator has the role "1263597681918349483"
      

        if (!member.bannable) {
            await interaction.followUp({ content: "This user is not bannable.", ephemeral: true });
            return;
        }

        if (member.id === interaction.user.id) {
            await interaction.followUp({ content: "You cannot ban yourself.", ephemeral: true });
            return;
        }

    const userWarnings = await warningSchema.findOneAndUpdate(
        { GuildID: interaction.guild.id, UserID: targetUserId },
        { $set: { Content: [] } },
        { new: true }
    );

    if (!userWarnings) {
        await interaction.reply({ content: "User not found or clear failed.", ephemeral: true });
        return;
    }

    const clearEmbed = new EmbedBuilder()
        .setColor('#FFA500') 
        .setTitle(`Cleared All Warnings for User: ${targetUserId}`)
        .setTimestamp();

    await interaction.reply({ embeds: [clearEmbed] });

    if (Logclearwarn1) {
        const logChannel = interaction.guild.channels.cache.get(Logclearwarn1);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(`Warnings Cleared`)
                .setDescription(`**User ID:** ${targetUserId}\n**Cleared by:** ${interaction.user.tag}`)
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }
    }
}
