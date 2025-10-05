-- Migración 005: Sistema de Branches para Chat Maestro
-- Habilita el manejo de ramas en conversaciones para branching funcional

-- Crear tabla branches
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Agregar columna branch_id a mensajes (cada mensaje pertenece a una rama)
alter table messages add column if not exists branch_id uuid references branches(id);

-- Índices para optimizar queries
create index if not exists ix_branches_thread on branches(thread_id);
create index if not exists ix_messages_thread_branch on messages(thread_id, branch_id);
create index if not exists ix_branches_thread_default on branches(thread_id, is_default);

-- Constraint para asegurar nombre único por hilo (case-insensitive)
create unique index if not exists ix_branches_unique_name_per_thread 
  on branches(thread_id, lower(name));

-- Constraint para asegurar solo una rama default por hilo
create unique index if not exists ix_branches_one_default_per_thread 
  on branches(thread_id) where is_default = true;

-- RLS para branches
alter table branches enable row level security;

create policy p_branches_owner on branches 
  using (
    thread_id in (select id from threads where owner = auth.uid())
  ) 
  with check (
    thread_id in (select id from threads where owner = auth.uid())
  );

-- Función para crear rama default al crear thread
create or replace function create_default_branch_for_thread()
returns trigger as $$
begin
  insert into branches (thread_id, name, is_default)
  values (new.id, 'main', true);
  return new;
end;
$$ language plpgsql;

-- Trigger para crear rama main automáticamente
drop trigger if exists tr_create_default_branch on threads;
create trigger tr_create_default_branch
  after insert on threads
  for each row
  execute function create_default_branch_for_thread();

-- Función para validar que no se elimine la única rama de un hilo
create or replace function validate_branch_deletion()
returns trigger as $$
declare
  branch_count integer;
begin
  -- Contar ramas restantes en el hilo
  select count(*) into branch_count
  from branches 
  where thread_id = old.thread_id and id != old.id;
  
  -- No permitir eliminar si es la única rama
  if branch_count = 0 then
    raise exception 'Cannot delete the only branch in a thread';
  end if;
  
  return old;
end;
$$ language plpgsql;

-- Trigger para validar eliminación de ramas
drop trigger if exists tr_validate_branch_deletion on branches;
create trigger tr_validate_branch_deletion
  before delete on branches
  for each row
  execute function validate_branch_deletion();

-- Migrar mensajes existentes a la rama main de su hilo
do $$
declare
  msg record;
  main_branch_id uuid;
begin
  for msg in 
    select distinct thread_id 
    from messages 
    where branch_id is null
  loop
    -- Obtener la rama main del hilo
    select id into main_branch_id
    from branches 
    where thread_id = msg.thread_id and is_default = true
    limit 1;
    
    -- Si no existe, crear una
    if main_branch_id is null then
      insert into branches (thread_id, name, is_default)
      values (msg.thread_id, 'main', true)
      returning id into main_branch_id;
    end if;
    
    -- Actualizar mensajes
    update messages 
    set branch_id = main_branch_id 
    where thread_id = msg.thread_id and branch_id is null;
  end loop;
end $$;

-- Hacer branch_id NOT NULL después de la migración
alter table messages alter column branch_id set not null;

-- Comentarios para documentar la estructura
comment on table branches is 'Ramas de conversación para branching funcional';
comment on column branches.thread_id is 'ID del hilo al que pertenece la rama';
comment on column branches.name is 'Nombre de la rama (único por hilo)';
comment on column branches.is_default is 'Indica si es la rama principal del hilo';
comment on column messages.branch_id is 'ID de la rama a la que pertenece el mensaje';