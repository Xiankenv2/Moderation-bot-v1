const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules-setup')
        .setDescription('Set up the server rules'),
    async execute(interaction) {
        // Check if the user has administrator permissions 
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: 'Invalid permissions', ephemeral: true });
        }
        // ^^ you need adminpoerms

        const rulesChannelId = 'Channl ID';
        const rulesChannel = interaction.guild.channels.cache.get(rulesChannelId);

        if (!rulesChannel) {
            return await interaction.reply({ content: 'The specified rules channel does not exist.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('**Server Rules**')
            .setDescription(
                '1. **Respect Everyone:** Be kind and treat everyone with respect, regardless of their beliefs or background.\n' +
                '2. **No Hate:** Discrimination based on race, ethnicity, religion, sexual orientation, or gender is not welcome here.\n' +
                '3. **No Inappropriate Content:** Keep adult content out of this server.\n' +
                '4. **No Violence:** Avoid glorifying or promoting violence.\n' +
                '5. **Stay On Topic:** Keep your messages relevant to the channel to maintain order.\n' +
                '6. **No Spam:** Spam is discouraged and will be removed.\n' +
                '7. **Self-Promotion With Permission:** Self-promotion is only allowed with moderator approval.\n' +
                '8. **No Illegal Activities:** Discussing or promoting illegal activities is prohibited.\n' +
                '9. **Privacy is Sacred:** Keep personal information like addresses, phone numbers, and bank details private.\n' +
                '10. **No Trolling:** Deliberate provocation is not allowed.\n' +
                '11. **Respectful Discussions:** Discuss sensitive topics like religion and politics respectfully and in appropriate channels.\n' +
                '12. **Mind Your Language:** Offensive language is not tolerated.\n' +
                '13. **Stick to Your Own Story:** Do not share personal stories of others without consent.\n' +
                '14. **No Piracy:** Sharing illegal download links is strictly forbidden.\n' +
                '15. **Stay On Theme:** Keep conversations relevant to the channel’s theme.\n' +
                '16. **Do Not Impersonate:** Be yourself; do not pretend to be someone else.\n' +
                '17. **Speak the Language:** Use the channel\'s designated language unless otherwise stated.\n' +
                '18. **Limit CAPS LOCK:** Excessive use of capital letters can be disruptive.\n' +
                '19. **Selling With Permission:** Only conduct sales with permission from the server owner.\n' +
                '20. **Bot Commands in Designated Areas:** Use bot commands only in designated channels.\n' +
                '21. **No Acting as Mod/Admin:** Do not take actions reserved for server staff.\n' +
                '22. **No External Drama:** Keep personal conflicts out of the server.\n' +
                '23. **Links With Permission:** Only share links with moderator approval.\n' +
                '24. **No Fake News:** Only share verified information.\n' +
                '25. **No Abuse of Bug/Suggestion Channels:** Use these channels appropriately.\n' +
                '26. **No Exploiting Bugs:** Do not exploit server bugs for personal gain.\n' +
                '27. **Follow Discord Community Guidelines:** Always adhere to [Discord Community Guidelines](https://discord.com/guidelines) and [Discord\'s Terms of Service](https://discord.com/terms).'
            )
            .setColor('DarkRed')
            .setTimestamp()
            .setFooter({ text: 'Please read and follow the rules.' });

        // Send the rules embed in the specified channel
        await rulesChannel.send({ embeds: [embed] });

        await interaction.reply({ content: 'Rules have been set up successfully.', ephemeral: true });
    }
};
