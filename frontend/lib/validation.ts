export type CryptoNetwork = "TRC20" | "BEP20" | "ERC20" | "TON";

const TRON_REGEX = /^T[1-9A-HJ-NP-za-km-z]{33}$/;
const EVM_REGEX = /^0x[a-fA-F0-9]{40}$/;
const TON_FRIENDLY_REGEX = /^(EQ|UQ|Ef|Uf)[a-zA-Z0-9_-]{46}$/;
const TON_RAW_REGEX = /^(-1|0):[a-fA-F0-9]{64}$/;

export function validateWalletAddress(network: CryptoNetwork, address: string): { isValid: boolean; message: string } {
  if (!address || !address.trim()) {
    return { isValid: false, message: "Введите адрес вашего USDT кошелька" };
  }

  const trimmed = address.trim();

  switch (network) {
    case "TRC20":
      if (!TRON_REGEX.test(trimmed)) {
        return {
          isValid: false,
          message: "Неверный адрес TRC-20 (Tron). Должен начинаться с 'T' и состоять из 34 символов.",
        };
      }
      return { isValid: true, message: "" };

    case "BEP20":
      if (!EVM_REGEX.test(trimmed)) {
        return {
          isValid: false,
          message: "Неверный адрес BEP-20 (BNB Chain). Должен начинаться с '0x' и содержать 42 символа.",
        };
      }
      return { isValid: true, message: "" };

    case "ERC20":
      if (!EVM_REGEX.test(trimmed)) {
        return {
          isValid: false,
          message: "Неверный адрес ERC-20 (Ethereum). Должен начинаться с '0x' и содержать 42 символа.",
        };
      }
      return { isValid: true, message: "" };

    case "TON":
      if (!TON_FRIENDLY_REGEX.test(trimmed) && !TON_RAW_REGEX.test(trimmed)) {
        return {
          isValid: false,
          message: "Неверный адрес TON. Должен начинаться с EQ / UQ (48 символов) или workchain raw 0:...",
        };
      }
      return { isValid: true, message: "" };

    default:
      return { isValid: false, message: "Неизвестная сеть." };
  }
}
