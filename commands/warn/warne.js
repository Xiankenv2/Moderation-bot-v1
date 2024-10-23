const { EmbedBuilder } = require("discord.js");
const warningSchema = require("../../schema/warnSchema");

const logChannelEditRemoveWarn = 'log channel';

module.exports = {
    data: {
        name: "warne",
        description: "Edit a warning",
        options: [
            {
                type: 6, // USER
                name: "user",
                description: "The user to edit the warning for",
                required: true,
            },
            {
                type: 3, // STRING
                name: "warn-id",
                description: "The warning ID",
                required: true,
            },
            {
                type: 3, // STRING
                name: "reason",
                description: "The new reason for the warning",
                required: true,
            },
        ],
    },
    async execute(interaction) {
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

        const targetUserId = interaction.options.getUser("user").id;
        const warnId = interaction.options.getString("warn-id");
        const newReason = interaction.options.getString("reason");
        await editWarn(interaction, targetUserId, warnId, newReason);
    },
};



async function editWarn(interaction, targetUserId, warnId, newReason) {
    // Find the warning data for the user
    const warningData = await warningSchema.findOne({ GuildID: interaction.guild.id, UserID: targetUserId });
    const editEmbed = new EmbedBuilder().setColor('#FFA500');
    
    if (!warningData) {
        // No warnings found for the user
        editEmbed.setTitle(`No Warnings`).setDescription(`User with ID ${targetUserId} has no warnings.`);
        await interaction.reply({ embeds: [editEmbed] });
        return;
    }

    // Find the specific warning by WarnID
    const warning = warningData.Content.find(w => w.WarnID === warnId);

    if (!warning) {
        // Warning not found
        editEmbed.setTitle(`Warning Not Found`).setDescription(`Warn ID ${warnId} not found.`);
        await interaction.reply({ embeds: [editEmbed] });
        return;
    }

    // Warning found, update it
    const oldReason = warning.Reason; // Define oldReason here

    // Update the warning
    warning.Reason = newReason;
    warning.Edits = warning.Edits || []; // Initialize Edits if it doesn’t exist
    warning.Edits.push({
        EditedByExecuterId: interaction.user.id,
        EditedByExecuterTag: interaction.user.tag,
        NewReason: newReason,
        OldReason: oldReason,
        EditTimestamp: Date.now()
    });

    try {
        // Save the updated warning data
        await warningData.save();
        editEmbed.setTitle(`Warning Updated for User ID ${targetUserId}`)
            .setDescription(`**Warn ID:** ${warnId}\n**Old Reason:** ${oldReason}\n**New Reason:** ${newReason}`);
    } catch (error) {
        console.error("Error saving warning data:", error);
        editEmbed.setTitle(`Error`).setDescription(`An error occurred while updating the warning.`);
        await interaction.reply({ embeds: [editEmbed] });
        return;
    }

    // Reply to the interaction with the edit embed
    try {
        await interaction.reply({ embeds: [editEmbed] });
    } catch (error) {
        console.error("Error sending interaction reply:", error);
    }

    // Log the edit if the log channel ID is defined
    if (logChannelEditRemoveWarn) {
        // Fetch the target user from the guild
        const user = await interaction.guild.members.fetch(targetUserId).catch(() => null);

        // Create log embed
        const logEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(`Warn Edit Log`)
            .addFields(
                { name: 'User', value: user ? user.user.tag : 'Unknown User', inline: true },
                { name: 'Mod', value: interaction.user.tag, inline: true },
                { name: 'Date', value: new Date().toLocaleString(), inline: true },
                { name: 'Warn ID', value: warnId, inline: true },
                { name: 'Old Reason', value: oldReason, inline: true }, // Use oldReason here
                { name: 'New Reason', value: newReason, inline: true }
            );

        // Get the log channel and send the log
        const logChannel = interaction.guild.channels.cache.get(logChannelEditRemoveWarn);
        if (logChannel) {
            try {
                await logChannel.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error("Error sending log embed:", error);
            }
        } else {
            console.error(`Log channel with ID ${logChannelEditRemoveWarn} not found.`);
        }
    }
}
