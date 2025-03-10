import express, { Request, Response, Router, RequestHandler } from "express";
import axios from "axios";
import { cache } from "../utils/cache";

const router: Router = express.Router();

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const CACHE_TIME = 60 * 1000; // 1 минута

const getPrices: RequestHandler = async (req, res) => {
    try {
        const { symbols } = req.query;
        if (!symbols || typeof symbols !== "string" || symbols.trim() === "") {
            res.status(400).json({ error: "Symbols are required" });
            return;
        }

        const symbolsArray = symbols.split(",").filter(Boolean);
        if (symbolsArray.length === 0) {
            res.status(400).json({ error: "No valid symbols provided" });
            return;
        }

        const cacheKey = `prices_${symbols}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            res.json(cachedData);
            return;
        }

        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
                ids: symbols,
                vs_currencies: "usd",
                include_24hr_change: true,
            },
        });

        cache.set(cacheKey, response.data, CACHE_TIME);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching prices:", error);
        res.status(500).json({ error: "Failed to fetch prices" });
    }
};

router.get("/", getPrices);

export default router;
