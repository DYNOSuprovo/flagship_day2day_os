import chromadb
import json
import os

def populate_db():
    try:
        # Load data
        with open("../data/hindu_scriptures.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        scriptures = data.get("scriptures", [])
        print(f"Found {len(scriptures)} scriptures to index.")

        # Initialize ChromaDB
        client = chromadb.PersistentClient(path="./chroma_db")
        # Delete if exists to start fresh
        try:
            client.delete_collection("scripture_knowledge")
        except:
            pass
        
        collection = client.create_collection("scripture_knowledge")

        documents = []
        metadatas = []
        ids = []

        for idx, s in enumerate(scriptures):
            # Create a rich context string for embedding
            doc_text = f"""
            Source: {s['source']} {s['chapter']}.{s['verse']}
            Translation: {s['translation']}
            Teaching: {s['teaching']}
            Context: {', '.join(s['context'])}
            """
            documents.append(doc_text)
            
            # Metadata for retrieval
            metadatas.append({
                "source": s['source'],
                "chapter": str(s['chapter']),
                "verse": str(s['verse']),
                "sanskrit": s['sanskrit']
            })
            
            ids.append(f"scripture_{idx}")

        # Add to collection
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"Successfully added {len(documents)} documents to ChromaDB.")
        
    except Exception as e:
        print(f"Error populating DB: {e}")

if __name__ == "__main__":
    populate_db()
