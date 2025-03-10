import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Box,
    Typography,
    InputAdornment,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp"; // Добавляем этот импорт
import TrendingDownIcon from "@mui/icons-material/TrendingDown"; // Добавляем этот импорт
import SearchIcon from "@mui/icons-material/Search";
import { useTokens } from "../../hooks/useTokens";
import { useTokenPrices } from "../../hooks/useTokenPrice";

interface TokenSelectModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (tokenAddress: string) => void;
    selectedToken?: string;
}

export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
    open,
    onClose,
    onSelect,
    selectedToken,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const { tokens, loading: tokensLoading } = useTokens(); // Переименовали loading в tokensLoading
    const { prices, loading: pricesLoading } = useTokenPrices(
        tokens.map((token) => token.symbol)
    );

    const filteredTokens = useMemo(() => {
        return tokens.filter(
            (token) =>
                token.symbol
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                token.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tokens, searchQuery]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Select a token</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    fullWidth
                    placeholder="Search by name or symbol"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                {tokensLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            py: 3,
                        }}
                    >
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography variant="body2" color="textSecondary">
                            Loading tokens...
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ pt: 0 }}>
                        {filteredTokens.length === 0 ? (
                            <Box sx={{ py: 2, textAlign: "center" }}>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    No tokens found
                                </Typography>
                            </Box>
                        ) : (
                            filteredTokens.map((token) => (
                                <ListItem disablePadding key={token.address}>
                                    <ListItemButton
                                        onClick={() => onSelect(token.address)}
                                        selected={
                                            selectedToken === token.address
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={token.logoURI}
                                                alt={token.symbol}
                                            >
                                                {token.symbol[0]}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                >
                                                    <Typography
                                                        component="span"
                                                        variant="subtitle1"
                                                    >
                                                        {token.symbol}
                                                    </Typography>
                                                    {pricesLoading ? (
                                                        <CircularProgress
                                                            size={16}
                                                        />
                                                    ) : (
                                                        prices[
                                                            token.symbol.toLowerCase()
                                                        ]?.usd && (
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                color="textSecondary"
                                                            >
                                                                $
                                                                {prices[
                                                                    token.symbol.toLowerCase()
                                                                ].usd.toFixed(
                                                                    2
                                                                )}
                                                            </Typography>
                                                        )
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="space-between"
                                                >
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="textSecondary"
                                                    >
                                                        {token.name}
                                                    </Typography>
                                                    {!pricesLoading &&
                                                        prices[
                                                            token.symbol.toLowerCase()
                                                        ]?.usd_24h_change && (
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                sx={{
                                                                    color:
                                                                        prices[
                                                                            token.symbol.toLowerCase()
                                                                        ]
                                                                            .usd_24h_change! >
                                                                        0
                                                                            ? "success.main"
                                                                            : "error.main",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                {prices[
                                                                    token.symbol.toLowerCase()
                                                                ]
                                                                    .usd_24h_change! >
                                                                0 ? (
                                                                    <TrendingUpIcon fontSize="small" />
                                                                ) : (
                                                                    <TrendingDownIcon fontSize="small" />
                                                                )}
                                                                {Math.abs(
                                                                    prices[
                                                                        token.symbol.toLowerCase()
                                                                    ]
                                                                        .usd_24h_change!
                                                                ).toFixed(1)}
                                                                %
                                                            </Typography>
                                                        )}
                                                </Box>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        )}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};
