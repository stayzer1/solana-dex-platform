const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export async function fetchTokenPrices(symbols: string[]) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/prices?symbols=${symbols.join(",")}`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch prices");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching prices:", error);
        throw error;
    }
}
