import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { WalletContextProvider } from "./context/WalletContext";
import { ConnectionProvider } from "@solana/wallet-adapter-react";

const endpoint =
    process.env.REACT_APP_RPC_URL || "https://api.mainnet-beta.solana.com";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <ConnectionProvider endpoint={endpoint}>
            <WalletContextProvider>
                <App />
            </WalletContextProvider>
        </ConnectionProvider>
    </React.StrictMode>
);
