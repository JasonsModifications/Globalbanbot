const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

// Create the client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const bansFilePath = './bans.json';
let bans = [];

// Load global bans from the file; ensure the result is an array.
function loadBans() {
  try {
    if (fs.existsSync(bansFilePath)) {
      const data = fs.readFileSync(bansFilePath, 'utf8');
      let parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        // If the file is not an array, reset to an empty array.
        bans = [];
      } else {
        bans = parsed;
      }
    } else {
      bans = [];
    }
  } catch (err) {
    console.error('Error reading bans.json:', err);
    bans = [];
  }
}

// Save the bans array to the file
function saveBans() {
  fs.writeFileSync(bansFilePath, JSON.stringify(bans, null, 2));
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  loadBans();
});

client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;
  // Only process messages that start with the defined prefix
  if (!message.content.startsWith(config.prefix)) return;

  // Split message into command and arguments
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  if (args.length === 0) return;
  const command = args.shift().toLowerCase();
  
  console.log(`Received command: ${command} with args: ${args.join(' ')}`);

  // --- !gbanhelp command ---
  if (command === 'gbanhelp') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('Global Ban Help')
      .setDescription('Available commands:')
      .addFields(
        { name: `${config.prefix}globalban [@user or userID] [reason]`, value: 'Globally ban a user.' },
        { name: `${config.prefix}gunban [userID] [reason]`, value: 'Globally unban a user.' },
        { name: `${config.prefix}gbanlist`, value: 'List all globally banned users.' },
        { name: `${config.prefix}gbanhelp`, value: 'Show this help message.' }
      )
      .setColor(0x0000FF) // Blue
      .setTimestamp();
    return message.reply({ embeds: [helpEmbed] });
  }

  // --- !globalban command ---
  if (command === 'globalban') {
    // Check if the message author has the required staff role
    if (!message.member.roles.cache.has(config.staffRoleId)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Determine target user:
    // Try to get a mention. If none, assume the first argument is a user ID.
    let targetId = null;
    if (message.mentions.members.size > 0) {
      targetId = message.mentions.members.first().id;
    } else {
      targetId = args[0];
    }
    if (!targetId) {
      return message.reply('Please mention a user or provide a valid user ID.');
    }

    // Get ban reason (if a mention was used, the rest of args; otherwise, args after userID)
    const reason = message.mentions.members.size > 0 ? args.slice(0).join(' ') : args.slice(1).join(' ') || 'No reason provided';

    // Send a DM to the target user
    try {
      const user = await client.users.fetch(targetId);
      const dmEmbed = new EmbedBuilder()
        .setTitle('Global Ban Notice')
        .setDescription(`You have been banned by ${message.author.tag} for: ${reason}`)
        .addFields({ name: 'Appeal', value: `If you wish to appeal, please contact ${config.serverOwnerName}.` })
        .setColor(0xFF0000) // Red
        .setTimestamp();
      await user.send({ embeds: [dmEmbed] });
    } catch (err) {
      console.error('Failed to send DM:', err);
    }

    // Check if the user is already globally banned
    if (bans.find(b => b.id === targetId)) {
      return message.reply('This user is already globally banned.');
    }

    // Add to global bans and persist the data
    bans.push({ id: targetId, reason: reason, date: new Date().toISOString() });
    saveBans();

    // Ban the user from every guild the bot is in.
    let bannedCount = 0;
    for (const guild of client.guilds.cache.values()) {
      try {
        await guild.members.ban(targetId, { reason: `Global ban by ${message.author.tag}: ${reason}` });
        bannedCount++;
      } catch (error) {
        console.error(`Failed to ban user in guild "${guild.name}":`, error);
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setTitle('Global Ban Executed')
      .setDescription(`User with ID ${targetId} has been banned from ${bannedCount} server(s).`)
      .addFields({ name: 'Reason', value: reason })
      .setColor(0xFF0000)
      .setTimestamp();
    return message.reply({ embeds: [replyEmbed] });
  }

  // --- !gunban command ---
  if (command === 'gunban') {
    // Check if the message author has the required staff role
    if (!message.member.roles.cache.has(config.staffRoleId)) {
      return message.reply('You do not have permission to use this command.');
    }
    const targetId = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!targetId) {
      return message.reply('Please provide a user ID.');
    }
    // Check if user is in the bans list
    const index = bans.findIndex(b => b.id === targetId);
    if (index === -1) {
      return message.reply('This user is not globally banned.');
    }
    // Remove from bans list and persist
    bans.splice(index, 1);
    saveBans();

    let unbannedCount = 0;
    for (const guild of client.guilds.cache.values()) {
      try {
        await guild.members.unban(targetId, reason);
        unbannedCount++;
      } catch (error) {
        console.error(`Failed to unban user in guild "${guild.name}":`, error);
      }
    }
    const unbanEmbed = new EmbedBuilder()
      .setTitle('Global Unban Executed')
      .setDescription(`User with ID ${targetId} has been unbanned from ${unbannedCount} server(s).`)
      .addFields({ name: 'Reason', value: reason })
      .setColor(0x00FF00) // Green
      .setTimestamp();
    return message.reply({ embeds: [unbanEmbed] });
  }

  // --- !gbanlist command ---
  if (command === 'gbanlist') {
    if (bans.length === 0) {
      return message.reply('No users are currently globally banned.');
    }
    const listEmbed = new EmbedBuilder()
      .setTitle('Global Ban List')
      .setColor(0xFFFF00) // Yellow
      .setTimestamp();
    for (const ban of bans) {
      listEmbed.addFields({
        name: `User ID: ${ban.id}`,
        value: `Reason: ${ban.reason}\nDate: ${ban.date}`,
        inline: false,
      });
    }
    return message.reply({ embeds: [listEmbed] });
  }
});

client.login(config.token);
