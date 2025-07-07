# 🚀 Migration vers AdonisJS - Guide Complet

## Vue d'ensemble

Ce guide détaille la migration de votre backend Express.js vers AdonisJS pour bénéficier d'une architecture plus robuste et de fonctionnalités intégrées.

## Prérequis

- Node.js 18+
- npm ou yarn
- Base de données PostgreSQL/MySQL (recommandé pour la production)

## Installation d'AdonisJS

```bash
# Installation globale d'AdonisJS
npm i -g @adonisjs/cli

# Création d'un nouveau projet AdonisJS
adonis new ads-saas-backend --api-only

# Ou avec TypeScript
adonis new ads-saas-backend --api-only --typescript
```

## Structure AdonisJS vs Express.js

### Structure actuelle (Express.js)
```
server/
├── src/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── index.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

### Structure AdonisJS
```
ads-saas-backend/
├── app/
│   ├── Controllers/
│   ├── Models/
│   ├── Middleware/
│   └── Validators/
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
├── start/
└── package.json
```

## Migration étape par étape

### 1. Configuration de base

```bash
cd ads-saas-backend

# Configuration de la base de données
adonis configure @adonisjs/lucid

# Configuration de l'authentification
adonis configure @adonisjs/auth

# Configuration de la validation
adonis configure @adonisjs/validator

# Configuration des tests
adonis configure @adonisjs/test
```

### 2. Migration des modèles Prisma vers Lucid

#### Modèle User (Prisma → Lucid)

**Avant (Prisma) :**
```prisma
model User {
  id                     String                @id @default(cuid())
  email                  String                @unique
  password               String
  firstName              String?
  lastName               String?
  role                   String                @default("USER")
  status                 String                @default("ACTIVE")
  emailVerified          Boolean               @default(false)
  twoFactorEnabled       Boolean               @default(false)
  twoFactorSecret        String?
  createdAt              DateTime              @default(now())
  updatedAt              DateTime              @updatedAt
}
```

**Après (Lucid) :**
```typescript
// app/Models/User.ts
import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Campaign from './Campaign'
import Activity from './Activity'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public firstName?: string

  @column()
  public lastName?: string

  @column()
  public role: string = 'USER'

  @column()
  public status: string = 'ACTIVE'

  @column()
  public emailVerified: boolean = false

  @column()
  public twoFactorEnabled: boolean = false

  @column()
  public twoFactorSecret?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasMany(() => Campaign)
  public campaigns: HasMany<typeof Campaign>

  @hasMany(() => Activity)
  public activities: HasMany<typeof Activity>
}
```

### 3. Migration des contrôleurs

#### Contrôleur d'authentification

**Avant (Express.js) :**
```typescript
// server/src/routes/auth.js
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // ... logique de validation
});
```

**Après (AdonisJS) :**
```typescript
// app/Controllers/AuthController.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  public async login({ request, auth, response }: HttpContextContract) {
    const loginSchema = schema.create({
      email: schema.string({ trim: true }, [rules.email()]),
      password: schema.string({}, [rules.minLength(6)])
    })

    const payload = await request.validate({ schema: loginSchema })

    try {
      const token = await auth.use('api').attempt(payload.email, payload.password)
      return response.json({
        user: auth.user,
        token: token.token
      })
    } catch (error) {
      return response.unauthorized({ error: 'Identifiants invalides' })
    }
  }

  public async register({ request, response }: HttpContextContract) {
    const registerSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email' })
      ]),
      password: schema.string({}, [rules.minLength(6)]),
      firstName: schema.string.optional(),
      lastName: schema.string.optional()
    })

    const payload = await request.validate({ schema: registerSchema })
    const user = await User.create(payload)

    return response.created({ user })
  }
}
```

### 4. Migration des routes

**Avant (Express.js) :**
```typescript
// server/src/index.ts
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
```

**Après (AdonisJS) :**
```typescript
// start/routes.ts
import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'AuthController.login')
  Route.post('/register', 'AuthController.register')
  Route.post('/logout', 'AuthController.logout').middleware('auth:api')
}).prefix('/api/auth')

Route.group(() => {
  Route.get('/me', 'UsersController.me')
  Route.put('/me', 'UsersController.update')
  Route.delete('/me', 'UsersController.destroy')
}).prefix('/api/users').middleware('auth:api')
```

### 5. Migration des middlewares

**Avant (Express.js) :**
```typescript
// server/src/middleware/auth.js
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // ... logique de vérification JWT
};
```

**Après (AdonisJS) :**
```typescript
// app/Middleware/Auth.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Auth {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    try {
      await auth.use('api').authenticate()
      await next()
    } catch (error) {
      return response.unauthorized({ error: 'Token invalide' })
    }
  }
}
```

### 6. Configuration de la base de données

```typescript
// config/database.ts
import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: Env.get('DB_CONNECTION', 'database/database.sqlite3'),
      },
      useNullAsDefault: true,
      debug: false,
    },
    // Pour la production avec PostgreSQL
    pg: {
      client: 'pg',
      connection: {
        host: Env.get('PG_HOST'),
        port: Env.get('PG_PORT'),
        user: Env.get('PG_USER'),
        password: Env.get('PG_PASSWORD'),
        database: Env.get('PG_DB_NAME'),
      },
    },
  },
}

export default databaseConfig
```

### 7. Migration des données

```bash
# Créer les migrations
adonis make:migration users
adonis make:migration campaigns
adonis make:migration activities

# Exécuter les migrations
adonis migration:run

# Créer les seeders
adonis make:seeder UserSeeder
adonis make:seeder CampaignSeeder

# Exécuter les seeders
adonis db:seed
```

### 8. Configuration des validations

```typescript
// app/Validators/CampaignValidator.ts
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export class CreateCampaignValidator {
  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.minLength(3)]),
    description: schema.string.optional(),
    budget: schema.number([rules.unsigned()]),
    startDate: schema.date.optional(),
    endDate: schema.date.optional()
  })

  public messages = {
    'name.required': 'Le nom de la campagne est requis',
    'name.minLength': 'Le nom doit contenir au moins 3 caractères',
    'budget.unsigned': 'Le budget doit être positif'
  }
}
```

## Avantages de la migration vers AdonisJS

### 1. **Productivité améliorée**
- CLI puissant pour générer du code
- Conventions claires et cohérentes
- Moins de code boilerplate

### 2. **Sécurité renforcée**
- Validation automatique des données
- Protection CSRF intégrée
- Gestion sécurisée des sessions

### 3. **Maintenabilité**
- Architecture MVC claire
- Séparation des responsabilités
- Tests intégrés

### 4. **Performance**
- Cache intégré
- Optimisations automatiques
- Support des workers

## Script de migration automatisée

```bash
#!/bin/bash
# scripts/migrate-to-adonisjs.sh

echo "🚀 Migration vers AdonisJS..."

# 1. Sauvegarde de l'ancien backend
echo "📦 Sauvegarde du backend actuel..."
cp -r server server-backup-$(date +%Y%m%d)

# 2. Installation d'AdonisJS
echo "📥 Installation d'AdonisJS..."
npm i -g @adonisjs/cli
adonis new ads-saas-backend --api-only --typescript

# 3. Configuration des packages
cd ads-saas-backend
adonis configure @adonisjs/lucid
adonis configure @adonisjs/auth
adonis configure @adonisjs/validator
adonis configure @adonisjs/test

# 4. Migration des modèles
echo "🔄 Migration des modèles..."
# Scripts de migration automatique...

# 5. Migration des contrôleurs
echo "🔄 Migration des contrôleurs..."
# Scripts de migration automatique...

# 6. Tests de validation
echo "🧪 Tests de validation..."
adonis test

echo "✅ Migration terminée !"
```

## Configuration Docker avec AdonisJS

```dockerfile
# Dockerfile pour AdonisJS
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3333

CMD ["node", "build/server.js"]
```

## Conclusion

La migration vers AdonisJS apporte :
- **Architecture plus robuste** avec MVC
- **Moins de code boilerplate**
- **Sécurité renforcée**
- **Meilleure maintenabilité**
- **Performance optimisée**

Cette migration peut être effectuée progressivement en gardant l'ancien backend en parallèle pendant la transition. 