import { useState, useEffect, useRef, useCallback } from 'react';
import { Truck, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const formatCep = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
};

const FreteCalculadora = ({ cartItems, cepInicial = '', onSelect, onCepChange }) => {
  const [cep, setCep] = useState(formatCep(cepInicial));
  const [opcoes, setOpcoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const debounceRef = useRef(null);
  const lastCepRef = useRef('');

  const calcular = useCallback(
    async (cepDigits) => {
      if (cepDigits === lastCepRef.current) return;
      lastCepRef.current = cepDigits;

      setLoading(true);
      setError('');
      setOpcoes([]);
      setSelectedId(null);
      onSelect(null);

      try {
        const items = cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        }));
        const resultado = await api.post('/frete/calcular/', {
          cep_destino: cepDigits,
          items,
        });
        setOpcoes(resultado);
      } catch (err) {
        const msg =
          err?.detail ||
          (typeof err === 'object' ? Object.values(err).flat().join(' ') : '') ||
          'Não foi possível calcular o frete.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [cartItems, onSelect],
  );

  useEffect(() => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setOpcoes([]);
      setSelectedId(null);
      setError('');
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calcular(digits), 500);
    return () => clearTimeout(debounceRef.current);
  }, [cep, calcular]);

  // Atualiza se o CEP inicial muda (ex: usuário preenche perfil)
  useEffect(() => {
    if (cepInicial && !cep) {
      setCep(formatCep(cepInicial));
    }
  }, [cepInicial]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (opcao) => {
    setSelectedId(opcao.id);
    onSelect(opcao);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-marrom-linho flex-shrink-0" />
        <span className="text-sm font-semibold text-marrom-linho">Calcular frete</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="CEP (somente números)"
          value={cep}
          onChange={(e) => {
            const formatted = formatCep(e.target.value);
            setCep(formatted);
            onCepChange?.(formatted.replace(/\D/g, ''));
          }}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-terracota"
          maxLength={9}
        />
        {loading && <Loader2 className="w-5 h-5 animate-spin text-terracota self-center flex-shrink-0" />}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {opcoes.length > 0 && (
        <div className="space-y-2">
          {opcoes.map((opcao) => (
            <label
              key={opcao.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedId === opcao.id
                  ? 'border-terracota bg-rosa-cha'
                  : 'border-border bg-background hover:border-terracota/50'
              }`}
            >
              <input
                type="radio"
                name="frete-opcao"
                value={opcao.id}
                checked={selectedId === opcao.id}
                onChange={() => handleSelect(opcao)}
                className="accent-terracota"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-marrom-linho truncate">
                    {opcao.transportadora} — {opcao.servico}
                  </span>
                  <span className="text-sm font-bold text-terracota whitespace-nowrap">
                    R$ {Number(opcao.preco).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Prazo estimado: {opcao.prazo_com_producao} dias úteis
                </p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreteCalculadora;
