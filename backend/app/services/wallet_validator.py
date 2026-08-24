import re
from typing import Tuple
from app.schemas.order import CryptoNetwork

class WalletValidator:
    # TRC-20 (Tron): Base58Check string starting with 'T', length 34
    TRON_REGEX = re.compile(r"^T[1-9A-HJ-NP-za-km-z]{33}$")
    
    # ERC-20 / BEP-20 (EVM): 0x followed by 40 hex characters
    EVM_REGEX = re.compile(r"^0x[a-fA-F0-9]{40}$")
    
    # TON (The Open Network): Base64url 48-char friendly address (EQ/UQ) or raw workchain hex
    TON_FRIENDLY_REGEX = re.compile(r"^(EQ|UQ|Ef|Uf)[a-zA-Z0-9_-]{46}$")
    TON_RAW_REGEX = re.compile(r"^(-1|0):[a-fA-F0-9]{64}$")

    @classmethod
    def validate(cls, network: CryptoNetwork, address: str) -> Tuple[bool, str]:
        """
        Validates the wallet address format according to network specifications.
        Returns (is_valid, error_message).
        """
        if not address or not isinstance(address, str):
            return False, "Адрес кошелька не может быть пустым."
            
        address = address.strip()

        if network == CryptoNetwork.TRC20:
            if not cls.TRON_REGEX.match(address):
                return False, "Неверный формат TRC-20 (Tron) адреса. Должен начинаться с 'T' и содержать 34 символа."
            return True, ""

        elif network in (CryptoNetwork.BEP20, CryptoNetwork.ERC20):
            net_name = "BEP-20 (BNB Chain)" if network == CryptoNetwork.BEP20 else "ERC-20 (Ethereum)"
            if not cls.EVM_REGEX.match(address):
                return False, f"Неверный формат адреса {net_name}. Должен начинаться с '0x' и содержать 42 символа."
            return True, ""

        elif network == CryptoNetwork.TON:
            if not (cls.TON_FRIENDLY_REGEX.match(address) or cls.TON_RAW_REGEX.match(address)):
                return False, "Неверный формат TON адреса. Должен начинаться с EQ/UQ (48 символов) или workchain raw: 0:..."
            return True, ""

        return False, f"Неизвестная сеть: {network}"
