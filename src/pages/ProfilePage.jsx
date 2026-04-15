import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile: { phone: '', address: '', number: '', city: '', state: '', cep: '' },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email ?? '',
        profile: {
          phone: user.profile?.phone ?? '',
          address: user.profile?.address ?? '',
          number: user.profile?.number ?? '',
          city: user.profile?.city ?? '',
          state: user.profile?.state ?? '',
          cep: user.profile?.cep ?? '',
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['phone', 'address', 'number', 'city', 'state', 'cep'].includes(name)) {
      setFormData((prev) => ({ ...prev, profile: { ...prev.profile, [name]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    try {
      await api.put('/auth/profile/', formData);
      setSuccess(true);
    } catch (err) {
      setError(err?.detail || 'Erro ao salvar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-playfair font-bold text-marrom-linho mb-8">
        Meu Perfil
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-playfair font-semibold text-marrom-linho">
            Dados pessoais
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="first_name">Nome</Label>
              <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last_name">Sobrenome</Label>
              <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" value={formData.profile.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-playfair font-semibold text-marrom-linho">
            Endereço
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="address">Endereço (rua/avenida)</Label>
              <Input id="address" name="address" value={formData.profile.address} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="number">Número</Label>
              <Input id="number" name="number" value={formData.profile.number} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" value={formData.profile.city} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" name="state" maxLength={2} value={formData.profile.state} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" name="cep" value={formData.profile.cep} onChange={handleChange} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-verde-oliva">Perfil atualizado com sucesso!</p>}

        <Button type="submit" disabled={loading} className="w-full btn-terracota py-6 text-lg">
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
