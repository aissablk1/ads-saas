'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  ChevronDownIcon,
  HeartIcon,
  SparklesIcon,
  GlobeAltIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { ThemeToggle } from '@/lib/theme-toggle'
import { LanguageToggle } from '@/lib/language-toggle'
import CinematicHero from '@/lib/cinematic-hero'
import ROICalculator from '@/lib/roi-calculator'
import SocialProof from '@/lib/social-proof'
import { TrustBadges, ReassuranceBanner } from '@/lib/trust-badges'
import { SatisfactionWidget } from '@/lib/user-feedback'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  // Gestion du montage côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Ne pas rendre côté serveur pour éviter les erreurs
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background theme-transition flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-foreground-muted">Chargement...</p>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: ChartBarIcon,
      title: "Analytics Avancés",
      description: "Suivez vos performances en temps réel avec des graphiques interactifs et des insights actionables."
    },
    {
      icon: RocketLaunchIcon,
      title: "Optimisation IA",
      description: "Notre IA optimise automatiquement vos campagnes pour maximiser votre ROI."
    },
    {
      icon: ShieldCheckIcon,
      title: "Sécurité Entreprise",
      description: "Authentification 2FA, chiffrement des données et conformité RGPD inclus."
    },
    {
      icon: CursorArrowRaysIcon,
      title: "Interface Intuitive",
      description: "Créez et gérez vos campagnes en quelques clics avec notre interface moderne."
    },
    {
      icon: UsersIcon,
      title: "Collaboration Équipe",
      description: "Travaillez en équipe avec des rôles définis et un système de permissions granulaire."
    },
    {
      icon: CurrencyDollarIcon,
      title: "ROI Maximisé",
      description: "Augmentez vos conversions jusqu'à 40% grâce à nos algorithmes d'optimisation."
    }
  ]

  const plans = [
    {
      name: "Starter",
      price: "29",
      description: "Parfait pour débuter",
      features: [
        "5 campagnes actives",
        "Analytics de base",
        "Support email",
        "Jusqu'à 10,000 impressions/mois"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "79",
      description: "Pour les entreprises en croissance",
      features: [
        "25 campagnes actives",
        "Analytics avancés",
        "Support prioritaire",
        "Jusqu'à 100,000 impressions/mois",
        "A/B Testing",
        "Intégrations tierces"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "199",
      description: "Solution complète",
      features: [
        "Campagnes illimitées",
        "Analytics personnalisés",
        "Support dédié",
        "Impressions illimitées",
        "IA avancée",
        "API complète",
        "Formation incluse"
      ],
      popular: false
    }
  ]

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Directrice Marketing",
      company: "TechCorp",
      content: "ADS SaaS a révolutionné notre approche publicitaire. +150% de ROI en 3 mois !",
      rating: 5
    },
    {
      name: "Pierre Martin",
      role: "CEO",
      company: "StartupInc",
      content: "Interface intuitive et résultats exceptionnels. Je recommande vivement.",
      rating: 5
    },
    {
      name: "Sophie Chen",
      role: "Growth Manager",
      company: "E-commerce Pro",
      content: "Les analytics sont incroyables. On voit enfin clairement ce qui fonctionne.",
      rating: 5
    }
  ]

  const trustBadges = [
    { icon: ShieldExclamationIcon, text: "Sécurité RGPD", color: "text-green-500" },
    { icon: UserGroupIcon, text: "10,000+ Clients", color: "text-blue-500" },
    { icon: CogIcon, text: "99.9% Uptime", color: "text-purple-500" },
    { icon: DocumentTextIcon, text: "Certifié ISO", color: "text-orange-500" }
  ]

  return (
    <div className="min-h-screen bg-background theme-transition">
      {/* Header sticky modernisé */}
      <header className="sticky top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center border-b border-border/50 bg-card/80 backdrop-blur-xl theme-transition shadow-md">
        <Link className="flex items-center justify-center" href="#">
          <RocketLaunchIcon className="h-8 w-8 text-primary-600 animate-bounce" />
          <span className="ml-2 text-2xl font-bold text-foreground">ADS SaaS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium text-foreground-secondary hover:text-primary-600 transition-colors" href="#features">
            Fonctionnalités
          </Link>
          <Link className="text-sm font-medium text-foreground-secondary hover:text-primary-600 transition-colors" href="#pricing">
            Tarifs
          </Link>
          <Link className="text-sm font-medium text-foreground-secondary hover:text-primary-600 transition-colors" href="#testimonials">
            Témoignages
          </Link>
          <Link className="text-sm font-medium text-foreground-secondary hover:text-primary-600 transition-colors" href="/demo">
            Démo
          </Link>
          <Link className="text-sm font-medium text-foreground-secondary hover:text-primary-600 transition-colors" href="/login">
            Connexion
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle variant="menu" showFlag={true} showName={false} size="sm" />
            <ThemeToggle size="sm" />
          </div>
        </nav>
      </header>
      {/* Bandeau de réassurance */}
      <ReassuranceBanner />
      {/* Bouton retour en haut */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all animate-bounce-slow focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Retour en haut"
      >
        <ChevronDownIcon className="h-6 w-6 rotate-180" />
      </button>

      {/* Hero Section Cinématique */}
      <CinematicHero 
        onGetStarted={() => window.location.href = '/register'}
        onWatchDemo={() => window.location.href = '/demo'}
      />

      {/* Section Fonctionnalités */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Fonctionnalités puissantes
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour réussir vos campagnes publicitaires
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 card-glow rounded-lg group">
                <div className="p-3 bg-primary-600/10 rounded-lg w-fit mb-4 group-hover:bg-primary-600/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Calculateur de ROI */}
      <section className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Calculez votre ROI potentiel
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
              Découvrez combien ADS SaaS peut améliorer vos performances publicitaires
            </p>
          </div>
          
          <div className="flex justify-center">
            <ROICalculator />
          </div>
        </div>
      </section>

      {/* Section Preuve Sociale */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <SocialProof />
        </div>
      </section>

      {/* Section Tarifs */}
      <section id="pricing" className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Tarifs transparents
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 card-glow rounded-lg relative transition-all duration-300 transform hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-primary-500 shadow-xl' : 'hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Populaire
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-foreground-secondary mb-4">
                    {plan.description}
                  </p>
                  <div className="text-4xl font-bold text-foreground">
                    €{plan.price}
                    <span className="text-lg font-normal text-foreground-secondary">/mois</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                      <span className="text-foreground-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 transform hover:scale-105'
                      : 'bg-background-secondary text-foreground hover:bg-background border border-border'
                  }`}
                >
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Témoignages - Remplacée par SocialProof */}

      {/* Section Confiance */}
      <section id="trust" className="py-20 bg-background-secondary">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Prêt à optimiser vos campagnes ?
          </h2>
          <p className="text-xl text-foreground-secondary mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'entreprises qui font confiance à ADS SaaS
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Commencer gratuitement
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Section Contact/Footer enrichi */}
      <section id="contact" className="py-20 bg-background-secondary border-t border-border">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <RocketLaunchIcon className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-2xl font-bold text-foreground">ADS SaaS</span>
              </div>
              <p className="text-foreground-secondary mb-4">
                La plateforme de gestion publicitaire moderne pour les entreprises.
              </p>
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <span>⭐ 4.9/5</span>
                <span>•</span>
                <span>15 000+ clients</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link href="#features" className="hover:text-primary-600 transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#pricing" className="hover:text-primary-600 transition-colors">Tarifs</Link></li>
                <li><Link href="/demo" className="hover:text-primary-600 transition-colors">Démo</Link></li>
                <li><Link href="/api" className="hover:text-primary-600 transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-foreground-secondary">
                <li><Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link></li>
                <li><Link href="/docs" className="hover:text-primary-600 transition-colors">Documentation</Link></li>
                <li><Link href="/help" className="hover:text-primary-600 transition-colors">Aide</Link></li>
                <li><Link href="/status" className="hover:text-primary-600 transition-colors">Statut</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact rapide</h4>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background"
                />
                <textarea
                  placeholder="Votre message"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background resize-none"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-sm text-foreground-secondary">
                <span>© 2024 ADS SaaS. Tous droits réservés.</span>
                <Link href="/privacy" className="hover:text-primary-600 transition-colors">Confidentialité</Link>
                <Link href="/terms" className="hover:text-primary-600 transition-colors">Conditions</Link>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <span>🔒 RGPD</span>
                  <span>⚡ 99.9%</span>
                  <span>🇫🇷 France</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="#" className="text-foreground-secondary hover:text-primary-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </Link>
                  <Link href="#" className="text-foreground-secondary hover:text-primary-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </Link>
                  <Link href="#" className="text-foreground-secondary hover:text-primary-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Widget de satisfaction */}
      <SatisfactionWidget />

      {/* Section chiffres clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 mb-16">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-primary-600 countup-animated">15 000</div>
          <div className="text-foreground-secondary mt-2">Clients satisfaits</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-primary-600 countup-animated">250M</div>
          <div className="text-foreground-secondary mt-2">Million € générés</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-primary-600 countup-animated">98%</div>
          <div className="text-foreground-secondary mt-2">% de satisfaction</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-primary-600 countup-animated">24/7</div>
          <div className="text-foreground-secondary mt-2">Support client</div>
        </div>
      </div>

      {/* Badges de confiance */}
      <TrustBadges />
    </div>
  )
}