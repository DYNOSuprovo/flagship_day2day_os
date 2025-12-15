import chromadb
import os

try:
    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection("scripture_knowledge")
    count = collection.count()
    print(f"Collection 'scripture_knowledge' has {count} documents.")
    if count > 0:
        print("Sample document:", collection.peek(limit=1))
except Exception as e:
    print(f"Error checking ChromaDB: {e}")
