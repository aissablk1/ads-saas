'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRightIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  SwatchIcon,
  SparklesIcon,
  CheckIcon,
  ClipboardIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  Bars3Icon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { ThemeToggle } from '@/lib/theme-toggle'
import Link from 'next/link'
import { CacheBusterDemo } from '@/components/CacheBusterDemo'

// Types pour les composants
interface Section {
  id: string
  title: string
  icon: React.ComponentType<any>
}

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface AccordionItem {
  id: string
  title: string
  content: string
}

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface ProgressBarProps {
  value: number
  max: number
  showLabel?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
}

interface CodeBlockProps {
  code: string
  language: string
  title?: string
}

interface ColorPaletteProps {
  colors: { name: string; value: string; description: string }[]
  title: string
}

export default function DemoPage() {
  const [activeSection, setActiveSection] = useState('navigation')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('tab1')
  const [openAccordions, setOpenAccordions] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Sections de navigation
  const sections: Section[] = [
    { id: 'navigation', title: 'Navigation & Ancres', icon: Bars3Icon },
    { id: 'animations', title: 'Animations', icon: SparklesIcon },
    { id: 'tabs', title: 'Tabs Dynamiques', icon: CodeBracketIcon },
    { id: 'accordions', title: 'Accordéons', icon: ChevronDownIcon },
    { id: 'tooltips', title: 'Tooltips', icon: InformationCircleIcon },
    { id: 'progress', title: 'Indicateurs de Progrès', icon: ArrowPathIcon },
    { id: 'alerts', title: 'Alertes & Notifications', icon: ExclamationTriangleIcon },
    { id: 'loading', title: 'États de Chargement', icon: ArrowPathIcon },
    { id: 'code', title: 'Blocs de Code', icon: CodeBracketIcon },
    { id: 'colors', title: 'Palettes de Couleurs', icon: SwatchIcon },
    { id: 'cache-busting', title: 'Cache Busting', icon: ArrowPathIcon }
  ]

  // Données pour les exemples
  const tabs: Tab[] = [
    { id: 'tab1', label: 'Interface', content: <div className="p-4 text-foreground-secondary">Contenu de l'onglet Interface avec des composants modernes et une expérience utilisateur optimisée.</div> },
    { id: 'tab2', label: 'Code', content: <div className="p-4 text-foreground-secondary">Exemples de code avec syntaxe highlighting et possibilité de copier le code facilement.</div> },
    { id: 'tab3', label: 'Styles', content: <div className="p-4 text-foreground-secondary">Démonstration des styles avec différentes palettes de couleurs et thèmes adaptatifs.</div> }
  ]

  const accordionItems: AccordionItem[] = [
    { id: 'acc1', title: 'Comment utiliser les composants ?', content: 'Chaque composant est conçu pour être réutilisable et facilement personnalisable. Importez simplement le composant et utilisez-le avec les props appropriées.' },
    { id: 'acc2', title: 'Personnalisation des thèmes', content: 'Notre système de thème utilise des variables CSS personnalisées qui s\'adaptent automatiquement au mode clair/sombre. Vous pouvez facilement modifier les couleurs dans le fichier globals.css.' },
    { id: 'acc3', title: 'Animations et performances', content: 'Toutes les animations utilisent Framer Motion pour des performances optimales. Les animations sont configurées pour respecter les préférences d\'accessibilité de l\'utilisateur.' }
  ]

  const colorPalettes = [
    {
      title: 'Palette Primaire',
      colors: [
        { name: 'Primary 50', value: 'var(--primary-50)', description: 'Arrière-plan très clair' },
        { name: 'Primary 100', value: 'var(--primary-100)', description: 'Arrière-plan clair' },
        { name: 'Primary 500', value: 'var(--primary-500)', description: 'Couleur principale' },
        { name: 'Primary 600', value: 'var(--primary-600)', description: 'Couleur d\'accent' },
        { name: 'Primary 700', value: 'var(--primary-700)', description: 'Couleur foncée' }
      ]
    },
    {
      title: 'Palette de Fond',
      colors: [
        { name: 'Background', value: 'var(--background)', description: 'Arrière-plan principal' },
        { name: 'Background Secondary', value: 'var(--background-secondary)', description: 'Arrière-plan secondaire' },
        { name: 'Card', value: 'var(--card)', description: 'Arrière-plan des cartes' },
        { name: 'Border', value: 'var(--border)', description: 'Couleur des bordures' }
      ]
    }
  ]

  // Intersection Observer pour le suivi des sections
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    )

    sections.forEach(section => {
      const element = document.getElementById(section.id)
      if (element) observerRef.current?.observe(element)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  // Animation du progrès
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsAnimating(false)
            return 100
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isAnimating])

  // Gestion des accordéons
  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  // Copie du code
  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  // Animations
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.1 }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 lg:px-6 h-16 flex items-center border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-background-secondary rounded-md transition-colors"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            <span className="font-semibold text-foreground">Démo UI</span>
          </Link>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Link href="/" className="btn-secondary text-sm px-3 py-1.5">
            Retour
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Navigation latérale */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.nav
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-card border-r border-border overflow-y-auto scrollbar-thin"
            >
              <div className="p-4">
                <h2 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-4">
                  Sections
                </h2>
                <ul className="space-y-1">
                  {sections.map(section => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(section.id)?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                          })
                          setSidebarOpen(false)
                        }}
                        className={`nav-link ${
                          activeSection === section.id 
                            ? 'nav-link-active' 
                            : 'nav-link-inactive'
                        }`}
                      >
                        <section.icon className="h-4 w-4 mr-3" />
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Indicateur de progression de scroll */}
                <div className="mt-8">
                  <h3 className="text-xs font-medium text-foreground-muted mb-2">Progression</h3>
                  <div className="w-full bg-background-secondary rounded-full h-2">
                    <motion.div
                      className="bg-primary-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, (Object.keys(sections).findIndex(key => sections[key].id === activeSection) + 1) / sections.length * 100)}%` 
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto p-6 space-y-16">

            {/* Section Navigation */}
            <motion.section 
              id="navigation" 
              className="space-y-6"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Démonstration UI</h1>
                <p className="text-xl text-foreground-secondary">
                  Explorez nos composants interactifs avec navigation latérale et animations fluides
                </p>
              </div>
              
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Navigation latérale avec ancres</h2>
                <div className="space-y-3 text-foreground-secondary">
                  <p>✨ Menu de navigation fixe avec indicateur de section active</p>
                  <p>📊 Indicateur de progression de scroll</p>
                  <p>🔗 Ancres avec défilement fluide pour chaque section</p>
                  <p>📱 Design responsive avec overlay sur mobile</p>
                </div>
              </div>
            </motion.section>

            {/* Section Animations */}
            <motion.section 
              id="animations" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Animations et Micro-interactions</h2>
              
              <motion.div 
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.div className="card p-6" variants={scaleIn} transition={{ duration: 0.5 }}>
                  <h3 className="font-semibold text-foreground mb-3">Animation d'apparition</h3>
                  <p className="text-foreground-secondary mb-4">Cette carte apparaît avec une animation de scale et fade.</p>
                  <motion.button 
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Bouton animé
                  </motion.button>
                </motion.div>

                <motion.div className="card p-6" variants={scaleIn} transition={{ duration: 0.3 }}>
                  <h3 className="font-semibold text-foreground mb-3">Effets de hover</h3>
                  <div className="space-y-3">
                    <motion.div 
                      className="p-3 bg-primary-50 dark:bg-primary-950/20 rounded-lg cursor-pointer"
                      whileHover={{ x: 10, backgroundColor: "var(--primary-100)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      Glissez sur moi !
                    </motion.div>
                    <motion.div 
                      className="p-3 bg-background-secondary rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      Je m'agrandis au hover
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.section>

            {/* Section Tabs */}
            <motion.section 
              id="tabs" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Tabs Dynamiques</h2>
              
              <div className="card overflow-hidden">
                <div className="border-b border-border">
                  <nav className="flex -mb-px">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-foreground-secondary hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                            layoutId="activeTab"
                          />
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[120px]"
                  >
                    {tabs.find(tab => tab.id === activeTab)?.content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.section>

            {/* Section Accordéons */}
            <motion.section 
              id="accordions" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Accordéons</h2>
              
              <div className="space-y-4">
                {accordionItems.map(item => (
                  <div key={item.id} className="card overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-background-secondary transition-colors"
                    >
                      <span className="font-medium text-foreground">{item.title}</span>
                      <motion.div
                        animate={{ rotate: openAccordions.includes(item.id) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDownIcon className="h-5 w-5 text-foreground-secondary" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {openAccordions.includes(item.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 pt-2 border-t border-border">
                            <p className="text-foreground-secondary">{item.content}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Section Tooltips */}
            <motion.section 
              id="tooltips" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Tooltips Informatifs</h2>
              
              <div className="card p-6">
                <div className="flex flex-wrap gap-4">
                  <Tooltip content="Information utile qui apparaît au survol">
                    <button className="btn-primary">Survolez-moi</button>
                  </Tooltip>
                  
                  <Tooltip content="Ce bouton effectue une action importante" position="top">
                    <button className="btn-secondary">Tooltip en haut</button>
                  </Tooltip>
                  
                  <Tooltip content="Les tooltips s'adaptent à leur position" position="left">
                    <button className="btn-ghost">Tooltip à gauche</button>
                  </Tooltip>
                </div>
              </div>
            </motion.section>

            {/* Section Indicateurs de Progrès */}
            <motion.section 
              id="progress" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Indicateurs de Progrès</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="font-semibold mb-4">Barre de progression animée</h3>
                  <ProgressBar value={progress} max={100} showLabel color="primary" />
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => {
                        setProgress(0)
                        setIsAnimating(true)
                      }}
                      className="btn-primary text-sm px-3 py-1.5"
                      disabled={isAnimating}
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Démarrer
                    </button>
                    <button 
                      onClick={() => setIsAnimating(false)}
                      className="btn-secondary text-sm px-3 py-1.5"
                    >
                      <PauseIcon className="h-4 w-4 mr-1" />
                      Pause
                    </button>
                    <button 
                      onClick={() => {
                        setProgress(0)
                        setIsAnimating(false)
                      }}
                      className="btn-ghost text-sm px-3 py-1.5"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold mb-4">Différentes couleurs</h3>
                  <div className="space-y-3">
                    <ProgressBar value={75} max={100} color="success" />
                    <ProgressBar value={45} max={100} color="warning" />
                    <ProgressBar value={90} max={100} color="error" />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section Alertes */}
            <motion.section 
              id="alerts" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Alertes & Notifications</h2>
              
              <div className="space-y-4">
                <div className="alert alert-info">
                  <InformationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Information</h4>
                    <p className="mt-1">Voici une alerte informative pour guider l'utilisateur.</p>
                  </div>
                </div>

                <div className="alert alert-success">
                  <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Succès</h4>
                    <p className="mt-1">L'opération s'est déroulée avec succès !</p>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Attention</h4>
                    <p className="mt-1">Veuillez vérifier ces informations avant de continuer.</p>
                  </div>
                </div>

                <div className="alert alert-error">
                  <XCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Erreur</h4>
                    <p className="mt-1">Une erreur s'est produite lors du traitement de votre demande.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section Loading States */}
            <motion.section 
              id="loading" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">États de Chargement</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="font-semibold mb-4">Skeleton Loading</h3>
                  <div className="space-y-3">
                    <div className="skeleton h-4 w-3/4"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                    <div className="skeleton h-4 w-2/3"></div>
                    <div className="flex items-center space-x-3 mt-4">
                      <div className="skeleton-circle h-10 w-10"></div>
                      <div className="space-y-2 flex-1">
                        <div className="skeleton h-3 w-1/2"></div>
                        <div className="skeleton h-3 w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold mb-4">Spinners</h3>
                  <div className="flex items-center gap-6">
                    <div className="spinner"></div>
                    <div className="spinner border-green-600"></div>
                    <div className="spinner border-yellow-500"></div>
                    <div className="spinner border-red-500"></div>
                  </div>
                  <div className="mt-6">
                    <button className="btn-primary" disabled>
                      <div className="spinner mr-2"></div>
                      Chargement...
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section Code */}
            <motion.section 
              id="code" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Blocs de Code</h2>
              
              <CodeBlock
                title="Composant React"
                language="jsx"
                code={`export function Button({ children, variant = 'primary', ...props }) {
  return (
    <motion.button
      className={\`btn-\${variant}\`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}`}
              />
              
              <CodeBlock
                title="Style CSS"
                language="css"
                code={`.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent 
         text-sm font-medium rounded-md shadow-sm text-white 
         bg-primary-600 hover:bg-primary-700 transition-all duration-200;
}`}
              />
            </motion.section>

            {/* Section Couleurs */}
            <motion.section 
              id="colors" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Palettes de Couleurs</h2>
              
              <div className="space-y-8">
                {colorPalettes.map((palette, index) => (
                  <ColorPalette key={index} {...palette} />
                ))}
              </div>
            </motion.section>

            {/* Section Cache Busting */}
            <motion.section 
              id="cache-busting" 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-2xl font-bold text-foreground">Cache Busting</h2>
              <p className="text-foreground-secondary">
                Système automatique d'ajout du paramètre ?v= aux assets statiques pour éviter les problèmes de cache.
              </p>
              
              <CacheBusterDemo />
            </motion.section>

          </div>
        </main>
      </div>
    </div>
  )
}

// Composant Tooltip
function Tooltip({ children, content, position = 'bottom' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}
          >
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${
              position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -mt-1' :
              position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1' :
              position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 -ml-1' :
              'right-full top-1/2 transform -translate-y-1/2 -mr-1'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Composant ProgressBar
function ProgressBar({ value, max, showLabel = true, color = 'primary' }: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100)
  
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    error: 'bg-red-600'
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {showLabel && (
          <span className="text-sm text-foreground-secondary">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-background-secondary rounded-full h-2.5">
        <motion.div
          className={`h-2.5 rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// Composant CodeBlock
function CodeBlock({ code, language, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  return (
    <div className="card overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-background-secondary border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 text-xs text-foreground-secondary hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4 text-green-600" />
                Copié !
              </>
            ) : (
              <>
                <ClipboardIcon className="h-4 w-4" />
                Copier
              </>
            )}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-foreground whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}

// Composant ColorPalette
function ColorPalette({ colors, title }: ColorPaletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  
  const copyColor = async (color: string, name: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(name)
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            className="group cursor-pointer"
            onClick={() => copyColor(color.value, color.name)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="h-20 rounded-lg border border-border mb-3 shadow-sm group-hover:shadow-md transition-shadow"
              style={{ backgroundColor: color.value }}
            />
            <div className="space-y-1">
              <h4 className="font-medium text-sm text-foreground">{color.name}</h4>
              <p className="text-xs text-foreground-muted">{color.description}</p>
              <div className="flex items-center justify-between">
                <code className="text-xs text-foreground-secondary font-mono bg-background-secondary px-2 py-1 rounded">
                  {color.value}
                </code>
                {copiedColor === color.name ? (
                  <CheckIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <ClipboardIcon className="h-4 w-4 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 