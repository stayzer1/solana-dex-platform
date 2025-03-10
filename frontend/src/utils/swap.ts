import { Connection, PublicKey } from "@solana/web3.js";
import { getOrca, OrcaPool, OrcaToken } from "@orca-so/sdk";
import Decimal from "decimal.js";

// Маппинг адресов токенов в OrcaToken
const TOKEN_ADDRESS_TO_ORCA_TOKEN: { [key: string]: OrcaToken } = {
    So11111111111111111111111111111111111111112: OrcaToken.SOL,
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: OrcaToken.USDC,
};

export async function createSwapTransaction({
    connection,
    fromToken,
    toToken,
    fromAmount,
    wallet,
    slippage = 1,
}: {
    connection: Connection;
    fromToken: string;
    toToken: string;
    fromAmount: number;
    wallet: PublicKey;
    slippage?: number;
}) {
    try {
        // Получаем Orca токены
        const fromOrcaToken = TOKEN_ADDRESS_TO_ORCA_TOKEN[fromToken];
        const toOrcaToken = TOKEN_ADDRESS_TO_ORCA_TOKEN[toToken];

        if (!fromOrcaToken || !toOrcaToken) {
            throw new Error(`Unsupported token pair: ${fromToken}/${toToken}`);
        }

        console.log("Converting tokens:", {
            fromToken: fromOrcaToken,
            toToken: toOrcaToken,
            fromAmount,
        });

        // Инициализируем Orca
        const orca = getOrca(connection);

        // Получаем пул напрямую из Orca
        const pool = orca.getPool(fromOrcaToken, toOrcaToken);

        // Конвертируем amount в Decimal
        const decimalAmount = new Decimal(fromAmount);

        // Получаем quote
        const quote = await pool.getQuote(fromOrcaToken, decimalAmount);
        console.log("Quote received:", quote.toString());

        // Рассчитываем минимальное количество с учетом проскальзывания
        const minOutputAmount = quote.getMinOutputAmount();

        // Создаем свап транзакцию
        const swapPayload = await pool.swap(
            wallet,
            fromOrcaToken,
            decimalAmount,
            minOutputAmount
        );

        return {
            transaction: swapPayload.transaction,
            signers: swapPayload.signers,
            expectedAmount: Number(quote.getExpectedOutputAmount().toString()),
        };
    } catch (error) {
        console.error("Error creating swap:", error);
        throw error;
    }
}
