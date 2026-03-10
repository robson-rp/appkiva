UPDATE ledger_entries 
SET requires_approval = false, 
    approved_at = created_at, 
    approved_by = created_by 
WHERE entry_type = 'donation' 
  AND requires_approval = true 
  AND approved_at IS NULL;