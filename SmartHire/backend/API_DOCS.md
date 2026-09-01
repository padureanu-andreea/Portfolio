# AUTH

## POST /api/auth/register
Body:
{
  "nume": "",
  "prenume": "",
  "email": "",
  "parola": "",
  "rol": "candidat | recruiter | manager"
}

## POST /api/auth/login
Body:
{
  "email": "",
  "parola": ""
}
Response:
{
  "token": ""
}


# JOBURI

## GET /api/jobs

## GET /api/jobs/:id

## POST /api/jobs
Headers:
Authorization: Bearer TOKEN

Body:
{
  "id_departament": 1,
  "titlu_job": "",
  "descriere_job": "",
  "salariu_minim": 0,
  "salariu_maxim": 0,
  "status": "activ"
}

## PUT /api/jobs/:id

## DELETE /api/jobs/:id


# APLICATII

## POST /api/applications

Descriere:
Candidatul aplica la un job.

Autentificare:
Bearer Token candidat.

Body:
{
  "id_job": 1,
  "id_cv": 1
}

## GET /api/applications/my

Descriere:
Returneaza aplicatiile candidatului autentificat.

Autentificare:
Bearer Token candidat.

## GET /api/jobs/:id/applications

Descriere:
Returneaza toate aplicatiile unui job.

Autentificare:
Bearer Token recruiter.

## PUT /api/applications/:id/status

Descriere:
Recruiterul modifica statusul unei aplicatii.

Autentificare:
Bearer Token recruiter.

Body:
{
  "status": "in_review | interviu | acceptat | respins"
}

## PUT /api/applications/:id/withdraw

Descriere:
Candidatul isi retrage candidatura.

Autentificare:
Bearer Token candidat.


# CV-URI

## POST /api/cvs

Descriere:
Incarcare CV nou.

Autentificare:
Bearer Token candidat.

Content-Type:
multipart/form-data

Body:
Key: cv
Type: File (PDF)

Response:
201 Created

## GET /api/cvs/my

Descriere:
Returneaza toate CV-urile candidatului autentificat.

Autentificare:
Bearer Token candidat.

## GET /api/cvs/:id/download

Descriere:
Descarcare CV dupa ID.

Autentificare:
Bearer Token necesar.

## DELETE /api/cvs/:id

Descriere:
Stergere CV.

Autentificare:
Bearer Token candidat.

# REGULI CV-URI

- Sunt acceptate doar fisiere PDF.
- CV-urile sunt salvate pe server in folderul uploads/cvs.
- Un candidat poate avea mai multe CV-uri.
- Un candidat poate sterge doar propriile CV-uri.


# PROFILE CANDIDAT

## POST /api/profile

Descriere:
Creare profil candidat.

Autentificare:
Bearer Token candidat.

Body:
{
  "rezumat_profesional": "",
  "experienta_text": "",
  "proiecte_text": "",
  "certificari_text": "",
  "voluntariat_text": "",
  "soft_skills_detectate": ""
}

## GET /api/profile/me

Descriere:
Returneaza profilul candidatului autentificat.

Autentificare:
Bearer Token candidat.


## PUT /api/profile

Descriere:
Actualizare profil candidat.

Autentificare:
Bearer Token candidat.

Body:
{
  "rezumat_profesional": "",
  "experienta_text": "",
  "proiecte_text": "",
  "certificari_text": "",
  "voluntariat_text": "",
  "soft_skills_detectate": ""
}


## DELETE /api/profile

Descriere:
Stergere profil candidat.

Autentificare:
Bearer Token candidat.



# CV SKILLS

## POST /api/cvs/:id/skills

Descriere:
Adauga competenta la CV.

Autentificare:
Bearer Token candidat.

Body:
{
  "id_competenta": 1,
  "ani_experienta": 3,
  "nivel_competenta": 4,
  "confidence_score": 0.95
}


## GET /api/cvs/:id/skills

Descriere:
Returneaza competentele asociate unui CV.

Autentificare:
Bearer Token candidat.


## DELETE /api/cvs/:id/skills/:skillId

Descriere:
Stergere competenta din CV.

Autentificare:
Bearer Token candidat.



# JOB SKILLS

## POST /api/jobs/:id/skills

Descriere:
Adauga competenta necesara pentru job.

Autentificare:
Bearer Token recruiter.

Body:
{
  "id_competenta": 1,
  "este_obligatoriu": true,
  "prioritate": 5
}


## GET /api/jobs/:id/skills

Descriere:
Returneaza competentele asociate unui job.

Autentificare:
Bearer Token recruiter.


## DELETE /api/jobs/:id/skills/:skillId

Descriere:
Stergere competenta asociata jobului.

Autentificare:
Bearer Token recruiter.



# REGULI PROFILE

- Un candidat poate avea un singur profil.
- Profilul poate fi actualizat oricand de candidat.
- Profilul contine informatii relevante pentru scoring si NLP.
- soft_skills_detectate va fi utilizat ulterior pentru semantic analysis si AI scoring.



# REGULI CV SKILLS

- Un CV poate avea mai multe competente asociate.
- O competenta nu poate fi asociata de doua ori aceluiasi CV.
- nivel_competenta trebuie sa fie intre 1 si 5.
- confidence_score va fi utilizat ulterior de modulul NLP.



# REGULI JOB SKILLS

- Un job poate avea mai multe competente asociate.
- O competenta nu poate fi asociata de doua ori aceluiasi job.
- prioritate trebuie sa fie intre 1 si 5.
- este_obligatoriu determina daca skill-ul este mandatory pentru matching.



# STATUSURI

## application_status

- DEPUSA
- IN_ANALIZA
- ACCEPTATA
- RESPINSA
- RETRASA


## job_status

- DRAFT
- ACTIV
- INCHIS


## interview_status

- PROGRAMAT
- FINALIZAT
- ANULAT


## user_role

- CANDIDAT
- RECRUTOR
- MANAGER
- ADMIN