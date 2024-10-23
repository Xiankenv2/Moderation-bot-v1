const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a poll and send it to a specific channel.")
        .addStringOption(option =>
            option.setName("question")
                .setDescription("Provide the question of the poll.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("choice-1")
                .setDescription("First choice.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("choice-2")
                .setDescription("Second choice.")
                .setRequired(true)
        )
        .setDMPermission(false) // Prevents the command from being executable in bot DMs.
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Edit this permission to your liking.
        
    async execute(interaction) {
        const { options } = interaction;
        const question = options.getString("question");
        const choiceOne = options.getString("choice-1");
        const choiceTwo = options.getString("choice-2");

        // Specify the target channel ID here.
        const targetChannelId = 'ChannlID';
        const targetChannel = await interaction.client.channels.fetch(targetChannelId);

        try {
            // Send the poll embed.
            const message = await targetChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📊 New Poll!")
                        .setDescription(`**Question:** ${question}`)
                        .addFields(
                            { name: "1️⃣ Choice 1", value: `${choiceOne}`, inline: true },
                            { name: "2️⃣ Choice 2", value: `${choiceTwo}`, inline: true }
                        )
                        .setFooter({
                            text: `Requested by: ${interaction.member.user.tag}`,
                            iconURL: interaction.member.displayAvatarURL({ dynamic: true })
                        })
                        .setColor("#2b2d31")
                ]
            });

            // Add the number reactions to the poll embed.
            await message.react("1️⃣");
            await message.react("2️⃣");

            // Send the success embed.
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setDescription(
                            `✅ Successfully sent the poll embed in the channel: <#${targetChannelId}>`
                        )
                        .addFields(
                            { name: "❓ Question", value: `${question}`, inline: true },
                            { name: "1️⃣ Choice 1", value: `${choiceOne}`, inline: true },
                            { name: "2️⃣ Choice 2", value: `${choiceTwo}`, inline: true },
                        )
                ],
                ephemeral: true
            });
        } catch (err) {
            console.log(err);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Yellow")
                        .setDescription(
                            `⚠️ Something went wrong. Please try again later.`
                        )
                ],
                ephemeral: true
            });
        }
    }
};
