# Telegram RAG Chatbot Backend

A comprehensive backend system for a Telegram chatbot with Retrieval-Augmented Generation (RAG) capabilities.

## Features

- **Telegram Bot Integration**: Handle incoming messages and send responses
- **RAG System**: Retrieve relevant information from knowledge base
- **Vector Database**: Store and search document embeddings using Milvus
- **Conversation Management**: Cache user conversations in Redis
- **Web Scraping**: Automated content extraction from websites
- **LLM Integration**: Connect to self-hosted language models
- **Reranking**: Improve retrieval accuracy with document reranking
- **Admin Dashboard API**: RESTful endpoints for monitoring and management

## Architecture

```
[Telegram] ⇄ [FastAPI] ⇄ [Redis (Conversations)]
                      ⇄ [Milvus (Vector Store)]
                      ⇄ [LLM Service]
                      ⇄ [Reranker API]
                      ⇄ [Web Scraper]
```

## Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Telegram bot token
- LLM API endpoint
- Reranker API key (Jina AI)
- Other service configurations

### 2. Using Docker Compose (Recommended)

Start all services:
```bash
docker-compose up -d
```

This will start:
- Redis (port 6379)
- Milvus with dependencies (port 19530)
- FastAPI backend (port 8000)

### 3. Manual Setup

Install dependencies:
```bash
pip install -r requirements.txt
```

Start Redis and Milvus separately, then run:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Telegram
- `POST /api/telegram/webhook` - Telegram webhook handler
- `GET /api/telegram/stats` - Bot statistics

### Dashboard
- `GET /api/dashboard/metrics` - System metrics
- `GET /api/dashboard/system-status` - Service health status
- `GET /api/dashboard/conversations` - Recent conversations
- `GET /api/dashboard/activity` - Activity data

### Knowledge Base
- `GET /api/knowledge/sources` - List knowledge sources
- `POST /api/knowledge/sources` - Add new source
- `POST /api/knowledge/sources/{id}/sync` - Sync source
- `GET /api/knowledge/stats` - Knowledge base statistics

### Web Scraping
- `POST /api/scraping/start` - Start scraping job
- `GET /api/scraping/jobs` - List scraping jobs
- `GET /api/scraping/jobs/{id}` - Get job status
- `DELETE /api/scraping/jobs/{id}` - Cancel job

## Configuration

### Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Set webhook URL: `https://your-domain.com/api/telegram/webhook`

### LLM Integration

Configure your self-hosted LLM endpoint in `.env`:
```
LLM_API_URL=http://your-llm-service:8080/v1/chat/completions
LLM_API_KEY=your_api_key
```

### Vector Database

Milvus is used for storing document embeddings. The system automatically:
- Creates collections with proper schema
- Generates embeddings using sentence-transformers
- Handles vector similarity search

### Reranking

Uses Jina AI's reranking API to improve retrieval accuracy:
```
RERANKER_API_URL=https://api.jina.ai/v1/rerank
RERANKER_API_KEY=your_jina_api_key
```

## Development

### Project Structure

```
backend/
├── main.py                 # FastAPI application
├── routers/               # API route handlers
│   ├── telegram.py
│   ├── dashboard.py
│   ├── knowledge.py
│   └── scraping.py
├── services/              # Core services
│   ├── redis_client.py
│   ├── milvus_client.py
│   ├── embedding_service.py
│   ├── llm_service.py
│   ├── reranker_service.py
│   └── scraping_service.py
├── tasks/                 # Background tasks
│   └── scraping_scheduler.py
└── utils/                 # Utilities
    └── config.py
```

### Adding New Features

1. **New API Endpoints**: Add to appropriate router in `routers/`
2. **New Services**: Create in `services/` directory
3. **Background Tasks**: Add to `tasks/` directory
4. **Configuration**: Update `utils/config.py`

### Testing

Run the development server:
```bash
uvicorn main:app --reload
```

Access API documentation at: http://localhost:8000/docs

## Deployment

### Kubernetes

The system is designed to run on Kubernetes with:
- Horizontal pod autoscaling
- Service mesh integration (Istio)
- Persistent volumes for data storage

### Monitoring

Integrate with:
- Prometheus for metrics collection
- Grafana for visualization
- ELK stack for logging

## Performance Optimization

- **Async Processing**: All I/O operations are asynchronous
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for conversation and query caching
- **Batch Processing**: Bulk embedding generation
- **Background Tasks**: Non-blocking message processing

## Security

- **API Authentication**: Bearer token authentication
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Pydantic models for request validation
- **Environment Variables**: Secure configuration management

## Troubleshooting

### Common Issues

1. **Milvus Connection Failed**
   - Check if Milvus is running: `docker ps`
   - Verify connection settings in `.env`

2. **Redis Connection Failed**
   - Ensure Redis is accessible
   - Check Redis password configuration

3. **Embedding Model Loading**
   - First run downloads the model (may take time)
   - Ensure sufficient disk space

4. **LLM API Errors**
   - Verify LLM service is running
   - Check API endpoint and authentication

### Logs

View application logs:
```bash
docker-compose logs -f backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.