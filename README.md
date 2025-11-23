# Patrulha de Próprios PBH

Sistema de monitoramento e registro de visitas a próprios municipais da Guarda Civil Municipal de Belo Horizonte.

## Funcionalidades

- **Agente:**
  - Login simplificado (Viatura/Agente).
  - Geolocalização em tempo real.
  - Simulação de rota automática por Regional.
  - Registro automático de visitas a próprios (escolas, postos de saúde, etc.) ao se aproximar (Geofencing).
  - Visualização de rota e status no mapa.

- **Gestor:**
  - Dashboard em tempo real.
  - Monitoramento de múltiplas viaturas simultâneas.
  - Filtros por Regional, Viatura e Data.
  - Relatórios em PDF e gráficos estatísticos.

## Como rodar localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:5173` no navegador.

## Tecnologias

- React + Vite
- TypeScript
- Leaflet (Mapas)
- Tailwind CSS (Estilização)
- Recharts (Gráficos)
- jsPDF (Relatórios)

## Estrutura de Dados

Os dados dos próprios foram extraídos de base oficial da PBH e as coordenadas são simuladas em torno dos centros regionais para fins de demonstração. Em produção, deve-se conectar a uma API real de geocoding ou banco de dados geoespacial.
