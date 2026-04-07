const fs = require('fs');

const content = `import axios, { AxiosError, AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { RedisCache } from './redis.service';
import { config } from '../utils/config';

export interface TokenLaunch {
  tokenMint: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  status: 'PRE_LAUNCH' | 'LIVE';
  bagsStatus: 'PRE_LAUNCH' | 'PRE_GRAD' | 'MIGRATING' | 'MIGRATED';
  launchTime: string;
  creatorWallet: string;
  twitter?: string | null;
  website?: string | null;
  volume24h?: number;
}

export interface TokenScore {
  tokenMint: string;
  score: number;
  factors: {
    liquidityDepth: number;
    feeShareConfig: number;
    creatorHistory: number;
    volumeVelocity: number;
    socialPresence: number;
    priceStability: number;
  };
  source: 'ai' | 'heuristic';
}

export interface FeeShareConfig {
  walletAddress: string;
  feePercentage: number;
  recipients: {
    wallet: string;
    percentage: number;
  }[];
}

interface BagsEnvelope<T> {
  success: boolean;
  response?: T;
  error?: string;
}

interface BagsFeedItem {
  name: string;
  symbol: string;
  image: string;
  tokenMint: string;
  status: 'PRE_LAUNCH' | 'PRE_GRAD' | 'MIGRATING' | 'MIGRATED';
  twitter?: string | null;
  website?: string | null;
}

interface BagsPoolInfo {
  tokenMint: string;
  dbcPoolKey: string;
  dbcConfigKey: string;
  dammV2PoolKey?: string | null;
}

class ServiceError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = 'SERVICE_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class BagsService {
  private client: AxiosInstance;
  private aiServiceUrl: string;
  private redis: RedisCache;

  constructor() {
    this.client = axios.create({
      baseURL: config.BAGS_API_BASE_URL,
      timeout: 12000,
    });

    this.aiServiceUrl = config.AI_SERVICE_URL;
    this.redis = new RedisCache();
  }

  private getApiKey(): string {
    const key = config.BAGS_API_KEY;
    if (!key) {
      throw new ServiceError('BAGS_API_KEY is missing on server', 500, 'MISSING_BAGS_API_KEY');
    }
    return key;
  }

  private mapAxiosError(error: unknown, fallbackMessage: string): ServiceError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<BagsEnvelope<unknown>>;
      const status = axiosError.response?.status || 502;
      const bagsMessage = axiosError.response?.data?.error;
      return new ServiceError(bagsMessage || axiosError.message || fallbackMessage, status, 'BAGS_API_ERROR');
    }

    if (error instanceof ServiceError) {
      return error;
    }

    return new ServiceError(fallbackMessage, 500, 'UNKNOWN_ERROR');
  }

  private async request<T>(method: 'GET' | 'POST', path: string, options?: {
    params?: Record<string, string | number | boolean>;
    data?: unknown;
  }): Promise<T> {
    try {
      const apiKey = this.getApiKey();
      const response = await this.client.request<BagsEnvelope<T>>({
        method,
        url: path,
        params: options?.params,
        data: options?.data,
        headers: {
          'x-api-key': apiKey,
          'content-type': 'application/json',
        },
      });

      if (!response.data?.success) {
        throw new ServiceError(response.data?.error || 'Bags API success=false', 502, 'BAGS_API_INVALID_RESPONSE');
      }

      return response.data.response as T;
    } catch (error) {
      throw this.mapAxiosError(error, \`Bags API request failed: \${path}\`);
    }
  }

  private async cachedRequest<T>(path: string, ttl: number, params?: Record<string, string | number | boolean>): Promise<T> {
    const cacheKey = \`bags:\${path}:\${JSON.stringify(params || {})}\`;
    
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      logger.warn('Cache read error', { path, err });
    }

    const data = await this.request<T>('GET', path, { params });

    try {
      await this.redis.set(cacheKey, JSON.stringify(data), ttl);
    } catch (err) {
      logger.warn('Cache write error', { path, err });
    }

    return data;
  }

  private syntheticLaunchIso(tokenMint: string): string {
    const hash = tokenMint.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
    const days = (hash % 14) + 1;
    return new Date(Date.now() - days * 86400000).toISOString();
  }

  async getTokenFeed(): Promise<TokenLaunch[]> {
    const items = await this.cachedRequest<BagsFeedItem[]>('/token-launch/feed', 30);
    
    const tokens = (items || []).map((item) => ({
      tokenMint: item.tokenMint,
      name: item.name,
      symbol: item.symbol,
      imageUrl: item.image,
      status: (item.status === 'PRE_LAUNCH' ? 'PRE_LAUNCH' : 'LIVE') as 'PRE_LAUNCH' | 'LIVE',
      bagsStatus: item.status,
      launchTime: this.syntheticLaunchIso(item.tokenMint),
      creatorWallet: \`...\${item.tokenMint.slice(-4)}\`,
      twitter: item.twitter,
      website: item.website,
    }));

    const tokensWithVolume = await Promise.all(
      tokens.map(async (token) => {
        try {
          const volume = await this.getTokenVolume(token.tokenMint);
          return { ...token, volume24h: volume };
        } catch {
          return token;
        }
      })
    );

    return tokensWithVolume;
  }

  async getTokenLaunchFeed(): Promise<TokenLaunch[]> {
    return this.getTokenFeed();
  }

  async getTokenDetails(tokenMint: string): Promise<any> {
    if (!tokenMint?.trim()) {
      throw new ServiceError('tokenMint is required', 400, 'INVALID_TOKEN_MINT');
    }

    const [lifetimeFees, pool] = await Promise.all([
      this.getLifetimeFees(tokenMint),
      this.cachedRequest<BagsPoolInfo>('/solana/bags/pools/token-mint', 60, { tokenMint }).catch(() => null),
    ]);

    return {
      tokenMint,
      lifetimeFees,
      pool,
    };
  }

  async getTokenScore(tokenMint: string): Promise<TokenScore> {
    if (!tokenMint?.trim()) {
      throw new ServiceError('tokenMint is required', 400, 'INVALID_TOKEN_MINT');
    }

    const cacheKey = \`score:\${tokenMint}\`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    try {
      const response = await axios.get<TokenScore>(\`\${this.aiServiceUrl}/score/\${tokenMint}\`, {
        timeout: 4000,
      });
      const scoreData = { ...response.data, source: 'ai' as const };
      await this.redis.set(cacheKey, JSON.stringify(scoreData), 300);
      return scoreData;
    } catch {
      const heuristic = await this.calculateHeuristicScore(tokenMint);
      await this.redis.set(cacheKey, JSON.stringify(heuristic), 60);
      return heuristic;
    }
  }

  async getFeeShareConfig(walletAddress: string): Promise<any | null> {
    if (!walletAddress?.trim()) {
      throw new ServiceError('walletAddress is required', 400, 'INVALID_WALLET');
    }

    try {
      return await this.cachedRequest<any>('/fee-share/wallet', 300, { walletAddress });
    } catch (error) {
      logger.warn('getFeeShareConfig fallback', { walletAddress, error: (error as Error).message });
      return null;
    }
  }

  async configureFeeShare(config: FeeShareConfig): Promise<any> {
    const res = await this.request<any>('POST', '/fee-share/config', { data: config });
    await this.redis.del(\`bags:/fee-share/wallet:{"walletAddress":"\${config.walletAddress}"}\`);
    return res;
  }

  async getLifetimeFees(tokenMint: string): Promise<{ tokenMint: string; totalLamports: string; totalSol: number }> {
    try {
      const raw = await this.cachedRequest<string | number>('/token-launch/lifetime-fees', 60, { tokenMint });
      const totalLamports = String(raw || '0');
      return {
        tokenMint,
        totalLamports,
        totalSol: Number(totalLamports) / 1e9,
      };
    } catch (error) {
      logger.warn('getLifetimeFees fallback', { tokenMint, error: (error as Error).message });
      return { tokenMint, totalLamports: '0', totalSol: 0 };
    }
  }

  async getClaimStats(tokenMint: string): Promise<any> {
    try {
      return await this.cachedRequest<any>('/token-launch/claim-stats', 60, { tokenMint });
    } catch (error) {
      logger.warn('getClaimStats fallback', { tokenMint, error: (error as Error).message });
      return { tokenMint, totalClaimed: '0', claimCount: 0 };
    }
  }

  async getClaimablePositions(walletAddress: string): Promise<any[]> {
    try {
      const positions = await this.cachedRequest<any[]>('/fee-claiming/positions', 30, { walletAddress });
      return positions || [];
    } catch (error) {
      logger.warn('getClaimablePositions fallback', { walletAddress, error: (error as Error).message });
      return [];
    }
  }

  async claimFees(tokenMint: string, walletAddress: string): Promise<any> {
    return this.request<any>('POST', '/fee-claiming/claim-v3', {
      data: { tokenMint, walletAddress },
    });
  }

  async launchToken(launchData: any): Promise<any> {
    const metadata = await this.request<any>('POST', '/token-launch/info', {
      data: {
        name: launchData.name,
        symbol: launchData.symbol,
        description: launchData.description,
        image: launchData.image,
        twitter: launchData.twitter,
        website: launchData.website,
      },
    });

    return this.request<any>('POST', '/token-launch/transaction', {
      data: {
        ...launchData,
        metadataUri: metadata?.uri,
      },
    });
  }

  async getPartnerStats(partnerWallet: string): Promise<any> {
    try {
      return await this.request<any>('GET', '/partner/stats', {
        params: { partnerWallet },
      });
    } catch (error) {
      logger.warn('getPartnerStats fallback', { partnerWallet, error: (error as Error).message });
      return { partnerWallet, referredTokens: [], totalRevenue: 0 };
    }
  }

  async registerPartner(partnerData: any): Promise<any> {
    return this.request<any>('POST', '/partner/config', { data: partnerData });
  }

  async getUserAlerts(walletAddress: string, threshold: number): Promise<any> {
    return {
      walletAddress,
      threshold,
      enabled: true,
      channels: ['websocket'],
    };
  }

  private async getTokenVolume(tokenMint: string): Promise<number | undefined> {
    const cacheKey = \`volume:\${tokenMint}\`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    try {
      // Strategy 1: Try Birdeye API for accurate 24h volume
      try {
        const birdeyeResponse = await axios.get(
          \`https://public-api.birdeye.so/defi/v3/token/trade-data/single\`,
          {
            params: { address: tokenMint },
            headers: { 'X-API-KEY': config.BIRDEYE_API_KEY || '' },
            timeout: 3000,
          }
        );
        if (birdeyeResponse.data?.data?.volume_24h_usd) {
          const volume = Math.round(birdeyeResponse.data.data.volume_24h_usd);
          await this.redis.set(cacheKey, JSON.stringify(volume), 300);
          logger.debug('Volume fetched from Birdeye', { tokenMint, volume });
          return volume;
        }
      } catch (err) {
        logger.debug('Birdeye volume fetch failed', { tokenMint, error: (err as Error).message });
      }

      // Strategy 2: Try DexScreener for tokens that have graduated to DEX
      try {
        const dexResponse = await axios.get(
          \`https://api.dexscreener.com/latest/dex/tokens/\${tokenMint}\`,
          { timeout: 3000 }
        );
        if (dexResponse.data?.pairs?.[0]?.volume?.h24) {
          const volume = Math.round(dexResponse.data.pairs[0].volume.h24);
          await this.redis.set(cacheKey, JSON.stringify(volume), 300);
          logger.debug('Volume fetched from DexScreener', { tokenMint, volume });
          return volume;
        }
      } catch (err) {
        logger.debug('DexScreener volume fetch failed', { tokenMint, error: (err as Error).message });
      }

      return undefined;
    } catch (error) {
      logger.debug('Volume fetch failed', { tokenMint, error: (error as Error).message });
      return undefined;
    }
  }

  private async calculateHeuristicScore(tokenMint: string): Promise<TokenScore> {
    const [fees, pool] = await Promise.all([
      this.getLifetimeFees(tokenMint),
      this.request<BagsPoolInfo>('GET', '/solana/bags/pools/token-mint', {
        params: { tokenMint },
      }).catch(() => null),
    ]);

    const feeScore = Math.min(22, Math.log10(1 + fees.totalSol) * 12);
    const liquidity = pool?.dammV2PoolKey ? 25 : pool?.dbcPoolKey ? 18 : 6;
    const score = Math.max(15, Math.min(98, Math.round(40 + feeScore + liquidity)));

    return {
      tokenMint,
      score,
      factors: {
        liquidityDepth: Math.round(liquidity),
        feeShareConfig: Math.round(Math.min(20, feeScore * 0.9)),
        creatorHistory: Math.round(Math.min(20, feeScore * 0.6)),
        volumeVelocity: Math.round(Math.min(15, feeScore * 0.4)),
        socialPresence: 5,
        priceStability: 6,
      },
      source: 'heuristic',
    };
  }
}
`;

fs.writeFileSync('src/services/bags.service.ts', content, 'utf8');
console.log('File written successfully!');
console.log('File size:', fs.statSync('src/services/bags.service.ts').size, 'bytes');
