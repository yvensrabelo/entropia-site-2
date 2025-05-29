'use client';

import React, { useState, useEffect } from 'react';
import './TurmasCards.css';

interface PlanOption {
  id: string;
  name: string;
  planName: string;
  originalPrice: string;
  currentPrice: string;
  duration: string;
  benefits: string[];
}

interface TurmaCard {
  id: string;
  badge: string;
  subtitle: string;
  titleAccent: string;
  titleMain: string;
  description: string;
  gradientClass: string;
  ctaClass: string;
  plans: PlanOption[];
}

const turmasData: TurmaCard[] = [
  {
    id: 'extensivo',
    badge: 'ECONOMIA DE ATÉ 60%',
    subtitle: 'Cursinho ENEM e Pré-Vestibular',
    titleAccent: 'APOSTE EM VOCÊ',
    titleMain: 'APOSTE NA ENTROPIA',
    description: 'Inscreva-se no seu curso preparatório ENEM e Pré-vestibular 2025 e garanta uma preparação completa!',
    gradientClass: '',
    ctaClass: '',
    plans: [
      {
        id: 'extensivo-full',
        name: 'Extensivo',
        planName: 'Extensivo Medicina',
        originalPrice: '12x R$199,90',
        currentPrice: 'R$89,90',
        duration: '10 MESES DE ACESSO',
        benefits: [
          'Biblioteca com mais de 2 mil aulas',
          'Material didático exclusivo',
          'Simulados periódicos',
          'Monitoria especializada',
          'Foco ENEM/MACRO'
        ]
      },
      {
        id: 'intensivo',
        name: 'Intensivo',
        planName: 'Intensivo Medicina',
        originalPrice: '12x R$249,90',
        currentPrice: 'R$119,90',
        duration: '6 MESES INTENSIVOS',
        benefits: [
          'Revisão completa e acelerada',
          'Simulados semanais',
          'Plantão de dúvidas 24h',
          'Material focado',
          'Turma reduzida'
        ]
      }
    ]
  }
];

export default function TurmasCards() {
  const [activePlans, setActivePlans] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set default active plans
    const defaults: Record<string, string> = {};
    turmasData.forEach(turma => {
      defaults[turma.id] = turma.plans[0].id;
    });
    setActivePlans(defaults);

    // Animate cards on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all cards
    const cards = document.querySelectorAll('.turma-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const handlePlanChange = (turmaId: string, planId: string) => {
    setActivePlans(prev => ({
      ...prev,
      [turmaId]: planId
    }));
  };

  if (!mounted) {
    return <div style={{ padding: '40px', background: 'red', color: 'white', textAlign: 'center' }}>LOADING TURMAS...</div>;
  }

  return (
    <div className="turmas-container" style={{ opacity: 1, display: 'grid', visibility: 'visible' }}>
      {turmasData.map(turma => {
        const activePlan = turma.plans.find(plan => plan.id === activePlans[turma.id]) || turma.plans[0];
        
        return (
          <div key={turma.id} className="turma-card">
            <div className={`card-gradient-bg ${turma.gradientClass}`}>
              <span className="card-badge">{turma.badge}</span>
              <h3 className="card-subtitle">{turma.subtitle}</h3>
              <h2 className="card-title">
                <span className={`title-accent ${turma.gradientClass ? 'title-purple' : 'title-green'}`}>
                  {turma.titleAccent}
                </span>
                <span className="title-white">{turma.titleMain}</span>
              </h2>
              <p className="card-description">{turma.description}</p>
              
              {/* Toggle de planos */}
              <div className="plan-toggle">
                {turma.plans.map(plan => (
                  <button
                    key={plan.id}
                    className={`toggle-option ${activePlans[turma.id] === plan.id ? 'active' : ''}`}
                    onClick={() => handlePlanChange(turma.id, plan.id)}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>
              
              {/* Card de preço */}
              <div className="price-card">
                <h3 className="plan-name">{activePlan.planName}</h3>
                
                <div className="price-section">
                  <span className="price-from">
                    De <s>{activePlan.originalPrice}</s> por:
                  </span>
                  <div className="price-current">
                    12x <span className="price-value">{activePlan.currentPrice}</span>
                  </div>
                </div>
                
                <button className={`cta-button ${turma.ctaClass}`}>
                  {turma.id === 'extensivo' ? 'Comece Agora' : 'Garanta sua Vaga'}
                </button>
                
                <div className="plan-duration">{activePlan.duration}</div>
                
                <ul className="benefits-list">
                  {activePlan.benefits.map((benefit, index) => (
                    <li key={index}>✓ {benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}