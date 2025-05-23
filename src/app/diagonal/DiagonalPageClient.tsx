'use client'

import React from 'react'
import NavbarDiagonal from '../components/diagonal/NavbarDiagonal'
import HeroSection from '../components/diagonal/HeroSection'
import TurmasSection from '../components/diagonal/TurmasSection'
import MateriaisSection from '../components/diagonal/MateriaisSection'

export default function DiagonalPageClient() {
  return (
    <div className="min-h-screen bg-black">
      <NavbarDiagonal />
      <HeroSection />
      <TurmasSection />
      <MateriaisSection />
    </div>
  )
}