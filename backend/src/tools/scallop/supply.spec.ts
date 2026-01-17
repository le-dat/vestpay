/**
 * Comprehensive tests for Scallop Supply (buildSupplyTransaction)
 */

import { ScallopLendingIntegration } from './index';

// Mock Scallop SDK
jest.mock('@scallop-io/sui-scallop-sdk', () => ({
  Scallop: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    client: {
      scallopSuiKit: {
        client: jest.fn().mockReturnValue({
          // Mock SuiClient for transaction building
        }),
      },
    },
    createScallopClient: jest.fn().mockResolvedValue({
      deposit: jest.fn().mockResolvedValue({
        build: jest.fn().mockResolvedValue(Buffer.from('mock-supply-tx-bytes')),
      }),
    }),
    createScallopQuery: jest.fn().mockResolvedValue({
      getMarketPool: jest.fn().mockResolvedValue({
        supplyApy: 5.5,
        borrowApy: 3.2,
        utilizationRate: 0.75,
        totalSupply: 1000000000000,
        totalBorrow: 750000000000,
      }),
    }),
  })),
}));

describe('ScallopLending - buildSupplyTransaction', () => {
  const mockUserAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should build supply transaction successfully', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000, // 1 SUI
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('txBlockBytes');
      expect(result).toHaveProperty('apy');
    });

    it('should return valid transaction bytes', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(typeof result.txBlockBytes).toBe('string');
      expect(result.txBlockBytes.length).toBeGreaterThan(0);
    });

    it('should return valid base64 encoded bytes', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      // Should be able to decode base64 without error
      expect(() => Buffer.from(result.txBlockBytes, 'base64')).not.toThrow();

      const decoded = Buffer.from(result.txBlockBytes, 'base64');
      expect(decoded.length).toBeGreaterThan(0);
    });

    it('should return APY as a number', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(typeof result.apy).toBe('number');
      expect(result.apy).toBeGreaterThanOrEqual(0);
      expect(result.apy).toBeLessThan(100); // APY should be reasonable
    });
  });

  describe('Different Coin Types', () => {
    it('should handle SUI supply', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000, // 1 SUI (9 decimals)
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result.txBlockBytes).toBeTruthy();
      expect(result.apy).toBeGreaterThanOrEqual(0);
    });

    it('should handle USDC supply', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'usdc',
        amount: 100000000, // 100 USDC (6 decimals)
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result.txBlockBytes).toBeTruthy();
      expect(result.apy).toBeGreaterThanOrEqual(0);
    });

    it('should handle USDT supply', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'usdt',
        amount: 50000000, // 50 USDT (6 decimals)
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result.txBlockBytes).toBeTruthy();
      expect(result.apy).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple coin types in sequence', async () => {
      const coinTypes = ['sui', 'usdc', 'usdt'];

      for (const coinName of coinTypes) {
        const params = {
          userAddress: mockUserAddress,
          coinName,
          amount: 1000000,
        };

        const result =
          await ScallopLendingIntegration.buildSupplyTransaction(params);

        expect(result).toHaveProperty('txBlockBytes');
        expect(result).toHaveProperty('apy');
        expect(result.txBlockBytes).toBeTruthy();
      }
    });
  });

  describe('Different Amounts', () => {
    it('should handle small amounts', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000, // 0.000001 SUI
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result.txBlockBytes).toBeTruthy();
    });

    it('should handle medium amounts', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000, // 1 SUI
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result.txBlockBytes).toBeTruthy();
    });

    it('should handle large amounts', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000000, // 1000 SUI
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result.txBlockBytes).toBeTruthy();
    });
  });

  describe('Different User Addresses', () => {
    it('should handle valid Sui address format', async () => {
      const addresses = [
        '0x1234567890abcdef1234567890abcdef12345678',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      ];

      for (const userAddress of addresses) {
        const params = {
          userAddress,
          coinName: 'sui',
          amount: 1000000000,
        };

        const result =
          await ScallopLendingIntegration.buildSupplyTransaction(params);

        expect(result.txBlockBytes).toBeTruthy();
      }
    });
  });

  describe('APY Information', () => {
    it('should return current market APY', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result.apy).toBe(5.5); // From mock
    });

    it('should return 0 APY if market data unavailable', async () => {
      // Mock market pool with no APY
      const { Scallop } = require('@scallop-io/sui-scallop-sdk');
      Scallop.mockImplementationOnce(() => ({
        init: jest.fn().mockResolvedValue(undefined),
        client: {
          scallopSuiKit: {
            client: jest.fn().mockReturnValue({}),
          },
        },
        createScallopClient: jest.fn().mockResolvedValue({
          deposit: jest.fn().mockResolvedValue({
            build: jest.fn().mockResolvedValue(Buffer.from('mock-tx-bytes')),
          }),
        }),
        createScallopQuery: jest.fn().mockResolvedValue({
          getMarketPool: jest.fn().mockResolvedValue({
            supplyApy: null,
          }),
        }),
      }));

      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(result.apy).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw error if SDK initialization fails', async () => {
      const { Scallop } = require('@scallop-io/sui-scallop-sdk');
      Scallop.mockImplementationOnce(() => ({
        init: jest.fn().mockRejectedValue(new Error('SDK init failed')),
      }));

      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      await expect(
        ScallopLendingIntegration.buildSupplyTransaction(params),
      ).rejects.toThrow();
    });

    it('should throw error if client creation fails', async () => {
      const { Scallop } = require('@scallop-io/sui-scallop-sdk');
      Scallop.mockImplementationOnce(() => ({
        init: jest.fn().mockResolvedValue(undefined),
        client: {
          scallopSuiKit: {
            client: jest.fn().mockReturnValue({}),
          },
        },
        createScallopClient: jest
          .fn()
          .mockRejectedValue(new Error('Client creation failed')),
        createScallopQuery: jest.fn().mockResolvedValue({
          getMarketPool: jest.fn().mockResolvedValue({ supplyApy: 5.5 }),
        }),
      }));

      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      await expect(
        ScallopLendingIntegration.buildSupplyTransaction(params),
      ).rejects.toThrow('Failed to build supply transaction');
    });

    it('should throw error if deposit transaction build fails', async () => {
      const { Scallop } = require('@scallop-io/sui-scallop-sdk');
      Scallop.mockImplementationOnce(() => ({
        init: jest.fn().mockResolvedValue(undefined),
        client: {
          scallopSuiKit: {
            client: jest.fn().mockReturnValue({}),
          },
        },
        createScallopClient: jest.fn().mockResolvedValue({
          deposit: jest
            .fn()
            .mockRejectedValue(new Error('Transaction build failed')),
        }),
        createScallopQuery: jest.fn().mockResolvedValue({
          getMarketPool: jest.fn().mockResolvedValue({ supplyApy: 5.5 }),
        }),
      }));

      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      await expect(
        ScallopLendingIntegration.buildSupplyTransaction(params),
      ).rejects.toThrow('Failed to build supply transaction');
    });

    it('should include original error message in thrown error', async () => {
      const { Scallop } = require('@scallop-io/sui-scallop-sdk');
      Scallop.mockImplementationOnce(() => ({
        init: jest.fn().mockResolvedValue(undefined),
        client: {
          scallopSuiKit: {
            client: jest.fn().mockReturnValue({}),
          },
        },
        createScallopClient: jest.fn().mockResolvedValue({
          deposit: jest
            .fn()
            .mockRejectedValue(new Error('Insufficient balance')),
        }),
        createScallopQuery: jest.fn().mockResolvedValue({
          getMarketPool: jest.fn().mockResolvedValue({ supplyApy: 5.5 }),
        }),
      }));

      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      await expect(
        ScallopLendingIntegration.buildSupplyTransaction(params),
      ).rejects.toThrow('Insufficient balance');
    });
  });

  describe('Transaction Bytes Format', () => {
    it('should return base64 encoded string', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      // Base64 regex pattern
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
      expect(base64Pattern.test(result.txBlockBytes)).toBe(true);
    });

    it('should return consistent format across multiple calls', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const result1 =
        await ScallopLendingIntegration.buildSupplyTransaction(params);
      const result2 =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      expect(typeof result1.txBlockBytes).toBe(typeof result2.txBlockBytes);
      expect(typeof result1.apy).toBe(typeof result2.apy);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work in a typical user flow', async () => {
      // Step 1: User wants to supply 10 SUI
      const supplyAmount = 10 * 1000000000; // 10 SUI

      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: supplyAmount,
      };

      // Step 2: Backend builds transaction
      const result =
        await ScallopLendingIntegration.buildSupplyTransaction(params);

      // Step 3: Verify result can be sent to frontend
      expect(result.txBlockBytes).toBeTruthy();
      expect(result.apy).toBeGreaterThanOrEqual(0);

      // Step 4: Frontend can decode the transaction
      const decoded = Buffer.from(result.txBlockBytes, 'base64');
      expect(decoded).toBeTruthy();
    });

    it('should handle multiple sequential supplies', async () => {
      const supplies = [
        { coinName: 'sui', amount: 1000000000 },
        { coinName: 'usdc', amount: 100000000 },
        { coinName: 'usdt', amount: 50000000 },
      ];

      const results = [];

      for (const supply of supplies) {
        const result =
          await ScallopLendingIntegration.buildSupplyTransaction({
            userAddress: mockUserAddress,
            ...supply,
          });

        results.push(result);
      }

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.txBlockBytes).toBeTruthy();
        expect(result.apy).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Performance', () => {
    it('should complete within reasonable time', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const startTime = Date.now();
      await ScallopLendingIntegration.buildSupplyTransaction(params);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const params = {
        userAddress: mockUserAddress,
        coinName: 'sui',
        amount: 1000000000,
      };

      const promises = Array(5)
        .fill(null)
        .map(() => ScallopLendingIntegration.buildSupplyTransaction(params));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.txBlockBytes).toBeTruthy();
        expect(result.apy).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
