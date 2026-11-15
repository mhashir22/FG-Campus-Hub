create policy "Anyone can view blog covers" on storage.objects
  for select to anon, authenticated using (bucket_id = 'blog-covers');
create policy "Admins can upload blog covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-covers' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can update blog covers" on storage.objects
  for update to authenticated using (bucket_id = 'blog-covers' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete blog covers" on storage.objects
  for delete to authenticated using (bucket_id = 'blog-covers' and public.has_role(auth.uid(), 'admin'));