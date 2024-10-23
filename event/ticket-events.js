const { Events, PermissionsBitField, ChannelType, MessageEmbed, MessageAttachment, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const cooldowns = new Map();
const blacklistRoleId = '1263597789309309010'; // Ticket blacklist
const categoryID = '1264713829615669259'; // Support category for open ticket
const supportRoleID = '1263597784733585642'; // Support role for Ticket
const adminRoleId = '1263597783768895558'; // Support Admin
const closedChannelId = '1268542991916601357'; // Log channel


const fs = require('fs');
const path = require('path');


// Define the file path for the ticket database
const ticketDataPath = path.join(__dirname, '../Database/ticketlog.json');

// Function to read the database
// Function to write to the database
function writeDatabase(data) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(ticketDataPath, jsonData, 'utf-8');
    } catch (error) {
        console.error('Failed to write to database:', error);
    }
}


function readDatabase() {
    try {
        if (!fs.existsSync(ticketDataPath)) {
            // If the file doesn't exist, return an empty object
            return { tickets: [] };
        }
        const jsonData = fs.readFileSync(ticketDataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        // Ensure the data has a tickets array
        if (!Array.isArray(data.tickets)) {
            return { tickets: [] };
        }

        return data;
    } catch (error) {
        console.error('Failed to read from database:', error);
        return { tickets: [] }; // Return a default object in case of error
    }
}




module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId !== 'ticketsystemid') return;
        
            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (member.roles.cache.has(blacklistRoleId)) {
                return interaction.reply({ content: 'You are on the blacklist and cannot create tickets.', ephemeral: true });
            }
        
            const userId = interaction.user.id;
            const now = Date.now();
            const cooldownDuration = 0 * 60 * 1000; // Set cooldown duration in milliseconds
        
            if (cooldowns.has(userId)) {
                const lastInteraction = cooldowns.get(userId);
                const remainingTime = cooldownDuration - (now - lastInteraction);
        
                if (remainingTime > 0) {
                    const minutesLeft = Math.ceil(remainingTime / 60000);
                    return interaction.reply({ content: `You cannot create a new ticket until your cooldown of ${minutesLeft} minutes has expired.`, ephemeral: true });
                }
            }
        
            cooldowns.set(userId, now);
            const ticketNumber = Math.floor(1000 + Math.random() * 9000);
            const channelName = `${interaction.values[0]}-${ticketNumber}`;
            const category = interaction.guild.channels.cache.get(categoryID);
        
            if (!category) {
                return interaction.reply({ content: 'Category not found.', ephemeral: true });
            }
        
            try {
                // Create the ticket channel
                const channel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: categoryID,
                    topic: `Ticket for ${interaction.values[0]}`,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: supportRoleID,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: adminRoleId,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                    ],
                });
        
             
        
                // Prepare the embed and action row
                let embed = new EmbedBuilder()
                    .setTitle('Ticket Details')
                    .setColor('DarkRed')
                    .addFields(
                        { name: 'Ticket Type', value: interaction.values[0], inline: true },
                        { name: 'User', value: `${interaction.user.username}`, inline: true }
                    )
                    .setDescription(`Hello ${interaction.user}, this is your ticket for ${interaction.values[0]}. Please be patient while our support team, <@&${supportRoleID}>, reviews your request.`);
        
                // Adjust embed based on ticket type
                switch (interaction.values[0]) {
                    case 'report':
                        embed.addFields(
                            { name: 'Reason', value: 'Add reason', inline: false },
                            { name: 'Rules', value: 'Provide rules', inline: false },
                            { name: 'Evidence', value: 'Add evidence', inline: false }
                        );
                        break;
                    case 'questions':
                        embed.addFields(
                            { name: 'Question', value: 'Add question', inline: false }
                        );
                        break;
                    case 'support':
                        embed.addFields(
                            { name: 'Question or Issue', value: 'How can we help you?', inline: false }
                        );
                        break;
                    case 'other':
                        embed.addFields(
                            { name: 'Details', value: 'Wat is you problem', inline: false }
                        );
                        break;
                }
        
                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('claim_ticket')
                            .setLabel('Claim')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('deny_ticket')
                            .setLabel('Deny')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('add_member')
                            .setLabel('Add Member')
                            .setStyle(ButtonStyle.Secondary)
                    );
        
                // Send the message in the newly created ticket channel
                await channel.send({ content: `Hello ${interaction.user}, this is your ticket for ${interaction.values[0]}. \n ping || <@&${supportRoleID}> ||`, embeds: [embed], components: [actionRow] });
        
                // Notify the user that the ticket has been created
                await interaction.reply({ content: `Your ticket has been created: ${channel}.`, ephemeral: true });
        
            } catch (error) {
                console.error('Error handling string select menu interaction:', error);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'An error occurred. Please try again later.', ephemeral: true });
                }
            }
        }

        if (interaction.isButton()) {
            const { customId } = interaction;

            // Check if the user has the support role or is an admin
            if (['claim_ticket', 'deny_ticket', 'unclaim_ticket', 'close_ticket', 'add_member', 'remove_member', 'add_staff', 'remove_staff'].includes(customId)) {
                // Check if interaction.member exists before accessing roles
if (!interaction.member || (!interaction.member.roles.cache.has(supportRoleID) && !interaction.member.roles.cache.has(adminRoleId))) {
    return interaction.reply({ content: 'You do not have permission to perform this action.', ephemeral: true });
}

            }

            try {
                const channel = interaction.channel;
                if (!channel) return;
            
                if (customId === 'claim_ticket') {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle('Ticket Claimed')
                            .setColor('Green')
                            .setDescription(`This ticket has been claimed by ${interaction.user}. Support role <@&${supportRoleID}> has been notified.`)
                            .addFields(
                                { name: 'Ticket Type', value: channel.name.split('-')[0], inline: true },
                                { name: 'Claimed By', value: `${interaction.user.username}`, inline: true }
                            );
            
                        await channel.send({ embeds: [embed] });
            
                        const actionRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('unclaim_ticket')
                                    .setLabel('Unclaim')
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId('close_ticket')
                                    .setLabel('Close')
                                    .setStyle(ButtonStyle.Danger),
                                new ButtonBuilder()
                                    .setCustomId('add_member')
                                    .setLabel('Add Member')
                                    .setStyle(ButtonStyle.Secondary)
                            );
            
                        // Update the interaction with the new action row
                        await interaction.update({ components: [actionRow] });
            
            
                        if (!interaction.replied) {
                            await interaction.reply({ content: 'You have claimed and locked the ticket.', ephemeral: true });
                        }
                    } catch (error) {
                        console.error('Error handling ticket claim:', error);
                        if (!interaction.replied) {
                            await interaction.reply({ content: 'There was an error handling your request.', ephemeral: true });
                        }
                    }
                
                } else if (customId === 'unclaim_ticket') {
                    const embed = new EmbedBuilder()
                        .setTitle('Ticket Unclaimed')
                        .setColor('Yellow')
                        .setDescription(`This ticket has been unclaimed by ${interaction.user}. Support role <@&${supportRoleID}> has been notified.`);
                
                    await channel.send({ embeds: [embed] });
                
                    const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('claim_ticket')
                            .setLabel('Claim')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('deny_ticket')
                            .setLabel('Deny')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('add_member')
                            .setLabel('Add Member')
                            .setStyle(ButtonStyle.Secondary)
                    );
                
                // Try to update the interaction with the new action row
                try {
                    await interaction.update({ components: [actionRow] });
                } catch (error) {
                    console.error('Error updating interaction components:', error);
                }

                } else if (customId === 'close_ticket') {
                    const embed = new EmbedBuilder()
                        .setTitle('Confirm Ticket Closure')
                        .setColor('Orange')
                        .setDescription('Are you sure you want to close this ticket? This action cannot be undone.');
                
                    const confirmActionRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirm_close_ticket')
                                .setLabel('Confirm Close')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId('cancel_close_ticket')
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Secondary)
                        );
                
                    await interaction.reply({ embeds: [embed], components: [confirmActionRow], ephemeral: false });
                
                } else if (customId === 'cancel_close_ticket') {
                    const embed = new EmbedBuilder()
                        .setTitle('Ticket Closure Canceled')
                        .setColor('Green')
                        .setDescription(`The ticket closure has been canceled. ${interaction.user}`);
                
                    await interaction.update({ embeds: [embed], components: [] });
                
                }else if (customId === 'confirm_close_ticket') {
                    // Sla de transcriptie op
                    await saveTranscript(channel);
                    
                    await channel.delete();
                    
                    const logChannel = interaction.guild.channels.cache.get(closedChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Closed')
                            .setColor('Red')
                            .addFields(
                                { name: 'Ticket Channel', value: channel.name, inline: true },
                                { name: 'Closed By', value: `${interaction.user}`, inline: true },
                                { name: 'Closed At', value: new Date().toLocaleString(), inline: true },
                                { name: 'Ticket ID', value: `#${channel.name}`, inline: true }
                            );
                    
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                
                    const ticketType = interaction.values && interaction.values.length > 0 ? interaction.values[0] : 'Unknown';  // Controleer of er waarden zijn
                
                    const responseEmbed = new EmbedBuilder()
                        .setAuthor({ name: `Ticket close` })
                        .setColor(`#D4AF37`)
                        .setTitle(`Ticket has been close`)
                        .addFields(
                            { name: 'Ticket Channel ', value: channel.name, inline: true },
                            { name: 'Ticket Type ', value: ticketType, inline: true },  // Gebruik de gecontroleerde waarde
                            { name: 'Denied By ', value: `${interaction.user}`, inline: true },
                            { name: 'Denied At  ', value: new Date().toLocaleString(), inline: true },
                            { name: 'Ticket ID ', value: `#${channel.name}`, inline: true }
                        );
                    
                    await interaction.user.send({ embeds: [responseEmbed] });
                }
                
                else if (customId === 'deny_ticket') {
                    const responseEmbed = new EmbedBuilder()
                        .setAuthor({ name: `Ticket is Denied` })
                        .setColor(`#D4AF37`)
                        .setTitle(`Ticket has been denied:`)
                        .addFields(
                            { name: 'Ticket Channel', value: channel.name, inline: true },
                            { name: 'Denied By', value: `${interaction.user}`, inline: true },
                            { name: 'Denied At', value: new Date().toLocaleString(), inline: true },
                            { name: 'Ticket ID', value: `#${channel.name}`, inline: true }
                        );
                
                    try {
                        // Send the denial response to the user
                        await interaction.user.send({ embeds: [responseEmbed] });
                
                        // Save the transcript
                        await saveTranscript(channel);
                
                        // Define the path to the saved transcript files
                        const transcriptFolder = path.join(__dirname, '../transcriptie', channel.id);
                        const htmlFilePath = path.join(transcriptFolder, 'transcript.html');
                        const cssFilePath = path.join(transcriptFolder, 'styles.css');
                
                        // Delete the ticket channel
                        await channel.delete();
                
                        // Find the log channel
                        const logChannel = interaction.guild.channels.cache.get(closedChannelId);
                        if (logChannel) {
                            // Send the transcript files as attachments
                            await logChannel.send({
                                files: [
                                    { attachment: htmlFilePath, name: 'transcript.html' },
                                    { attachment: cssFilePath, name: 'styles.css' }
                                ]
                            });
                
                            // Create the log embed
                            const logEmbed = new EmbedBuilder()
                                .setTitle('Ticket Denied')
                                .setColor('Red')
                                .addFields(
                                    { name: 'Ticket Channel', value: channel.name, inline: true },
                                    { name: 'Denied By', value: `${interaction.user}`, inline: true },
                                    { name: 'Denied At', value: new Date().toLocaleString(), inline: true },
                                    { name: 'Ticket ID', value: `#${channel.name}`, inline: true }
                                );
                
                            // Send the log embed
                            await logChannel.send({ embeds: [logEmbed] });
                        }
                    } catch (error) {
                        console.error('Error handling deny ticket:', error);
                        if (!interaction.replied) {
                            await interaction.reply({ content: 'Er is een fout opgetreden bij het verwerken van je verzoek.', ephemeral: true });
                        }
                    }
                }
                
                
                 else if (customId === 'add_member' || customId === 'remove_member' || customId === 'add_staff' || customId === 'remove_staff') {
                    const modal = new ModalBuilder()
                        .setCustomId('member_modal')
                        .setTitle('Manage Members');

                    const userInput = new TextInputBuilder()
                        .setCustomId('user_input')
                        .setLabel('User ID')
                        .setStyle(TextInputStyle.Short);

                    const row = new ActionRowBuilder().addComponents(userInput);

                    modal.addComponents(row);

                    await interaction.showModal(modal);
                }
            } catch (error) {
                console.error('An error occurred while handling the button interaction:', error);
            }


            async function saveTranscript(channel) {
                // Verkrijg berichten in het kanaal
                const messages = await channel.messages.fetch({ limit: 100 }); // Pas de limiet aan indien nodig
            
                // Pad voor de transcriptiemappen
                const transcriptFolder = path.join(__dirname, '../transcriptie', channel.id);
                if (!fs.existsSync(transcriptFolder)) {
                    fs.mkdirSync(transcriptFolder, { recursive: true });
                }
            
                // Pad voor HTML en CSS-bestanden
                const htmlFilePath = path.join(transcriptFolder, 'transcript.html');
                const cssFilePath = path.join(transcriptFolder, 'styles.css');
            
                // Begin HTML-bestand met basisstructuur
                let htmlContent = `
                <html>
                <head>
                    <link rel="stylesheet" type="text/css" href="styles.css">
                </head>
                <body>
                    <h1>Transcriptie voor ${channel.name}</h1>
                    <div class="messages">
                `;
            
                // Verwerk berichten en voeg ze toe aan de HTML
                messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp).forEach(msg => {
                    const user = msg.author;
                    const userRoles = msg.member ? msg.member.roles.cache.map(role => role.name).join(', ') : 'No roles';


                    
                    // Specifieke rol die de gebruiker moet hebben om rollen te bekijken
                    const requiredRoleID = '1233419667473825862';
                    
                    // Controleer of de gebruiker de specifieke rol heeft
                    let rolesHTML = '';
                    if (msg.member && msg.member.roles.cache.has(requiredRoleID)) {

                        rolesHTML = `<span class="roles">${userRoles}</span>`;
                    } else {
                        rolesHTML = `<span class="roles">Roles hidden</span>`;
                    }
                    
                    htmlContent += `
                        <div class="message">
                            <div class="user-info">
                                <img src="${user.displayAvatarURL({ format: 'png', size: 32 })}" alt="${user.username}" />
                                <span class="username">${user.username}</span>
                                ${rolesHTML} <!-- Alleen tonen als de gebruiker de vereiste rol heeft -->
                                <span class="timestamp">${msg.createdAt.toLocaleString()}</span>
                            </div>
                            <div class="content">
                                ${msg.content}
                            </div>
                        </div>
                    `;
                    
            
                    // Verwerk bijlagen
                    if (msg.attachments.size > 0) {
                        msg.attachments.forEach(attachment => {
                            htmlContent += `
                            <div class="attachment">
                                <a href="${attachment.url}" target="_blank">${attachment.name}</a>
                            </div>
                            `;
                            // Controleer bestandstype voor afbeeldingen en video's
                            if (attachment.contentType.startsWith('image/')) {
                                htmlContent += `<img src="${attachment.url}" alt="${attachment.name}" class="image"/>`;
                            } else if (attachment.contentType.startsWith('video/')) {
                                htmlContent += `<video src="${attachment.url}" controls class="video"></video>`;
                            }
                        });
                    }
            
                    // Verwerk embeds
                    if (msg.embeds.length > 0) {
                        msg.embeds.forEach(embed => {
                            if (embed.image) {
                                htmlContent += `<img src="${embed.image.url}" alt="Embed Image" class="image"/>`;
                            } else if (embed.video) {
                                htmlContent += `<video src="${embed.video.url}" controls class="video"></video>`;
                            } else if (embed.thumbnail) {
                                htmlContent += `<img src="${embed.thumbnail.url}" alt="Embed Thumbnail" class="image"/>`;
                            } else if (embed.url) {
                                htmlContent += `<a href="${embed.url}" target="_blank">Link to Embed</a>`;
                            }
            
                            // Voeg embed description toe
                            if (embed.description) {
                                htmlContent += `<div class="embed-description">${embed.description}</div>`;
                            }
            
                            // Voeg embed title toe
                            if (embed.title) {
                                htmlContent += `<div class="embed-title">${embed.title}</div>`;
                            }
            
                            // Voeg embed footer toe
                            if (embed.footer) {
                                htmlContent += `<div class="embed-footer">${embed.footer.text}</div>`;
                            }
                        });
                    }
            
                    htmlContent += `
                        </div>
                    </div>
                    `;
                });
            
                // Sluit HTML-bestand
                htmlContent += `
                    </div>
                </body>
                </html>
                `;
            
                // CSS voor opmaak
                const cssContent = `
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 20px;
                }
                .messages {
                    max-width: 800px;
                    margin: auto;
                }
                .message {
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 10px;
                    margin-bottom: 10px;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                }
                .user-info img {
                    border-radius: 50%;
                    margin-right: 10px;
                }
                .username {
                    font-weight: bold;
                    margin-right: 10px;
                }
                .roles {
                    color: #666;
                    font-size: 0.9em;
                    margin-left: 10px;
                }
                .timestamp {
                    font-size: 0.8em;
                    color: #888;
                }
                .content {
                    margin-top: 10px;
                }
                .image {
                    max-width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    margin-top: 10px;
                }
                .video {
                    max-width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    margin-top: 10px;
                }
                .attachment a {
                    display: block;
                    margin-top: 5px;
                    color: #1a73e8;
                }
                .embed-description,
                .embed-title,
                .embed-footer {
                    margin-top: 10px;
                    padding: 5px;
                    border-top: 1px solid #ddd;
                }
                .embed-title {
                    font-weight: bold;
                }
                .embed-footer {
                    color: #666;
                }
                `;
            
                // Schrijf bestanden naar schijf
                fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
                fs.writeFileSync(cssFilePath, cssContent, 'utf-8');
            }
    }
    },
};
