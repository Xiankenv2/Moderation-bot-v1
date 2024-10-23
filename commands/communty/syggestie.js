const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("suggestion")
        .setDescription("Submit a suggestion for the bot"),
        
    async execute(interaction) {
        let modal = new ModalBuilder()
            .setCustomId('suggestionModal')
            .setTitle('Submit a Suggestion');

        let textInput = new TextInputBuilder()
            .setCustomId('suggestionInput')
            .setPlaceholder('Type your suggestion here')
            .setLabel('Suggestion')
            .setMaxLength(250)
            .setMinLength(5)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        let suggestion = new ActionRowBuilder().addComponents(textInput);
        modal.addComponents(suggestion);

        try {
            await interaction.showModal(modal);

            let response = await interaction.awaitModalSubmit({ time: 600000 });
            let suggestionText = response.fields.getTextInputValue('suggestionInput');

            const suggestionEmbed = new EmbedBuilder()
                .setAuthor({ name: `Suggestion` })
                .setTitle(`${interaction.client.user.username} Suggestion System`)
                .setColor('#00FF00') // Example color
                .addFields({ name: "User:", value: `<@${interaction.user.id}>`, inline: false })
                .setDescription(`New suggestion from ${interaction.user.username}: \n> **${suggestionText}**`)
                .setFooter({ text: `Suggestion submitted from ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ size: 1024 }) })
                .setTimestamp();

            const responseEmbed = new EmbedBuilder()
                .setAuthor({ name: `Suggestion` })
                .setTitle(`You've submitted a suggestion to the developers of ${interaction.client.user.username}!`)
                .setDescription(`Thank you for your suggestion: \n> **${suggestionText}**`)
                .setColor('#00FF00') // Example color
                .setTimestamp();

            const acceptButton = new ButtonBuilder()
                .setCustomId('acceptSuggestion')
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success);

            const denyButton = new ButtonBuilder()
                .setCustomId('denySuggestion')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger);

            const buttonRow = new ActionRowBuilder().addComponents(acceptButton, denyButton);

            const suggestionChannel = interaction.client.channels.cache.get('YOU ID'); // Replace with your suggestion channel ID
            if (suggestionChannel) {
                const suggestionMessage = await suggestionChannel.send({ embeds: [suggestionEmbed], components: [buttonRow] });

                // Add reaction emojis for initial feedback
                await suggestionMessage.react('👍'); // Thumbs up emoji
                await suggestionMessage.react('❌'); // Thumbs down emoji
            } else {
                console.error(`Channel with ID 1272573966942212137 not found.`);
            }

            try {
                await interaction.user.send({ embeds: [responseEmbed] });
            } catch (err) {
                console.error(`Failed to send DM to user ${interaction.user.tag}: ${err}`);
                if (!interaction.replied) {
                    await interaction.reply({ content: "I was unable to send a confirmation DM. Please make sure your DM settings allow messages from server members.", ephemeral: true });
                }
            }

            if (response) {
                await response.reply({ content: "Your suggestion has been submitted successfully!", ephemeral: true });
            }

        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: "There was an error while handling your suggestion.", ephemeral: true });
            } else if (interaction.replied && !interaction.acknowledged) {
                await interaction.followUp({ content: "There was an error while handling your suggestion.", ephemeral: true });
            }
        }
    }
};
