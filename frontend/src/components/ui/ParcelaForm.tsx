import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parcelaSchema, type ParcelaFormData } from '../../lib/validations/parcela';
import { Button } from './Button';
import type { Parcela } from '../../types/financeiro';

interface ParcelaFormProps {
  onSubmit: (data: ParcelaFormData) => Promise<void>;
  isLoading: boolean;
  defaultValues?: Partial<Parcela>;
}

export function ParcelaForm({ onSubmit, isLoading, defaultValues }: ParcelaFormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ParcelaFormData>({
    resolver: zodResolver(parcelaSchema),
    defaultValues: {
      valor_parcela: defaultValues?.valor_parcela ?? 0,
      data_vencimento: defaultValues?.data_vencimento ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Valor da Parcela com Máscara Profissional */}
      <Controller
        name="valor_parcela"
        control={control}
        render={({ field }) => {
          // Formata o valor numérico para exibição visual (ex: 1250.5 -> 1.250,50)
          const displayValue = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(field.value || 0);

          return (
            <div className="flex flex-col gap-2 w-full text-left">
              <label className="input-label" htmlFor="valor_parcela">
                Valor da Parcela
              </label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix-symbol">R$</span>
                <input
                  id="valor_parcela"
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  className={`input-with-prefix ${errors.valor_parcela ? 'input-error' : ''}`}
                  // Se o valor for 0 e o usuário não digitou nada, mostramos vazio
                  value={field.value === 0 ? '' : displayValue}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
                    const floatValue = Number(rawValue) / 100; // Transforma centavos em float
                    field.onChange(floatValue); // Salva como número no formulário
                  }}
                />
              </div>
              {errors.valor_parcela && (
                <span className="input-error-msg">{errors.valor_parcela.message}</span>
              )}
            </div>
          );
        }}
      />

      {/* Data de Vencimento */}
      <Controller
        name="data_vencimento"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2 w-full text-left">
            <label className="input-label" htmlFor="data_vencimento">
              Data de Vencimento
            </label>
            <input
              id="data_vencimento"
              type="date"
              className={`input-base ${errors.data_vencimento ? 'input-error' : ''}`}
              value={field.value ?? ''}
              onChange={e => field.onChange(e.target.value)}
            />
            {errors.data_vencimento && (
              <span className="input-error-msg">{errors.data_vencimento.message}</span>
            )}
          </div>
        )}
      />

      <div className="pt-2">
        <Button type="submit" loading={isLoading}>
          Salvar Parcela
        </Button>
      </div>
    </form>
  );
}