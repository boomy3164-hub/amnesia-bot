const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');

require('dotenv').config();

const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let leaderboard = {};

if (fs.existsSync('./leaderboard.json')) {
    leaderboard = JSON.parse(fs.readFileSync('./leaderboard.json'));
}

client.once('ready', () => {
    console.log(`${client.user.tag} is online.`);
});

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const allowedRoles = [
        'tryout hoster',
        'stage 1 tryout hoster'
    ];

    const hasRole = interaction.member.roles.cache.some(role =>
        allowedRoles.includes(role.name.toLowerCase())
    );

    const hasAdmin =
        interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // =========================
    // /rank
    // =========================

    if (interaction.commandName === 'rank') {

        if (!hasRole && !hasAdmin && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: 'No permission.',
                ephemeral: true
            });
        }

        const member = interaction.options.getMember('user');
        const stage = interaction.options.getString('stage');
        const skill = interaction.options.getString('skill');

        const stages = [
            'Stage 0',
            'Stage 1',
            'Stage 2',
            'Stage 3'
        ];

        const skills = [
            'high',
            'mid',
            'low',
            'strong',
            'stable',
            'weak'
        ];

        for (const roleName of stages.concat(skills)) {

            const role = interaction.guild.roles.cache.find(
                r => r.name.toLowerCase() === roleName.toLowerCase()
            );

            if (role && member.roles.cache.has(role.id)) {
                await member.roles.remove(role).catch(() => {});
            }
        }

        const stageRole = interaction.guild.roles.cache.find(
            r => r.name.toLowerCase() === stage.toLowerCase()
        );

        const skillRole = interaction.guild.roles.cache.find(
            r => r.name.toLowerCase() === skill.toLowerCase()
        );

        if (stageRole) {
            await member.roles.add(stageRole).catch(console.error);
        }

        if (skillRole) {
            await member.roles.add(skillRole).catch(console.error);
        }

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('TRYOUT RESULTS')
            .setDescription(
`${member}

Stage: ${stage}

Skill: ${skill}`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }

    // =========================
    // /setlb
    // =========================

    else if (interaction.commandName === 'setlb') {

        if (!hasRole && !hasAdmin && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: 'No permission.',
                ephemeral: true
            });
        }

        const place = interaction.options.getInteger('place');
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
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=420x420&format=Png&isCircular=false`;
        }

        leaderboard[place] = {
            place,
            user: `<@${user.id}>`,
            roblox,
            region,
            rank,
            avatar
        };

        fs.writeFileSync('./leaderboard.json', JSON.stringify(leaderboard, null, 2));

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`#${place} | ${roblox}`)
            .setDescription(
`${user}

≪《 | ${roblox} | 》≫

Region: ${region}

${rank}`
            )
            .setImage(avatar);

        await interaction.reply({
            embeds: [embed]
        });
    }

    // =========================
    // /leaderboard
    // =========================

    else if (interaction.commandName === 'leaderboard') {

        await interaction.deferReply();

        let page = interaction.options.getInteger('page');

        if (!page || page < 1) page = 1;

        if (page > 5) {
            return interaction.editReply({
                content: 'Leaderboard only goes to page 5.'
            });
        }

        const start = (page * 10) - 9;
        const end = page * 10;

        for (let i = start; i <= end; i++) {

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
                    );

            } else {

                embed
                    .setTitle(`#${data.place} | ${data.roblox}`)
                    .setDescription(
`${data.user}

≪《 | ${data.roblox} | 》≫

Region: ${data.region}

${data.rank}`
                    )
                    .setImage(data.avatar);
            }

            await interaction.followUp({
                embeds: [embed]
            });
        }

        await interaction.editReply({
            content: `Showing leaderboard ${start}-${end}`
        });
    }
});

client.login(process.env.TOKEN);