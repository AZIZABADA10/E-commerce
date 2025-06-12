```markdown
# E-commerce Microservices Application

Une application e-commerce moderne développée avec une architecture **microservices**. Elle permet la gestion complète d'un catalogue de produits, des commandes, des utilisateurs et de l'authentification via JWT, tout en utilisant **RabbitMQ** pour la communication inter-services.

---


##  Technologies utilisées

- **Frontend** : React.js (client SPA)
- **Backend** :
  - Node.js + Express.js (API REST)
  - JWT (authentification sécurisée)
  - MongoDB (base de données NoSQL)
  - RabbitMQ (communication entre microservices)
- **Services** :
  - Auth Service
  - Product Service
  - Order Service

---

### Structure du projet

```

E-commerce/
├── auth-service/        # Inscription, login, JWT
├── product-service/     # CRUD des produits
├── order-service/       # Gestion des commandes
├── frontend/            # Interface utilisateur React
├── docker-compose.yml   # Orchestration des services
└── README.md            # Documentation du projet

````

---

##  Fonctionnalités principales

-  Authentification avec JWT
-  Gestion des utilisateurs
-  CRUD des produits
-  Création et gestion des commandes
-  Communication asynchrone via RabbitMQ
-  Architecture scalable basée sur microservices

---

##  Lancer le projet avec Docker

1. **Cloner le dépôt**

```bash
git clone https://github.com/AZIZABADA10/E-commerce.git
cd E-commerce
````

2. **Démarrer tous les services**

```bash
docker-compose up --build
```

3. **Accéder à l'application**

* Frontend : [http://localhost:3000](http://localhost:3000)
* RabbitMQ Management : [http://localhost:15672](http://localhost:15672) 

---



## Sécurité

* Authentification via JWT
* Middleware de protection des routes
* Vérification des rôles pour les actions sensibles

---

##  Communication entre services

* Utilisation de **RabbitMQ** pour publier/consommer des événements
* Exemple :

  * `product-service` publie un événement `PRODUCT_UPDATED`
  * `order-service` écoute et réagit à cet événement pour mettre à jour ses données

---

---

##  À venir

* Paiement en ligne (Stripe, PayPal)
* Notification par email ou SMS
* Gestion des stocks avancée
* CI/CD avec GitHub Actions
* Monitoring (Prometheus, Grafana)

---

---

## Auteur

**AZIZ ABADA**
Étudiant Web-Full‑Stack
