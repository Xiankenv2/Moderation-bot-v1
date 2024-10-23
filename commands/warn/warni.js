// commands/warn/warni.js
const { EmbedBuilder } = require("discord.js");
const warningSchema = require("../../schema/warnSchema");


module.exports = {
    data: {
        name: "warni",
        description: "Get information about a specific warning",
        options: [
            {
                type: 6, // USER
                name: "user",
                description: "The user to get the warning info for",
                required: true,
            },
            {
                type: 3, // STRING
                name: "warn-id",
                description: "The warning ID",
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const targetUserId = interaction.options.getUser("user").id;
        const warnId = interaction.options.getString("warn-id");
        await getWarnInfo(interaction, targetUserId, warnId);
    },
};



async function getWarnInfo(interaction, targetUserId, warnId) {

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

    try {
        // Log the received User ID and Warn ID for debugging
        console.log("Received User ID:", targetUserId, "Warn ID:", warnId);
 
        const warningData = await warningSchema.findOne({ GuildID: interaction.guild.id, UserID: targetUserId });
 
        // Log the retrieved warning data
        console.log("Retrieved Warning Data:", warningData);
 
        const infoEmbed = new EmbedBuilder().setColor('#0099ff');
 
        if (!warningData) {
            infoEmbed.setTitle(`No Warnings`).setDescription(`User with ID ${targetUserId} has no warnings.`);
        } else {
            const warning = warningData.Content.find(w => w.WarnID === warnId);
 
            // Log the specific warning found
            console.log("Specific Warning Found:", warning);
 
            if (!warning) {
                infoEmbed.setTitle(`Warning Not Found`).setDescription(`Warn ID ${warnId} not found.`);
            } else {
                infoEmbed.setTitle(`Warning Info for User ID ${targetUserId}`)
                    .setDescription(`**Warn ID:** ${warnId}\n**Issued by:** ${warning.ExecuterTag}\n**Reason:** ${warning.Reason}\n**Issued on:** <t:${Math.floor(warning.Timestamp / 1000)}:f>`);
            }
        }
 
        await interaction.reply({ embeds: [infoEmbed] });
    } catch (error) {
        // Log any errors that occur
        console.error("Error in getWarnInfo:", error);
        await interaction.reply({ content: "An error occurred while retrieving warning information.", ephemeral: true });
    }
}