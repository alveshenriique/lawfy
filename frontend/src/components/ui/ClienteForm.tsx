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
    setValue,
    setError,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
  });

  async function buscarCep(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('cep', { message: 'CEP não encontrado' });
        return;
      }

      setValue('logradouro', data.logradouro);
      setValue('bairro', data.bairro);
      setValue('cidade', data.localidade);
      setValue('estado', data.uf);
    } catch {
      setError('cep', { message: 'Erro ao buscar CEP' });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* Dados principais */}
      <Input
        label="Nome / Razão Social"
        placeholder="Ex: João Silva"
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
            label="Telefone"
            mask="(00) 00000-0000"
            value={field.value}
            onAccept={(value) => field.onChange(value)}
            placeholder="(31) 99999-9999"
            name="telefone"
            error={errors.telefone?.message}
          />
        )}
      />

      {/* Endereço */}
      <div className="form-section-divider">
        <span className="form-section-label">Endereço</span>
      </div>

      <Controller
        name="cep"
        control={control}
        render={({ field }) => (
          <MaskedInput
            label="CEP"
            mask="00000-000"
            value={field.value}
            onAccept={(value) => {
              field.onChange(value);
              buscarCep(value);
            }}
            placeholder="00000-000"
            name="cep"
            error={errors.cep?.message}
          />
        )}
      />

      <div className="form-row">
        <div className="form-col-grow">
          <Input
            label="Logradouro"
            placeholder="Ex: Rua das Flores"
            {...register('logradouro')}
            error={errors.logradouro?.message}
          />
        </div>
        <div className="form-col-small">
          <Input
            label="Número"
            placeholder="Ex: 123"
            {...register('numero')}
            error={errors.numero?.message}
          />
        </div>
      </div>

      <Input
        label="Complemento"
        placeholder="Ex: Apto 42"
        {...register('complemento')}
        error={errors.complemento?.message}
      />

      <Input
        label="Bairro"
        placeholder="Ex: Centro"
        {...register('bairro')}
        error={errors.bairro?.message}
      />

      <div className="form-row">
        <div className="form-col-grow">
          <Input
            label="Cidade"
            placeholder="Ex: Belo Horizonte"
            {...register('cidade')}
            error={errors.cidade?.message}
          />
        </div>
        <div className="form-col-estado">
          <Input
            label="Estado"
            placeholder="MG"
            maxLength={2}
            {...register('estado')}
            error={errors.estado?.message}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={isLoading}>
          Salvar Cliente
        </Button>
      </div>
    </form>
  );
}