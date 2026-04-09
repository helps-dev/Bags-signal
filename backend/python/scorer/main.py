from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
import hashlib

from scorer import TokenScorer

app = FastAPI(
    title="Bags Signal AI Scorer",
    description="AI-powered token scoring microservice for Bags.fm",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scorer
scorer = TokenScorer()

class TokenScoreRequest(BaseModel):
    token_mint: str
    name: Optional[str] = None
    symbol: Optional[str] = None
    liquidity_sol: Optional[float] = 0
    volume_24h: Optional[float] = 0
    creator_wallet: Optional[str] = None
    has_website: Optional[bool] = False
    has_twitter: Optional[bool] = False

class ScoreFactors(BaseModel):
    liquidity_depth: int
    fee_share_config: int
    creator_history: int
    volume_velocity: int
    social_presence: int
    price_stability: int

class TokenScoreResponse(BaseModel):
    token_mint: str
    score: int
    factors: ScoreFactors
    confidence: float
    timestamp: str

@app.get("/")
async def root():
    return {"status": "ok", "service": "bags-signal-ai-scorer"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/score/{token_mint}", response_model=TokenScoreResponse)
async def get_token_score(token_mint: str):
    """Get AI score for a specific token"""
    try:
        score_data = scorer.calculate_score(token_mint)
        return TokenScoreResponse(
            token_mint=token_mint,
            score=score_data["score"],
            factors=ScoreFactors(**score_data["factors"]),
            confidence=score_data["confidence"],
            timestamp=score_data["timestamp"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/score", response_model=TokenScoreResponse)
async def score_token(request: TokenScoreRequest):
    """Calculate score with provided token data"""
    try:
        score_data = scorer.calculate_score_with_data(
            token_mint=request.token_mint,
            data={
                "name": request.name,
                "symbol": request.symbol,
                "liquidity_sol": request.liquidity_sol,
                "volume_24h": request.volume_24h,
                "creator_wallet": request.creator_wallet,
                "has_website": request.has_website,
                "has_twitter": request.has_twitter,
            }
        )
        return TokenScoreResponse(
            token_mint=request.token_mint,
            score=score_data["score"],
            factors=ScoreFactors(**score_data["factors"]),
            confidence=score_data["confidence"],
            timestamp=score_data["timestamp"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/score/batch")
async def score_batch(tokens: List[TokenScoreRequest]):
    """Score multiple tokens at once"""
    results = []
    for token in tokens:
        try:
            score_data = scorer.calculate_score_with_data(
                token_mint=token.token_mint,
                data={
                    "name": token.name,
                    "symbol": token.symbol,
                    "liquidity_sol": token.liquidity_sol,
                    "volume_24h": token.volume_24h,
                    "creator_wallet": token.creator_wallet,
                    "has_website": token.has_website,
                    "has_twitter": token.has_twitter,
                }
            )
            results.append({
                "token_mint": token.token_mint,
                "score": score_data["score"],
                "factors": score_data["factors"],
                "confidence": score_data["confidence"],
            })
        except Exception as e:
            results.append({
                "token_mint": token.token_mint,
                "error": str(e)
            })
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
