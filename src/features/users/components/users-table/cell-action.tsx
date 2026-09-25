'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteUserMutation } from '../../api/mutations';
import type { User } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserFormSheet } from '../user-form-sheet';

interface CellActionProps {
  data: User;
}

export function CellAction({ data }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const deleteMutation = useMutation({
    ...deleteUserMutation,
    onSuccess: () => {
      toast.success('Usuario eliminado exitosamente');
      setDeleteOpen(false);
    },
    onError: () => {
      toast.error('No se pudo eliminar el usuario');
    }
  });

  const cleanPhone = data.phone?.replace(/[^0-9]/g, '');

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      <UserFormSheet user={data} open={editOpen} onOpenChange={setEditOpen} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0 cursor-pointer' />}>
          <span className='sr-only'>Abrir menú</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='font-gotham'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            {cleanPhone && (
              <DropdownMenuItem
                className='cursor-pointer text-emerald-600'
                onClick={() =>
                  window.open(
                    `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `¡Hola ${data.first_name}! Te saludamos desde la administración de JG Store Polirubro.`
                    )}`,
                    '_blank'
                  )
                }
              >
                <Icons.whatsapp className='mr-2 h-4 w-4' /> Chatear por WhatsApp
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className='cursor-pointer' onClick={() => setEditOpen(true)}>
              <Icons.edit className='mr-2 h-4 w-4' /> Editar Datos
            </DropdownMenuItem>
            <DropdownMenuItem
              className='cursor-pointer text-destructive'
              onClick={() => setDeleteOpen(true)}
            >
              <Icons.trash className='mr-2 h-4 w-4' /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
