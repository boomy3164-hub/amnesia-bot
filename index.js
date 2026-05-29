require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const leaderboard = {};

const commands = [

    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Give somebody a rank')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('stage')
                .setDescription('Stage')
                .setRequired(true)
                .addChoices(
                    { name: 'Stage 0', value: 'Stage 0' },
                    { name: 'Stage 1', value: 'Stage 1' },
                    { name: 'Stage 2', value: 'Stage 2' },
                    { name: 'Stage 3', value: 'Stage 3' }
                ))
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Tier')
                .setRequired(true)
                .addChoices(
                    { name: 'High', value: 'High' },
                    { name: 'Mid', value: 'Mid' },
                    { name: 'Low', value: 'Low' }
                ))
        .addStringOption(option =>
            option.setName('strength')
                .setDescription('Strength')
                .setRequired(true)
                .addChoices(
                    { name: 'Strong', value: 'Strong' },
                    { name: 'Stable', value: 'Stable' },
                    { name: 'Weak', value: 'Weak' }
                )),

    new SlashCommandBuilder()
        .setName('setlb')
        .setDescription('Set leaderboard spot')
        .addIntegerOption(option =>
            option.setName('spot')
                .setDescription('1-50')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Discord user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('roblox')
                .setDescription('Roblox username')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('region')
                .setDescription('Region')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rank')
                .setDescription('Rank')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('profile')
                .setDescription('Roblox profile link')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show leaderboard')
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(c => c.toJSON()) }
        );

        console.log('Commands registered.');
    } catch (err) {
        console.log(err);
    }
})();

client.on('ready', () => {
    console.log(`${client.user.tag} is online.`);
});

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    try {

        if (interaction.commandName === 'rank') {

            const member = interaction.member;

            const allowed =
                member.permissions.has(PermissionFlagsBits.Administrator) ||
                interaction.guild.ownerId === interaction.user.id ||
                member.roles.cache.some(role =>
                    role.name.toLowerCase() === 'tryout hoster' ||
                    role.name.toLowerCase() === 'stage 1 tryout hoster'
                );

            if (!allowed) {
                return interaction.reply({
                    content: 'You cannot use this command.',
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            const user = interaction.options.getUser('user');
            const stage = interaction.options.getString('stage');
            const tier = interaction.options.getString('tier');
            const strength = interaction.options.getString('strength');

            const guildMember = await interaction.guild.members.fetch(user.id);

            const removeRoles = [
                'Stage 0',
                'Stage 1',
                'Stage 2',
                'Stage 3',
                'High',
                'Mid',
                'Low',
                'Strong',
                'Stable',
                'Weak'
            ];

            for (const roleName of removeRoles) {
                const role = interaction.guild.roles.cache.find(
                    r => r.name === roleName
                );

                if (role && guildMember.roles.cache.has(role.id)) {
                    await guildMember.roles.remove(role).catch(() => {});
                }
            }

            const stageRole = interaction.guild.roles.cache.find(
                r => r.name === stage
            );

            const tierRole = interaction.guild.roles.cache.find(
                r => r.name === tier
            );

            const strengthRole = interaction.guild.roles.cache.find(
                r => r.name === strength
            );

            if (stageRole) await guildMember.roles.add(stageRole).catch(() => {});
            if (tierRole) await guildMember.roles.add(tierRole).catch(() => {});
            if (strengthRole) await guildMember.roles.add(strengthRole).catch(() => {});

            await interaction.editReply({
                content:
                    `${user} Tryout result is ${stage} ${tier} ${strength}`
            });
        }

        else if (interaction.commandName === 'setlb') {

            const member = interaction.member;

            const allowed =
                member.permissions.has(PermissionFlagsBits.Administrator) ||
                interaction.guild.ownerId === interaction.user.id ||
                member.roles.cache.some(role =>
                    role.name.toLowerCase() === 'tryout hoster' ||
                    role.name.toLowerCase() === 'stage 1 tryout hoster'
                );

            if (!allowed) {
                return interaction.reply({
                    content: 'You cannot use this command.',
                    ephemeral: true
                });
            }

            const spot = interaction.options.getInteger('spot');
            const user = interaction.options.getUser('user');
            const roblox = interaction.options.getString('roblox');
            const region = interaction.options.getString('region');
            const rank = interaction.options.getString('rank');
            const profile = interaction.options.getString('profile');

            let avatar =
                'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-310x310-Png/1';

            const match = profile.match(/users\/(\d+)/);

            if (match) {
                const id = match[1];

                avatar =
                    `https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=420&height=420&format=png`;
            }

            leaderboard[spot] = {
                user,
                roblox,
                region,
                rank,
                avatar
            };

            await interaction.reply(`Updated leaderboard spot #${spot}`);
        }

        else if (interaction.commandName === 'leaderboard') {

            await interaction.deferReply();

            for (let i = 1; i <= 50; i++) {

                const data = leaderboard[i];

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31');

                if (!data) {

                    embed
                        .setTitle(`#${i} VACANT`)
                        .setDescription(
`VACANT

≪《 | VACANT | 》≫

Region: VACANT

VACANT`
                        )
                        .setThumbnail(
'https://cdn.discordapp.com/embed/avatars/0.png'
                        );

                } else {

                    embed
                        .setTitle(`#${i} ${data.roblox}`)
                        .setDescription(
`${data.user}

≪《 | ${data.roblox} | 》≫

Region: ${data.region}

${data.rank}`
                        )
                        .setThumbnail(data.avatar);
                }

                await interaction.followUp({
                    embeds: [embed]
                });
            }

            await interaction.editReply({
                content: 'Leaderboard loaded.'
            });
        }

    } catch (err) {

        console.log(err);

        if (interaction.deferred) {
            interaction.editReply({
                content: 'Error running command.'
            });
        } else {
            interaction.reply({
                content: 'Error running command.',
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);