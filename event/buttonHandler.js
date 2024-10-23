const { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const { customId, user } = interaction;

        try {
            if (interaction.replied || interaction.deferred) return; // Controleer of er al een reactie is gegeven.

            if (['acceptSuggestion', 'denySuggestion', 'editSuggestion'].includes(customId)) {
                const developerRoleId = 'Develper_rol'; // Developer role ID

                if (!interaction.member.roles.cache.has(developerRoleId)) {
                    await interaction.reply({ content: 'You do not have permission to use this button.', ephemeral: true });
                    return;
                }

                const suggestionMessage = await interaction.channel.messages.fetch(interaction.message.id);
                const suggestionEmbed = suggestionMessage.embeds[0];
                let updatedEmbed, updatedComponents;

                if (customId === 'acceptSuggestion') {
                    updatedEmbed = EmbedBuilder.from(suggestionEmbed)
                        .setTitle('Suggestion Accepted')
                        .setColor('#00FF00')
                        .setFooter({ text: `Suggestion accepted by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

                    updatedComponents = [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('editSuggestion')
                                .setLabel('Edit')
                                .setStyle(ButtonStyle.Secondary)
                        )
                    ];

                    await suggestionMessage.edit({ embeds: [updatedEmbed], components: updatedComponents });
                    await interaction.reply({ content: 'Suggestion has been accepted.', ephemeral: true });

                } else if (customId === 'denySuggestion') {
                    updatedEmbed = EmbedBuilder.from(suggestionEmbed)
                        .setTitle('Suggestion Denied')
                        .setColor('#FF0000')
                        .setFooter({ text: `Suggestion denied by ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) });

                    updatedComponents = [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('editSuggestion')
                                .setLabel('Edit')
                                .setStyle(ButtonStyle.Secondary)
                        )
                    ];

                    await suggestionMessage.edit({ embeds: [updatedEmbed], components: updatedComponents });
                    await interaction.reply({ content: 'Suggestion has been denied.', ephemeral: true });

                } else if (customId === 'editSuggestion') {
                    updatedComponents = [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('acceptSuggestion')
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('denySuggestion')
                                .setLabel('Deny')
                                .setStyle(ButtonStyle.Danger)
                        )
                    ];

                    await suggestionMessage.edit({ components: updatedComponents });
                    await interaction.reply({ content: 'You can now modify the suggestion decision.', ephemeral: true });
                }
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error handling the suggestion.', ephemeral: true });
            }
        }
    }
};

module.exports = {
    async handleButtonInteraction(interaction) {
        const requiredRole = 'Event_admin'; // Role ID
        const eventChannelId = 'eventchannel'; // Event channel ID

        if (!interaction.member.roles.cache.has(requiredRole)) {
            return interaction.reply({ content: 'You do not have the required role to perform this action.', ephemeral: true });
        }

        // Check if the interaction is in the event channel
        if (interaction.channel.id !== eventChannelId) {
            return interaction.reply({ content: 'This interaction can only be used in the event channel.', ephemeral: true });
        }

        try {
            if (interaction.customId === 'start_button') {
                // Replace 'Start Event' button with 'End Event' button
                const endButtonRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('end_button')
                            .setLabel('End Event')
                            .setStyle(ButtonStyle.Danger)
                    );

                // Update the message to replace the 'Start Event' button with the 'End Event' button
                await interaction.update({ components: [endButtonRow] });

                // Log the status change
                console.log('Event status updated to Started.');
            } else if (interaction.customId === 'end_button') {
                // Delete the event message
                await interaction.message.delete();

                // Log the status change
                console.log('Event status updated to Ended.');
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
        }
    }
};
