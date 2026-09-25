'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useMutation } from '@tanstack/react-query';
import { createUserMutation, updateUserMutation } from '../api/mutations';
import type { User } from '../api/types';
import { toast } from 'sonner';
import { userSchema, type UserFormValues } from '../schemas/user';
import { ROLE_OPTIONS, STATUS_OPTIONS } from './users-table/options';

interface UserFormSheetProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormSheet({ user, open, onOpenChange }: UserFormSheetProps) {
  const isEdit = !!user;

  const createMutation = useMutation({
    ...createUserMutation,
    onSuccess: () => {
      toast.success('Cliente / Usuario registrado exitosamente');
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error('No se pudo registrar el usuario. Intenta de nuevo.')
  });

  const updateMutation = useMutation({
    ...updateUserMutation,
    onSuccess: () => {
      toast.success('Datos de usuario actualizados exitosamente');
      onOpenChange(false);
    },
    onError: () => toast.error('No se pudo actualizar el usuario. Intenta de nuevo.')
  });

  const form = useAppForm({
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      role: user?.role ?? 'Mayorista B2B',
      status: user?.status ?? 'Activo',
      empresa: user?.empresa ?? '',
      rif_cuit: user?.rif_cuit ?? '',
      ciudad: user?.ciudad ?? ''
    } as UserFormValues,
    validators: {
      onSubmit: userSchema
    },
    onSubmit: async ({ value }) => {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: user.id, values: value });
      } else {
        await createMutation.mutateAsync(value);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col sm:max-w-md font-gotham'>
        <SheetHeader>
          <SheetTitle className='font-gotham text-xl font-bold'>
            {isEdit ? 'Editar Cliente / Usuario' : 'Registrar Nuevo Cliente'}
          </SheetTitle>
          <SheetDescription className='text-xs text-[#6C757D]'>
            {isEdit
              ? 'Actualiza los datos comerciales, empresa y rol del cliente en JG Store.'
              : 'Completa los datos para habilitar acceso mayorista o minorista en el sistema.'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto py-2'>
          <form
            id='user-form-sheet'
            className='space-y-4 px-1'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className='grid grid-cols-2 gap-3'>
                <form.AppField
                  name='first_name'
                  children={(field) => (
                    <field.TextField label='Nombre' required placeholder='Ej: Carlos' />
                  )}
                />
                <form.AppField
                  name='last_name'
                  children={(field) => (
                    <field.TextField label='Apellido' required placeholder='Ej: Mendoza' />
                  )}
                />
              </div>

              <form.AppField
                name='email'
                children={(field) => (
                  <field.TextField
                    label='Correo Electrónico'
                    required
                    type='email'
                    placeholder='cliente@empresa.com'
                  />
                )}
              />

              <form.AppField
                name='phone'
                children={(field) => (
                  <field.TextField
                    label='WhatsApp / Teléfono Móvil'
                    required
                    type='tel'
                    placeholder='+58 412 1234567'
                  />
                )}
              />

              <div className='p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-3'>
                <div className='text-[11px] font-bold text-[#D4A017] uppercase tracking-wider'>
                  Información Comercial & Fiscal
                </div>

                <form.AppField
                  name='role'
                  children={(field) => (
                    <field.SelectField
                      label='Tipo de Cuenta / Rol'
                      required
                      options={ROLE_OPTIONS}
                      placeholder='Selecciona el tipo de cuenta'
                    />
                  )}
                />

                <form.AppField
                  name='empresa'
                  children={(field) => (
                    <field.TextField
                      label='Razón Social / Nombre Comercial'
                      placeholder='Ej: Distribuidora Los Llanos C.A.'
                    />
                  )}
                />

                <div className='grid grid-cols-2 gap-3'>
                  <form.AppField
                    name='rif_cuit'
                    children={(field) => (
                      <field.TextField
                        label='RIF / Cédula Fiscal'
                        placeholder='J-12345678-0'
                      />
                    )}
                  />

                  <form.AppField
                    name='ciudad'
                    children={(field) => (
                      <field.TextField
                        label='Ciudad de Despacho'
                        placeholder='Valencia'
                      />
                    )}
                  />
                </div>
              </div>

              <form.AppField
                name='status'
                children={(field) => (
                  <field.SelectField
                    label='Estado de la Cuenta'
                    required
                    options={STATUS_OPTIONS}
                    placeholder='Selecciona el estado'
                  />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter className='border-t border-border pt-4 gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='cursor-pointer'
          >
            Cancelar
          </Button>
          <LoadingButton
            loading={isPending}
            type='submit'
            form='user-form-sheet'
            className='bg-[#E63946] hover:bg-[#d62839] text-white font-semibold cursor-pointer'
          >
            {isEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UserFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className='bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs md:text-sm cursor-pointer'
      >
        <Icons.add className='mr-1.5 h-4 w-4' /> Registrar Cliente
      </Button>
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
