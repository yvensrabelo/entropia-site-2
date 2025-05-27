'use client'

import React, { useState } from 'react'
import { X, Phone, MessageSquare, Loader2, CheckCircle } from 'lucide-react'

interface WhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
  turmaTitle: string
  periodo?: string
  duracao?: string
  vagas?: number | string
}

export default function WhatsAppModal({ isOpen, onClose, turmaTitle, periodo, duracao, vagas }: WhatsAppModalProps) {
  const [telefone, setTelefone] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  if (!isOpen) return null

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length <= 10) {
      // Formato: (XX) XXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      // Formato: (XX) XXXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      setTelefone(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    
    if (!telefone) {
      setErro('Por favor, informe seu WhatsApp')
      return
    }

    if (telefone.length < 10) {
      setErro('Número de telefone inválido')
      return
    }

    setEnviando(true)
    
    try {
      const response = await fetch('/api/whatsapp/send-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefone,
          turma: turmaTitle,
          periodo,
          duracao,
          vagas
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao enviar')
      }
      
      setSucesso(true)
      
      // Resetar após 3 segundos
      setTimeout(() => {
        onClose()
        setSucesso(false)
        setTelefone('')
      }, 3000)
      
    } catch (error) {
      setErro('Erro ao enviar informações. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {sucesso ? (
          // Tela de sucesso
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfeito!</h3>
            <p className="text-gray-600">
              As informações foram enviadas para o seu WhatsApp.
            </p>
          </div>
        ) : (
          <>
            {/* Cabeçalho */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Matrícule-se Agora!</h3>
              <p className="text-gray-600">
                Interessado na turma <span className="font-semibold">{turmaTitle}</span>?
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Informe seu WhatsApp para receber as informações!
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="telefone"
                    value={formatPhone(telefone)}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="(92) 99999-9999"
                    required
                  />
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Enviar pelo WhatsApp
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              Ao enviar, você concorda em receber mensagens sobre sua matrícula.
            </p>
          </>
        )}
      </div>
    </div>
  )
}