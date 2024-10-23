const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, resolvePartialEmoji } = require('discord.js');
const Rolperm = ["Perm_to_usecommand" || "Perm_to_usecommand"];
const logChannelId = "Log channel";
 

// 
const staffTeamRoles = ["Your_staffrols" ]; // game mod
const developerRoles = ["Your_staffrols" ];
const jrModRoles = ["Your_staffrols"];
const modRoles = [ "Your_staffrols"  ];
const jrAdminRoles = ["", "Your_staffrols"];
const teamLeaderRoles = ["Your_staffrols"];
const managementRoles = [ "Your_staffrols"];
const headDeveloperRoles = [ "Your_staffrols", "ADD_,_and_ for more rols"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrols')
        .setDescription('Add or remove a role to/from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to manage roles for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role')
                .setDescription('Select a role to add or remove')
                .setRequired(true)
                .addChoices(
                    { name: 'Staff Team', value: 'staffTeam' },
                    { name: 'Developer', value: 'developer' },
                    { name: 'Jr. Mod', value: 'jrMod' },
                    { name: 'Mod', value: 'mod' },
                    { name: 'Jr. Admin', value: 'jrAdmin' },
                    { name: 'Team Leader', value: 'teamLeader' },
                    { name: 'Management', value: 'management' },
                    { name: 'Head Developer', value: 'headDeveloper' },
                    { name: 'Remove All Specified Roles', value: 'remove' }
                )),
    async execute(interaction) {

        const moderator = interaction.guild.members.cache.get(interaction.user.id);
        const require = '';
        const options = interaction.options;
        if (!Rolperm.some(role => moderator.roles.cache.has(role))) {
            await interaction.followUp({ content: 'You do not have the required roles to use this command.', ephemeral: true });
            return;
        }

        

        
        // Deferring the reply to prevent interaction timeout
        await interaction.deferReply();

        const member = interaction.options.getMember('user');
        const roleChoice = interaction.options.getString('role');

        const embed = new EmbedBuilder()
            .setTitle('Rol Beheer')
            .setColor('#0099ff');

        const logEmbed = new EmbedBuilder()
            .setTitle('Rol Wijziging Log')
            .setColor('#ff0000')
            .setDescription(`Rolwijzigingen voor ${member.displayName}`)
            .setTimestamp();

        try {
            if (roleChoice === 'remove') {
                const rolesToRemove = [
                    ...staffTeamRoles, 
                    ...developerRoles, 
                    ...jrModRoles, 
                    ...modRoles, 
                    ...jrAdminRoles, 
                    ...teamLeaderRoles, 
                    ...managementRoles, 
                    ...headDeveloperRoles
                ];

                let removedRoles = [];

                for (const roleId of rolesToRemove) {
                    const role = interaction.guild.roles.cache.get(roleId);
                    if (role && member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                        removedRoles.push(role.name);
                    }
                }

                if (removedRoles.length > 0) {
                    embed.setDescription(`De volgende rollen zijn verwijderd van ${member.displayName}: ${removedRoles.join(', ')}`);
                    logEmbed.setDescription(`De volgende rollen zijn verwijderd van ${member.displayName}: ${removedRoles.join(', ')}`);
                } else {
                    embed.setDescription(`Er zijn geen rollen verwijderd van ${member.displayName}.`);
                    logEmbed.setDescription(`Er zijn geen rollen verwijderd van ${member.displayName}.`);
                }
            } else {
                let rolesToAdd;
                switch (roleChoice) {
                    case 'staffTeam':
                        rolesToAdd = staffTeamRoles;
                        break;
                    case 'developer':
                        rolesToAdd = developerRoles;
                        break;
                    case 'jrMod':
                        rolesToAdd = jrModRoles;
                        break;
                    case 'mod':
                        rolesToAdd = modRoles;
                        break;
                    case 'jrAdmin':
                        rolesToAdd = jrAdminRoles;
                        break;
                    case 'teamLeader':
                        rolesToAdd = teamLeaderRoles;
                        break;
                    case 'management':
                        rolesToAdd = managementRoles;
                        break;
                    case 'headDeveloper':
                        rolesToAdd = headDeveloperRoles;
                        break;
                }

                let addedRoles = [];

                for (const roleId of rolesToAdd) {
                    const role = interaction.guild.roles.cache.get(roleId);
                    if (role) {
                        if (!member.roles.cache.has(role.id)) {
                            await member.roles.add(role);
                            addedRoles.push(role.name);
                        }
                    } else {
                        await interaction.editReply({ content: 'Rol niet gevonden.' });
                        return; // Stop verder uitvoeren als een rol niet gevonden is
                    }
                }

                if (addedRoles.length > 0) {
                    embed.setDescription(`De volgende rollen zijn toegevoegd aan ${member.displayName}: ${addedRoles.join(', ')}`);
                    logEmbed.setDescription(`De volgende rollen zijn toegevoegd aan ${member.displayName}: ${addedRoles.join(', ')}`);
                } else {
                    embed.setDescription(`Er zijn geen rollen toegevoegd aan ${member.displayName}.`);
                    logEmbed.setDescription(`Er zijn geen rollen toegevoegd aan ${member.displayName}.`);
                }
            }

            // Stuur de embed naar het interactie-kanaal
            await interaction.editReply({ embeds: [embed] });

            // Log de wijzigingen naar het log-kanaal
            const logChannel = await interaction.guild.channels.fetch(logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.error('Logkanaal niet gevonden');
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Er is een fout opgetreden bij het verwerken van je verzoek.' });
        }
    },
};
