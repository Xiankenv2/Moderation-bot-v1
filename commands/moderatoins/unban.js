const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unnban")
    .setDescription("Unban a user from the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to unban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for unbanning the member")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply(); // Defers the reply to prevent timeout issues

    const userID = interaction.options.getUser("user").id; // Fetching user ID
    const guild = interaction.guild;

    // Check if the user has permission to unban
    const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const options = interaction.options;

        // Check if the moderator has the required roles
        const requiredRoles = ['staff rol', 'staff rol'];
        if (!requiredRoles.some(role => moderator.roles.cache.has(role))) {
            await interaction.followUp({ content: 'You do not have the required roles to use this command.', ephemeral: true });
            return;
        }
        
      
          // Check if the moderator has the role "1263597681918349483"
        


    // Check if the user is trying to unban themselves
    if (interaction.user.id === userID) {
      await interaction.followUp({
        content: "You cannot unban yourself!",
        ephemeral: true,
      });
      return;
    }

    const reason = interaction.options.getString("reason") || "No reason given";

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setDescription(`:white_check_mark: <@${userID}> has been unbanned | ${reason}`);

    try {
      const bans = await guild.bans.fetch();

      // Check if there are no bans
      if (bans.size === 0) {
        await interaction.followUp({
          content: "There is no one banned from this guild",
          ephemeral: true,
        });
        return;
      }

      // Check if the user is banned
      const bannedUser = bans.find((ban) => ban.user.id === userID);
      if (!bannedUser) {
        await interaction.followUp({
          content: "The ID stated is not banned from this server",
          ephemeral: true,
        });
        return;
      }

      // Unban the user
      await guild.bans.remove(userID, reason);

      // Reply with success message
      await interaction.followUp({ embeds: [embed] });

      // Log the unban action to the specified channel
      const logChannelId = '1265368941014810817';
      const logChannel = guild.channels.cache.get(logChannelId);

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("Unban Log")
          .addFields(
            { name: "Unbanned User:", value: `<@${userID}>`, inline: true },
            { name: "Unbanned By:", value: interaction.user.tag, inline: true },
            { name: "Reason:", value: reason, inline: true },
            { name: "Date:", value: new Date().toLocaleString(), inline: true }
          );

        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.error(`Log channel with ID ${logChannelId} not found.`);
      }

    } catch (err) {
      console.error(err);
      // Error handling if the unban fails
      await interaction.followUp({ content: "I cannot unban this user" });
    }
  },
};
