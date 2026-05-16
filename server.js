const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

app.post('/ask', async (req, res) => {
    const { question, player, context } = req.body;

    console.log("Question de:", player, "->", question);

    const prompt = context + "\n\nCurrent player: " + player + "\nCurrent message: " + question;

    const postData = JSON.stringify({
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ],
        generationConfig: {
            temperature: 0.3, // On baisse encore pour éviter qu'elle invente des réponses
            maxOutputTokens: 100
        }
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: '/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                let msg = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur IA.";
                
                // 🔥 NETTOYAGE STRICT : On vire les guillemets et les retours à la ligne superflus
                msg = msg.replace(/^["'\s]+|["'\s]+$/g, '').trim();
                
                console.log("AI brute:", msg);

                res.json({ answer: msg });
            } catch (e) {
                console.log(e);
                res.json({ answer: "Erreur parsing." });
            }
        });
    });

    request.on('error', (err) => {
        console.log(err);
        res.json({ answer: "Erreur backend." });
    });

    request.write(postData);
    request.end();
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Gemini backend started");
});
