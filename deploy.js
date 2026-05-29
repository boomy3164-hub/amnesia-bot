require('dotenv').config();

const {
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const commands = [

  // =========================
  // /RANK
  // =========================

  new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Give somebody a rank')

    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('stage')
        .setDescription('Stage')
        .setRequired(true)
        .addChoices(
          { name: 'Stage 0', value: 'Stage 0' },
          { name: 'Stage 1', value: 'Stage 1' },
          { name: 'Stage 2', value: 'Stage 2' },
          { name: 'Stage 3', value: 'Stage 3' }
        )
    )

    .addStringOption(option =>
      option
        .setName('power')
        .setDescription('High Mid Low')
        .setRequired(true)
        .addChoices(
          { name: 'High', value: 'high' },
          { name: 'Mid', value: 'mid' },
          { name: 'Low', value: 'low' }
        )
    )

    .addStringOption(option =>
      option
        .setName('stability')
        .setDescription('Strong Stable Weak')
        .setRequired(true)
        .addChoices(
          { name: 'Strong', value: 'strong' },
          { name: 'Stable', value: 'stable' },
          { name: 'Weak', value: 'weak' }
        )
    ),

  // =========================
  // /LEADERBOARD
  // =========================

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show leaderboard')

    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('1-5')
        .setRequired(true)
    ),

  // =========================
  // /SETLB
  // =========================

  new SlashCommandBuilder()
    .setName('setlb')
    .setDescription('Set leaderboard spot')

    .addIntegerOption(option =>
      option
        .setName('place')
        .setDescription('1-50')
        .setRequired(true)
    )

    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Discord user')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('roblox')
        .setDescription('Roblox username')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('region')
        .setDescription('Region')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('stage')
        .setDescription('Stage')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('profile')
        .setDescription('Roblox profile link')
        .setRequired(true)
    )

].map(command => command.toJSON());

const rest = new REST({ version: '10' })
.setToken(process.env.TOKEN);

(async () => {

  try {

    console.log('Deploying commands...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('Commands deployed.');

  } catch (err) {
    console.error(err);
  }

})();