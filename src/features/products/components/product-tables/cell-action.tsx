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
import { deleteProductMutation } from '../../api/mutations';
import type { Product } from '../../api/types';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CellActionProps {
  data: Product;
}

export function CellAction({ data }: CellActionProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const deleteMutation = useMutation({
    ...deleteProductMutation,
    onSuccess: () => {
      toast.success('Producto eliminado exitosamente');
      setOpen(false);
    },
    onError: () => {
      toast.error('No se pudo eliminar el producto');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0 cursor-pointer' />}>
          <span className='sr-only'>Abrir menú</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='font-gotham'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className='cursor-pointer text-[#E63946]'
              onClick={() => window.open(`/producto/${data.id}`, '_blank')}
            >
              <Icons.externalLink className='mr-2 h-4 w-4' /> Ver en Tienda (Mercado Libre)
            </DropdownMenuItem>
            <DropdownMenuItem
              className='cursor-pointer'
              onClick={() => router.push(`/dashboard/product/${data.id}`)}
            >
              <Icons.edit className='mr-2 h-4 w-4' /> Editar Producto
            </DropdownMenuItem>
            <DropdownMenuItem
              className='cursor-pointer text-destructive'
              onClick={() => setOpen(true)}
            >
              <Icons.trash className='mr-2 h-4 w-4' /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
