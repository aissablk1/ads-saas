import React from 'react'
import Link from 'next/link'
import { DocumentTextIcon, ScaleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { ThemeToggle } from '@/lib/theme-toggle'

export default function TermsOfServicePage() {
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-lg text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
              <p className="text-gray-700 mb-4">
                En utilisant la plateforme ADS SaaS ("Service"), vous acceptez d'être lié par ces 
                Conditions Générales d'Utilisation ("CGU"). Si vous n'acceptez pas ces conditions, 
                vous ne devez pas utiliser notre service.
              </p>
              <p className="text-gray-700">
                Ces CGU constituent un contrat légal entre vous et ADS SaaS SARL, société française 
                immatriculée sous le numéro 123 456 789 RCS Paris.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description du service</h2>
              <p className="text-gray-700 mb-4">
                ADS SaaS est une plateforme de gestion de campagnes publicitaires en ligne qui permet aux 
                utilisateurs de :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Créer et gérer des campagnes publicitaires</li>
                <li>Suivre les performances en temps réel</li>
                <li>Optimiser automatiquement les campagnes via l'IA</li>
                <li>Collaborer en équipe</li>
                <li>Générer des rapports détaillés</li>
                <li>Accéder à des outils d'analyse avancés</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Éligibilité et inscription</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Conditions d'éligibilité</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Être âgé de 18 ans minimum ou avoir l'autorisation parentale</li>
                <li>Avoir la capacité légale de contracter</li>
                <li>Fournir des informations exactes et complètes</li>
                <li>Respecter toutes les lois applicables</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Compte utilisateur</h3>
              <p className="text-gray-700 mb-4">
                Vous êtes responsable de :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Toutes les activités effectuées sous votre compte</li>
                <li>Notifier immédiatement toute utilisation non autorisée</li>
                <li>Maintenir vos informations à jour</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Plans et facturation</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Plans d'abonnement</h3>
              <p className="text-gray-700 mb-4">
                Nous proposons plusieurs plans d'abonnement avec des fonctionnalités et limites différentes. 
                Les détails des plans sont disponibles sur notre page de tarification.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Paiement</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Les paiements sont traités mensuellement ou annuellement selon votre choix</li>
                <li>Tous les prix sont en euros, toutes taxes comprises</li>
                <li>Le paiement est prélevé automatiquement sauf indication contraire</li>
                <li>Les frais non payés peuvent entraîner la suspension du service</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Remboursements</h3>
              <p className="text-gray-700">
                Les remboursements sont accordés selon notre politique de remboursement. 
                Généralement, nous offrons un remboursement proportionnel pour les annulations 
                dans les 30 jours suivant le paiement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Utilisation acceptable</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Utilisations interdites</h3>
                    <ul className="list-disc pl-6 text-red-800 text-sm">
                      <li>Contenu illégal, diffamatoire ou frauduleux</li>
                      <li>Spam ou communications non sollicitées</li>
                      <li>Violation des droits de propriété intellectuelle</li>
                      <li>Tentatives de piratage ou d'accès non autorisé</li>
                      <li>Transmission de malware ou virus</li>
                      <li>Utilisation pour concurrencer directement nos services</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Contenu publicitaire</h3>
              <p className="text-gray-700 mb-4">
                Vous vous engagez à ce que vos campagnes publicitaires respectent :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Toutes les lois et réglementations applicables</li>
                <li>Les politiques des plateformes publicitaires</li>
                <li>Les standards éthiques de l'industrie</li>
                <li>Les droits des consommateurs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriété intellectuelle</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Nos droits</h3>
              <p className="text-gray-700 mb-4">
                ADS SaaS détient tous les droits de propriété intellectuelle sur :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>La plateforme et son code source</li>
                <li>Les algorithmes d'optimisation</li>
                <li>Les marques et logos</li>
                <li>La documentation et les guides</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Vos droits</h3>
              <p className="text-gray-700">
                Vous conservez tous les droits sur le contenu que vous créez ou téléchargez. 
                Vous nous accordez une licence limitée pour utiliser ce contenu dans le cadre 
                de la fourniture de nos services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Confidentialité et données</h2>
              <p className="text-gray-700">
                Le traitement de vos données personnelles est régi par notre 
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500"> Politique de Confidentialité</Link>, 
                qui fait partie intégrante de ces CGU.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disponibilité du service</h2>
              <p className="text-gray-700 mb-4">
                Nous nous efforçons de maintenir une disponibilité de service optimale, mais nous ne 
                garantissons pas un accès ininterrompu. Nous pouvons suspendre le service pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Maintenance programmée (avec préavis)</li>
                <li>Mises à jour de sécurité urgentes</li>
                <li>Résolution de problèmes techniques</li>
                <li>Respect des obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation de responsabilité</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Clause importante</h3>
                <p className="text-yellow-800 text-sm">
                  Dans les limites autorisées par la loi, ADS SaaS ne peut être tenu responsable 
                  des dommages indirects, incidents, spéciaux ou consécutifs résultant de 
                  l'utilisation ou de l'impossibilité d'utiliser nos services. Notre responsabilité 
                  totale ne dépassera pas le montant payé par vous au cours des 12 derniers mois.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Résiliation</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Par vous</h3>
              <p className="text-gray-700 mb-4">
                Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre compte 
                ou en nous contactant. La résiliation prend effet à la fin de votre période de facturation en cours.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 Par nous</h3>
              <p className="text-gray-700">
                Nous pouvons suspendre ou résilier votre compte en cas de violation de ces CGU, 
                de non-paiement, ou pour toute autre raison légitime avec un préavis approprié.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications des CGU</h2>
              <p className="text-gray-700">
                Nous pouvons modifier ces CGU à tout moment. Les modifications importantes vous seront 
                notifiées par email ou via notre plateforme au moins 30 jours avant leur entrée en vigueur. 
                Votre utilisation continue du service après notification constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Droit applicable et juridiction</h2>
              <p className="text-gray-700 mb-4">
                Ces CGU sont régies par le droit français. En cas de litige, nous nous efforcerons 
                d'abord de trouver une solution amiable.
              </p>
              <p className="text-gray-700">
                À défaut d'accord amiable, tout litige sera soumis à la juridiction exclusive des 
                tribunaux de Paris, France.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Informations légales</h3>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Raison sociale :</strong> ADS SaaS SARL</p>
                  <p><strong>SIRET :</strong> 123 456 789 00012</p>
                  <p><strong>RCS :</strong> Paris 123 456 789</p>
                  <p><strong>Adresse :</strong> 123 Avenue de la Technologie, 75001 Paris, France</p>
                  <p><strong>Email :</strong> legal@ads-saas.com</p>
                  <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                </div>
              </div>
            </section>
          </div>

          {/* Back to home */}
          <div className="mt-12 text-center">
            <Link href="/" className="btn-primary mr-4">
              Retour à l'accueil
            </Link>
            <Link href="/privacy" className="btn-secondary">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 