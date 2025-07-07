'use client'

import React, { useState } from 'react'
import { useSectionScroll } from './parallax-effect'
import { VoiceNavigation, AdaptiveControls } from './voice-navigation'
import { ProgressiveReveal, ScrollReveal, HoverReveal, AutoReveal } from './progressive-reveal'
import { CinematicTransition, MorphTransition, ParallaxTransition, RevealTransition } from './cinematic-transitions'

// Composant de test pour la Phase 2
export const TestPhase2: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<'exploration' | 'efficiency' | 'accessibility'>('exploration')
  const [effectsIntensity, setEffectsIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const {
    currentSection,
    scrollToSection,
    platform,
    userMode,
    navigationStyle,
    canUseEffects,
    userBehavior,
    voiceNavigationEnabled,
    toggleVoiceNavigation,
    changeEffectsIntensity
  } = useSectionScroll(5)

  const sectionTitles = [
    'Accueil avec Transitions',
    'Navigation Vocale',
    'Révélation Progressive',
    'Effets Cinématiques',
    'Contrôles Adaptatifs'
  ]

  const handleModeChange = (mode: 'exploration' | 'efficiency' | 'accessibility') => {
    setCurrentMode(mode)
  }

  const handleIntensityChange = (intensity: 'low' | 'medium' | 'high') => {
    setEffectsIntensity(intensity)
    changeEffectsIntensity(intensity)
  }

  const handleVoiceToggle = () => {
    setVoiceEnabled(!voiceEnabled)
    toggleVoiceNavigation()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Panneau de contrôle */}
      <div className="fixed top-4 left-4 z-50 bg-background/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Test Phase 2</h2>
        
        <div className="space-y-4">
          {/* Mode utilisateur */}
          <div>
            <label className="block text-sm font-medium mb-2">Mode Utilisateur:</label>
            <div className="flex space-x-2">
              {(['exploration', 'efficiency', 'accessibility'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`px-3 py-1 text-xs rounded ${
                    currentMode === mode
                      ? 'bg-primary-600 text-white'
                      : 'bg-background-secondary text-foreground hover:bg-background-tertiary'
                  }`}
                >
                  {mode === 'exploration' && '🔍'}
                  {mode === 'efficiency' && '⚡'}
                  {mode === 'accessibility' && '♿'}
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Intensité des effets */}
          <div>
            <label className="block text-sm font-medium mb-2">Intensité des Effets:</label>
            <div className="flex space-x-2">
              {(['low', 'medium', 'high'] as const).map((intensity) => (
                <button
                  key={intensity}
                  onClick={() => handleIntensityChange(intensity)}
                  className={`px-3 py-1 text-xs rounded ${
                    effectsIntensity === intensity
                      ? 'bg-primary-600 text-white'
                      : 'bg-background-secondary text-foreground hover:bg-background-tertiary'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation vocale */}
          <div>
            <label className="block text-sm font-medium mb-2">Navigation Vocale:</label>
            <button
              onClick={handleVoiceToggle}
              className={`px-3 py-1 text-xs rounded ${
                voiceEnabled
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              {voiceEnabled ? 'Désactiver' : 'Activer'} 🎤
            </button>
          </div>

          {/* Informations de debug */}
          <div className="text-xs space-y-1">
            <div>Section: {currentSection + 1}/5</div>
            <div>Plateforme: {platform}</div>
            <div>Mode: {userMode}</div>
            <div>Style: {navigationStyle}</div>
            <div>Comportement: {userBehavior}</div>
            <div>Effets: {canUseEffects ? 'Activés' : 'Désactivés'}</div>
          </div>
        </div>
      </div>

      {/* Navigation vocale */}
      {voiceEnabled && (
        <VoiceNavigation
          onSectionChange={scrollToSection}
          currentSection={currentSection}
          totalSections={5}
          userMode={currentMode}
          platform={platform}
          isEnabled={voiceEnabled}
        />
      )}

      {/* Contrôles adaptatifs */}
      <AdaptiveControls
        currentSection={currentSection}
        totalSections={5}
        onSectionChange={scrollToSection}
        userMode={currentMode}
        platform={platform}
        canUseEffects={canUseEffects}
      />

      {/* Sections de test */}
      <div className="snap-y snap-mandatory h-screen overflow-y-auto">
        {/* Section 1: Transitions cinématiques */}
        <section className="h-screen snap-start flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="text-center text-white">
            <CinematicTransition
              isVisible={currentSection === 0}
              type="morph"
              direction="up"
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <h1 className="text-6xl font-bold mb-4">Transitions Cinématiques</h1>
            </CinematicTransition>
            
            <CinematicTransition
              isVisible={currentSection === 0}
              type="reveal"
              direction="left"
              delay={0.3}
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <p className="text-xl mb-8">Découvrez les nouvelles transitions fluides</p>
            </CinematicTransition>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <MorphTransition
                isVisible={currentSection === 0}
                type="morph"
                direction="up"
                delay={0.5}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">Morphing</h3>
                  <p className="text-sm">Transformation fluide</p>
                </div>
              </MorphTransition>

              <ParallaxTransition
                isVisible={currentSection === 0}
                type="parallax"
                direction="up"
                delay={0.7}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">Parallaxe</h3>
                  <p className="text-sm">Profondeur 3D</p>
                </div>
              </ParallaxTransition>

              <RevealTransition
                isVisible={currentSection === 0}
                type="reveal"
                direction="up"
                delay={0.9}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">Révélation</h3>
                  <p className="text-sm">Apparition progressive</p>
                </div>
              </RevealTransition>
            </div>
          </div>
        </section>

        {/* Section 2: Navigation vocale */}
        <section className="h-screen snap-start flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600">
          <div className="text-center text-white">
            <ScrollReveal
              direction="up"
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <h1 className="text-6xl font-bold mb-4">Navigation Vocale</h1>
            </ScrollReveal>
            
            <ScrollReveal
              direction="up"
              delay={0.3}
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <p className="text-xl mb-8">Contrôlez la navigation par la voix</p>
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <ScrollReveal
                direction="left"
                delay={0.5}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Commandes Vocales</h3>
                  <ul className="text-left space-y-2">
                    <li>"Section suivante"</li>
                    <li>"Section précédente"</li>
                    <li>"Aller à l'accueil"</li>
                    <li>"Aller à la fin"</li>
                    <li>"Pause" / "Reprendre"</li>
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal
                direction="right"
                delay={0.7}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Fonctionnalités</h3>
                  <ul className="text-left space-y-2">
                    <li>Reconnaissance en français</li>
                    <li>Adaptation au mode utilisateur</li>
                    <li>Feedback visuel</li>
                    <li>Détection de confiance</li>
                    <li>Gestion des erreurs</li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Section 3: Révélation progressive */}
        <section className="h-screen snap-start flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
          <div className="text-center text-white">
            <HoverReveal
              direction="up"
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <h1 className="text-6xl font-bold mb-4">Révélation Progressive</h1>
            </HoverReveal>
            
            <HoverReveal
              direction="up"
              delay={0.3}
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <p className="text-xl mb-8">Contenu qui apparaît de manière fluide</p>
            </HoverReveal>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <HoverReveal
                direction="left"
                delay={0.5}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg hover:bg-white/30 transition-colors">
                  <h3 className="text-lg font-semibold">Au Scroll</h3>
                  <p className="text-sm">Apparition lors du défilement</p>
                </div>
              </HoverReveal>

              <HoverReveal
                direction="up"
                delay={0.7}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg hover:bg-white/30 transition-colors">
                  <h3 className="text-lg font-semibold">Au Survol</h3>
                  <p className="text-sm">Révélation interactive</p>
                </div>
              </HoverReveal>

              <HoverReveal
                direction="right"
                delay={0.9}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-lg hover:bg-white/30 transition-colors">
                  <h3 className="text-lg font-semibold">Automatique</h3>
                  <p className="text-sm">Chargement progressif</p>
                </div>
              </HoverReveal>
            </div>
          </div>
        </section>

        {/* Section 4: Effets cinématiques */}
        <section className="h-screen snap-start flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
          <div className="text-center text-white">
            <AutoReveal
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <h1 className="text-6xl font-bold mb-4">Effets Cinématiques</h1>
            </AutoReveal>
            
            <AutoReveal
              delay={0.3}
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <p className="text-xl mb-8">Animations adaptées à chaque utilisateur</p>
            </AutoReveal>

            <div className="flex space-x-8 mt-8">
              <AutoReveal
                delay={0.5}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Exploration</h3>
                  <p className="text-sm mb-4">Animations détaillées et immersives</p>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </AutoReveal>

              <AutoReveal
                delay={0.7}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Efficacité</h3>
                  <p className="text-sm mb-4">Transitions rapides et minimales</p>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </AutoReveal>

              <AutoReveal
                delay={0.9}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Accessibilité</h3>
                  <p className="text-sm mb-4">Animations lentes et réduites</p>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </AutoReveal>
            </div>
          </div>
        </section>

        {/* Section 5: Contrôles adaptatifs */}
        <section className="h-screen snap-start flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600">
          <div className="text-center text-white">
            <ProgressiveReveal
              trigger="scroll"
              direction="up"
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <h1 className="text-6xl font-bold mb-4">Contrôles Adaptatifs</h1>
            </ProgressiveReveal>
            
            <ProgressiveReveal
              trigger="scroll"
              direction="up"
              delay={0.3}
              userMode={currentMode}
              intensity={effectsIntensity}
            >
              <p className="text-xl mb-8">Interface qui s'adapte à vos besoins</p>
            </ProgressiveReveal>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <ProgressiveReveal
                trigger="scroll"
                direction="left"
                delay={0.5}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Détection Automatique</h3>
                  <ul className="text-left space-y-2">
                    <li>Plateforme (Desktop/Mobile/Tablet)</li>
                    <li>Comportement utilisateur</li>
                    <li>Capacités de performance</li>
                    <li>Préférences d'accessibilité</li>
                  </ul>
                </div>
              </ProgressiveReveal>

              <ProgressiveReveal
                trigger="scroll"
                direction="right"
                delay={0.7}
                userMode={currentMode}
                intensity={effectsIntensity}
              >
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Personnalisation</h3>
                  <ul className="text-left space-y-2">
                    <li>Mode exploration immersif</li>
                    <li>Mode efficacité minimal</li>
                    <li>Mode accessibilité adapté</li>
                    <li>Intensité des effets</li>
                  </ul>
                </div>
              </ProgressiveReveal>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 