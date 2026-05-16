Gemini response: {"error":{"code":400,"message":"API key not valid. Please pass a valid API key.","statconst express = require('express');
const https = require('https');

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

app.post('/ask', async (req, res) => {

    const {
        question,
        player,
        context
    } = req.body;

    console.log(
        "Question:",
        question
    );

    const prompt =
        context +
        "\n\nCurrent player: " + player +
        "\nCurrent message: " + question;

    const postData = JSON.stringify({

        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],

        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150
        }

    });

    const options = {

        hostname:
            'generativelanguage.googleapis.com',

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

                const msg =
                    parsed.candidates?.[0]
                    ?.content?.parts?.[0]
                    ?.text
                    || "Erreur IA.";

                console.log("AI:", msg);

                res.json({
                    answer: msg
                });

            } catch (e) {

                console.log(e);

                res.json({
                    answer: "Erreur parsing."
                });
            }
        });
    });

    request.on('error', (err) => {

        console.log(err);

        res.json({
            answer: "Erreur backend."
        });
    });

    request.write(postData);

    request.end();
});

app.listen(process.env.PORT || 3000, () => {

    console.log("Gemini backend started");
});lease pass a valid API key."}]}}
