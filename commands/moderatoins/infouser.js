const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { profileImage } = require('discord-arts'); // Zorg ervoor dat deze module werkt zoals verwacht

module.exports = {
  data: new SlashCommandBuilder()
    .setName("memberinfo")
    .setDescription("View your or any member's information")
    .setDMPermission(false)
    .addUserOption(option => option
      .setName("member")
      .setDescription("View member information")
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    const memberOption = interaction.options.getMember("member");
    const member = memberOption || interaction.member;

    if (member.user.bot) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder().setDescription("Bots are not supported for this command.")
        ],
        ephemeral: true
      });
    }

    try {
      const fetchedMembers = await interaction.guild.members.fetch();
      const profileBuffer = await profileImage(member.id);
      const imageAttachment = new AttachmentBuilder(profileBuffer, { name: 'profile.png' });

      const joinPosition = Array.from(fetchedMembers
        .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
        .keys())
        .indexOf(member.id) + 1;

      const topRoles = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, 3)
        .join(', ');

      const userBadges = member.user.flags.toArray();

      const joinTime = Math.floor(member.joinedTimestamp / 1000);
      const createdTime = Math.floor(member.user.createdTimestamp / 1000);

      const Booster = member.premiumSince ? "<:discordboost:1136752072369377410>" : "✖";

      const avatarButton = new ButtonBuilder()
        .setLabel('Avatar')
        .setStyle('LINK')
        .setURL(member.displayAvatarURL());

      const bannerButton = new ButtonBuilder()
        .setLabel('Banner')
        .setStyle('LINK')
        .setURL(member.user.bannerURL() || 'https://example.com/default-banner.jpg');

      const row = new ActionRowBuilder()
        .addComponents(avatarButton, bannerButton);

      const Embed = new EmbedBuilder()
        .setAuthor({ name: `${member.user.tag} | General Information`, iconURL: member.displayAvatarURL() })
        .setColor('Aqua')
        .setDescription(`On <t:${joinTime}:D>, ${member.user.username} joined as the **${addSuffix(joinPosition)}** member of this guild.`)
        .setImage("attachment://profile.png")
        .addFields([
          { name: "Badges", value: `${addBadges(userBadges).join(" ")}`, inline: true },
          { name: "Booster", value: `${Booster}`, inline: true },
          { name: "Top Roles", value: `${topRoles}`, inline: false },
          { name: "Created", value: `<t:${createdTime}:R>`, inline: true },
          { name: "Joined", value: `<t:${joinTime}:R>`, inline: true },
          { name: "UserId", value: `${member.id}`, inline: false },
        ]);

      await interaction.editReply({ embeds: [Embed], components: [row], files: [imageAttachment] });

    } catch (error) {
      console.error(error); // Zorg ervoor dat je foutmeldingen logt
      await interaction.editReply({ content: "An error occurred while executing the command." });
    }
  }
};

function addSuffix(number) {
  if (number % 100 >= 11 && number % 100 <= 13) return number + "th";
  switch (number % 10) {
    case 1: return number + "st";
    case 2: return number + "nd";
    case 3: return number + "rd";
    default: return number + "th";
  }
}

function addBadges(badgeNames) {
  if (!badgeNames.length) return ["X"];
  const badgeMap = {
    "ActiveDeveloper": "<:activedeveloper:1137081810656960512>",
    "BugHunterLevel1": "<:discordbughunter1:1137081819423064175>",
    "BugHunterLevel2": "<:discordbughunter2:1137081823734800424>",
    "PremiumEarlySupporter": "<:discordearlysupporter:1137081826872139876>",
    "Partner": "<:discordpartner:1137081833612394569>",
    "Staff": "<:discordstaff:1137081836829409362>",
    "HypeSquadOnlineHouse1": "<:hypesquadbravery:1137081841761923184>",
    "HypeSquadOnlineHouse2": "<:hypesquadbrilliance:1137081843620008007>",
    "HypeSquadOnlineHouse3": "<:hypesquadbalance:1137081838553276416>",
    "Hypesquad": "<:hypesquadevents:1137081846824452096>",
    "CertifiedModerator": "<:olddiscordmod:1137081849131319336>",
    "VerifiedDeveloper": "<:discordbotdev:1137081815799169084>",
  };

  return badgeNames.map(badgeName => badgeMap[badgeName] || '❔');
}
