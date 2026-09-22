-- A signed-in creator may open the recipient link in the same browser.
-- The function still requires both the unguessable share token and the exact
-- intended recipient email, and public tables remain inaccessible.
grant execute on function public.get_shared_agreement(text, text) to authenticated;
