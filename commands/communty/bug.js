const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bug-report")
        .setDescription("Report a bug in the bot"),
    async execute(interaction) {
        let modal = new ModalBuilder()
            .setCustomId('reportModal')
            .setTitle('Report a bug');

        let textInput = new TextInputBuilder()
            .setCustomId('reportInput')
            .setPlaceholder('Type your issue here')
            .setLabel('Bug Report | Issue')
            .setMaxLength(250)
            .setMinLength(5)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        let report = new ActionRowBuilder().addComponents(textInput);
        modal.addComponents(report);

        try {
            await interaction.showModal(modal);

            let response = await interaction.awaitModalSubmit({ time: 600000 });
            let message = response.fields.getTextInputValue('reportInput');

            const bugEmbed = new EmbedBuilder()
                .setAuthor({ name: `Bug Report Command` })
                .setTitle(`${interaction.client.user.username} Bug Report Tool`)
                .setColor('#00FF00') // Example color
                .addFields({ name: "User:", value: `<@${interaction.user.id}>`, inline: false })
                .setDescription(`New bug report from ${interaction.user.username}: \n> **${message}**`)
                .setFooter({ text: `Bug report sent from ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ size: 1024 }) })
                .setTimestamp();

            const channelEmbed = new EmbedBuilder()
                .setAuthor({ name: `Bug Report Command` })
                .setTitle(`You've sent a bug report to the developers of ${interaction.client.user.username}!`)
                .setDescription(`Thank you for the bug report of: \n> **${message}**`)
                .setColor('#00FF00') // Example color
                .setTimestamp();

            const userEmbed = new EmbedBuilder()
                .setAuthor({ name: `Bug Report Command` })
                .setTitle(`You've sent a bug report to the developers of ${interaction.client.user.username}!`)
                .setThumbnail(interaction.client.user.avatarURL())
                .setDescription(`Thank you for the bug report of: \n> **${message}**`)
                .setColor('#00FF00') // Example color
                .setFooter({ text: `Bug report sent from ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ size: 1024 }) })
                .setTimestamp();

            const channel = interaction.client.channels.cache.get('CHennelID');
            if (channel) {
                await channel.send({ embeds: [bugEmbed] });
            } else {
                console.error(`Channel with ID 831904566366306376 not found.`);
            }

            try {
                await interaction.user.send({ embeds: [userEmbed] });
            } catch (err) {
                console.error(`Failed to send DM to user ${interaction.user.tag}: ${err}`);
                // Optionally, you can follow up with a message in the guild
                if (!interaction.replied) {
                    await interaction.reply({ content: "I was unable to send a confirmation DM. Please make sure your DM settings allow messages from server members.", ephemeral: true });
                }
            }

            if (response && !response.replied) {
                // Reply to the modal submission interaction if it hasn't been replied to yet
                await response.reply({ embeds: [channelEmbed], ephemeral: true });
            }

        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: "There was an error while handling your bug report.", ephemeral: true });
            } else if (interaction.replied && !interaction.acknowledged) {
                await interaction.followUp({ content: "There was an error while handling your bug report.", ephemeral: true });
            }
        }
    }
};
