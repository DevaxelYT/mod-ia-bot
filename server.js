const express = require("express")

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
    res.send("OK")
})

app.post("/ask", (req, res) => {

    const question = req.body.question || "vide"

    res.setHeader("Content-Type", "application/json")

    return res.send(JSON.stringify({
        answer: "Tu as dit : " + question
    }))
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Backend online")
})
