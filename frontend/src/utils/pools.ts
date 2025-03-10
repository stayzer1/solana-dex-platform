import { Connection, PublicKey } from "@solana/web3.js";
import { getOrca, OrcaPool } from "@orca-so/sdk";
import { OrcaPoolConfig } from "@orca-so/sdk/dist/public/pools/config";
import Decimal from "decimal.js";

// Определяем типы для конфигурации пулов
interface PoolTokens {
    [key: string]: string; // токен: адрес
}

interface PoolConfig {
    address: string;
    tokens: PoolTokens;
}

export interface PoolsConfig {
    [key: string]: PoolConfig;
}

// Определяем доступные пулы
export const POOLS: PoolsConfig = {
    "SOL/USDC": {
        address: "HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ",
        tokens: {
            SOL: "So11111111111111111111111111111111111111112",
            USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
    },
    "USDC/SOL": {
        address: "HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ",
        tokens: {
            USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            SOL: "So11111111111111111111111111111111111111112",
        },
    },
};

// Определяем конфигурацию для Orca пулов
interface CustomOrcaPoolConfig {
    address: PublicKey;
    nonce: number;
    authority: PublicKey;
    poolTokenMint: PublicKey;
    poolTokenDecimals: number;
    feeAccount: PublicKey;
    tokenIds: string[];
    tokens: {
        [key: string]: {
            mint: PublicKey;
            vault: PublicKey;
        };
    };
    curveType: number;
    feeStructure: {
        traderFee: Decimal;
        ownerFee: Decimal;
    };
}

// Конфигурация пулов Orca
const ORCA_POOL_CONFIGS: { [key: string]: CustomOrcaPoolConfig } = {
    "SOL/USDC": {
        address: new PublicKey("HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ"),
        nonce: 255,
        authority: new PublicKey(
            "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1"
        ),
        poolTokenMint: new PublicKey(
            "APDFRM3HMr8CAGXwKHiu2f5ePSpaiEJhaURwhsRrUUt9"
        ),
        poolTokenDecimals: 6,
        feeAccount: new PublicKey(
            "4Zc4kQZhRQeGztihvcGSWezJE1k44kKEgPCAkdeBfras"
        ),
        tokenIds: ["SOL", "USDC"],
        tokens: {
            SOL: {
                mint: new PublicKey(
                    "So11111111111111111111111111111111111111112"
                ),
                vault: new PublicKey(
                    "ANP74VNsHwSrq9uUSjiSNyNWvf6ZPrKTmE4gHoNd13Lg"
                ),
            },
            USDC: {
                mint: new PublicKey(
                    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                ),
                vault: new PublicKey(
                    "75HgnSvXbWKZBpZHveX68ZzAhDqMzNDS29X6BGLtxMo1"
                ),
            },
        },
        curveType: 0,
        feeStructure: {
            traderFee: new Decimal(0.0025),
            ownerFee: new Decimal(0.0005),
        },
    },
    // Добавляем обратный порядок для USDC/SOL
    "USDC/SOL": {
        address: new PublicKey("HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ"),
        nonce: 255,
        authority: new PublicKey(
            "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1"
        ),
        poolTokenMint: new PublicKey(
            "APDFRM3HMr8CAGXwKHiu2f5ePSpaiEJhaURwhsRrUUt9"
        ),
        poolTokenDecimals: 6,
        feeAccount: new PublicKey(
            "4Zc4kQZhRQeGztihvcGSWezJE1k44kKEgPCAkdeBfras"
        ),
        tokenIds: ["USDC", "SOL"],
        tokens: {
            USDC: {
                mint: new PublicKey(
                    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                ),
                vault: new PublicKey(
                    "75HgnSvXbWKZBpZHveX68ZzAhDqMzNDS29X6BGLtxMo1"
                ),
            },
            SOL: {
                mint: new PublicKey(
                    "So11111111111111111111111111111111111111112"
                ),
                vault: new PublicKey(
                    "ANP74VNsHwSrq9uUSjiSNyNWvf6ZPrKTmE4gHoNd13Lg"
                ),
            },
        },
        curveType: 0,
        feeStructure: {
            traderFee: new Decimal(0.0025),
            ownerFee: new Decimal(0.0005),
        },
    },
};

// Функция для конвертации CustomOrcaPoolConfig в OrcaPoolConfig
function convertToOrcaPoolConfig(
    customConfig: CustomOrcaPoolConfig
): OrcaPoolConfig {
    const config = {
        address: customConfig.address.toString(),
        nonce: customConfig.nonce,
        authority: customConfig.authority.toString(),
        poolTokenMint: customConfig.poolTokenMint.toString(),
        poolTokenDecimals: customConfig.poolTokenDecimals,
        feeAccount: customConfig.feeAccount.toString(),
        tokenIds: customConfig.tokenIds,
        tokens: {
            [customConfig.tokenIds[0]]: {
                mint: customConfig.tokens[
                    customConfig.tokenIds[0]
                ].mint.toString(),
                vault: customConfig.tokens[
                    customConfig.tokenIds[0]
                ].vault.toString(),
            },
            [customConfig.tokenIds[1]]: {
                mint: customConfig.tokens[
                    customConfig.tokenIds[1]
                ].mint.toString(),
                vault: customConfig.tokens[
                    customConfig.tokenIds[1]
                ].vault.toString(),
            },
        },
        curveType: customConfig.curveType,
        feeStructure: customConfig.feeStructure,
    } as unknown;

    return config as OrcaPoolConfig;
}

export async function getPool(
    connection: Connection,
    fromToken: string,
    toToken: string
): Promise<OrcaPool> {
    const orca = getOrca(connection);

    // Находим подходящий пул
    let poolKey;

    // Проверяем прямой порядок токенов
    if (POOLS[`${fromToken}/${toToken}`]) {
        poolKey = `${fromToken}/${toToken}`;
    }
    // Проверяем обратный порядок токенов
    else if (POOLS[`${toToken}/${fromToken}`]) {
        poolKey = `${toToken}/${fromToken}`;
    }
    // Если пул не найден, пробуем найти по адресам токенов
    else {
        const normalizedFromToken = fromToken.toLowerCase();
        const normalizedToToken = toToken.toLowerCase();

        for (const [key, pool] of Object.entries(POOLS)) {
            const poolTokens = Object.values(pool.tokens).map((t) =>
                t.toLowerCase()
            );
            if (
                poolTokens.includes(normalizedFromToken) &&
                poolTokens.includes(normalizedToToken)
            ) {
                poolKey = key;
                break;
            }
        }
    }

    if (!poolKey) {
        throw new Error(`Pool ${fromToken}/${toToken} not found`);
    }

    const poolConfig = ORCA_POOL_CONFIGS[poolKey];
    if (!poolConfig) {
        throw new Error(`Orca pool config for ${poolKey} not found`);
    }

    return orca.getPool(convertToOrcaPoolConfig(poolConfig));
}

export function calculateMinimumReceived(
    amount: number,
    slippage: number
): number {
    const decimal = new Decimal(amount);
    const slippageDecimal = new Decimal(1).minus(
        new Decimal(slippage).dividedBy(100)
    );
    return decimal.times(slippageDecimal).toNumber();
}
