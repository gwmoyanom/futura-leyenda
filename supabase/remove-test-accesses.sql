-- Removes old demo/test accounts if they were inserted before going live.
-- Safe criteria: only deletes accounts with known demo passwords or example.com emails.

delete from public.users
where password_hash in ('admin123', 'pass123')
   or email in (
    'admin@example.com',
    'carlos@example.com',
    'ana@example.com',
    'pedro@example.com'
  );
