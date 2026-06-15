-- =============================================================================
-- Lawfy — Row Level Security Policies
-- Aplicar no Supabase SQL Editor para recriar todas as políticas de isolamento
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CLIENTE_PERMISSOES
-- Tabela de compartilhamento: relaciona um cliente com usuários que têm acesso
-- Nota: leitura_propria e select_own são duplicatas — manter apenas select_own
-- -----------------------------------------------------------------------------

ALTER TABLE cliente_permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON cliente_permissoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON cliente_permissoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON cliente_permissoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON cliente_permissoes
  FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- CLIENTES
-- Usuário vê/edita seus próprios clientes + clientes compartilhados com ele
-- -----------------------------------------------------------------------------

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_proprio" ON clientes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "select_proprio_ou_compartilhado" ON clientes
  FOR SELECT USING (
    user_id = auth.uid()
    OR id IN (
      SELECT cliente_id FROM cliente_permissoes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "update_proprio_ou_compartilhado" ON clientes
  FOR UPDATE USING (
    user_id = auth.uid()
    OR id IN (
      SELECT cliente_id FROM cliente_permissoes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "delete_proprio" ON clientes
  FOR DELETE USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- PROCESSOS
-- Acesso via cliente: próprios ou compartilhados
-- -----------------------------------------------------------------------------

ALTER TABLE processos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_via_cliente" ON processos
  FOR ALL
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE user_id = auth.uid()
      UNION
      SELECT cliente_id FROM cliente_permissoes WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    cliente_id IN (
      SELECT id FROM clientes WHERE user_id = auth.uid()
      UNION
      SELECT cliente_id FROM cliente_permissoes WHERE user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- FINANCEIRO
-- Acesso via processo → cliente: próprios ou compartilhados
-- -----------------------------------------------------------------------------

ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_via_processo" ON financeiro
  FOR ALL
  USING (
    processo_id IN (
      SELECT p.id FROM processos p
      WHERE p.cliente_id IN (
        SELECT id FROM clientes WHERE user_id = auth.uid()
        UNION
        SELECT cliente_id FROM cliente_permissoes WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    processo_id IN (
      SELECT p.id FROM processos p
      WHERE p.cliente_id IN (
        SELECT id FROM clientes WHERE user_id = auth.uid()
        UNION
        SELECT cliente_id FROM cliente_permissoes WHERE user_id = auth.uid()
      )
    )
  );

-- -----------------------------------------------------------------------------
-- PARCELAS
-- Acesso via financeiro → processo → cliente: próprios ou compartilhados
-- -----------------------------------------------------------------------------

ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_via_financeiro" ON parcelas
  FOR ALL
  USING (
    financeiro_id IN (
      SELECT f.id FROM financeiro f
      WHERE f.processo_id IN (
        SELECT p.id FROM processos p
        WHERE p.cliente_id IN (
          SELECT id FROM clientes WHERE user_id = auth.uid()
          UNION
          SELECT cliente_id FROM cliente_permissoes WHERE user_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    financeiro_id IN (
      SELECT f.id FROM financeiro f
      WHERE f.processo_id IN (
        SELECT p.id FROM processos p
        WHERE p.cliente_id IN (
          SELECT id FROM clientes WHERE user_id = auth.uid()
          UNION
          SELECT cliente_id FROM cliente_permissoes WHERE user_id = auth.uid()
        )
      )
    )
  );
