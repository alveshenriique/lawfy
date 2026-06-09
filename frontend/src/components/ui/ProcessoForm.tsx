import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { processoSchema, type ProcessoFormData } from '../../lib/validations/processo';
import { MaskedInput } from './MaskedInput';
import { Textarea } from './TextArea';
import { Button } from './Button';
import type { Cliente } from '../../types/cliente';

interface ProcessoFormProps {
  onSubmit: (data: ProcessoFormData) => Promise<void>;
  isLoading: boolean;
  clientes: Cliente[];
  defaultValues?: Partial<ProcessoFormData>;
}

export function ProcessoForm({
  onSubmit,
  isLoading,
  clientes,
  defaultValues,
}: ProcessoFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProcessoFormData>({
    resolver: zodResolver(processoSchema),
    defaultValues: {
      tipo: 'extrajudicial',
      status: 'ativo',
      numero_processo: '',
      ...defaultValues,
    },
  });

  // Substitui watch por useWatch 
  const numeroProcesso = useWatch({
    control,
    name: 'numero_processo',
  });

  const isJudicial = !!numeroProcesso?.replace(/\D/g, '').length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      
      {/* Número do processo */}
      <Controller
        name="numero_processo"
        control={control}
        render={({ field }) => (
          <MaskedInput
            label="Número do Processo (opcional)"
            mask="0000000-00.0000.0.00.0000"
            value={field.value ?? ''}
            onAccept={(value) => {
              field.onChange(value);

              const isJudicial = value.replace(/\D/g, '').length > 0;

              setValue('tipo', isJudicial ? 'judicial' : 'extrajudicial');
            }}
            placeholder="Deixe em branco para processo extrajudicial"
            name="numero_processo"
            error={errors.numero_processo?.message}
          />
        )}
      />

      {/* Tipo automático */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-lawfy-text-soft">
          Tipo detectado:
        </span>
        <span
          className={`badge-tipo ${
            isJudicial
              ? 'badge-tipo-judicial'
              : 'badge-tipo-extrajudicial'
          }`}
        >
          {isJudicial ? 'Judicial' : 'Extrajudicial'}
        </span>
      </div>

      {/* Nome das partes */}
      <Textarea
        label="Nome das Partes"
        placeholder={`Ex: João Silva\nEmpresa LTDA`}
        rows={3}
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
              className={`input-base ${
                errors.cliente_id ? 'input-error' : ''
              }`}
              value={field.value ?? ''}
              onChange={(e) =>
                field.onChange(Number(e.target.value))
              }
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
            {errors.cliente_id && (
              <span className="input-error-msg">
                {errors.cliente_id.message}
              </span>
            )}
          </div>
        )}
      />

      {/* Status */}
      <div className="flex flex-col gap-2 w-full text-left">
        <label className="input-label" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          className={`input-base ${
            errors.status ? 'input-error' : ''
          }`}
          {...register('status')}
        >
          <option value="ativo">Ativo</option>
          <option value="arquivado">Arquivado</option>
          <option value="encerrado">Encerrado</option>
        </select>
        {errors.status && (
          <span className="input-error-msg">
            {errors.status.message}
          </span>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button type="submit" loading={isLoading}>
          Salvar Processo
        </Button>
      </div>
    </form>
  );
}