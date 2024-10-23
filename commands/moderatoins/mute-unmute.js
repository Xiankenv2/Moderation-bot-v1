const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

const MUTE_LOG_CHANNEL_ID = '';
const UNMUTE_LOG_CHANNEL_ID = '';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeouts a user')
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set a timeout')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
            .addStringOption(option => option
                .setName('days')
                .setDescription('Timeout duration in days'))
            .addStringOption(option => option
                .setName('hours')
                .setDescription('Timeout duration in hours'))
            .addStringOption(option => option
                .setName('minutes')
                .setDescription('Timeout duration in minutes'))
            .addStringOption(option => option
                .setName('seconds')
                .setDescription('Timeout duration in seconds'))
            .addStringOption(option => option
                .setName('reason')
                .setDescription('The reason for the timeout')))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove a timeout')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to remove the timeout from')
                .setRequired(true)))
        .setDMPermission(false),
    async execute(interaction) {
        const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const options = interaction.options;

        // Check if the moderator has the required roles
        const requiredRoles = ['1233419667473825862'];
        if (!requiredRoles.some(role => moderator.roles.cache.has(role))) {
            await interaction.followUp({ content: 'You do not have the required roles to use this command.', ephemeral: true });
            return;
        }
        
      
        // Check if the moderator has the role "1263597681918349483"
        if (moderator.roles.cache.has('Mod rol')) {
            await interaction.reply({ content: 'Error: You are under investigation', ephemeral: false });
            return;
        }

        const subcommand = options.getSubcommand();

        if (subcommand === 'set') {
            const user = options.getUser('user');
            const days = options.getString('days');
            const hours = options.getString('hours');
            const minutes = options.getString('minutes');
            const seconds = options.getString('seconds');
            const reason = options.getString('reason') || 'Not specified';

            const timeMember = await interaction.guild.members.fetch(user.id);

            if (!days && !hours && !minutes && !seconds) {
                const embed2 = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Timeout')
                    .setDescription('You must provide at least one time option!')
                    .setTimestamp()
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });
                return await interaction.reply({ embeds: [embed2], ephemeral: true });
            }

            if (!timeMember) {
                const embed3 = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Timeout')
                    .setDescription('The mentioned user is no longer in the server.')
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed3], ephemeral: true });
            }

            if (interaction.member.id === timeMember.id) {
                const embed5 = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Timeout')
                    .setDescription('You cannot timeout yourself!')
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed5], ephemeral: true });
            }

            if (!timeMember.kickable) {
                const embed4 = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Timeout')
                    .setDescription('You cannot timeout this user because they have a higher/same role.')
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed4], ephemeral: true });
            }

            if (timeMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
                const embed6 = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Timeout')
                    .setDescription('You cannot timeout staff members or users with administrator permission!')
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed6], ephemeral: true });
            }

            let duration = (parseInt(days) || 0) * 86400 + (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
            if (duration === 0) {
                const embed7 = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Timeout')
                    .setDescription('You cannot specify 0 duration!')
                    .setTimestamp()
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });
                return await interaction.reply({ embeds: [embed7], ephemeral: true });
            }

            if (duration > 604800) {
                const embed8 = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Timeout')
                    .setDescription('You cannot specify more than 1 week duration!')
                    .setTimestamp()
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });
                return await interaction.reply({ embeds: [embed8], ephemeral: true });
            }

            let displayDays = Math.floor(duration / 86400);
            let displayHours = Math.floor((duration % 86400) / 3600);
            let displayMinutes = Math.floor((duration % 3600) / 60);
            let displaySeconds = duration % 60;

            let durationString = `${displayDays > 0 ? displayDays + ' day' : ''}${displayHours > 0 ? (displayDays > 0 ? ', ' : '') + displayHours + ' hour' : ''}${displayMinutes > 0 ? (displayDays > 0 || displayHours > 0 ? ', ' : '') + displayMinutes + ' minute' : ''}${displaySeconds > 0 ? (displayDays > 0 || displayHours > 0 || displayMinutes > 0 ? ', ' : '') + displaySeconds + ' second' : ''}`;

            await timeMember.timeout(duration * 1000, reason);

            const embed9 = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle('Timeout')
                .setDescription(`${user} has been successfully timed out.`)
                .addFields(
                    { name: 'Duration', value: durationString, inline: true },
                    { name: 'Reason', value: reason, inline: true }
                )
                .setTimestamp()
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed9] });

            // Log to mute log channel
            const muteLogChannel = await interaction.client.channels.fetch(MUTE_LOG_CHANNEL_ID);
            const muteLogEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('User Timeout')
                .addFields(
                    { name: 'User', value: user.toString(), inline: true },
                    { name: 'Mute Time', value: durationString, inline: true },
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Moderator', value: interaction.member.toString(), inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `ID: ${user.id}` });
            await muteLogChannel.send({ embeds: [muteLogEmbed] });

        } else if (subcommand === 'remove') {
            const user = options.getUser('user');
            const timeMember = await interaction.guild.members.fetch(user.id);

            if (!timeMember) {
                const embed10 = new EmbedBuilder()
                    .setColor('#ffffff')
                    .setTitle('Timeout')
                    .setDescription('The mentioned user is no longer in the server.')
                    .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed10], ephemeral: true });
            }

            await timeMember.timeout(null);

            const embed11 = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle('Timeout Removed')
                .setDescription(`Timeout for ${user} has been removed.`)
                .setTimestamp()
                .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed11] });

            // Log to unmute log channel
            const unmuteLogChannel = await interaction.client.channels.fetch(UNMUTE_LOG_CHANNEL_ID);
            const unmuteLogEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('User Unmuted')
                .addFields(
                    { name: 'User', value: user.toString(), inline: true },
                    { name: 'Time Left', value: 'N/A', inline: true }, // Time left is not applicable for unmute
                    { name: 'Moderator', value: interaction.member.toString(), inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `ID: ${user.id}` });
            await unmuteLogChannel.send({ embeds: [unmuteLogEmbed] });
        }
    }
};
