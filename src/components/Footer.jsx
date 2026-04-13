import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-marrom-linho text-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-2xl font-playfair font-bold mb-4">
              Dety Costureira
            </h3>
            <p className="text-rosa-cha mb-2">& Artesanatos</p>
            <p className="text-sm text-creme-algodao">
              Peças artesanais feitas com amor e dedicação. 
              Cada produto é único e carrega a essência do trabalho manual.
            </p>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-xl font-playfair font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-creme-algodao">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-creme-algodao">
                <Mail className="w-4 h-4" />
                <span>contato@detycostureira.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-creme-algodao">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="text-xl font-playfair font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-rosa-cha hover:bg-terracota rounded-full transition-colors"
              >
                <Instagram className="w-5 h-5 text-marrom-linho" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-rosa-cha hover:bg-terracota rounded-full transition-colors"
              >
                <Facebook className="w-5 h-5 text-marrom-linho" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-rosa-cha mt-8 pt-8 text-center">
          <p className="text-sm text-creme-algodao">
            © {new Date().getFullYear()} Dety Costureira & Artesanatos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

