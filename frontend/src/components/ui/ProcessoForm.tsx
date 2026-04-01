import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { processoSchema, type ProcessoFormData } from '../../lib/validations/processo';
import { Input } from './Input';
import { MaskedInput } from './MaskedInput';
import { Button } from './Button';
import type { Cliente } from '../../types/cliente';

interface ProcessoFormProps {
  onSubmit: (data: ProcessoFormData) => Promise<void>;
  isLoading: boolean;
  clientes: Cliente[];
  defaultValues?: Partial<ProcessoFormData>;
}

export function ProcessoForm({ onSubmit, isLoading, clientes, defaultValues }: ProcessoFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<ProcessoFormData>({
    resolver: zodResolver(processoSchema),
    defaultValues: {
      tipo: 'extrajudicial',
      status: 'ativo',
      ...defaultValues,
    },
  });

  const tipo = watch('tipo');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* Tipo do processo */}
      <div className="flex flex-col gap-2 w-full text-left">
        <label className="input-label">Tipo do Processo</label>
        <div className="flex gap-3">
          <label className="processo-tipo-option">
            <input
              type="radio"
              value="extrajudicial"
              {...register('tipo')}
              className="hidden"
            />
            <span className={`processo-tipo-btn ${tipo === 'extrajudicial' ? 'processo-tipo-btn-active' : ''}`}>
              Extrajudicial
            </span>
          </label>
          <label className="processo-tipo-option">
            <input
              type="radio"
              value="judicial"
              {...register('tipo')}
              className="hidden"
            />
            <span className={`processo-tipo-btn ${tipo === 'judicial' ? 'processo-tipo-btn-active' : ''}`}>
              Judicial
            </span>
          </label>
        </div>
      </div>

      {/* Número do processo — só aparece se judicial */}
      {tipo === 'judicial' && (
        <Controller
          name="numero_processo"
          control={control}
          render={({ field }) => (
            <MaskedInput
              label="Número do Processo"
              mask="0000000-00.0000.0.00.0000"
              value={field.value ?? ''}
              onAccept={(value) => field.onChange(value)}
              placeholder="0000000-00.0000.0.00.0000"
              name="numero_processo"
              error={errors.numero_processo?.message}
            />
          )}
        />
      )}

      <Input
        label="Nome das Partes"
        placeholder="Ex: João Silva vs Empresa LTDA"
        {...register('nome_partes')}
        error={errors.nome_partes?.message}
      />

      {/* Cliente */}
      <Controller
        name="cliente_id"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2 w-full text-left">
            <label className="input-label" htmlFor="cliente_id">
              Cliente
            </label>
            <select
              id="cliente_id"
              className={`input-base ${errors.cliente_id ? 'input-error' : ''}`}
              value={field.value ?? ''}
              onChange={e => field.onChange(Number(e.target.value))}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
            {errors.cliente_id && (
              <span className="input-error-msg">{errors.cliente_id.message}</span>
            )}
          </div>
        )}
      />

      {/* Status */}
      <div className="flex flex-col gap-2 w-full text-left">
        <label className="input-label" htmlFor="status">Status</label>
        <select
          id="status"
          className={`input-base ${errors.status ? 'input-error' : ''}`}
          {...register('status')}
        >
          <option value="ativo">Ativo</option>
          <option value="arquivado">Arquivado</option>
          <option value="encerrado">Encerrado</option>
        </select>
        {errors.status && (
          <span className="input-error-msg">{errors.status.message}</span>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" loading={isLoading}>
          Salvar Processo
        </Button>
      </div>
    </form>
  );
}