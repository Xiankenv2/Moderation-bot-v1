const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');
const Fuse = require('fuse.js'); // Fuzzy search library

// Path to the JSON file containing signal words and phrases
const sinaalWordenPath = path.join(__dirname, '../Database/sinaalworden.json');

// Function to read the signal words and phrases from the JSON file
function readSinaalWorden() {
    try {
        const jsonData = fs.readFileSync(sinaalWordenPath, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading sinaalworden.json:', error);
        return { signalWords: [], signalPhrases: [] };  // Default empty arrays in case of error
    }
}

// Load the signal words and phrases
const sinaalWorden = readSinaalWorden();

// Fuse.js options for fuzzy searching
const fuseOptions = {
    includeScore: true,
    threshold: 0.4, // Set the tolerance level for spelling errors (lower is stricter, higher is more lenient)
    keys: ['word', 'phrase'] // Search both words and phrases
};

// Create Fuse instances for words and phrases
const fuseWords = new Fuse(sinaalWorden.signalWords, fuseOptions);
const fusePhrases = new Fuse(sinaalWorden.signalPhrases, fuseOptions);

// Constants for roles and category
const supportRoleID = 'Ticket_staff'; // Support role for Ticket
const adminRoleId = 'Ticket_admin'; // Support Admin
const categoryID = 'TicketCatorgrie'; // Specific category ID for checking

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        // Ignore messages from bots or users with support/admin roles
        if (message.author.bot || message.member.roles.cache.has(supportRoleID) || message.member.roles.cache.has(adminRoleId)) return;

        // Check if the message is in a channel that belongs to the specific category
        const categoryChannel = message.guild.channels.cache.get(message.channel.parentId); // Get the parent category of the channel
        if (!categoryChannel || categoryChannel.id !== categoryID) return; // Exit if not in the specific category

        // Directly respond to 'hallo'
     

        // Fuzzy match for signal words
        const wordResult = fuseWords.search(message.content);
        const phraseResult = fusePhrases.search(message.content);

        // If a match is found, respond with the corresponding response
        if (wordResult.length > 0) {
            const bestWordMatch = wordResult[0].item;
            await message.reply(bestWordMatch.response);
        } else if (phraseResult.length > 0) {
            const bestPhraseMatch = phraseResult[0].item;
            await message.reply(bestPhraseMatch.response);
        }
    }
};
