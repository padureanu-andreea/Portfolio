Plan de Proiect 

În cele ce urmează sunt detaliate aspectele tehnice și planificarea temporală pentru implementarea aplicației.

1. Arhitectura Tehnică Aleasă

Pentru dezvoltarea aplicației vom folosi următoarele tehnologii:

- Frontend: React.js

- Backend: Node.js (Express.js)

- Bază de Date: PostgreSQL

2. Arhitectura Bazei de Date (Schema Relațională Inițială)

Schema bazei de date va conține următoarele tabele și câmpuri principale:

- users (id, username, email, password_hash, phone, bio, create_date)

- products (id, user_id, name, expiry_date, category_id, quantity, notes, status ['in_stock', 'available', 'claimed'], create_date)

- categories (id, name, user_id)

- groups (id, name, owner_id)

- group_members (user_id, group_id, role)

- product_shares (product_id, group_id)

- claims (id, product_id, user_id_claimer, status ['pending', 'approved', 'rejected'], create_date)

- tags (id, name)

- user_tags (user_id_tagged, user_id_tagger, tag_id)

- social_tokens (user_id, service ['facebook', 'instagram'], access_token)

3. Definirea API-ului REST (Endpoints Principale)

Backend-ul va expune o serie de endpoint-uri REST pentru operațiile CRUD. Câteva exemple reprezentative:

- POST - Înregistrare utilizator nou.

- GET - Preluare profil utilizator curent.

- POST - Adăugare produs nou.

etc.

4. Planificare pe Etape (Timeline)

- Etapa 1: Planificare 

  - Finalizare Specificații detaliate și Plan de Proiect.

  - Configurare repository Git.

  - Definire Schema DB.

- Etapa 2: Dezvoltare Backend

  - Implementare module de bază (Autentificare, Profil Utilizator).

  - Implementare API REST pentru Managementul Inventarului (CRUD Products).

  - Implementare API REST pentru Managementul Grupurilor.

  - Configurare Deployment inițial pe Azure.

- Etapa 3: Dezvoltare Frontend și Integrare

  - Dezvoltare componente React (Ecrane: Login, Register, Inventar, Feed).

  - Conectare Frontend la API-ul REST.

  - Implementare flux de Revendicare (Claiming) și Notificări Push.

  - Implementare integrare Social Media.

  - Testare end-to-end.

  - Deployment final Frontend & Backend.
