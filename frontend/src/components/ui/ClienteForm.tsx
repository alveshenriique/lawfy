import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema, type ClienteFormData } from '../../lib/validations/cliente';
import { Input } from './Input';
import { MaskedInput } from './MaskedInput';
import { Button } from './Button';

interface ClienteFormProps {
  onSubmit: (data: ClienteFormData) => Promise<void>;
  isLoading: boolean;
  defaultValues?: Partial<ClienteFormData>;
}

export function ClienteForm({ onSubmit, isLoading, defaultValues }: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Nome / Razão Social"
        placeholder="Ex: João Silva ou Empresa LTDA"
        {...register('nome')}
        error={errors.nome?.message}
      />

      <Controller
        name="cpf_cnpj"
        control={control}
        render={({ field }) => (
          <MaskedInput
            label="CPF / CNPJ"
            mask={[
              { mask: '000.000.000-00' },
              { mask: '00.000.000/0000-00' },
            ]}
            value={field.value}
            onAccept={(value) => field.onChange(value)}
            placeholder="CPF ou CNPJ"
            name="cpf_cnpj"
            error={errors.cpf_cnpj?.message}
          />
        )}
      />

      <Controller
        name="telefone"
        control={control}
        render={({ field }) => (
          <MaskedInput
            label="Telefone (opcional)"
            mask="(00) 00000-0000"
            value={field.value}
            onAccept={(value) => field.onChange(value)}
            placeholder="(31) 99999-9999"
            name="telefone"
            error={errors.telefone?.message}
          />
        )}
      />

      <div className="pt-2">
        <Button type="submit" loading={isLoading}>
          Salvar Cliente
        </Button>
      </div>
    </form>
  );
}