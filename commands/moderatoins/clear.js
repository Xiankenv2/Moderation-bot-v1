const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Purge messages based on a specific criterion")
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("Select the type of messages to purge")
                .setRequired(true)
                .addChoices(
                    { name: "All", value: "all" },
                    { name: "User", value: "user" },
                    { name: "Bot", value: "bot" },
                    { name: "Links", value: "links" },
                    { name: "Caps", value: "caps" },
                    { name: "Images", value: "images" },
                    { name: "Reactions", value: "reactions" },
                    { name: "Mentions", value: "mentions" },
                    { name: "Embeds", value: "embed" },
                    { name: "Emojis", value: "emojis" },
                    { name: "Stickers", value: "stickers" },
                    { name: "Webhooks", value: "webhooks" },
                    { name: "Pins", value: "pins" }
                )
        )
        .addIntegerOption(option =>
            option
                .setName("count")
                .setDescription("Number of messages to purge")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Specify the user (only for 'User' purge type)")
        ),
    async execute(interaction) {
        const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const requiredRoles = ['Staff rol', 'option'];

        if (!requiredRoles.some(role => moderator.roles.cache.has(role))) {
            await interaction.reply({ content: 'You do not have the required roles to use this command.', ephemeral: true });
            return;
        }

        if (moderator.roles.cache.has('1263597681918349483')) {
            await interaction.reply({ content: 'Error: You are under investigation', ephemeral: true });
            return;
        }

        const type = interaction.options.getString("type");
        let amount = interaction.options.getInteger("count");
        const user = interaction.options.getUser("user");
        if (amount > 100) amount = 100;
        if (amount < 1) amount = 1;

        const fetch = await interaction.channel.messages.fetch({ limit: amount });
        const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

        async function results(deletedMessages, type) {
            if (deletedMessages.size === 0) {
                const embed = new EmbedBuilder()
                    .setDescription(`:warning: There is no **${type}** to purge.`)
                    .setColor("#a4aafe");

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const results = {};
            for (const [, deleted] of deletedMessages) {
                const user = `${deleted.author.username}`;
                if (!results[user]) results[user] = 0;
                results[user]++;
            }

            const userMessageMap = Object.entries(results);

            const finalResult = userMessageMap
                .map(([user, messages]) => `**\`${user} - ${messages}\`**`)
                .join("\n");

            const embed = new EmbedBuilder()
                .setTitle(`Purged ${type} (${deletedMessages.size})`)
                .setDescription(finalResult)
                .setColor("#a4aafe");

            await interaction.reply({ embeds: [embed] });
        }

        let filtered;
        let deletedMessages;

        try {
            switch (type) {
                case "all":
                    filtered = fetch.filter(m => m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Messages");
                    break;

                case "bot":
                    filtered = fetch.filter(m => m.author.bot && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Bot messages");
                    break;

                case "user":
                    if (!user) {
                        await interaction.reply({ content: "Please specify a user to purge messages from.", ephemeral: true });
                        return;
                    }
                    filtered = fetch.filter(m => m.author.id === user.id && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, `Messages from ${user.username}`);
                    break;

                case "links":
                    filtered = fetch.filter(m => /https?:\/\/\S+/i.test(m.content) && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Links");
                    break;

                case "caps":
                    filtered = fetch.filter(m => m.content.match(/[A-Z]/g) !== null && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Capital letters");
                    break;

                case "images":
                    filtered = fetch.filter(m =>
                        (m.attachments.some(attachment =>
                            /\.(png|jpe?g|gif|bmp|webp)$/i.test(attachment.url)
                        ) ||
                        /\/\/\S+\.(png|jpe?g|gif|bmp|webp)$/i.test(m.content)) &&
                        m.createdTimestamp > fourteenDaysAgo
                    );
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Images");
                    break;

                case "reactions":
                    filtered = fetch.filter(m => m.reactions.cache.size > 0 && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Reactions");
                    break;

                case "mentions":
                    filtered = fetch.filter(m => m.mentions.users.size > 0 && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Mentions");
                    break;

                case "embed":
                    filtered = fetch.filter(m => m.embeds.length > 0 && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Embeds");
                    break;

                case "emojis":
                    filtered = fetch.filter(m => /<:.+?:\d+>|<a:.+?:\d+>/i.test(m.content) && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Emojis");
                    break;

                case "stickers":
                    filtered = fetch.filter(m => m.stickers.size > 0 && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Stickers");
                    break;

                case "webhooks":
                    filtered = fetch.filter(m => m.webhookId && m.createdTimestamp > fourteenDaysAgo);
                    try {
                        deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                        await results(deletedMessages, "Webhooks");
                    } catch (error) {
                        console.error("[PURGE]", error);
                        await interaction.reply({
                            content: "An error occurred while processing the purge webhook command.",
                            ephemeral: true,
                        });
                    }
                    break;

                case "pins":
                    filtered = fetch.filter(m => m.pinned && m.createdTimestamp > fourteenDaysAgo);
                    deletedMessages = await interaction.channel.bulkDelete(filtered, true);
                    await results(deletedMessages, "Pins");
                    break;

                default:
                    await interaction.reply({
                        content: "Unknown purge type.",
                        ephemeral: true,
                    });
                    break;
            }
        } catch (error) {
            console.error("[PURGE]", error);
            await interaction.reply({
                content: "An error occurred while processing the purge command.",
                ephemeral: true,
            });
        }
    }
};
