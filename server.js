const express = require('express');
const https = require('https');

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

app.post('/ask', async (req, res) => {

    const { question, player, context } = req.body;

    console.log(
        "Question de:",
        player,
        "|",
        question
    );

    const finalPrompt =
        context +
        "\n\nJoueur: " + player +
        "\nQuestion: " + question +
        "\n\nRéponds naturellement.";

    const postData = JSON.stringify({

        contents: [
            {
                parts: [
                    {
                        text: finalPrompt
                    }
                ]
            }
        ],

        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 120
        }

    });

    const options = {

        hostname: 'generativelanguage.googleapis.com',

        path:
            '/v1beta/models/gemini-2.5-flash:generateContent?key=' +
            process.env.GEMINI_API_KEY,

        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
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
                    "Gemini response:",
                    JSON.stringify(parsed)
                );

                const msg =
                    parsed.candidates?.[0]
                    ?.content?.parts?.[0]
                    ?.text
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

        console.log(
            "Erreur:",
            err.message
        );

        res.json({
            answer:
                "Erreur backend."
        });
    });

    request.write(postData);

    request.end();
});

app.listen(process.env.PORT || 3000, () => {

    console.log("Gemini ModIA started!");
});
