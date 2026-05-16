const express = require('express');
const https = require('https');

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

app.post('/ask', async (req, res) => {

    const { question, player, context } = req.body;

    console.log(
        "Requête reçue de:",
        player,
        "| Question:",
        question
    );

    const postData = JSON.stringify({

        model: "gpt-4.1-mini",

        messages: [
            {
                role: "system",
                content:
                    context +
                    "\nIMPORTANT: Réponds en maximum 2 phrases courtes."
            },
            {
                role: "user",
                content:
                    player + " demande : " + question
            }
        ],

        max_tokens: 100,
        temperature: 0.7
    });

    const options = {

        hostname: 'api.openai.com',

        path: '/v1/chat/completions',

        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
            'Authorization':
                'Bearer ' + process.env.OPENAI_API_KEY,

            'Content-Length':
                Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (response) => {

        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {

            try {

                const parsed = JSON.parse(data);

                console.log(
                    "Réponse OpenAI:",
                    JSON.stringify(parsed)
                );

                const msg =
                    parsed.choices?.[0]?.message?.content
                    || "Erreur IA.";

                res.json({
                    answer: msg
                });

            } catch (e) {

                console.log(
                    "Parse error:",
                    e.message
                );

                res.json({
                    answer: "Erreur parsing."
                });
            }
        });
    });

    request.on('error', (err) => {

        console.log("Erreur:", err.message);

        res.json({
            answer:
                "Erreur, contacte un vrai modérateur."
        });
    });

    request.write(postData);

    request.end();
});

app.listen(process.env.PORT || 3000, () => {

    console.log("Bot Mod IA démarré !");
});
