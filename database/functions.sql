-- =============================================================================
-- Lawfy — Database Functions
-- Aplicar no Supabase SQL Editor
-- =============================================================================

-- -----------------------------------------------------------------------------
-- compartilhar_cliente
-- Substitui todas as permissões de um cliente atomicamente (DELETE + INSERT
-- numa única transação — se o INSERT falhar, o DELETE é revertido)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION compartilhar_cliente(p_cliente_id integer, p_user_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM cliente_permissoes WHERE cliente_id = p_cliente_id;

  IF array_length(p_user_ids, 1) > 0 THEN
    INSERT INTO cliente_permissoes (cliente_id, user_id)
    SELECT p_cliente_id, unnest(p_user_ids);
  END IF;
END;
$$;
