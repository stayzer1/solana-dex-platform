import React, { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Paper,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Tabs,
    Tab,
} from "@mui/material";
import { SwapForm } from "./components/Swap/SwapForm";

import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    // Добавьте другие адаптеры, если нужно
} from "@solana/wallet-adapter-wallets";

require("@solana/wallet-adapter-react-ui/styles.css");

const endpoint =
    process.env.REACT_APP_RPC_URL || "https://api.mainnet-beta.solana.com";
// Создаем темную тему
const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#512da8",
        },
        secondary: {
            main: "#ff4081",
        },
        background: {
            default: "#121212",
            paper: "#1e1e1e",
        },
    },
});

// Компонент для содержимого таба
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

// Компоненты для разных секций
const Swap = () => <SwapForm />;

const TransferSwap = () => (
    <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Transfer Swap</Typography>
        {/* Контент для transfer swap */}
    </Paper>
);

const LimitOrders = () => (
    <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Limit Orders</Typography>
        {/* Контент для лимитных ордеров */}
    </Paper>
);

const TwapSwap = () => (
    <Paper sx={{ p: 3 }}>
        <Typography variant="h5">TWAP Swap</Typography>
        {/* Контент для TWAP */}
    </Paper>
);

function App() {
    const { connected } = useWallet();
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            // Добавьте другие кошельки, если нужно
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <ThemeProvider theme={darkTheme}>
                        <CssBaseline />
                        <Box sx={{ flexGrow: 1, minHeight: "100vh" }}>
                            <AppBar position="static">
                                <Toolbar>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        sx={{ flexGrow: 1 }}
                                    >
                                        Solana DEX Platform
                                    </Typography>
                                    <WalletMultiButton />
                                </Toolbar>
                            </AppBar>

                            <Container sx={{ mt: 4 }}>
                                {connected ? (
                                    <Box>
                                        <Paper sx={{ mb: 2 }}>
                                            <Tabs
                                                value={currentTab}
                                                onChange={handleTabChange}
                                                variant="fullWidth"
                                                textColor="primary"
                                                indicatorColor="primary"
                                            >
                                                <Tab label="Swap" />
                                                <Tab label="Transfer Swap" />
                                                <Tab label="Limit Orders" />
                                                <Tab label="TWAP" />
                                            </Tabs>
                                        </Paper>

                                        <TabPanel value={currentTab} index={0}>
                                            <Swap />
                                        </TabPanel>
                                        <TabPanel value={currentTab} index={1}>
                                            <TransferSwap />
                                        </TabPanel>
                                        <TabPanel value={currentTab} index={2}>
                                            <LimitOrders />
                                        </TabPanel>
                                        <TabPanel value={currentTab} index={3}>
                                            <TwapSwap />
                                        </TabPanel>
                                    </Box>
                                ) : (
                                    <Paper sx={{ p: 4, textAlign: "center" }}>
                                        <Typography variant="h5" sx={{ mb: 2 }}>
                                            Подключите кошелек для использования
                                            платформы
                                        </Typography>
                                        <WalletMultiButton />
                                    </Paper>
                                )}
                            </Container>
                        </Box>
                    </ThemeProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default App;
