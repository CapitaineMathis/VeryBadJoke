require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tu veux une blague nulle ?')
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2])
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
  } catch (error) {
    console.error('Erreur commande :', error);
  }
})();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`login : ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'joke') {
    try {
      const joke = await getAJoke();
      await interaction.reply(joke);
    } catch (err) {
      console.error(err);
      await interaction.reply('Impossible de récupérer une blague.');
    }
  }
});

async function getAJoke() {
  const reponse = await fetch('https://v2.jokeapi.dev/joke/Any?lang=fr&blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
  if (!reponse.ok) {
    throw new Error(`Erreur API: ${reponse.status}`);
  }
  const data = await reponse.json();

  if (data.type === 'single') {
    return data.joke;
  }
  return `${data.setup}\n${data.delivery}`;
}

client.login(process.env.TOKEN);
