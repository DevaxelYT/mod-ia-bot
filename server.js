const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

app.post('/ask', async (req, res) => {
    const { question, player, context } = req.body;

    console.log("Question de:", player, "->", question);

    // Structure mise à jour pour l'API Cohere v2 (Format universel)
    const postData = JSON.stringify({
        model: 'command-r-08-2024',
        messages: [
            {
                role: 'system',
                content: context + "\n\nCurrent player: " + player
            },
            {
                role: 'user',
                content: question
            }
        ],
        temperature: 0.3,
        max_tokens: 250
    });

    const options = {
        hostname: 'api.cohere.com',
        path: '/v2/chat', // Passage à l'API v2 sécurisée
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + process.env.COHERE_API_KEY,
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
                
                // Gestion des logs d'erreurs renvoyés par Cohere
                if (parsed.error || parsed.message) {
                    console.log("DÉTAIL ERREUR API :", parsed.error || parsed.message);
                }

                // Dans l'API v2, la réponse se trouve dans message.content[0].text
                let msg = parsed.message?.content?.[0]?.text || "Erreur IA.";
                
                // NETTOYAGE STRICT
                msg = msg.replace(/^["'\s]+|["'\s]+$/g, '').trim();
                
                console.log("AI brute (Cohere v2):", msg);

                res.json({ answer: msg });
            } catch (e) {
                console.log("Erreur crash parsing. Réponse brute du serveur :", data);
                res.json({ answer: "Erreur parsing." });
            }
        });
    });

    request.on('error', (err) => {
        console.log("Erreur de connexion au backend :", err);
        res.json({ answer: "Erreur backend." });
    });

    request.write(postData);
    request.end();
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Cohere v2 backend started");
});
