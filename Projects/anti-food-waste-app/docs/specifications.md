Aplicație web pentru a preveni risipa de alimente

1. Introducere

   1.1. Prezentare Generală
   
      - Aplicația web este concepută pentru a combate risipa alimentară la nivel de gospodărie. 

      - Aplicația permite utilizatorilor să își gestioneze digital inventarul de alimente, să primească alerte inteligente privind termenele de expirare și să faciliteze partajarea surplusului de alimente într-un cerc social de încredere (prieteni, familie, vecini).

   1.2. Problema Soluționată

      - În gospodăriile moderne, o cantitate semnificativă de mâncare este aruncată din cauza uitării, gestionării defectuoase a stocurilor și depășirii termenului de valabilitate. 

      - Aplicația urmărește să transforme această problemă într-o oportunitate de socializare și economisire.

   1.3. Public Țintă

      - Gospodării: Familii sau persoane singure care doresc să își optimizeze consumul și să reducă risipa.

      - Grupuri sociale: Studenți, colegi de apartament sau de birou care doresc să partajeze eficient resursele alimentare.

      - Utilizatori eco-conștienți: Persoane interesate de un stil de viață sustenabil și de reducerea amprentei de carbon.

   1.4. Roluri Utilizatori

      - Există un singur rol principal de utilizator, care poate acționa atât ca "Donator" (cel care oferă alimente), cât și ca "Primitor" (cel care revendică alimente) în cadrul grupurilor sale.

**Specificații Funcționale Detaliate**
   
**Partea 1: Autentificare și Managementul Contului**

   - Utilizatorul se poate înregistra folosind e-mail și parolă sau prin provideri OAuth (Google).

   - Utilizatorul își poate crea un profil care include: nume de utilizator (unic), număr de telefon, fotografie de profil și o scurtă descriere (bio).

   - *Utilizatorul își poate reseta parola printr-un flux de "parolă uitată" (link trimis pe e-mail).

**Partea 2: Managementul Inventarului**

   - Adăugare Produs: Utilizatorul poate adăuga un produs în inventarul său. Câmpurile necesare la adăugare sunt:

        Nume Produs (Text) - Obligatoriu
        Data Expirării/Preparării (Selector de dată) - Obligatoriu
        Categorie (Dropdown/Selector) - Obligatoriu
        Cantitate (Text, ex: "500g", "1 buc") - Obligatoriu
        Notițe (Text) - Opțional

   - Categorii: Aplicația va avea un set de categorii predefinite (ex: “Lactate”, “Fructe”, “Legume”, “Carne”, “Conserve”, “Mancare gatita”, “Diverse”, etc.). 

   - Afișare Inventar: Inventarul este afișat ca o listă, grupată pe categorii (similar cu un frigider virtual).

   - Sortare/Filtrare: Utilizatorul poate sorta inventarul după:
      
      Data expirării (cea mai apropiată prima - implicit)
      Nume (A-Z)
      *Data adăugării

   - Editare/Ștergere: Utilizatorul poate edita detaliile oricărui produs sau îl poate șterge (prin swipe sau buton). *La ștergere, aplicația poate întreba: "Consumat?" sau "Aruncat?" (pentru statistici viitoare).

   - Vizibilitate inventar: Utilizatorul își crează inventarul, acesta fiind vizibil doar pentru el. Ulterior când vrea să distribuie un produs îl poate face vizibil pentru ceilalți utilizatori ca fiind disponibil pentru preluare.

**Partea 3: Alerte și Statusul Produselor**

   - Alerte de Expirare: Utilizatorul primește o notificare push atunci când un produs se apropie de data expirării (ex: "Iaurtul tău expiră în 2 zile!").

   - Configurare Alerte: Utilizatorul poate seta în ecranul de "Setări" cu câte zile înainte să fie notificat (ex: 1, 3, 7 zile înainte).

   - Marcare ca Disponibil: Din inventar, utilizatorul poate selecta orice produs și îl poate marca cu un status. Statusurile posibile ale unui produs sunt:

      Disponibil pentru Partajare
      Produsele marcate ca Disponibil pentru Partajare devin vizibile pentru grupurile selectate de utilizator.
      Revendicat
 
**Partea 4: Managementul Grupurilor Sociale**

   - Creare Grup: Utilizatorul poate crea grupuri sociale (ex: "Prieteni Bloc A", "Colegi Birou", "Familie").

   - Invitare Membri: Utilizatorul poate invita alți utilizatori ai aplicației în grupurile sale, căutându-i după numele de utilizator sau trimițând un link unic de invitație.

   - Sistem de Etichete: Vor exista etichete predefinite (ex: "Vegetarian", "Vegan", "Fără Gluten", "Carnivor") și etichete personalizate (ex: "Iubitor de zacusca", "Fan brânzeturi").

   - Partajare Selectivă: Când un utilizator marchează un produs ca Disponibil pentru Partajare, aplicația îl va întreba cu ce grup(uri) dorește să partajeze acel produs.

**Partea 5: Revendicarea Produselor**

   - Feed de Disponibilități: Utilizatorul va avea un feed unde poate vedea toate produsele marcate ca Disponibile de către prietenii săi din diverse grupuri.

   - Revendicare (Claim): Utilizatorul (Primitorul) poate apăsa un buton "Revendic" pentru un articol disponibil.

   - Notificare Donator: Utilizatorul care a oferit produsul (Donatorul) primește o notificare push ("Utilizatorul X dorește [Nume Produs]").

   - Confirmare: Donatorul trebuie să confirme revendicarea. Acesta poate vedea o listă a tuturor celor care au revendicat produsul și poate alege cui îl oferă (pentru a gestiona cererile multiple).

   - Status Actualizat: Odată ce Donatorul confirmă revendicarea pentru Utilizatorul X, statusul produsului devine Revendicat, iar acesta dispare din feed-ul public de disponibilități.

   - Cum se face revendicarea: Notificare push, ulterioară confirmării de către donator, în care va apărea mesajul “Pentru detalii despre ridicarea produsului, sunați la ___ (nr telefon donator)”

**Partea 6: Integrare Social Media**

   - Conectare Conturi: În "Setări", utilizatorul își poate conecta conturile de Facebook și Instagram (folosind API-urile oficiale).

   - Opțiune de Postare: Când un utilizator marchează un produs ca Disponibil pentru Partajare, pe lângă selectarea grupurilor, va avea și opțiunea (checkbox) de a posta pe rețelele sociale.

   - Generare Postare: Aplicația va genera automat un format de postare:

   - Pentru Facebook: O postare pe timeline cu o imagine generică (sau poza produsului, dacă e adăugată) și un text (ex: "Donez [Nume Produs] prin aplicația web ____ (link de la aplicatie). Expiră pe [Data]. #AntiFoodWaste").

   - Link Public: Postarea va conține un link general către aplicația web, nu un link direct către produs (pentru a proteja confidențialitatea și a încuraja descărcarea aplicației).

