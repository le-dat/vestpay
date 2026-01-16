import { SuiClient } from '@mysten/sui/client';

/**
 * Request testnet SUI from faucet
 */
export async function requestFaucet(address: string): Promise<{
  success: boolean;
  message: string;
  txDigest?: string;
}> {
  try {
    const response = await fetch('https://faucet.testnet.sui.io/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Try to get error message from response
      const errorMsg = data.error || data.message || 'Faucet request failed';
      throw new Error(errorMsg);
    }

    // Check if we got a valid response
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      success: true,
      message: 'Successfully received 1 SUI from faucet!',
      txDigest: data.transferredGasObjects?.[0]?.id || data.task,
    };
  } catch (error: any) {
    console.error('Faucet error:', error);

    // Provide helpful error messages
    let message = 'Failed to request faucet. ';
    if (error.message.includes('rate limit')) {
      message += 'Rate limit exceeded. Please try again later.';
    } else if (error.message.includes('network')) {
      message += 'Network error. Please check your connection.';
    } else {
      message += error.message || 'Please try again or use Discord faucet.';
    }

    return {
      success: false,
      message,
    };
  }
}

/**
 * Get all coin balances for an address
 */
export async function getAllBalances(
  client: SuiClient,
  address: string
): Promise<Array<{
  coinType: string;
  balance: string;
  symbol: string;
}>> {
  try {
    const balances = await client.getAllBalances({ owner: address });

    return balances.map((bal) => {
      // Extract symbol from coin type (e.g., "0x2::sui::SUI" -> "SUI")
      const parts = bal.coinType.split('::');
      const symbol = parts[parts.length - 1] || 'UNKNOWN';

      // Convert to decimal with proper precision
      const balanceInSui = (Number(bal.totalBalance) / 1_000_000_000).toFixed(9);
      const formatted = parseFloat(balanceInSui).toString();

      return {
        coinType: bal.coinType,
        balance: formatted,
        symbol,
      };
    });
  } catch (error) {
    console.error('Failed to get balances:', error);
    return [];
  }
}

/**
 * Get transaction history for an address
 */
export async function getTransactionHistory(
  client: SuiClient,
  address: string,
  limit: number = 20
): Promise<Array<{
  digest: string;
  timestamp: number;
  sender: string;
  status: 'success' | 'failure';
  gasUsed: string;
}>> {
  try {
    const txs = await client.queryTransactionBlocks({
      filter: {
        FromAddress: address,
      },
      options: {
        showEffects: true,
        showInput: true,
      },
      limit,
      order: 'descending',
    });

    return txs.data.map((tx) => ({
      digest: tx.digest,
      timestamp: Number(tx.timestampMs || 0),
      sender: (tx.transaction?.data as any)?.sender || address,
      status: tx.effects?.status?.status === 'success' ? 'success' : 'failure',
      gasUsed: tx.effects?.gasUsed?.computationCost || '0',
    }));
  } catch (error) {
    console.error('Failed to get transaction history:', error);
    return [];
  }
}
