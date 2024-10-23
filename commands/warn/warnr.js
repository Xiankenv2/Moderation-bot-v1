const { EmbedBuilder } = require("discord.js");
const warningSchema = require("../../schema/warnSchema");
const logChannelEditRemoveWarn = 'logchannel';


module.exports = {
    data: {
        name: "warnr",
        description: "Remove a specific warning",
        options: [
            {
                type: 6, // USER
                name: "user",
                description: "The user to remove the warning for",
                required: true,
            },
            {
                type: 3, // STRING
                name: "warn-id",
                description: "The warning ID to remove",
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const targetUserId = interaction.options.getUser("user").id;
        const warnId = interaction.options.getString("warn-id");
        await removeWarn(interaction, targetUserId, warnId);
    },
};

async function removeWarn(interaction, userId, warnId) {
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


   
    const warningData = await warningSchema.findOne({ GuildID: interaction.guild.id, UserID: userId });

    if (!warningData) {
        await interaction.reply({ content: `User ${userId} has no warnings.`, ephemeral: true });
        return;
    }

    const warnIndex = warningData.Content.findIndex(w => w.WarnID === warnId);

    if (warnIndex === -1) {
        await interaction.reply({ content: `Warning with ID ${warnId} not found for user ${userId}.`, ephemeral: true });
        return;
    }

    warningData.Content.splice(warnIndex, 1);
    await warningData.save();

    const removeWarnEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`Warning Removed for ${userId}`)
        .setDescription(`**Warn ID:** ${warnId}`)
        .setTimestamp();

    await interaction.reply({ embeds: [removeWarnEmbed] });

    const logChannel = interaction.guild.channels.cache.get(logChannelEditRemoveWarn);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`Warn Removal Log`)
            .setDescription(`**User ID:** ${userId}\n**Warn ID:** ${warnId}\n**Removed by:** ${interaction.user.tag}`)
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    } else {
        console.error(`Log channel with ID ${logChannelEditRemoveWarn} not found.`);
    }
}
