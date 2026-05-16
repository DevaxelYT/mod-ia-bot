const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

app.post('/ask', async (req, res) => {
    const { question, player, context } = req.body;

    console.log("Question de:", player, "->", question);

    // Cohere gère mieux les instructions via son paramètre 'preamble'.
    // On garde quand même la structure propre pour le message.
    const postData = JSON.stringify({
        model: 'command-r-plus',
        message: question,
        preamble: context + "\n\nCurrent player: " + player,
        temperature: 0.3, // Basse température pour éviter les inventions
        max_tokens: 250
    });

    const options = {
        hostname: 'api.cohere.com',
        path: '/v1/chat',
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
                
                // Si Cohere renvoie une erreur textuelle directe
                if (parsed.message && !parsed.text) {
                    console.log("DÉTAIL ERREUR COHERE :", parsed.message);
                }

                // Extraction de la réponse chez Cohere (le texte est dans parsed.text)
                let msg = parsed.text || "Erreur IA.";
                
                // 🔥 NETTOYAGE STRICT : On vire les guillemets et les retours à la ligne superflus
                msg = msg.replace(/^["'\s]+|["'\s]+$/g, '').trim();
                
                console.log("AI brute (Cohere):", msg);

                res.json({ answer: msg });
            } catch (e) {
                console.log("Erreur crash parsing. Réponse brute :", data);
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

// Port configuré pour Render (10000 ou process.env.PORT)
app.listen(process.env.PORT || 3000, () => {
    console.log("Cohere backend started");
});
