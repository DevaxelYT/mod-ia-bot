const express = require('express');
const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
    const { question, player, context } = req.body;
    console.log("Requête reçue de:", player, "| Question:", question);

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { role: "user", parts: [{ text: context + "\n\n" + player + " demande : " + question }] }
                    ]
                })
            }
        );

        const data = await response.json();
        console.log("Réponse Gemini:", JSON.stringify(data));
        res.json({ answer: data.candidates[0].content.parts[0].text });

    } catch (err) {
        console.log("Erreur:", err.message);
        res.json({ answer: "Erreur, contacte un vrai modérateur." });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Bot Mod IA démarré !");
});
