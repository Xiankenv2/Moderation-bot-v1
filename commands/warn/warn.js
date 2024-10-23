const { EmbedBuilder } = require("discord.js");
const warningSchema = require("../../schema/warnSchema");
const logChannelGiveWarn = 'staff rol';
const timeoutLogChannelId = 'Logchannel';

function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&?';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

module.exports = {
    data: {
        name: "warn",
        description: "Issue a warning",
        options: [
            {
                type: 6, // USER
                name: "user",
                description: "The user to warn",
                required: true,
            },
            {
                type: 3, // STRING
                name: "reason",
                description: "The reason for the warning",
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

        const targetUser = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");

        try {
            // Defer reply to allow time for processing
            await interaction.deferReply({ ephemeral: true });

            // Add warning and await the result
            await addWarn(interaction, targetUser.id, reason);

            // Send a follow-up message after processing
            await interaction.followUp({ content: `Warning issued to <@${targetUser.id}> for reason: ${reason}.` });
        } catch (error) {
            console.error("Error executing warn command:", error);
            await interaction.followUp({ content: "There was an error while issuing the warning.", ephemeral: true });
        }
    },
};

async function addWarn(interaction, targetUserId, reason) {
    const warnID = generateRandomCode(10); // Generate the warning ID here
    const warningData = await warningSchema.findOneAndUpdate(
        { GuildID: interaction.guild.id, UserID: targetUserId },
        {
            $push: { 
                Content: {
                    ExecuterId: interaction.user.id,
                    ExecuterTag: interaction.user.tag,
                    Reason: reason,
                    WarnID: warnID,
                    Timestamp: Date.now()
                }
            }
        },
        { new: true, upsert: true }
    );

    const warningCount = warningData.Content.length;

    // Log the warning in the designated channel
    if (logChannelGiveWarn) {
        const logChannel = interaction.guild.channels.cache.get(logChannelGiveWarn);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(`Warn Log`)
                .setDescription(`**User ID:** ${targetUserId}\n**Reason:** ${reason}\n**Issued by:** ${interaction.user.tag}\n**WarnID:** ${warnID}`)
                .addFields({ name: 'Warnings', value: warningCount.toString(), inline: false })
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }
    }

    // Handle warnings logic
    await handleWarningThresholds(interaction, targetUserId, warningCount, warnID);
}

async function handleWarningThresholds(interaction, targetUserId, warningCount, warnID) {
    const member = interaction.guild.members.cache.get(targetUserId);
    if (!member) {
        console.error(`User ${targetUserId} not found in the guild`);
        return;
    }

    if (warningCount >= 5 && warningCount < 10) {
        await logTimeout(interaction, member, warnID, warningCount, 16); // 16 hours timeout for 5-9 warnings
    } else if (warningCount >= 10) {
        const extraWarnTimeout = (warningCount - 10) * 30; // Additional 30 hours per extra warn over 10
        await logTimeout(interaction, member, warnID, warningCount, 30 + extraWarnTimeout); // 30 hours + extra for 10+ warnings
    }
}

async function logTimeout(interaction, member, warnID, warningCount, timeoutHours) {
    const timeoutDuration = timeoutHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const timeoutLogChannel = interaction.guild.channels.cache.get(timeoutLogChannelId);

    if (timeoutLogChannel) {
        const timeoutEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Timeout Issued')
            .setDescription(`WarnID: ${warnID}\nWarnings: ${warningCount}`)
            .addFields(
                { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                { name: 'Reason', value: `Reached ${warningCount} warnings`, inline: false }
            )
            .setTimestamp();

        await timeoutLogChannel.send({ embeds: [timeoutEmbed] });
    }

    // Apply the timeout to the user
    await member.timeout(timeoutDuration, `Reached ${warningCount} warnings`);
}
