#  Aplicatie web pentru prevenirea risipei de alimente

## Obiectiv
Realizarea unei aplicatii web prin care utilizatorii pot sa ofere alimente pe care nu le mai consuma, contribuind la reducerea risipei alimentare si la incurajarea comportamentelor sustenabile intr-un mod bazat pe comunitate.

---

## Descriere generala
Aplicatia are rolul de a-i ajuta pe utilizatori sa constientizeze risipa de alimente si sa colaboreze intre ei pentru a reutiliza alimentele care altfel ar fi aruncate.

Platforma ofera o experienta prietenoasa si interactiva, integrandu-se cu retelele sociale pentru a motiva implicarea comunitatii.

---

## Functionalitati principale

- **Gestionarea alimentelor:** Ca utilizator, pot sa creez o lista de alimente organizata pe categorii (ex: lactate, legume, carne etc.), reprezentand ce am in frigider.

- **Alerte de expirare:** Primesc notificari cand un produs se apropie de termenul de valabilitate. Pot marca acele produse ca "disponibile" pentru alti utilizatori.

- **Grupuri de prieteni si preferinte alimentare:** Pot sa definesc grupuri de prieteni si sa-i etichetez (ex: vegetarieni, carnivori, iubitori de zacusca). Imi invit prietenii sa vada lista mea de alimente disponibile.

- **Distribuire de produse:** Un alt utilizator poate revendica ("claim") un produs marcat ca disponibil.

- **Integrare social media:** Posibilitatea de a posta pe Instagram si Facebook produsele disponibile, pentru a atrage mai multi doritori.

---

## Arhitectura proiectului

### Frontend
- **Framework:** React.js (Single Page Application)
- **Rol:** Interfata cu utilizatorul, gestionarea sesiunilor si integrarea cu API-ul backend.

### Backend
- **Mediu de rulare:** Node.js cu Express
- **Arhitectura:** RESTful API
- **Securitate:** Autentificare bazata pe JWT (JSON Web Tokens).

### Baza de date
- **Tip:** Relationala (PostgreSQL).
- **ORM:** Sequelize.

---

## Instructiuni de Instalare si Rulare (Backend)

Pentru a porni serverul REST API local, urmeaza acesti pasi:

### 1. Configurare initiala
Asigura-te ca ai Node.js si PostgreSQL instalate pe masina ta.

Deschide terminalul in folderul proiectului si instaleaza librariile necesare:
```bash
npm install
```

### 2. Configurare Variabile de Mediu (.env)
Deoarece fisierele cu secrete nu sunt urcate pe GitHub, trebuie sa creezi manual un fisier numit .env in radacina proiectului. Copiaza si completeaza urmatoarele linii in el:

```text
JWT_SECRET=pune_aici_o_cheie_secreta_orice
# Configurare Baza de Date (completeaza doar daca ai parola setata la Postgres)
# DB_USERNAME=postgres
# DB_PASSWORD=parola_ta_de_la_postgres
# DB_DATABASE=antifoodwaste
# DB_HOST=127.0.0.1
# DB_DIALECT=postgres 
```

### 3. Pregatirea Bazei de Date
Inainte de a porni serverul, trebuie sa existe o baza de date goala in PostgreSQL.

Deschide pgAdmin sau terminalul PostgreSQL.

Creeaza o baza de date noua (ex: antifoodwaste).

Daca numele bazei create difera de "antifoodwaste", actualizeaza fisierul .env de la pasul anterior.

Nota: La prima rulare a serverului, Sequelize va crea automat tabelele necesare in baza de date.

### 4. Pornire Server
Ruleaza comanda:

```bash
node server.js
```

Serverul va porni pe http://localhost:5000.

### 5. Testare API (Postman)
In repository este inclus fisierul anti-food-waste-app.postman_collection.json
Deschide aplicatia Postman.

Apasa butonul Import (stanga sus).

Incarca fisierul JSON din acest folder.

Vei avea acces la toate rutele gata configurate (Login, Register, Groups, Inventory, Claims).
