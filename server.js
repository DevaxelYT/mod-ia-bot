const express = require('express');
const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
    const { question, player, context } = req.body;
    console.log("Requête reçue de:", player, "| Question:", question);

    try {
        const response = await fetch("https://api.cohere.com/v1/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.COHERE_API_KEY
            },
            body: JSON.stringify({
                model: "command-a-03-2025",
                preamble: context,
                message: player + " demande : " + question
            })
        });

        const data = await response.json();
        console.log("Réponse Cohere:", JSON.stringify(data));
        res.json({ answer: data.text });

    } catch (err) {
        console.log("Erreur:", err.message);
        res.json({ answer: "Erreur, contacte un vrai modérateur." });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Bot Mod IA démarré !");
});
