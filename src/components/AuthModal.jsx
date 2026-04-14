import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AuthModal = ({ open, onClose }) => {
  const { login, register } = useAuth();
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const form = new FormData(e.target);
    try {
      await login(form.get('username'), form.get('password'));
      onClose();
    } catch (err) {
      setLoginError(err?.detail || 'Usuário ou senha inválidos.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);
    const form = new FormData(e.target);
    const data = {
      username: form.get('username'),
      email: form.get('email'),
      first_name: form.get('first_name'),
      last_name: form.get('last_name'),
      password: form.get('password'),
      password2: form.get('password2'),
    };
    try {
      await register(data);
      onClose();
    } catch (err) {
      const msgs = [];
      if (err?.username) msgs.push(...err.username);
      if (err?.email) msgs.push(...err.email);
      if (err?.password) msgs.push(...err.password);
      if (err?.password2) msgs.push(...err.password2);
      if (err?.non_field_errors) msgs.push(...err.non_field_errors);
      setRegisterError(msgs.length ? msgs.join(' ') : 'Erro ao criar conta.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-marrom-linho text-2xl text-center">
            Minha Conta
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-1">
                <Label htmlFor="login-username">Usuário</Label>
                <Input id="login-username" name="username" required autoComplete="username" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-500">{loginError}</p>
              )}
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full btn-terracota"
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>

          {/* CADASTRO */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="reg-first">Nome</Label>
                  <Input id="reg-first" name="first_name" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-last">Sobrenome</Label>
                  <Input id="reg-last" name="last_name" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-email">E-mail</Label>
                <Input id="reg-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-username">Usuário</Label>
                <Input id="reg-username" name="username" required autoComplete="username" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-password">Senha</Label>
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-password2">Confirmar senha</Label>
                <Input
                  id="reg-password2"
                  name="password2"
                  type="password"
                  required
                  autoComplete="new-password"
                />
              </div>
              {registerError && (
                <p className="text-sm text-red-500">{registerError}</p>
              )}
              <Button
                type="submit"
                disabled={registerLoading}
                className="w-full btn-terracota"
              >
                {registerLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
