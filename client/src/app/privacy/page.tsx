import React from 'react'
import Link from 'next/link'
import { ShieldCheckIcon, EnvelopeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { ThemeToggle } from '@/lib/theme-toggle'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 gap-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                ADS SaaS
              </Link>
            </div>
            <div className="flex items-center space-x-4 gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Se connecter
              </Link>
              <Link href="/register" className="btn-primary">
                Essai gratuit
              </Link>
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                ADS SaaS ("nous", "notre", "nos") s'engage à protéger et respecter votre vie privée. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, 
                partageons et protégeons vos informations personnelles dans le cadre de l'utilisation 
                de notre plateforme de gestion de campagnes publicitaires.
              </p>
              <p className="text-gray-700">
                Cette politique s'applique à tous les utilisateurs de nos services, qu'ils soient 
                visiteurs de notre site web ou utilisateurs enregistrés de notre plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informations que nous collectons</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Informations que vous nous fournissez</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Informations de compte : nom, prénom, adresse email, mot de passe</li>
                <li>Informations de profil : photo, préférences, paramètres</li>
                <li>Informations de paiement : données de facturation (traitées par nos partenaires sécurisés)</li>
                <li>Communications : messages, support client, feedback</li>
                <li>Données de campagnes : paramètres publicitaires, audiences, créatifs</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Informations collectées automatiquement</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Données d'utilisation : pages visitées, temps passé, actions effectuées</li>
                <li>Informations techniques : adresse IP, navigateur, système d'exploitation</li>
                <li>Cookies et technologies similaires</li>
                <li>Données de performance : métriques des campagnes, analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Comment nous utilisons vos informations</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Fournir et améliorer nos services</li>
                <li>Gérer votre compte et authentification</li>
                <li>Traiter les paiements et facturation</li>
                <li>Optimiser les performances des campagnes</li>
                <li>Communiquer avec vous (support, notifications)</li>
                <li>Analyser l'utilisation pour améliorer la plateforme</li>
                <li>Assurer la sécurité et prévenir la fraude</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Base légale du traitement (RGPD)</h2>
              <p className="text-gray-700 mb-4">
                Nous traitons vos données personnelles sur la base des fondements juridiques suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>Exécution du contrat :</strong> pour fournir nos services</li>
                <li><strong>Intérêt légitime :</strong> pour améliorer nos services et analyser l'utilisation</li>
                <li><strong>Consentement :</strong> pour les communications marketing (révocable)</li>
                <li><strong>Obligation légale :</strong> pour respecter la réglementation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partage des informations</h2>
              <p className="text-gray-700 mb-4">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>Prestataires de services :</strong> partenaires techniques, paiement, hébergement</li>
                <li><strong>Équipe membres :</strong> dans le cadre de la collaboration d'équipe</li>
                <li><strong>Obligations légales :</strong> si requis par la loi ou autorités compétentes</li>
                <li><strong>Protection des droits :</strong> pour protéger nos droits ou ceux de tiers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Sécurité des données</h2>
              <p className="text-gray-700 mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Chiffrement des données en transit et au repos</li>
                <li>Authentification à deux facteurs (2FA)</li>
                <li>Contrôles d'accès stricts</li>
                <li>Surveillance continue de la sécurité</li>
                <li>Formation régulière de notre équipe</li>
                <li>Audits de sécurité périodiques</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Vos droits (RGPD)</h2>
              <p className="text-gray-700 mb-4">
                Vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> supprimer vos données ("droit à l'oubli")</li>
                <li><strong>Droit à la limitation :</strong> restreindre le traitement</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données</li>
                <li><strong>Droit d'opposition :</strong> s'opposer au traitement</li>
                <li><strong>Droit de retrait du consentement :</strong> à tout moment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
              <p className="text-gray-700 mb-4">
                Nous utilisons des cookies et technologies similaires pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Maintenir votre session de connexion</li>
                <li>Mémoriser vos préférences</li>
                <li>Analyser l'utilisation du site</li>
                <li>Améliorer l'expérience utilisateur</li>
              </ul>
              <p className="text-gray-700">
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Conservation des données</h2>
              <p className="text-gray-700">
                Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités 
                pour lesquelles elles ont été collectées, ou selon les exigences légales. 
                Les données des comptes inactifs sont supprimées après 3 ans d'inactivité.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Transferts internationaux</h2>
              <p className="text-gray-700">
                Vos données peuvent être transférées et traitées dans des pays en dehors de l'EEE. 
                Nous nous assurons que ces transferts respectent les exigences du RGPD par le biais 
                de clauses contractuelles types ou d'autres garanties appropriées.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications de cette politique</h2>
              <p className="text-gray-700">
                Nous pouvons modifier cette politique de confidentialité périodiquement. 
                Les modifications importantes vous seront notifiées par email ou via notre plateforme. 
                La date de dernière mise à jour est indiquée en haut de cette page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Délégué à la Protection des Données</h3>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Email :</strong> dpo@ads-saas.com</p>
                  <p><strong>Adresse :</strong> ADS SaaS, 123 Avenue de la Technologie, 75001 Paris, France</p>
                  <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                </div>
                <p className="text-sm text-blue-700 mt-4">
                  Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés).
                </p>
              </div>
            </section>
          </div>

          {/* Back to home */}
          <div className="mt-12 text-center">
            <Link href="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 