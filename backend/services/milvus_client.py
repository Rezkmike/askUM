from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility
from typing import List, Dict, Any
from loguru import logger
from utils.config import settings

milvus_client = None
COLLECTION_NAME = "knowledge_base"

async def init_milvus():
    """Initialize Milvus connection and create collection if needed"""
    global milvus_client
    try:
        # Connect to Milvus
        connections.connect(
            alias="default",
            host=settings.MILVUS_HOST,
            port=settings.MILVUS_PORT,
            user=settings.MILVUS_USER,
            password=settings.MILVUS_PASSWORD
        )
        
        # Create collection if it doesn't exist
        if not utility.has_collection(COLLECTION_NAME):
            await create_collection()
        
        milvus_client = Collection(COLLECTION_NAME)
        milvus_client.load()
        
        logger.info("Milvus connection established and collection loaded")
        
    except Exception as e:
        logger.error(f"Milvus initialization failed: {e}")
        raise

async def create_collection():
    """Create the knowledge base collection"""
    try:
        # Define schema
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768),  # nomic-embed dimension
            FieldSchema(name="source_url", dtype=DataType.VARCHAR, max_length=1000),
            FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=500),
            FieldSchema(name="chunk_index", dtype=DataType.INT64),
            FieldSchema(name="timestamp", dtype=DataType.INT64)
        ]
        
        schema = CollectionSchema(fields, "Knowledge base for RAG system")
        collection = Collection(COLLECTION_NAME, schema)
        
        # Create index for vector field
        index_params = {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 1024}
        }
        collection.create_index("embedding", index_params)
        
        logger.info(f"Collection {COLLECTION_NAME} created successfully")
        
    except Exception as e:
        logger.error(f"Error creating collection: {e}")
        raise

def get_milvus_client():
    """Get Milvus client instance"""
    global milvus_client
    if milvus_client is None:
        raise Exception("Milvus client not initialized")
    return milvus_client

class VectorStore:
    """Vector store operations for Milvus"""
    
    def __init__(self):
        self.collection_name = COLLECTION_NAME
    
    async def insert_documents(self, documents: List[Dict[str, Any]]):
        """Insert documents into vector store"""
        try:
            collection = get_milvus_client()
            
            # Prepare data for insertion
            data = [
                documents,  # This should be properly formatted for Milvus
            ]
            
            collection.insert(data)
            collection.flush()
            
            logger.info(f"Inserted {len(documents)} documents into vector store")
            
        except Exception as e:
            logger.error(f"Error inserting documents: {e}")
            raise
    
    async def search_similar(self, query_embedding: List[float], top_k: int = 10) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        try:
            collection = get_milvus_client()
            
            search_params = {
                "metric_type": "COSINE",
                "params": {"nprobe": 10}
            }
            
            results = collection.search(
                data=[query_embedding],
                anns_field="embedding",
                param=search_params,
                limit=top_k,
                output_fields=["text", "source_url", "title", "chunk_index"]
            )
            
            # Format results
            formatted_results = []
            for hits in results:
                for hit in hits:
                    formatted_results.append({
                        "id": hit.id,
                        "score": hit.score,
                        "text": hit.entity.get("text"),
                        "source_url": hit.entity.get("source_url"),
                        "title": hit.entity.get("title"),
                        "chunk_index": hit.entity.get("chunk_index")
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching similar documents: {e}")
            return []
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        try:
            collection = get_milvus_client()
            stats = collection.num_entities
            
            return {
                "total_documents": stats,
                "collection_name": self.collection_name
            }
            
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {"total_documents": 0, "collection_name": self.collection_name}

# Global instance
vector_store = VectorStore()