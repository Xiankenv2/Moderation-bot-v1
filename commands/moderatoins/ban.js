const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, WebhookClient } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('proof')
                .setDescription('Proof image for the ban')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply(); // Defers the reply to prevent interaction timeout issues

        const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const options = interaction.options;

        // Check if the moderator has the required roles
        const requiredRoles = ['Staffrol', 'Staffrol'];
        if (!requiredRoles.some(role => moderator.roles.cache.has(role))) {
            await interaction.followUp({ content: 'You do not have the required roles to use this command.', ephemeral: true });
            return;
        }

        const logChannelId = 'Log ID';

        if (!user) {
            await interaction.followUp({ content: "User not found in the guild.", ephemeral: true });
            return;
        }

        // Check if the user to be banned has certain roles
        if (user.roles.cache.has('Staffrol')) {
            await interaction.followUp({ content: 'You cannot ban a user with the role "Staff team"!', ephemeral: true });
            return;
        }
      
        // Check if the moderator has the role "1263597681918349483"
      

        if (!member.bannable) {
            await interaction.followUp({ content: "This user is not bannable.", ephemeral: true });
            return;
        }

        if (member.id === interaction.user.id) {
            await interaction.followUp({ content: "You cannot ban yourself.", ephemeral: true });
            return;
        }

         
        
        // Check if the user being banned is in the server
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const proof = interaction.options.getAttachment('proof');
        const member = interaction.guild.members.cache.get(user.id);

        try {
            await member.ban({ reason });

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('Ban Case')
                .setDescription(
                    `> User: ${user.tag}\n` +
                    `> Banned by: ${interaction.user.tag}\n` +
                    `> Reason: ${reason}\n` +
                    `> Banned on: ${new Date().toLocaleString()}\n` +
                    `> Expires: False`
                );

            if (proof) {
                embed.setImage(proof.url);
            }

            await interaction.followUp({ embeds: [embed] });

            // DM the user with the ban details
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('You have been banned')
                .setDescription(
                    `You have been banned from **${interaction.guild.name}**.\n\n` +
                    `**Reason:** ${reason}\n` +
                    `**Moderator:** ${interaction.user.tag}\n` +
                    `**Proof:** [Here](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${interaction.id})`
                );

            let dmStatus = 'failed';
            try {
                const dmChannel = await user.createDM();
                await dmChannel.send({ embeds: [dmEmbed] });
                dmStatus = 'successful';
            } catch (err) {
                console.error(`Failed to send DM to ${user.tag}: ${err}`);
            }

            // Log Channel ID
            
            const logChannel = interaction.guild.channels.cache.get(logChannelId);

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Ban Information')
                    .addFields(
                        { name: 'Name:', value: user.tag, inline: true },
                        { name: 'Date of Ban:', value: new Date().toLocaleString(), inline: true },
                        { name: 'Join Date:', value: new Date(member.joinedAt).toLocaleString(), inline: true },
                        { name: 'Reason:', value: reason, inline: true },
                        { name: 'Moderator:', value: interaction.user.tag, inline: true },
                        { name: 'DM Status:', value: dmStatus, inline: true }
                    );

                if (proof) {
                    logEmbed.addFields({ name: 'Proof:', value: proof.url, inline: true });
                }

                await logChannel.send({ embeds: [logEmbed] });
            }

            // Send the ban information to a webhook
            const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1264619801347883098/BgwhqLCVtYw6A26unLGbJDewE04Gd9U5KCunkf0VYJ8xio-q0EeASrsRbvJxQ4mZvSZi' });
            const webhookEmbed = new EmbedBuilder()
                .setTitle('Ban Information')
                .addFields(
                    { name: 'Name:', value: user.tag, inline: true },
                    { name: 'ID:', value: user.id, inline: true },
                    { name: 'Reason:', value: reason, inline: true },
                    { name: 'Date:', value: new Date().toLocaleString(), inline: true },
                    { name: 'Moderator:', value: interaction.user.tag, inline: true },
                    { name: 'Moderator ID:', value: interaction.user.id, inline: true },
                    { name: 'Avatar:', value: user.displayAvatarURL(), inline: true },
                    { name: 'Join Date:', value: new Date(member.joinedAt).toLocaleString(), inline: true },
                    { name: 'Moderator Join Date:', value: new Date(interaction.user.joinedAt).toLocaleString(), inline: true }
                );

            if (proof) {
                webhookEmbed.setImage(proof.url);
            }

            await webhook.send({ embeds: [webhookEmbed] });

        } catch (error) {
            console.error(error);
            // Ensure that you don't attempt to reply if the interaction has already been acknowledged
            if (!interaction.replied) {
                await interaction.followUp({ content: 'There was an error trying to ban this user.', ephemeral: true });
            }
        }
    }
};
