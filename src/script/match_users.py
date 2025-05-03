import sys
import json
from sentence_transformers import SentenceTransformer, util


model = SentenceTransformer("all-mpnet-base-v2")


def main():
    try:
        # 1. Lire l'entrée depuis stdin (depuis NestJS)
        input_data = json.loads(sys.stdin.read())

        current_user_profile = input_data['user']
        candidates = input_data['candidates']  # chaque candidat : {id, name, tags}

        candidate_texts = [c['tags'] for c in candidates]

        # 2. Encoder le texte en vecteurs
        user_embedding = model.encode(current_user_profile, convert_to_tensor=True)
        candidates_embeddings = model.encode(candidate_texts, convert_to_tensor=True)

        # 3. Calculer la similarité cosine
        similarities = util.cos_sim(user_embedding, candidates_embeddings)[0].cpu().numpy()

        # 4. Retourner les résultats ordonnés
        ranked = sorted([
            {
                "id": c["id"],
                "name": c["name"],
                "tags": c["tags"],
                "score": float(score),
                "matchedOn": [
               tag for tag in current_user_profile.split() 
               if tag in c["tags"].lower()
                   ] 
            }
            for c, score in zip(candidates, similarities)
        ], key=lambda x: x["score"], reverse=True)

        print(json.dumps(ranked))  # réponse envoyée à NestJS via stdout

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
