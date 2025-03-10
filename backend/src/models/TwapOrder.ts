import mongoose from "mongoose";

enum TwapStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
}

const TwapOrderSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        index: true,
    },
    fromToken: {
        type: String,
        required: true,
    },
    toToken: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: String,
        required: true,
    },
    amountPerTrade: {
        type: String,
        required: true,
    },
    interval: {
        type: Number, // интервал в минутах
        required: true,
    },
    executedTrades: {
        type: Number,
        default: 0,
    },
    totalTrades: {
        type: Number,
        required: true,
    },
    dex: {
        type: String,
        required: true,
    },
    transactions: [
        {
            signature: String,
            amount: String,
            price: String,
            timestamp: Date,
        },
    ],
    status: {
        type: String,
        enum: Object.values(TwapStatus),
        default: TwapStatus.ACTIVE,
    },
    nextExecutionTime: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("TwapOrder", TwapOrderSchema);
