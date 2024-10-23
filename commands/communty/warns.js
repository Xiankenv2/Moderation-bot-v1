// commands/warn/warns.js
const { EmbedBuilder } = require("discord.js");
const warningSchema = require("../../schema/warnSchema");



module.exports = {
    data: {
        name: "warns",
        description: "Get a list of a user's warnings",
        options: [
            {
                type: 6, // USER
                name: "user",
                description: "The user to get the warnings for",
                required: false,
            },
        ],
    },
    async execute(interaction) {
        const targetUser = interaction.options.getUser("user") || interaction.user;
        await listWarns(interaction, targetUser.id);
    },
};

async function listWarns(interaction, targetUserId) {
    
    // Use 'getUser' instead of 'getString' for user options
    const targetUser = interaction.options.getUser('user');
    const targetUserd = targetUser ? targetUser.id : interaction.user.id; // Default to the command user if no user is provided
 
    const warningData = await warningSchema.findOne({ GuildID: interaction.guild.id, UserID: targetUserd });
    const listEmbed = new EmbedBuilder().setColor('#0099ff');
    if (!warningData ||!warningData.Content.length) {
        listEmbed.setTitle(`No Warnings`).setDescription(`User with ID ${targetUserd} has no warnings.`);
    } else {
        const reasons = warningData.Content.map(w => `Warn ID: ${w.WarnID} - Reason: ${w.Reason}`).join('\n');
        listEmbed.setTitle(`Warnings for User ID ${targetUserd}`)
                .setDescription(`Reasons:\n${reasons}`);
    }
 
    await interaction.reply({ embeds: [listEmbed] });
}