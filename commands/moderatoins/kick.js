const {SlashCommandBuilder, PermissionsBitField, EmbedBuilder, WebhookClient } = require(`discord.js`)

module.exports = {
  data: new SlashCommandBuilder()
   .setName('kick')
   .setDescription('kick out of the server')
   .addUserOption(option => option.setName('user').setDescription('The user to ').setRequired(true))
   .addStringOption(option => option.setName('reason').setDescription('The reason for the ').setRequired(true))
   .addStringOption(option => option.setName('proof').setDescription('The proof for the mute').setRequired(false))
   .addAttachmentOption(option => option.setName('img').setDescription('place img proof').setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const moderator = interaction.guild.members.cache.get(interaction.user.id);

    // Check if the moderator has the required roles
    const requiredRoles = ['staff rol', 'option'];
    if (!requiredRoles.some(role => moderator.roles.cache.has(role))) {
      await interaction.reply({ content: 'You do not have the required roles to use this command.', ephemeral: false });
      return;
    }

    // Check if the moderator is trying to kick themselves
    if (moderator.id === user.id) {
      await interaction.reply({ content: 'You cannot kick yourself!', ephemeral: false });
      return;
    }

    // Check if the user has the role "1233419667473825862"
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      await interaction.reply({ content: 'User not found in the server.', ephemeral: false });
      return;
    }
    if (member.roles.cache.has('staff rol')) {
      await interaction.reply({ content: 'You cannot kick a user with the role "Staff team"!', ephemeral: false });
      return;
    }

    // Check if the moderator has the role "1263597681918349483"
   

    // Kick the user
    await member.kick({ reason: reason });

    // Create a nice embed with the kick information
    const embed = new EmbedBuilder()
     .setTitle('Kick Information')
     .addFields({ name: 'Name:', value: user.tag, inline: true })
     .addFields({ name: 'Date of kick:', value: new Date().toLocaleString(), inline: true })
     .addFields({ name: 'Join Date:', value: member.joinedAt.toLocaleString(), inline: true })
     .addFields({ name: 'Reason:', value: reason, inline: true })
     .addFields({ name: 'Moderator:', value: moderator.user.tag, inline: true });

    await interaction.reply({ embeds: [embed] });

    // Send a DM to the kicked user
    

    // Log the kick in the specified channel
    const logChannel = interaction.guild.channels.cache.get('log channel');
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }

    // Send the kick information to a webhook
    // (You'll need to set up a webhook and add the URL here)
    // const webhook = new WebhookClient({ url: 'YOUR_WEBHOOK_URL' });
    // await webhook.send({ embeds: [embed] });
  }
};