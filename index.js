const process = require('node:process');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes, Events, EmbedBuilder, Guild, Webhook, ChannelType,  } = require('discord.js');
const config = require('./config.json');
const axios = require('axios'); // We gebruiken axios om de webhook aan te roepen
const mongoose = require('mongoose'); // Add this line
const Fuse = require('fuse.js');
const util = require('util');




// =================== chande dis

const forbiddenWordsPath = path.join(__dirname, 'Database', 'badword.json');
const approveWordsPath = path.join(__dirname, 'Database', 'goodwords.json');
let forbiddenWords = [];
let approvedWords = ["kk"];
const Warning = require('./schema/warnSchema.js'); // Adjust the path as necessary
const immuneRoles = [
    'You_immune_Roles',
    'You_immune_Roles',
    'You_immune_Roles',
    'You_immune_Roles',
    'You_immune_Roles'
];

const sensitivePatterns = [
    // US phone numbers
    /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // US phone numbers with optional country code
    // UK phone numbers
    /\b(\+?44[-.\s]?)?(0\d{4}|\(?\d{3}\)?)?[-.\s]?\d{3}[-.\s]?\d{3}\b/, // UK phone numbers with optional country code
    // International phone numbers (basic)
    /\b(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/, // Generic international phone number format
    // Generic phone number format
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Generic 10-digit phone number
    // 10-digit phone number without delimiters
    /\b\d{10}\b/, // Generic 10-digit phone number
    // Email addresses (basic)
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Basic email format
    // Email addresses (more robust)
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/, // Allow for subdomains
    // Addresses (simple format)
    /\b\d{1,5}\s[A-Za-z0-9\s.#-]+\b/, // Addresses with street numbers and names
    // US ZIP codes
    /\b\d{5}(?:[-\s]\d{4})?\b/, // US ZIP codes (5 or 9 digits)
    // IPv4 addresses
    /(\b(?:\d{1,3}\.){3}\d{1,3}\b)/, // Matches IPv4 addresses (e.g., 192.168.1.1)
    // IPv6 addresses
    /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])/, // Matches IPv6 addresses
    // Credit card numbers (basic validation)
    /\b(?:\d[ -]*?){13,16}\b/, // Matches credit card numbers (13-16 digits)
];



// Allowed link patterns
const allowedLinks = [
    /^https:\/\/tenor.com\/./, // Tenor GIF links
    /^https:\/\/discord.com\/.*820333338219773953.*$/ // Discord server link with specific ID
];












// =============== don't chande 

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});


process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log('Uncaught Exception Monitor at:', origin, 'reason:', err);
});


const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageTyping,
  GatewayIntentBits.DirectMessageReactions,
] });


client.commands = new Collection();

// Function to recursively read directories and load commands
const loadCommands = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively load commands from subdirectories
      loadCommands(filePath);
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
};

// Start loading commands from the 'commands' directory
const commandsPath = path.join(__dirname, 'commands');
loadCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(config.token);

mongoose.connect(config.mongodbURL, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    sendErrorToWebhook('MongoDB Connection Error', err);
  });

client.once('ready', async () => {
  try {
    console.log(`${client.user.username} Is ready`);

    await client.user.setPresence({
      activities: [{ name: 'Met de boys ', type: 2 }], // Type 2 is LISTENING
      status: 'online'
    });

    console.log('Presence successfully set.');
  } catch (error) {
    console.error('Error setting presence:', error);
    sendErrorToWebhook('Set Presence Error', error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return; // Controleer of het een command is
  
    const command = client.commands.get(interaction.commandName);
  
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
  
    // Response objecten buiten de try-catch om herbruikbaarheid te verhogen
    const errorResponse = { content: 'There was an error while executing this command!', ephemeral: true };
  
    try {
      await command.execute(interaction); // Voer het commando uit
    } catch (error) {
      console.error('Error executing command:', error);
  
      // Bepaal of de interactie al beantwoord is
      if (interaction.replied || interaction.deferred) {
        // Probeer followUp als het al beantwoord is
        interaction.followUp(errorResponse).catch(console.error);
      } else {
        // Probeer reply als het nog niet beantwoord is
        interaction.reply(errorResponse).catch(console.error);
      }
    }
  });

const readdir = util.promisify(fs.readdir);

const eventsPath = path.join(__dirname, 'event');

(async () => {
  try {
    // Lees de event bestanden asynchroon
    const files = await readdir(eventsPath);
    const eventFiles = files.filter(file => file.endsWith('.js'));

    // Laad de events in cache
    const eventsCache = new Map();
    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      eventsCache.set(event.name, event);
    }

    // Verwerk de events
    for (const [name, event] of eventsCache) {
      if (event.once) {
        client.once(name, (...args) => event.execute(...args));
      } else {
        client.on(name, (...args) => event.execute(...args));
      }
    }
  } catch (error) {
    console.error('Error loading events:', error);
  }
})();

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: Array.from(client.commands.values()).map(c => c.data) },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();


// Helper function to extract file name from the stack trace
function getErrorFileName(error) {
  if (!error.stack) return 'Unknown file'; // Return a default value if stack is missing

  const stackLines = error.stack.split('\n');
  const firstLine = stackLines[1]; // usually the line with file information
  const fileMatch = firstLine.match(/\((.*):(\d+):\d+\)/);
  return fileMatch ? path.basename(fileMatch[1]) : 'Unknown file';
}

// Helper function to extract line number from the stack trace
function getErrorLineNumber(error) {
  if (!error.stack) return 'Unknown line'; // Return a default value if stack is missing

  const stackLines = error.stack.split('\n');
  const firstLine = stackLines[1]; // usually the line with file information
  const lineMatch = firstLine.match(/\((.*):(\d+):\d+\)/);
  return lineMatch ? lineMatch[2] : 'Unknown line';
}

// Helper function to send error details to the webhook



// index.js ===============================================







// Load forbidden words
try {
    const data = fs.readFileSync(forbiddenWordsPath, 'utf8');
    if (data.trim() === '') {
        throw new Error('badword.json is empty');
    }
    forbiddenWords = JSON.parse(data);
    if (!Array.isArray(forbiddenWords)) {
        throw new Error('The database does not contain a valid array of bad words.');
    }
} catch (error) {
    console.error('Error reading the bad words database:', error.message);
    forbiddenWords = [];
}

// Load approved words


try {
    const approvedData = fs.readFileSync(approveWordsPath, 'utf8');

    if (approvedData.trim() === '') {
        throw new Error('Approved words JSON file is empty');
    }

    approvedWords = JSON.parse(approvedData); // Parse the content, not the path

    if (!Array.isArray(approvedWords)) {
        throw new Error('The approved words database does not contain a valid array of words.');
    }
} catch (error) {
    console.error('Error reading the approved words database:', error.message);
    approvedWords = []; // Fallback to an empty array if there's an error
}

// Create a fuzzy search instance with a more lenient threshold
const fuse = new Fuse(forbiddenWords, { includeScore: true, threshold: 0.1 });

// Regex patterns to detect sensitive information


// Store message timestamps for spam detection
const messageTimestamps = new Map();

// Constants for spam and message validation
const MAX_EMOJIS = 10;
const MAX_TEXT_LENGTH = 400;
const MAX_SPACES = 10;
const MAX_MESSAGES_PER_INTERVAL = 5;
const INTERVAL_MS = 3000; // 3 seconds



// Event listener for messages
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages

    const member = message.guild.members.cache.get(message.author.id);

    // Skip users with immune roles
    if (member && member.roles.cache.some(role => immuneRoles.includes(role.id))) {
        console.log(`User ${message.author.tag} is immune.`);
        return;
    }

    // Handle spam detection (optional, can be adjusted or removed if not needed)
    const now = Date.now();
    const timestamps = messageTimestamps.get(message.author.id) || [];
    timestamps.push(now);
    messageTimestamps.set(message.author.id, timestamps.filter(ts => now - ts < INTERVAL_MS));
    if (timestamps.length > MAX_MESSAGES_PER_INTERVAL) {
        await handleSpam(message, `<@${message.author.id}> Spam detected: more than 5 messages in 3 seconds.`);
        return;
    }

    // Handle message content filtering
    const { filteredText, detectedWords } = filterForbiddenWords(message.content); // Only check forbidden words

    // Only delete the message if forbidden words are detected
    if (detectedWords.length > 0) {
        const warningContent = `Forbidden words detected: ${detectedWords.join(', ')}`;

        // Send a warning message to the user
        sendEmbedMessage(message, `Warning: ${warningContent}`);
        logForbiddenContent(message, detectedWords, [], []); // Log the detected words

        await addWarn(message, message.author.id, `Use of forbidden words: ${detectedWords.join(', ')}`);
        
        // Delete the message
        await message.delete();
        message.channel.send(`<@${message.author.id}> Your message has been deleted for using forbidden words.`);
    }
});

// Function to filter forbidden words from a message
function filterForbiddenWords(text) {
    let detectedWords = [];
    let filteredText = text;

    // Detect forbidden words using exact matching
    forbiddenWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi'); // Word boundary to detect full words
        if (regex.test(text)) {
            detectedWords.push(word);
            filteredText = filteredText.replace(regex, '[***]');
        }
    });

    return { filteredText, detectedWords };
}


// Event listener for message updates
client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author.bot || oldMessage.content === newMessage.content) return;

    console.log(`Message updated by ${newMessage.author.tag}.`);

    const member = oldMessage.guild.members.cache.get(oldMessage.author.id);

    if (member && member.roles.cache.some(role => immuneRoles.includes(role.id))) {
        console.log(`User ${oldMessage.author.tag} is immune.`);
        return; // User is immune, skip processing
    }

    const { filteredText, detectedWords, sensitiveData, detectedLinks } = filterText(newMessage.content);

    // Check for excessive emoticons
    const emojiCount = (newMessage.content.match(/<:\w+:\d+>/g) || []).length;
    if (emojiCount > MAX_EMOJIS) {
        await handleSpam(newMessage, `Too many emoticons: ${emojiCount} detected.`);
        return;
    }

    // Check for excessive text length
    if (filteredText.replace(/\s/g, '').length > MAX_TEXT_LENGTH) {
        await handleSpam(newMessage, `Message is too long: ${filteredText.length} characters.`);
        return;
    }

    // Check for excessive spaces within a word
    if (/\b[A-Za-z]*\s{11,}[A-Za-z]*\b/.test(filteredText)) {
        await handleSpam(newMessage, `Message contains excessive spaces.`);
        return;
    }

    // Check for forbidden words, sensitive data, and unauthorized links
    if (detectedWords.length > 0 || sensitiveData.length > 0 || detectedLinks.length > 0) {
        const warningContent = [
            detectedWords.length > 0 ? `Forbidden words detected: ${detectedWords.join(', ')}` : '',
            sensitiveData.length > 0 ? `Sensitive information detected: ${sensitiveData.join(', ')}` : '',
            detectedLinks.length > 0 ? `Unauthorized links detected: ${detectedLinks.join(', ')}` : ''
        ].filter(Boolean).join('\n');

        sendEmbedMessage(newMessage, `Warning: ${warningContent}`);
        logForbiddenContent(newMessage, detectedWords, sensitiveData, detectedLinks);

        await addWarn(newMessage, newMessage.author.id, 'Use of forbidden words or sensitive information');
        await newMessage.delete(); // Delete the flagged message
    }
});



// Function to log forbidden content for moderation purposes
function logForbiddenContent(message, words, sensitiveData, links) {
    console.log(`User ${message.author.tag} used forbidden content.`);
    console.log(`Forbidden words: ${words.join(', ')}`);
    console.log(`Sensitive data: ${sensitiveData.join(', ')}`);
    console.log(`Unauthorized links: ${links.join(', ')}`);
}

// Function to add a warning to a user (placeholder, implement according to your needs)
async function addWarn(message, userId, reason) {
    console.log(`Adding warning to user ${userId} for reason: ${reason}`);
    // Add your warning logic here, such as storing in a database or a file
}



// Function to handle spam-related actions
async function handleSpam(message, reason) {
    const warningContent = `Spam detected: ${reason}`;
    sendEmbedMessage(message, warningContent);
    logForbiddenContent(message, [], [], []);
    await addWarn(message, message.author.id, reason);
    await message.delete(); // Delete the message
}


function filterText(text) {
    let filteredText = text;
    let detectedWords = [];
    let sensitiveData = [];
    let detectedLinks = [];
  
    // Detect forbidden words using exact matching and fuzzy matching for words with 5 or more letters
    forbiddenWords.forEach(word => {
        const regex = new RegExp(`\\b${word.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(filteredText) && !approvedWords.includes(word.toLowerCase())) { // Check if not in approvedWords
            detectedWords.push(word);
            filteredText = filteredText.replace(regex, '[***]');
        }
    });
  
    // Custom fuzzy search for near matches, but only for words of 5 or more letters
    const words = text.split(/\s+/);
    words.forEach(word => {
        if (word.length >= 5 && !approvedWords.includes(word.toLowerCase())) { // Check if not in approvedWords
            const result = fuse.search(word);
            if (result.length > 0) {
                const matchedWord = result[0].item;
                if (isCloseMatch(word, matchedWord)) { // Custom match logic
                    detectedWords.push(matchedWord);
                    filteredText = filteredText.replace(new RegExp(word, 'gi'), '[***]');
                }
            }
        }
    });
  
    // Detect sensitive information
    sensitivePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                sensitiveData.push(match);
                filteredText = filteredText.replace(match, '[REDACTED]');
            });
        }
    });
  
    // Detect and filter links
    const linkPattern = /https?:\/\/[^\s]+/g;
    const links = text.match(linkPattern);
    if (links) {
        links.forEach(link => {
            if (!allowedLinks.some(pattern => pattern.test(link))) {
                detectedLinks.push(link);
                filteredText = filteredText.replace(link, '[LINK REDACTED]');
            }
        });
    }
  
    return { filteredText, detectedWords, sensitiveData, detectedLinks };
  }
  

// Helper function to determine if two words are a close match
function isCloseMatch(word, matchedWord) {
  let differences = 0;
  const maxDifferences = 2;

  // Regex for detecting special characters and numbers
  const specialCharacterRegex = /[^a-zA-Z]/;

  // Normalize the words by converting to lowercase
  word = word.toLowerCase();
  matchedWord = matchedWord.toLowerCase();

  // Iterate through each character and compare
  for (let i = 0; i < Math.max(word.length, matchedWord.length); i++) {
      const char1 = word[i] || '';
      const char2 = matchedWord[i] || '';

      // Check for character differences or special characters
      if (char1 !== char2 || specialCharacterRegex.test(char1) || specialCharacterRegex.test(char2)) {
          differences++;
      }

      // If the number of differences exceeds the allowed threshold, return false
      if (differences > maxDifferences) {
          return false;
      }
  }

  return differences <= maxDifferences;
}



// Custom function to check for word similarity based on letter and character differences




// Function to send an embed message as a reply to a message
function sendEmbedMessage(message, content) {
    const embed = new EmbedBuilder()
        .setColor('#FF0000') // Red for warning
        .setTitle('Warning')
        .setDescription(content)
        .setTimestamp();

    message.reply({ embeds: [embed] })
        .catch(error => console.error('Error sending embed:', error));
}

// Function to log forbidden content
function logForbiddenContent(message, detectedWords, sensitiveData, detectedLinks) {
    console.log(`[${new Date().toISOString()}] Forbidden content detected from user ${message.author.tag} in channel ${message.channel.name}: ${detectedWords.join(', ')} | Sensitive Data: ${sensitiveData.join(', ')} | Links: ${detectedLinks.join(', ')}`);

    const logChannelId = '1195406547044548718'; // Log channel ID
    const logChannel = client.channels.cache.get(logChannelId);

    if (logChannel) {
        const embed = new EmbedBuilder()
            .setTitle('Forbidden Content Detected')
            .setColor('#FF0000')
            .setDescription(`**User:** ${message.author.tag} (${message.author.id})\n**Channel:** ${message.channel.name} (${message.channel.id})\n**Message:** ${message.content}`)
            .setTimestamp();

        if (detectedWords.length > 0) {
            embed.addFields({ name: 'Forbidden Words', value: detectedWords.join(', ') });
        }

        if (sensitiveData.length > 0) {
            embed.addFields({ name: 'Sensitive Data', value: sensitiveData.join(', ') });
        }

        if (detectedLinks.length > 0) {
            embed.addFields({ name: 'Links', value: detectedLinks.join(', ') });
        }

        embed.addFields({
            name: 'Message Link',
            value: `[Click here to view the message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`
        })
        .addFields({
            name: 'Bad Word Log ID',
            value: generateRandomCode(10),
        });

        logChannel.send({ embeds: [embed] });
    }
}

// Function to add a warning to the database
async function addWarn(message, targetUserId, reason) {
  try {
    const warnID = generateRandomCode(10);
    const warningData = await Warning.findOneAndUpdate(
      { GuildID: message.guild.id, UserID: targetUserId },
      {
        $push: {
          Content: {
            ExecuterId: message.author.id,
            ExecuterTag: message.author.tag,
            Reason: reason,
            WarnID: warnID,
            Timestamp: Date.now()
          }
        }
      },
      { new: true, upsert: true }
    );

    logWarning(message.guild, targetUserId, warningData);
  } catch (error) {
    console.error('Error adding warning:', error);
  }
}



// Function to log the warning and apply timeouts
async function logWarning(guild, targetUserId, warningData) {
  const warningCount = warningData.Content.length;
  const timeoutLogChannelId = '1254473712477012018'; // Timeout log channel ID
  const wrongWordLogChannelId = '1254473632676057210'; // Wrong word log channel ID

  // Log timeout details to the timeout log channel
  if (warningCount >= 5 && warningCount < 10) {
      const timeoutLogChannel = guild.channels.cache.get(timeoutLogChannelId);
      if (timeoutLogChannel) {
          const timeoutEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('Timeout')
              .addFields(
                  { name: 'User', value: `${warningData.Content[0].ExecuterTag} (${targetUserId})`, inline: true },
                  { name: 'Reason', value: 'More than 5 warnings', inline: false },
                  { name: 'Warnings', value: warningCount.toString(), inline: false }
              )
              .setDescription(`Warning ID: ${warningData.Content[0].WarnID}`)
              .setTimestamp();

          timeoutLogChannel.send({ embeds: [timeoutEmbed] });
      }

      const timeoutDuration = 16 * 60 * 60 * 1000; // 16 hours
      const member = guild.members.cache.get(targetUserId);
      if (member) {
          member.timeout(timeoutDuration, 'Reached 5 warnings');
      } else {
          console.error(`User ${targetUserId} not found in the guild`);
      }
  } else if (warningCount >= 10) {
      const timeoutLogChannel = guild.channels.cache.get(timeoutLogChannelId);
      if (timeoutLogChannel) {
          const timeoutEmbed = new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('Timeout')
              .addFields(
                  { name: 'User', value: `${warningData.Content[0].ExecuterTag} (${targetUserId})`, inline: true },
                  { name: 'Reason', value: 'More than 10 warnings', inline: false },
                  { name: 'Warnings', value: warningCount.toString(), inline: false }
              )
              .setTimestamp();

          timeoutLogChannel.send({ embeds: [timeoutEmbed] });
      }

      const timeoutDuration = 30 * 60 * 60 * 1000 + (warningCount - 10) * 30 * 60 * 60 * 1000; // 30 hours + extra 30 hours per warning
      const member = guild.members.cache.get(targetUserId);
      if (member) {
          member.timeout(timeoutDuration, `Reached ${warningCount} warnings`);
      } else {
          console.error(`User ${targetUserId} not found in the guild`);
      }
  }

  // Log wrong words in the specific channel
  const wrongWordLogChannel = guild.channels.cache.get(wrongWordLogChannelId);
  if (wrongWordLogChannel) {
      const wrongWordEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Wrong Words Detected')
          .addFields(
              { name: 'User', value: `${warningData.Content[0].ExecuterTag} (${targetUserId})`, inline: true },
              { name: 'Warnings', value: warningCount.toString(), inline: false }
          )
          .addFields({
              name: 'Forbidden Words',
              value: warningData.Content.map(w => w.Reason).join(', ') // Assumes you have a Reason field in the Content array
          })
          .setTimestamp();

      wrongWordLogChannel.send({ embeds: [wrongWordEmbed] });
  }

  // Notify user via DM
  const user = await client.users.fetch(targetUserId);
  if (user) {
      const dmEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Warning Notification')
          .setDescription(`You have received a warning. You now have ${warningCount} warnings.`)
          .addFields(
              { name: 'Reason', value: 'You have accumulated warnings due to inappropriate behavior.' },
              { name: 'Please adhere to the server rules to avoid further action.', value: '\u200B' }
          )
          .setTimestamp();

      user.send({ embeds: [dmEmbed] })
          .catch(error => console.error('Error sending DM:', error));
  } else {
      console.error(`User ${targetUserId} not found for DM.`);
  }

  // Log warning in the channel where the forbidden word was used
  // Assuming warningData has a property `ChannelId` indicating the channel where the forbidden word was detected
  const forbiddenWordChannelId = warningData.ChannelId; // Ensure this property exists
  const forbiddenWordChannel = guild.channels.cache.get(forbiddenWordChannelId);
  if (forbiddenWordChannel) {
      const warningEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Warning Issued')
          .addFields(
              { name: 'User', value: `${warningData.Content[0].ExecuterTag} (<@${targetUserId}>)`, inline: true },
              { name: 'Reason', value: warningData.Content[0].Reason, inline: true }, // Assumes Reason field in Content
              { name: 'Warnings', value: warningCount.toString(), inline: false },
              { name: 'Warning ID', value: warningData.Content[0].WarnID, inline: true } // Include the Warning ID
          )
          .setTimestamp();

      forbiddenWordChannel.send({ embeds: [warningEmbed] });
  } else {
      console.error(`Channel ${forbiddenWordChannelId} not found for warning log.`);
  }
}

// Helper function to generate a random code
function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&€©®∃⊂∩∑∏∫∞¶§';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }


    return result;
}





client.login(config.token);
