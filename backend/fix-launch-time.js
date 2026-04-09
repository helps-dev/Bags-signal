const fs = require('fs');

const content = fs.readFileSync('src/services/bags.service.ts', 'utf8');

// Find the getTokenFeed method and replace it
const methodStart = content.indexOf('async getTokenFeed(): Promise<TokenLaunch[]> {');
const methodEnd = content.indexOf('return tokensWithVolume;\n  }', methodStart) + 'return tokensWithVolume;\n  }'.length;

const oldMethod = content.substring(methodStart, methodEnd);

const newMethod = `async getTokenFeed(): Promise<TokenLaunch[]> {
    const items = await this.cachedRequest<BagsFeedItem[]>('/token-launch/feed', 30);
    
    const tokens = await Promise.all((items || []).map(async (item) => {
      // Get real launch time from launchSignature if available
      let launchTime = this.syntheticLaunchIso(item.tokenMint);
      
      if (item.launchSignature) {
        try {
          const heliusUrl = \`\${config.HELIUS_RPC_URL}?api-key=\${config.HELIUS_API_KEY}\`;
          const txResponse = await axios.post(heliusUrl, {
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [item.launchSignature, { encoding: 'json', maxSupportedTransactionVersion: 0 }]
          }, { timeout: 3000 });
          
          const blockTime = txResponse.data?.result?.blockTime;
          if (blockTime) {
            launchTime = new Date(blockTime * 1000).toISOString();
          }
        } catch (err) {
          logger.debug('Failed to get launch time from signature', { tokenMint: item.tokenMint });
        }
      }

      return {
        tokenMint: item.tokenMint,
        name: item.name,
        symbol: item.symbol,
        imageUrl: item.image,
        status: (item.status === 'PRE_LAUNCH' ? 'PRE_LAUNCH' : 'LIVE') as 'PRE_LAUNCH' | 'LIVE',
        bagsStatus: item.status,
        launchTime,
        creatorWallet: \`...\${item.tokenMint.slice(-4)}\`,
        twitter: item.twitter,
        website: item.website,
      };
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
  }`;

const newContent = content.substring(0, methodStart) + newMethod + content.substring(methodEnd);

fs.writeFileSync('src/services/bags.service.ts', newContent, 'utf8');
console.log('Fixed getTokenFeed method');
console.log('File size:', fs.statSync('src/services/bags.service.ts').size, 'bytes');
