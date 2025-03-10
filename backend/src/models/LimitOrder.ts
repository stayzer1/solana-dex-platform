import mongoose from "mongoose";

enum OrderType {
    LIMIT = "LIMIT",
    STOP_LOSS = "STOP_LOSS",
    TAKE_PROFIT = "TAKE_PROFIT",
}

enum OrderStatus {
    PENDING = "PENDING",
    EXECUTED = "EXECUTED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
}

const LimitOrderSchema = new mongoose.Schema({
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
    amount: {
        type: String,
        required: true,
    },
    targetPrice: {
        type: String,
        required: true,
    },
    orderType: {
        type: String,
        enum: Object.values(OrderType),
        default: OrderType.LIMIT,
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.PENDING,
    },
    dex: {
        type: String,
        required: true,
    },
    signature: {
        type: String,
        default: null,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 неделя по умолчанию
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("LimitOrder", LimitOrderSchema);
