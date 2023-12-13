import express from "express";
import axios from "axios";
import cors from "cors";
import { createClient } from "redis";

const redisClient = createClient();

const DEFAULT_EXPIRATION = 10

const app = express();
app.use(express.json())
app.use(cors())

redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();

app.get("/photos", async (request, response) => {
    // REDIS Implementation
    const photos = await redisClient.get('photos')
    if (photos != null) {
        console.log("Redis Value")
        return response.status(200).send(JSON.parse(photos))
    }
    else {
        await axios.get("https://jsonplaceholder.typicode.com/photos")
            .then(async (res) => {
                await redisClient.setEx('photos', DEFAULT_EXPIRATION, JSON.stringify(res.data))
                console.log("Fetch Value")
                return response.status(200).json(res.data)
            })
            .catch((error) => {
                console.log("Fetch Photos Error")
                return response.status(500).send(error)
            })
    }
})

app.get("/photos/:id", async (request, response) => {
    const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${request.params.id}`)

    response.status(200).json(data)
})

app.listen(4000, () => console.log("Server Listening in Port 4000"))