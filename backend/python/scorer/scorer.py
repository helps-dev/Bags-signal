"""
Token Scoring Engine for Bags Signal
Heuristic-based scoring algorithm v1.0
"""

from datetime import datetime
from typing import Dict, Any
import hashlib
import numpy as np
from sklearn.ensemble import RandomForestRegressor

class TokenScorer:
    """AI Token Scoring Engine using heuristics and ML models"""
    
    # Weight configuration (from PRD)
    WEIGHTS = {
        "liquidity_depth": 25,
        "fee_share_config": 20,
        "creator_history": 20,
        "volume_velocity": 15,
        "social_presence": 10,
        "price_stability": 10,
    }
    
    def __init__(self):
        self.model_version = "1.0.0-ml-rf"
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self._train_dummy_model()
        
    def _train_dummy_model(self):
        # Generate some synthetic data to train the model
        # Features: liquidity(0-25), fee_config(0-20), creator(0-20), volume(0-15), social(0-10), stability(0-10)
        X = np.random.rand(1000, 6)
        X[:, 0] *= 25
        X[:, 1] *= 20
        X[:, 2] *= 20
        X[:, 3] *= 15
        X[:, 4] *= 10
        X[:, 5] *= 10
        
        # Target is just sum with some noise
        y = np.sum(X, axis=1) + np.random.normal(0, 2, 1000)
        y = np.clip(y, 0, 100)
        
        self.model.fit(X, y)
    
    def calculate_score(self, token_mint: str) -> Dict[str, Any]:
        """Calculate token score based on mint address (mock data for now)"""
        # Generate deterministic mock data from token_mint
        hash_val = int(hashlib.md5(token_mint.encode()).hexdigest(), 16)
        
        # Calculate individual factor scores
        liquidity_score = self._score_liquidity_depth(
            sol_amount=50 + (hash_val % 200)  # 50-250 SOL
        )
        
        fee_config_score = self._score_fee_share_config(
            is_configured=hash_val % 2 == 0
        )
        
        creator_score = self._score_creator_history(
            lifetime_fees=10 + (hash_val % 1000)  # 10-1010 SOL
        )
        
        volume_score = self._score_volume_velocity(
            volume_24h=1000 + (hash_val % 50000)  # 1K-51K volume
        )
        
        social_score = self._score_social_presence(
            has_website=hash_val % 3 != 0,
            has_twitter=hash_val % 2 != 0
        )
        
        stability_score = self._score_price_stability(
            volatility=(hash_val % 100) / 100  # 0-1 volatility
        )
        
        # Calculate weighted total score
        features = np.array([[
            liquidity_score,
            fee_config_score,
            creator_score,
            volume_score,
            social_score,
            stability_score
        ]])
        
        total_score = self.model.predict(features)[0]
        
        # Calculate confidence based on data availability
        confidence = 0.7 + (hash_val % 30) / 100  # 0.7-1.0
        
        return {
            "score": int(min(100, max(0, total_score))),
            "factors": {
                "liquidity_depth": liquidity_score,
                "fee_share_config": fee_config_score,
                "creator_history": creator_score,
                "volume_velocity": volume_score,
                "social_presence": social_score,
                "price_stability": stability_score,
            },
            "confidence": round(confidence, 2),
            "model_version": self.model_version,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    def calculate_score_with_data(self, token_mint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate score with provided token data"""
        
        liquidity_score = self._score_liquidity_depth(
            sol_amount=data.get("liquidity_sol", 0)
        )
        
        fee_config_score = self._score_fee_share_config(
            is_configured=data.get("fee_configured", False)
        )
        
        creator_score = self._score_creator_history(
            lifetime_fees=data.get("creator_lifetime_fees", 0)
        )
        
        volume_score = self._score_volume_velocity(
            volume_24h=data.get("volume_24h", 0)
        )
        
        social_score = self._score_social_presence(
            has_website=data.get("has_website", False),
            has_twitter=data.get("has_twitter", False)
        )
        
        stability_score = self._score_price_stability(
            volatility=data.get("price_volatility", 0.5)
        )
        
        features = np.array([[
            liquidity_score,
            fee_config_score,
            creator_score,
            volume_score,
            social_score,
            stability_score
        ]])
        
        total_score = self.model.predict(features)[0]
        
        # Higher confidence when we have real data
        data_points = sum(1 for v in data.values() if v is not None and v != 0 and v != False)
        confidence = min(0.95, 0.5 + (data_points * 0.1))
        
        return {
            "score": int(min(100, max(0, total_score))),
            "factors": {
                "liquidity_depth": liquidity_score,
                "fee_share_config": fee_config_score,
                "creator_history": creator_score,
                "volume_velocity": volume_score,
                "social_presence": social_score,
                "price_stability": stability_score,
            },
            "confidence": round(confidence, 2),
            "model_version": self.model_version,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    # Individual scoring methods
    
    def _score_liquidity_depth(self, sol_amount: float) -> int:
        """Score based on liquidity depth (0-25 points)"""
        if sol_amount >= 50:
            return 25
        elif sol_amount >= 30:
            return 20
        elif sol_amount >= 15:
            return 15
        elif sol_amount >= 5:
            return 10
        elif sol_amount > 0:
            return 5
        return 0
    
    def _score_fee_share_config(self, is_configured: bool) -> int:
        """Score based on fee share configuration (0-20 points)"""
        return 20 if is_configured else 5
    
    def _score_creator_history(self, lifetime_fees: float) -> int:
        """Score based on creator track record (0-20 points)"""
        if lifetime_fees >= 500:
            return 20
        elif lifetime_fees >= 200:
            return 15
        elif lifetime_fees >= 50:
            return 10
        elif lifetime_fees > 0:
            return 5
        return 0
    
    def _score_volume_velocity(self, volume_24h: float) -> int:
        """Score based on trading volume (0-15 points)"""
        if volume_24h >= 50000:
            return 15
        elif volume_24h >= 20000:
            return 12
        elif volume_24h >= 5000:
            return 9
        elif volume_24h >= 1000:
            return 6
        elif volume_24h > 0:
            return 3
        return 0
    
    def _score_social_presence(self, has_website: bool, has_twitter: bool) -> int:
        """Score based on social presence (0-10 points)"""
        score = 0
        if has_website:
            score += 5
        if has_twitter:
            score += 5
        return score
    
    def _score_price_stability(self, volatility: float) -> int:
        """Score based on price stability - lower volatility is better (0-10 points)"""
        # Volatility: 0 = stable, 1 = highly volatile
        if volatility <= 0.1:
            return 10
        elif volatility <= 0.3:
            return 8
        elif volatility <= 0.5:
            return 6
        elif volatility <= 0.7:
            return 4
        elif volatility <= 0.9:
            return 2
        return 0
