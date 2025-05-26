'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit, Eye, GripVertical } from 'lucide-react';
import { Turma, tipoTurmaLabels, tipoTurmaColors } from '@/lib/types/turma';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  turma: Turma;
  onDelete: (id: string) => void;
}

function SortableItem({ turma, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: turma.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'bg-gray-50' : ''}>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {turma.nome}
        </div>
        <div className="text-sm text-gray-500">{turma.periodo}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tipoTurmaColors[turma.tipo]}`}>
          {tipoTurmaLabels[turma.tipo]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {turma.duracao}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {turma.vagas_disponiveis}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          turma.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {turma.ativo ? 'Ativa' : 'Inativa'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/dashboard/turmas/${turma.id}/preview`}
            className="text-blue-600 hover:text-blue-900"
            title="Visualizar"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <Link
            href={`/admin/dashboard/turmas/${turma.id}/editar`}
            className="text-yellow-600 hover:text-yellow-900"
            title="Editar"
          >
            <Edit className="w-5 h-5" />
          </Link>
          <button
            onClick={() => onDelete(turma.id)}
            className="text-red-600 hover:text-red-900"
            title="Excluir"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface TurmasTableProps {
  turmas: Turma[];
  onDelete: (id: string) => void;
  onReorder: (turmas: Turma[]) => void;
}

export default function TurmasTable({ turmas, onDelete, onReorder }: TurmasTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = turmas.findIndex(t => t.id === active.id);
      const newIndex = turmas.findIndex(t => t.id === over?.id);
      const newTurmas = arrayMove(turmas, oldIndex, newIndex);
      onReorder(newTurmas);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Turma
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duração
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vagas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <SortableContext
            items={turmas.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody className="bg-white divide-y divide-gray-200">
              {turmas.map((turma) => (
                <SortableItem
                  key={turma.id}
                  turma={turma}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  );
}