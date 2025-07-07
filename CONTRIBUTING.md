# 🤝 Guide de Contribution - ADS SaaS

Merci de votre intérêt pour contribuer au projet ADS SaaS ! Ce document vous guidera à travers le processus de contribution.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Pull Request Process](#pull-request-process)
- [Reporting de Bugs](#reporting-de-bugs)
- [Suggestions de Fonctionnalités](#suggestions-de-fonctionnalités)

## 📜 Code de Conduite

### Notre Engagement

Nous nous engageons à maintenir un environnement ouvert et accueillant pour tous, peu importe l'âge, la taille, le handicap, l'ethnicité, l'identité et l'expression de genre, le niveau d'expérience, la nationalité, l'apparence personnelle, la race, la religion ou l'identité et l'orientation sexuelles.

### Nos Standards

Exemples de comportements qui contribuent à créer un environnement positif :

- Utiliser un langage accueillant et inclusif
- Respecter les différents points de vue et expériences
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres de la communauté

## 🚀 Comment Contribuer

### Types de Contributions

Nous accueillons plusieurs types de contributions :

- **🐛 Bug Reports** - Signaler des problèmes
- **✨ Feature Requests** - Proposer de nouvelles fonctionnalités
- **📝 Documentation** - Améliorer la documentation
- **🧪 Tests** - Ajouter ou améliorer les tests
- **🔧 Code** - Corriger des bugs ou ajouter des fonctionnalités
- **🎨 UI/UX** - Améliorer l'interface utilisateur
- **🔒 Sécurité** - Signaler des vulnérabilités

### Avant de Commencer

1. **Vérifiez les Issues existantes** - Évitez les doublons
2. **Lisez la documentation** - Familiarisez-vous avec le projet
3. **Rejoignez la communauté** - Discord, Discussions GitHub

## ⚙️ Configuration de l'Environnement

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- Git
- Docker (optionnel)

### Installation

```bash
# 1. Fork et clone le repository
git clone https://github.com/votre-username/ads-saas.git
cd ads-saas

# 2. Ajouter le remote upstream
git remote add upstream https://github.com/original-owner/ads-saas.git

# 3. Installer les dépendances
cd client && npm install
cd ../server && npm install

# 4. Configuration de l'environnement
cp .env.example .env
cp client/.env.example client/.env.local
cp server/.env.example server/.env

# 5. Configuration de la base de données
cd server
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Scripts Utiles

```bash
# Démarrage en développement
npm run dev

# Tests
npm run test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Formatage
npm run format
```

## 📏 Standards de Code

### TypeScript

- Utiliser des types stricts
- Éviter `any` - utiliser `unknown` si nécessaire
- Préférer les interfaces pour les objets
- Utiliser des génériques quand approprié

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
  name: string;
}

// ❌ Éviter
const user: any = { id: 1, email: 'test@example.com' };
```

### React/Next.js

- Utiliser les Server Components par défaut
- Client Components seulement si nécessaire
- Implémenter le loading et error boundaries
- Optimiser les images avec `next/image`

```typescript
// ✅ Server Component
export default function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ✅ Client Component (si nécessaire)
'use client';
export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### API Design

- RESTful avec verbes HTTP appropriés
- Codes de statut HTTP corrects
- Réponses JSON cohérentes
- Validation des entrées

```typescript
// ✅ Bon
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Base de Données

- Utiliser Prisma pour toutes les opérations
- Créer des migrations pour les changements de schéma
- Optimiser les requêtes avec des relations
- Utiliser des transactions quand nécessaire

```typescript
// ✅ Bon
const users = await prisma.user.findMany({
  include: {
    profile: true,
    campaigns: {
      where: { status: 'ACTIVE' }
    }
  }
});
```

## 🧪 Tests

### Types de Tests

- **Unit Tests** - Fonctions individuelles
- **Integration Tests** - API endpoints
- **E2E Tests** - Flux utilisateur complets
- **Performance Tests** - Tests de charge

### Écrire des Tests

```typescript
// ✅ Test unitaire
describe('UserService', () => {
  it('should create a new user', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const user = await createUser(userData);
    
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
  });
});

// ✅ Test d'intégration
describe('POST /api/users', () => {
  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' });
    
    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('test@example.com');
  });
});
```

### Couverture de Code

- Maintenir une couverture de 80%+ pour le code critique
- Tester les cas d'erreur et edge cases
- Utiliser des mocks pour les dépendances externes

## 🔄 Pull Request Process

### Workflow

1. **Créer une branche** depuis `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Développer votre fonctionnalité**
   - Suivez les standards de code
   - Ajoutez des tests
   - Mettez à jour la documentation

3. **Commits**
   - Utilisez [Conventional Commits](https://www.conventionalcommits.org/)
   - Messages clairs et descriptifs
   ```bash
   feat: add user authentication system
   fix: resolve database connection issue
   docs: update API documentation
   ```

4. **Tests et Linting**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

5. **Push et Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

### Template de Pull Request

```markdown
## Description
Brève description des changements apportés.

## Type de Changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests E2E ajoutés/mis à jour

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai testé mes changements
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests pour prouver que ma correction fonctionne

## Screenshots (si applicable)
```

### Review Process

1. **Automatic Checks** - CI/CD pipeline
2. **Code Review** - Au moins un reviewer
3. **Testing** - Validation fonctionnelle
4. **Merge** - Après approbation

## 🐛 Reporting de Bugs

### Template de Bug Report

```markdown
## Description du Bug
Description claire et concise du bug.

## Étapes pour Reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

## Comportement Attendu
Description de ce qui devrait se passer.

## Comportement Actuel
Description de ce qui se passe actuellement.

## Screenshots
Si applicable, ajoutez des captures d'écran.

## Environnement
- OS: [ex: macOS, Windows, Linux]
- Navigateur: [ex: Chrome, Safari, Firefox]
- Version: [ex: 22]

## Informations Supplémentaires
Toute autre information pertinente.
```

## 💡 Suggestions de Fonctionnalités

### Template de Feature Request

```markdown
## Problème à Résoudre
Description claire du problème que cette fonctionnalité résoudrait.

## Solution Proposée
Description de la solution souhaitée.

## Alternatives Considérées
Autres solutions que vous avez considérées.

## Informations Supplémentaires
Contexte, captures d'écran, etc.
```

## 🔒 Sécurité

### Reporting de Vulnérabilités

Si vous découvrez une vulnérabilité de sécurité :

1. **NE PAS** créer d'issue publique
2. **Envoyer un email** à security@ads-saas.com
3. **Inclure** les détails de la vulnérabilité
4. **Attendre** une réponse dans les 48h

### Bonnes Pratiques

- Valider toutes les entrées utilisateur
- Utiliser des requêtes préparées
- Implémenter l'authentification appropriée
- Tester les vulnérabilités courantes

## 📚 Ressources

### Documentation
- [Guide d'Installation](docs/INSTALLATION.md)
- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)

### Communauté
- [Discord](https://discord.gg/ads-saas)
- [GitHub Discussions](https://github.com/original-owner/ads-saas/discussions)
- [Wiki](https://github.com/original-owner/ads-saas/wiki)

### Outils
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent ce projet possible ! Votre temps et votre expertise sont grandement appréciés.

---

**Questions ?** N'hésitez pas à ouvrir une discussion ou à nous contacter directement. 