'use client'

import React, { useEffect, useState } from 'react'
import { 
  useSectionScroll, 
  AdaptiveNavigation, 
  ProgressBar, 
  UserModeSelector,
  FeedbackContextuel,
  NarrativeProgress,
  BackgroundEffects,
  SectionTransition,
  SectionScroll
} from './parallax-effect'

// Composant de test pour vérifier le système de navigation unifié
export const TestParallaxSystem: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    platform: string
    userMode: string
    navigationStyle: string
    userBehavior: string
    canUseEffects: boolean
    currentSection: number
    totalSections: number
  }>({
    platform: '',
    userMode: '',
    navigationStyle: '',
    userBehavior: '',
    canUseEffects: false,
    currentSection: 0,
    totalSections: 5
  })

  const { 
    currentSection, 
    scrollToSection, 
    totalSections, 
    platform,
    userMode,
    navigationStyle,
    userBehavior,
    canUseEffects,
    changeUserMode
  } = useSectionScroll(5)

  const sectionTitles = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5']

  // Mettre à jour les résultats de test
  useEffect(() => {
    setTestResults({
      platform,
      userMode,
      navigationStyle,
      userBehavior,
      canUseEffects,
      currentSection,
      totalSections
    })
  }, [platform, userMode, navigationStyle, userBehavior, canUseEffects, currentSection, totalSections])

  return (
    <div className="min-h-screen bg-background">
      {/* Panneau de test */}
      <div className="fixed top-4 left-4 z-[9999] bg-background/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="text-sm font-medium text-foreground mb-3">Test Système Navigation</h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-foreground-muted">Platform:</span>
            <span className="font-medium">{testResults.platform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">Mode:</span>
            <span className="font-medium">{testResults.userMode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">Navigation:</span>
            <span className="font-medium">{testResults.navigationStyle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">Comportement:</span>
            <span className="font-medium">{testResults.userBehavior}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">Effets:</span>
            <span className={`font-medium ${testResults.canUseEffects ? 'text-green-500' : 'text-red-500'}`}>
              {testResults.canUseEffects ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-muted">Section:</span>
            <span className="font-medium">{testResults.currentSection + 1}/{testResults.totalSections}</span>
          </div>
        </div>

        {/* Boutons de test */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex space-x-2">
            <button
              onClick={() => changeUserMode('exploration')}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Exploration
            </button>
            <button
              onClick={() => changeUserMode('efficiency')}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Efficacité
            </button>
            <button
              onClick={() => changeUserMode('accessibility')}
              className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
            >
              Accessibilité
            </button>
          </div>
        </div>
      </div>

      {/* Sections de test */}
      <main className="pt-16" style={{ scrollSnapType: 'y mandatory', overflowY: 'auto', height: 'calc(100vh - 4rem)' }}>
        {Array.from({ length: 5 }, (_, index) => (
          <SectionScroll 
            key={index}
            className={`w-full ${index % 2 === 0 ? 'bg-background-secondary' : 'bg-background'}`}
            index={index}
            totalSections={5}
          >
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center min-h-screen">
                <SectionTransition 
                  isVisible={currentSection === index} 
                  direction="up" 
                  delay={200}
                  animationSpeed={userMode === 'efficiency' ? 'fast' : userMode === 'accessibility' ? 'slow' : 'normal'}
                >
                  <h2 className="text-4xl font-bold text-foreground mb-4">
                    Section de Test {index + 1}
                  </h2>
                </SectionTransition>
                
                <SectionTransition 
                  isVisible={currentSection === index} 
                  direction="up" 
                  delay={400}
                  animationSpeed={userMode === 'efficiency' ? 'fast' : userMode === 'accessibility' ? 'slow' : 'normal'}
                >
                  <p className="text-foreground-muted text-lg max-w-2xl">
                    Cette section teste le système de navigation unifié. 
                    Mode actuel : <strong>{userMode}</strong> | 
                    Style : <strong>{navigationStyle}</strong> | 
                    Comportement : <strong>{userBehavior}</strong>
                  </p>
                </SectionTransition>

                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => scrollToSection(Math.max(0, index - 1))}
                    disabled={index === 0}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => scrollToSection(Math.min(4, index + 1))}
                    disabled={index === 4}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </SectionScroll>
        ))}
      </main>

      {/* Composants de navigation */}
      <AdaptiveNavigation 
        currentSection={currentSection}
        totalSections={totalSections}
        onSectionChange={scrollToSection}
        platform={platform}
        navigationStyle={navigationStyle}
        canUseEffects={canUseEffects}
        userBehavior={userBehavior}
        sectionTitles={sectionTitles}
      />
      
      <ProgressBar 
        currentSection={currentSection}
        totalSections={totalSections}
        platform={platform}
        showProgress={true}
      />

      <UserModeSelector 
        currentMode={userMode}
        onModeChange={changeUserMode}
        platform={platform}
      />

      <FeedbackContextuel 
        currentSection={currentSection}
        totalSections={totalSections}
        userBehavior={userBehavior}
        platform={platform}
        navigationStyle={navigationStyle}
      />

      <NarrativeProgress 
        currentSection={currentSection}
        totalSections={totalSections}
        platform={platform}
        sectionTitles={sectionTitles}
      />

      {/* Effets de fond sur la première section */}
      {currentSection === 0 && (
        <BackgroundEffects 
          platform={platform}
          canUseEffects={canUseEffects}
          userBehavior={userBehavior}
        />
      )}
    </div>
  )
} 