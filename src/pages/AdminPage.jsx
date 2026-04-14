import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus, PackageOpen, Tag } from 'lucide-react';

// ─── Formulário de Produto ────────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name: '', description: '', price: '', stock: '', category: '', is_active: true,
};

function ProductForm({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState(product ?? EMPTY_PRODUCT);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('stock', form.stock);
      fd.append('category', form.category);
      fd.append('is_active', form.is_active);
      if (imageFile) fd.append('image', imageFile);

      if (product) {
        await api.patchForm(`/products/${product.id}/`, fd);
      } else {
        await api.postForm('/products/', fd);
      }
      onSave();
    } catch (err) {
      const msgs = Object.values(err).flat().join(' ');
      setError(msgs || 'Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="p-name">Nome *</Label>
        <Input id="p-name" name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="p-desc">Descrição</Label>
        <textarea
          id="p-desc"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="p-price">Preço (R$) *</Label>
          <Input
            id="p-price" name="price" type="number" step="0.01" min="0"
            value={form.price} onChange={handleChange} required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-stock">Estoque *</Label>
          <Input
            id="p-stock" name="stock" type="number" min="0"
            value={form.stock} onChange={handleChange} required
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="p-cat">Categoria *</Label>
        <select
          id="p-cat"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Selecione...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label>Imagem</Label>
        <div className="flex items-center gap-3">
          {preview && (
            <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg border" />
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current.click()}>
            {preview ? 'Trocar imagem' : 'Escolher imagem'}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="p-active"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
          className="w-4 h-4 accent-terracota"
        />
        <Label htmlFor="p-active" className="cursor-pointer">Produto ativo (visível na loja)</Label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading} className="btn-terracota">
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Formulário de Categoria ──────────────────────────────────────────────────
function CategoryForm({ category, onSave, onClose }) {
  const [form, setForm] = useState(category ?? { name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (category) {
        await api.patch(`/categories/${category.id}/`, form);
      } else {
        await api.post('/categories/', form);
      }
      onSave();
    } catch (err) {
      const msgs = Object.values(err).flat().join(' ');
      setError(msgs || 'Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="c-name">Nome *</Label>
        <Input id="c-name" name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="c-desc">Descrição</Label>
        <Input id="c-desc" name="description" value={form.description} onChange={handleChange} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading} className="btn-terracota">
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productDialog, setProductDialog] = useState({ open: false, item: null });
  const [categoryDialog, setCategoryDialog] = useState({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, item: null });

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.get('/products/'),
        api.get('/categories/'),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openDeleteDialog = (type, item) =>
    setDeleteDialog({ open: true, type, item });

  const handleDelete = async () => {
    const { type, item } = deleteDialog;
    try {
      await api.delete(`/${type}/${item.id}/`);
      load();
    } catch {
      // silencioso
    } finally {
      setDeleteDialog({ open: false, type: null, item: null });
    }
  };

  const categoryName = (id) =>
    categories.find((c) => c.id === id)?.name ?? '—';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-playfair font-bold text-marrom-linho mb-8">
        Painel Administrativo
      </h1>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="gap-2">
            <PackageOpen className="w-4 h-4" /> Produtos
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="w-4 h-4" /> Categorias
          </TabsTrigger>
        </TabsList>

        {/* ── ABA PRODUTOS ─────────────────────────────────── */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">{products.length} produto(s)</p>
            <Button
              className="btn-terracota gap-2"
              onClick={() => setProductDialog({ open: true, item: null })}
            >
              <Plus className="w-4 h-4" /> Novo produto
            </Button>
          </div>

          {loading ? (
            <p className="text-center py-12 text-muted-foreground">Carregando...</p>
          ) : products.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">Nenhum produto cadastrado.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-14">Img</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Preço</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estoque</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="px-4 py-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-rosa-cha rounded-lg flex items-center justify-center text-lg">🧵</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-marrom-linho">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{categoryName(p.category)}</td>
                      <td className="px-4 py-3 text-terracota font-semibold">
                        R$ {Number(p.price).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {p.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setProductDialog({ open: true, item: p })}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-marrom-linho transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog('products', p)}
                            className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── ABA CATEGORIAS ───────────────────────────────── */}
        <TabsContent value="categories">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">{categories.length} categoria(s)</p>
            <Button
              className="btn-terracota gap-2"
              onClick={() => setCategoryDialog({ open: true, item: null })}
            >
              <Plus className="w-4 h-4" /> Nova categoria
            </Button>
          </div>

          {categories.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">Nenhuma categoria cadastrada.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="px-4 py-3 font-medium text-marrom-linho">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.description || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCategoryDialog({ open: true, item: c })}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-marrom-linho transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog('categories', c)}
                            className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Modal produto ─────────────────────────────────── */}
      <Dialog
        open={productDialog.open}
        onOpenChange={(v) => !v && setProductDialog({ open: false, item: null })}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-marrom-linho">
              {productDialog.item ? 'Editar produto' : 'Novo produto'}
            </DialogTitle>
          </DialogHeader>
          {productDialog.open && (
            <ProductForm
              key={productDialog.item?.id ?? 'new'}
              product={productDialog.item}
              categories={categories}
              onSave={() => { setProductDialog({ open: false, item: null }); load(); }}
              onClose={() => setProductDialog({ open: false, item: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal categoria ───────────────────────────────── */}
      <Dialog
        open={categoryDialog.open}
        onOpenChange={(v) => !v && setCategoryDialog({ open: false, item: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-marrom-linho">
              {categoryDialog.item ? 'Editar categoria' : 'Nova categoria'}
            </DialogTitle>
          </DialogHeader>
          {categoryDialog.open && (
            <CategoryForm
              key={categoryDialog.item?.id ?? 'new'}
              category={categoryDialog.item}
              onSave={() => { setCategoryDialog({ open: false, item: null }); load(); }}
              onClose={() => setCategoryDialog({ open: false, item: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirmação de exclusão ───────────────────────── */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(v) => !v && setDeleteDialog({ open: false, type: null, item: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{' '}
              <strong>"{deleteDialog.item?.name}"</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
