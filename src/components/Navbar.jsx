import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ cartItemsCount = 0, onCartClick, onAuthOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Início', href: '#home' },
    { label: 'Loja', href: '#loja' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Contato', href: '#contato' },
  ];

  const handleAnchorClick = (e, hash) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <nav className="bg-off-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-marrom-linho">
              Dety Costureira
            </h1>
            <p className="text-xs text-verde-oliva">& Artesanatos</p>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="text-marrom-linho hover:text-terracota transition-colors font-lato font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Carrinho + Auth + Menu Mobile */}
          <div className="flex items-center space-x-2">
            {/* Carrinho */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-marrom-linho hover:text-terracota transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-terracota text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Autenticação */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 text-marrom-linho hover:text-terracota transition-colors">
                    <User className="w-6 h-6" />
                    <span className="hidden md:inline text-sm font-lato font-medium">
                      {user.first_name || user.username}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-marrom-linho">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.is_staff && (
                    <DropdownMenuItem asChild className="cursor-pointer text-terracota font-medium">
                      <Link to="/painel">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/perfil">
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/meus-pedidos">
                      <Package className="w-4 h-4 mr-2" />
                      Meus Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onAuthOpen}
                className="hidden md:flex border-terracota text-terracota hover:bg-terracota hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-marrom-linho hover:text-terracota transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="text-marrom-linho hover:text-terracota transition-colors font-lato py-2"
                >
                  {item.label}
                </a>
              ))}
              {!user && (
                <button
                  onClick={() => { onAuthOpen(); setIsMenuOpen(false); }}
                  className="text-left text-terracota font-lato py-2 font-medium"
                >
                  Entrar / Cadastrar
                </button>
              )}
              {user?.is_staff && (
                <Link
                  to="/painel"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-terracota font-lato py-2 font-medium"
                >
                  Painel Admin
                </Link>
              )}
              {user && (
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="text-left text-red-500 font-lato py-2"
                >
                  Sair
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
