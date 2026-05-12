const express = require('express');
const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
    const { question, player, context } = req.body;

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 150,
                system: context,
                messages: [{ role: "user", content: player + " demande : " + question }]
            })
        });

        const data = await response.json();
        res.json({ answer: data.content[0].text });

    } catch (err) {
        res.json({ answer: "Erreur, contacte un vrai modérateur." });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Bot Mod IA démarré !");
});