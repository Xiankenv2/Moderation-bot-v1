const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionsBitField, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Send the ticket system embed'),
    async execute(interaction) {
        // Controleer of de gebruiker de rol heeft
        const requiredRoleId = 'staff rol';
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const hasRequiredRole = member.roles.cache.has(requiredRoleId);

        if (!hasRequiredRole) {
            return await interaction.reply({ content: 'Je hebt niet de benodigde rol om deze opdracht uit te voeren.', ephemeral: true });
        }

        // Controleer of de gebruiker administrator is
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: 'Invalid permissions', ephemeral: true });
        }

        const staffRoleId = 'staff rol'; 
        const hasStaffRole = member.roles.cache.has(staffRoleId);

        const embed = new EmbedBuilder()
            .setTitle('**Support System**')
            .setDescription('`Select the option below that best describes the help you need.`')
            .setTimestamp()
            .setColor('DarkRed')
            .setAuthor({ name: `${interaction.guild.name}` });

        // Build the select menu options
        const select = new StringSelectMenuBuilder()
            .setCustomId('ticketsystemid')
            .setPlaceholder('Make a selection!')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Support')
                    .setDescription('Create a support ticket.')
                    .setEmoji('📱')
                    .setValue('support'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Report')
                    .setDescription('Create a report ticket.')
                    .setEmoji('📝')
                    .setValue('report'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Questions')
                    .setDescription('Ask a general question.')
                    .setEmoji('❓')
                    .setValue('questions'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Other')
                    .setDescription('Anything else that doesn’t fit the options above.')
                    .setEmoji('🔞')
                    .setValue('other')
            );

        const row = new ActionRowBuilder()
            .addComponents(select);

        // Stuur de embed naar het specifieke kanaal
        const channelId = '1264702373800968276';
        const channel = interaction.guild.channels.cache.get(channelId);
        if (channel) {
            await channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: 'Ticket system setup complete.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'The specified channel does not exist.', ephemeral: true });
        }
    }
};
