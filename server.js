const express = require('express');
const https = require('https');
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

app.post('/ask', async (req, res) => {
    const { question, player, context } = req.body;
    console.log("Requête reçue de:", player, "| Question:", question);
    const postData = JSON.stringify({
        model: "command-a-03-2025",
        preamble: context,
        message: player + " demande : " + question
    });
    const options = {
        hostname: 'api.cohere.com',
        path: '/v1/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.COHERE_API_KEY,
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                console.log("Réponse Cohere:", JSON.stringify(parsed));
                res.json({ answer: parsed.text });
            } catch (e) {
                res.json({ answer: "Erreur, contacte un vrai modérateur." });
            }
        });
    });
    request.on('error', (err) => {
        console.log("Erreur:", err.message);
        res.json({ answer: "Erreur, contacte un vrai modérateur." });
    });
    request.write(postData);
    request.end();
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Bot Mod IA démarré !");
});
