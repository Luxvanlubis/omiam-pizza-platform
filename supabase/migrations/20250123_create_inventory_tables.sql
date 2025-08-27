-- Migration pour créer les tables d'inventaire
-- Créé le: 2025-01-23

-- Table des articles d'inventaire
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  unit VARCHAR(50) DEFAULT 'pcs',
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  supplier VARCHAR(255),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  cost DECIMAL(10,2),
  reason VARCHAR(255),
  batch_number VARCHAR(100),
  employee_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des alertes de stock
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('low_stock', 'out_of_stock', 'overstock')),
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by VARCHAR(100),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON public.inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON public.inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON public.inventory_movements(type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_item_id ON public.inventory_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type ON public.inventory_alerts(type);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at sur inventory_items
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques articles de test
INSERT INTO public.inventory_items (id, name, description, sku, category, unit, current_stock, min_stock, cost_price, selling_price)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Pizza Margherita', 'Pizza classique avec tomate et mozzarella', 'PIZZA-MARG', 'Pizza', 'pcs', 50, 10, 8.50, 12.90),
  ('00000000-0000-0000-0000-000000000002', 'Pizza Pepperoni', 'Pizza avec pepperoni et mozzarella', 'PIZZA-PEPP', 'Pizza', 'pcs', 30, 10, 9.50, 14.90),
  ('00000000-0000-0000-0000-000000000003', 'Coca-Cola 33cl', 'Boisson gazeuse', 'COCA-33', 'Boisson', 'pcs', 100, 20, 1.20, 2.50),
  ('00000000-0000-0000-0000-000000000004', 'Farine Type 00', 'Farine pour pizza', 'FARINE-00', 'Ingrédient', 'kg', 25, 5, 2.50, 0.00),
  ('00000000-0000-0000-0000-000000000005', 'Mozzarella', 'Fromage mozzarella', 'MOZZA', 'Ingrédient', 'kg', 15, 3, 8.90, 0.00)
ON CONFLICT (id) DO NOTHING;

-- Commentaires sur les tables
COMMENT ON TABLE public.inventory_items IS 'Table des articles d''inventaire';
COMMENT ON TABLE public.inventory_movements IS 'Table des mouvements de stock (entrées, sorties, ajustements)';
COMMENT ON TABLE public.inventory_alerts IS 'Table des alertes de stock (stock faible, rupture, etc.)';