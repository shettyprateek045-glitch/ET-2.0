import os

class Settings:
    PROJECT_NAME: str = "DataCentre AI EPC Intelligence Platform API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./datacentre_epc.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-epc-platform-hackathon-2026")
    API_V1_STR: str = "/api/v1"
    
    # Mock settings
    MOCK_AI_RESPONSE: bool = True
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
