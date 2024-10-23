const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Organize an SSU, GT, or CT event.')
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Choose the event type')
                .setRequired(true)
                .addChoices(
                    { name: 'Server Startup (SSU)', value: 'SSU' },
                    { name: 'Combat Training (CT)', value: 'CT' },
                    { name: 'General Training (GT)', value: 'GT' },
                ))
        .addUserOption(option => 
            option.setName('host')
                .setDescription('Select the host')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('starttime')
                .setDescription('Specify the start time in minutes from now (e.g., 5 for 5 minutes from now)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Roblox link (game or profile)')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('cohost')
                .setDescription('Select the co-host (optional)')
                .setRequired(false))
        .addUserOption(option => 
            option.setName('supervisor')
                .setDescription('Select the supervisor (optional)')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('extrainfo')
                .setDescription('Extra information (optional)')
                .setRequired(false)),
    async execute(interaction) {
        const requiredRole = 'Event_perm'; // Role ID
        const logChannel = interaction.guild.channels.cache.get('Logchannel'); // Log channel ID
        const eventChannel = interaction.guild.channels.cache.get('Evenchannel');
        const type = interaction.options.getString('type');
        const host = interaction.options.getUser('host');
        const cohost = interaction.options.getUser('cohost') || 'If needed';
        const supervisor = interaction.options.getUser('supervisor') || 'If needed';
        const starttimeMinutes = parseInt(interaction.options.getString('starttime'), 10);
        const extrainfo = interaction.options.getString('extrainfo') || `Stand STS for the host or co-host | PTS active | Don't raid | Don't abuse PTS | No viewers`;
        const link = interaction.options.getString('link');

        // Validate the Roblox link
        const robloxRegex = /^(https?:\/\/)?(www\.)?roblox\.com\/(games|users)\/\d+/;
        if (!robloxRegex.test(link)) {
            return interaction.reply({ content: 'The provided link is not a valid Roblox link.', ephemeral: true });
        }

        // Check if the user has the required role
        if (!interaction.member.roles.cache.has(requiredRole)) {
            return interaction.reply({ content: 'You do not have the required role to execute this command.', ephemeral: true });
        }

        if (!logChannel || !eventChannel) {
            return interaction.reply({ content: 'Could not find the log or event channel.', ephemeral: true });
        }

        // Validate the start time
        if (isNaN(starttimeMinutes) || starttimeMinutes <= 0) {
            return interaction.reply({ content: 'The start time must be a positive number of minutes from now.', ephemeral: true });
        }

        const now = new Date();
        const eventTime = new Date(now.getTime() + starttimeMinutes * 60000); // Add minutes to current time

        // Format the event time in 24-hour and 12-hour formats
        const hours = eventTime.getHours();
        const minutes = eventTime.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const usHours = hours % 12 || 12;
        const usFormattedTime = `${usHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        const ukFormattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Create the embed for the event channel
        const eventEmbed = new EmbedBuilder()
            .setTitle(`New Event: ${type}`)
            .setColor(0x00FF00) // Green
            .addFields(
                { name: 'Host', value: `${host}`, inline: false },
                { name: 'Co-Host', value: `${cohost}`, inline: false },
                { name: 'Supervisor', value: `${supervisor}`, inline: false },
                { name: 'Start Time (UK)', value: `${ukFormattedTime} (24-hour)`, inline: false },
                { name: 'Start Time (US)', value: `${usFormattedTime} (12-hour)`, inline: false },
                { name: 'Roblox Link', value: `[link](${link})`, inline: false },
                { name: 'Extra Info', value: `${extrainfo}`, inline: false }
            )
            .setTimestamp();

        // Send the event log to the log channel
        const logMessage = 
            `**Event Log**\n` +
            `Host: ${host}\n` +
            `Co-Host: ${cohost}\n` +
            `Supervisor: ${supervisor}\n` +
            `Event Type: ${type}\n` +
            `Start Time (UK): ${ukFormattedTime} (24-hour)\n` +
            `Start Time (US): ${usFormattedTime} (12-hour)\n` +
            `Info: ${extrainfo}\n` +
            `Link: [link](${link})`;

        // Log the event in the log channel
        logChannel.send({ content: logMessage });

        // Post the event in the event channel and ping everyone
        await eventChannel.send({ content: '@everyone', embeds: [eventEmbed] });

        // Confirm the command execution to the user
        interaction.reply({ content: 'The event has been successfully created and logged!', ephemeral: true });
    },
};
