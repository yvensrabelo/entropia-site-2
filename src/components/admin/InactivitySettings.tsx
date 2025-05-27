'use client';

import React, { useState } from 'react';
import { Settings, Clock, AlertTriangle, Save } from 'lucide-react';

interface InactivitySettingsProps {
  currentTimeout?: number; // em minutos
  currentWarning?: number; // em minutos
  onSave?: (timeoutMinutes: number, warningMinutes: number) => void;
}

export default function InactivitySettings({
  currentTimeout = 30,
  currentWarning = 5,
  onSave
}: InactivitySettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState(currentTimeout);
  const [warningMinutes, setWarningMinutes] = useState(currentWarning);

  const timeoutOptions = [
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' }
  ];

  const warningOptions = [
    { value: 5, label: '5 minutos antes' },
    { value: 10, label: '10 minutos antes' },
    { value: 15, label: '15 minutos antes' }
  ];

  const handleSave = () => {
    if (warningMinutes >= timeoutMinutes) {
      alert('O tempo de aviso deve ser menor que o tempo total');
      return;
    }
    
    if (onSave) {
      onSave(timeoutMinutes, warningMinutes);
    }
    
    setIsOpen(false);
    console.log('⚙️ Configurações de inatividade salvas:', { timeoutMinutes, warningMinutes });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        title="Configurações de Timeout"
      >
        <Settings className="w-4 h-4" />
        Timeout
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Configurações de Timeout
          </h2>
        </div>

        <div className="space-y-6">
          {/* Tempo Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo de Sessão
            </label>
            <select
              value={timeoutMinutes}
              onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeoutOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Tempo total antes do logout automático
            </p>
          </div>

          {/* Tempo de Aviso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aviso de Expiração
            </label>
            <select
              value={warningMinutes}
              onChange={(e) => setWarningMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {warningOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Quando mostrar o aviso de expiração
            </p>
          </div>

          {/* Aviso de Validação */}
          {warningMinutes >= timeoutMinutes && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                O tempo de aviso deve ser menor que o tempo total da sessão
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Sessão expira em: <strong>{timeoutMinutes} minutos</strong></li>
              <li>• Aviso aparece aos: <strong>{timeoutMinutes - warningMinutes} minutos</strong></li>
              <li>• Tempo para responder: <strong>{warningMinutes} minutos</strong></li>
            </ul>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={warningMinutes >= timeoutMinutes}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}