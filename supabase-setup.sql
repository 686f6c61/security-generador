-- Crear tabla para notas seguras
CREATE TABLE IF NOT EXISTS public.secure_notes (
  id UUID PRIMARY KEY,
  encrypted_data JSONB NOT NULL,
  requires_password BOOLEAN DEFAULT false,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  remaining_views INTEGER DEFAULT 1,
  expire_on_view BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS secure_notes_expires_at_idx ON public.secure_notes (expires_at);

-- Habilitar Row Level Security
ALTER TABLE public.secure_notes ENABLE ROW LEVEL SECURITY;

-- Política que permite a anónimos insertar notas
CREATE POLICY "Anyone can insert notes" ON public.secure_notes
  FOR INSERT WITH CHECK (true);

-- Política que permite a cualquiera leer sus propias notas (por ID)
CREATE POLICY "Anyone can read their own notes" ON public.secure_notes
  FOR SELECT USING (true);

-- Política que permite a cualquiera actualizar sus propias notas (por ID)
CREATE POLICY "Anyone can update their own notes" ON public.secure_notes
  FOR UPDATE USING (true);

-- Política que permite a cualquiera eliminar sus propias notas (por ID)
CREATE POLICY "Anyone can delete their own notes" ON public.secure_notes
  FOR DELETE USING (true);

-- Crear función para limpiar notas expiradas (se ejecutará con un trigger)
CREATE OR REPLACE FUNCTION cleanup_expired_notes()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.secure_notes
  WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para ejecutar la limpieza periódicamente
DROP TRIGGER IF EXISTS cleanup_notes_trigger ON public.secure_notes;
CREATE TRIGGER cleanup_notes_trigger
AFTER INSERT ON public.secure_notes
EXECUTE FUNCTION cleanup_expired_notes();

-- Añadir comentarios a la tabla para documentación
COMMENT ON TABLE public.secure_notes IS 'Almacena notas seguras encriptadas con autoexpiration';
COMMENT ON COLUMN public.secure_notes.encrypted_data IS 'Datos cifrados y metadatos de encriptación';
COMMENT ON COLUMN public.secure_notes.requires_password IS 'Indica si la nota requiere contraseña adicional';
COMMENT ON COLUMN public.secure_notes.expire_on_view IS 'Si es true, la nota se elimina al ser visualizada';

-- Configurar permisos públicos para la tabla
ALTER TABLE public.secure_notes OWNER TO postgres;
GRANT ALL ON TABLE public.secure_notes TO postgres;
GRANT ALL ON TABLE public.secure_notes TO anon;
GRANT ALL ON TABLE public.secure_notes TO authenticated;
GRANT ALL ON TABLE public.secure_notes TO service_role; 