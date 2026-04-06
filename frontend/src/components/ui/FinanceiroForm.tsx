import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { financeiroSchema, type FinanceiroFormData } from '../../lib/validations/financeiro';
import { Textarea } from './TextArea';
import { Button } from './Button';
import type { Processo } from '../../types/processo';

interface FinanceiroFormProps {
  onSubmit: (data: FinanceiroFormData) => Promise<void>;
  isLoading: boolean;
  processos: Processo[];
  defaultValues?: Partial<FinanceiroFormData>;
}

export function FinanceiroForm({ onSubmit, isLoading, processos, defaultValues }: FinanceiroFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FinanceiroFormData>({
    resolver: zodResolver(financeiroSchema),
    defaultValues: {
      tipo: 'receita',
      numero_parcelas: 1,
      ...defaultValues,
    },
  });

  const numeroParcelas = useWatch({ control, name: 'numero_parcelas' }) ?? 1;
  const valorTotal = useWatch({ control, name: 'valor_total' }) ?? 0;
  const tipo = useWatch({ control, name: 'tipo' });

  const valorParcela =
    numeroParcelas > 0 && valorTotal > 0 ? valorTotal / numeroParcelas : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* Processo */}
      <Controller
        name="processo_id"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2 w-full text-left">
            <label className="input-label" htmlFor="processo_id">
              Processo
            </label>
            <select
              id="processo_id"
              className={`input-base ${errors.processo_id ? 'input-error' : ''}`}
              value={field.value ?? ''}
              onChange={e => field.onChange(Number(e.target.value))}
            >
              <option value="">Selecione um processo</option>
              {processos.map(processo => (
                <option key={processo.id} value={processo.id}>
                  {processo.numero_processo ?? processo.clientes?.nome ?? processo.nome_partes}
                </option>
              ))}
            </select>
            {errors.processo_id && (
              <span className="input-error-msg">{errors.processo_id.message}</span>
            )}
          </div>
        )}
      />

      {/* Tipo */}
      <div className="flex flex-col gap-2 w-full text-left">
        <label className="input-label">Tipo</label>
        <div className="flex gap-3">
          <label className="processo-tipo-option">
            <input
              type="radio"
              value="receita"
              {...register('tipo')}
              className="hidden"
            />
            <span className={`processo-tipo-btn ${tipo === 'receita' ? 'processo-tipo-btn-active' : ''}`}>
              Receita
            </span>
          </label>
          <label className="processo-tipo-option">
            <input
              type="radio"
              value="despesa"
              {...register('tipo')}
              className="hidden"
            />
            <span className={`processo-tipo-btn ${tipo === 'despesa' ? 'processo-tipo-btn-active' : ''}`}>
              Despesa
            </span>
          </label>
        </div>
      </div>

      {/* Descrição */}
      <Textarea
        label="Descrição"
        placeholder="Ex: Honorários advocatícios referente ao processo..."
        rows={3}
        {...register('descricao')}
        error={errors.descricao?.message}
      />

      {/* Valor Total */}
      <Controller
        name="valor_total"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2 w-full text-left">
            <label className="input-label" htmlFor="valor_total">
              Valor Total
            </label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix-symbol">R$</span>
              <input
                id="valor_total"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className={`input-with-prefix ${errors.valor_total ? 'input-error' : ''}`}
                value={field.value ?? ''}
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </div>
            {errors.valor_total && (
              <span className="input-error-msg">{errors.valor_total.message}</span>
            )}
          </div>
        )}
      />

      {/* Número de Parcelas */}
      <Controller
        name="numero_parcelas"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2 w-full text-left">
            <label className="input-label" htmlFor="numero_parcelas">
              Número de Parcelas
            </label>
            <input
              id="numero_parcelas"
              type="number"
              min="1"
              max="60"
              className={`input-base ${errors.numero_parcelas ? 'input-error' : ''}`}
              value={field.value === 0 ? '' : field.value}
              onChange={e => {
                const val = e.target.value;
                field.onChange(val === '' ? 0 : parseInt(val));
              }}
            />
            {errors.numero_parcelas && (
              <span className="input-error-msg">{errors.numero_parcelas.message}</span>
            )}
          </div>
        )}
      />

      {/* Preview do valor por parcela */}
      {valorParcela > 0 && (
        <div className="financeiro-preview">
          <span className="text-sm text-lawfy-text-soft">Valor por parcela:</span>
          <span className="text-sm font-semibold text-lawfy-primary">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(valorParcela)}
          </span>
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" loading={isLoading}>
          Salvar Contrato
        </Button>
      </div>
    </form>
  );
}