const express = require('express');
const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
    const { question, player, context } = req.body;

    try {
        const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.AIML_API_KEY
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // gratuit et rapide sur AIML
                max_tokens: 150,
                messages: [
                    { role: "system", content: context },
                    { role: "user", content: player + " demande : " + question }
                ]
            })
        });

        const data = await response.json();
        res.json({ answer: data.choices[0].message.content });

    } catch (err) {
        res.json({ answer: "Erreur, contacte un vrai modérateur." });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Bot Mod IA démarré !");
});
