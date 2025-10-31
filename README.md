# Sistema de Visualização de Indicadores de Saúde - Mato Grosso do Sul

## 📋 Descrição

Sistema web interativo para visualização de indicadores de saúde dos 79 municípios de Mato Grosso do Sul, organizados por 9 microrregiões. O sistema combina dados em CSV com mapas GeoJSON para gerar visualizações SVG interativas.

## 🏗️ Arquitetura

### Frontend (Web)
- **HTML5**: Interface semântica e acessível
- **CSS3**: Design responsivo com animações
- **JavaScript ES6+**: Interatividade e manipulação de dados
- **SVG**: Mapas vetoriais interativos

### Backend (Python)
- **Python 3**: Processamento de dados e geração de SVG
- **Pandas**: Manipulação de dados CSV
- **JSON**: APIs de dados estruturados
- **XML ElementTree**: Geração de SVG

## 📁 Estrutura do Projeto

```
Mapa/
├── index.html                 # Página inicial
├── mapa.py                   # Script principal Python (LEGACY)
├── gerar_todos_svgs.py       # Gerador batch de SVGs
├── src/
│   ├── python/
│   │   └── mapa.py           # Gerador SVG principal
│   ├── html/
│   │   ├── filtros.html      # Interface de filtros
│   │   └── mapa.html         # Visualização do mapa
│   ├── css/
│   │   ├── filtros.css       # Estilos dos filtros
│   │   └── mapa.css          # Estilos do mapa
│   ├── js/
│   │   ├── filtros.js        # Lógica dos filtros
│   │   └── mapa.js           # Renderização do mapa
│   ├── svg/                  # SVGs gerados (automático)
│   └── data/                 # JSONs processados (automático)
├── REGIAO/                   # Dados GeoJSON das microrregiões
│   ├── baixopantanal.json
│   ├── centro.json
│   ├── centrosul.json
│   ├── leste.json
│   ├── nordeste.json
│   ├── norte.json
│   ├── pantanal.json
│   ├── sudeste.json
│   └── sulfronteira.json
├── EQUIPES MULTIPROFISSIONAIS NA APS/
│   └── AÇÕES INTERPROFISSIONAIS DA EMULTI/
├── ESTRATÉGIA SAÚDE DA FAMILIA NA APS/
│   ├── DESENVOLVIMENTO INFANTIL/
│   ├── DIABETES/
│   ├── GESTANTE E PUÉRPERA/
│   ├── HIPERTENSÃO ARTERIAL/
│   ├── MAIS ACESSO/
│   ├── PESSOA IDOSA/
│   └── PREVENÇÃO DO CÂNCER NA MULHER/
└── SAÚDE BUCAL NA APS/
    ├── 1ª CONSULTA ODONTOLÓGICA/
    ├── ESCOVAÇÃO SUPERVISIONADA/
    ├── PROCEDIMENTOS ODONTOLÓGICOS PREVENTIVOS/
    ├── TAXA DE EXODONTIAS/
    ├── TRATAMENTO ODONTOLÓGICO CONCLUIDO/
    └── TRATAMENTO RESTAURADOR ATRAUMATICO/
```

## 🚀 Como Usar

### 1. Preparação do Ambiente

```bash
# Requisitos
Python 3.7+
Navegador web moderno (Chrome, Firefox, Edge, Safari)

# Dependências Python (se necessário)
pip install pandas
```

### 2. Gerar SVGs dos Indicadores

#### Opção A: Gerar Todos de Uma Vez
```bash
python gerar_todos_svgs.py
```

#### Opção B: Gerar Indicador Específico
```bash
python src/python/mapa.py INDICADOR
```

**Indicadores Disponíveis:**
- `emulti-acoes` - Ações Interprofissionais da eMulti
- `emulti-media` - Média de Atendimento da eMulti por Pessoa
- `esf-desenvolvimento` - Desenvolvimento Infantil
- `esf-diabetes` - Cuidado da pessoa com Diabetes
- `esf-gestante` - Gestante e Puérpera
- `esf-hipertensao` - Hipertensão Arterial
- `esf-mais-acesso` - Mais Acesso
- `esf-idosa` - Pessoa Idosa
- `esf-cancer-mulher` - Prevenção do Câncer na Mulher
- `sb-primeira-consulta` - 1ª Consulta Odontológica
- `sb-escovacao` - Escovação Supervisionada
- `sb-preventivos` - Procedimentos Odontológicos Preventivos
- `sb-exodontias` - Taxa de Exodontias
- `sb-tratamento-concluido` - Tratamento Odontológico Concluído
- `sb-tratamento-atraumatico` - Tratamento Restaurador Atraumático

### 3. Iniciar Servidor Web

```bash
python -m http.server 8080
```

### 4. Acessar a Aplicação

Abra o navegador em: `http://localhost:8080`

## 🎯 Funcionalidades

### Interface de Filtros
- ✅ Seleção de indicador de saúde
- ✅ Filtro por microrregião
- ✅ Período temporal (quando disponível)
- ✅ Tipo de visualização

### Visualização do Mapa
- ✅ Mapa SVG interativo
- ✅ Cores baseadas em scores dos indicadores
- ✅ Tooltips informativos
- ✅ Zoom e pan
- ✅ Legenda dinâmica
- ✅ Informações detalhadas por município

### Recursos Técnicos
- ✅ Carregamento assíncrono de dados
- ✅ Cache inteligente
- ✅ Responsividade mobile
- ✅ Acessibilidade (ARIA)
- ✅ Tratamento de erros
- ✅ Loading states

## 📊 Formato dos Dados

### CSV (Entrada)
```
Linha 16+: 500025 / ALCINÓPOLIS | Score | [outras colunas]
```

### GeoJSON (Microrregiões)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "NM_MUN": "ALCINÓPOLIS",
        "CD_MUN": 500025
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    }
  ]
}
```

### JSON (Saída Processada)
```json
{
  "indicador": "esf-diabetes",
  "nome": "Cuidado da pessoa com Diabetes",
  "municipios": {
    "ALCINÓPOLIS": {
      "score": 85.5,
      "dados_adicionais": {...}
    }
  },
  "estatisticas": {
    "min": 20.0,
    "max": 100.0,
    "media": 67.3
  }
}
```

## 🎨 Personalização

### Cores do Mapa
Edite `src/python/mapa.py`, função `obter_cor_por_score()`:
```python
def obter_cor_por_score(self, score):
    if score >= 80: return "#2E7D32"    # Verde escuro - Excelente
    elif score >= 70: return "#66BB6A"  # Verde - Bom
    elif score >= 50: return "#FFA726"  # Laranja - Regular
    elif score >= 30: return "#FF7043"  # Vermelho claro - Ruim
    else: return "#D32F2F"              # Vermelho escuro - Crítico
```

### Estilos CSS
- `src/css/filtros.css` - Interface de filtros
- `src/css/mapa.css` - Visualização do mapa

### Lógica JavaScript
- `src/js/filtros.js` - Controles e navegação
- `src/js/mapa.js` - Renderização e interatividade

## 🐛 Solução de Problemas

### Erro 404 ao Carregar SVG
```bash
# Gere o SVG do indicador
python src/python/mapa.py NOME_DO_INDICADOR
```

### Dados Não Carregam
1. Verifique se o servidor HTTP está rodando
2. Confirme se os arquivos CSV estão nas pastas corretas
3. Verifique o console do navegador para erros

### SVG Não Renderiza
1. Confirme se o arquivo SVG foi gerado em `/src/svg/`
2. Verifique se há erros no console JavaScript
3. Teste com outro indicador

### Performance Lenta
1. Use filtros para reduzir dados carregados
2. Gere apenas SVGs necessários
3. Verifique conexão de rede local

## 📈 Estatísticas do Sistema

- **79 municípios** de Mato Grosso do Sul
- **9 microrregiões** administrativas
- **15 indicadores** de saúde diferentes
- **3 categorias**: eMulti, ESF, Saúde Bucal
- **Responsivo**: Desktop, tablet, mobile
- **Performance**: Carregamento < 3s

## 🔄 Atualizações

Para atualizar dados:
1. Substitua arquivos CSV nas respectivas pastas
2. Execute `python gerar_todos_svgs.py`
3. Reinicie o servidor web

## 📝 Notas Técnicas

- SVGs são gerados sob demanda
- Cache automático de dados JSON
- Coordenadas em sistema de projeção Web Mercator
- Scores normalizados 0-100
- Compatível com Python 3.7+
- Testes realizados em Chrome 118+, Firefox 119+, Edge 118+

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique este README
2. Consulte logs no terminal
3. Examine console do navegador (F12)
4. Teste com dados de exemplo

---

**Desenvolvido para visualização de indicadores de saúde pública**  
*Sistema integrado Python + JavaScript para análise geoespacial*#   m i n i s t e r i o  
 