document.addEventListener('DOMContentLoaded', function() {
    const mapaContainer = document.getElementById('mapa-container');
    const legendaContainer = document.getElementById('legenda-container');
    const legendaItems = document.querySelector('.legenda-items');
    const backButton = document.getElementById('back-to-filters');
    const containerMain = document.querySelector('.container');
    
    let currentFilters = null;
    let mapaData = null;
    let svgMapaCarregado = false;

    const ALL_MUNICIPALITIES_MS = [
        'ÁGUA CLARA', 'ALCINÓPOLIS', 'AMAMBAÍ', 'ANASTÁCIO', 'ANAURILÂNDIA', 'ANGÉLICA', 'ANTÔNIO JOÃO',
        'APARECIDA DO TABOADO', 'AQUIDAUANA', 'ARAL MOREIRA', 'BANDEIRANTES', 'BATAGUASSU', 'BATAYPORÃ',
        'BELA VISTA', 'BODOQUENA', 'BONITO', 'BRASILÂNDIA', 'CAARAPÓ', 'CAMAPUÃ', 'CAMPO GRANDE',
        'CARACOL', 'CASSILÂNDIA', 'CHAPADÃO DO SUL', 'CORGUINHO', 'CORONEL SAPUCAIA', 'CORUMBÁ',
        'COSTA RICA', 'COXIM', 'DEODÁPOLIS', 'DOIS IRMÃOS DO BURITI', 'DOURADINA', 'DOURADOS',
        'ELDORADO', 'FÁTIMA DO SUL', 'FIGUEIRÃO', 'GLÓRIA DE DOURADOS', 'GUIA LOPES DA LAGUNA',
        'IGUATEMI', 'INOCÊNCIA', 'ITAPORÃ', 'ITAQUIRAI', 'IVINHEMA', 'JAPORÃ', 'JARAGUARI', 'JARDIM',
        'JATEÍ', 'JUTI', 'LADÁRIO', 'LAGUNA CARAPÃ', 'MARACAJU', 'MIRANDA', 'MUNDO NOVO', 'NAVIRAÍ',
        'NIOAQUE', 'NOVA ALVORADA DO SUL', 'NOVA ANDRADINA', 'NOVO HORIZONTE DO SUL', 'PARAÍSO DAS ÁGUAS',
        'PARANAÍBA', 'PARANHOS', 'PEDRO GOMES', 'PONTA PORÃ', 'PORTO MURTINHO', 'RIBAS DO RIO PARDO',
        'RIO BRILHANTE', 'RIO NEGRO', 'RIO VERDE DE MATO GROSSO', 'ROCHEDO', 'SANTA RITA DO PARDO',
        'SÃO GABRIEL DO OESTE', 'SELVÍRIA', 'SETE QUEDAS', 'SIDROLÂNDIA', 'SONORA', 'TACURU',
        'TAQUARUSSU', 'TERENOS', 'TRÊS LAGOAS', 'VICENTINA'
    ];

    const INDICATOR_PATHS = {
        'emulti-acoes': {
            name: 'Ações Interprofissionais da eMulti',
            folder: 'EQUIPES MULTIPROFISSIONAIS NA APS/AÇÕES INTERPROFISSIONAIS DA EMULTI',
            files: Array.from({ length: 39 }, (_, i) => `relatorio-visao-competencia (${i + 1}).csv`)
        },
        'emulti-media': {
            name: 'Média de Atendimento da eMulti por Pessoa',
            folder: 'EQUIPES MULTIPROFISSIONAIS NA APS/MÉDIA DE ATENDIMENTO DA EMULTI POR PESSOA',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'esf-desenvolvimento': {
            name: 'Desenvolvimento Infantil',
            folder: 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/DESENVOLVIMENTO INFANTIL',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'esf-diabetes': {
            name: 'Cuidado da pessoa com Diabetes',
            folder: 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/DIABETES',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'esf-gestante': {
            name: 'Gestante e Puérpera',
            folder: 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/GESTANTE E PUÉRPERA',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'esf-hipertensao': {
            name: 'Hipertensão Arterial',
            folder: 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/HIPERTENSÃO ARTERIAL',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'esf-mais-acesso': {
            name: 'Mais Acesso',
            folder: 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/MAIS ACESSO',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'esf-idosa': {
            name: 'Pessoa Idosa',
            folder: 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/PESSOA IDOSA',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'esf-cancer-mulher': {
            name: 'Prevenção do Câncer na Mulher',
            folder: 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/PREVENÇÃO DO CÂNCER NA MULHER',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'sb-primeira-consulta': {
            name: '1ª Consulta Odontológica',
            folder: 'SAÚDE BUCAL NA APS/1ª CONSULTA ODONTOLÓGICA',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'sb-escovacao': {
            name: 'Escovação Supervisionada',
            folder: 'SAÚDE BUCAL NA APS/ESCOVAÇÃO SUPERVISIONADA',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'sb-preventivos': {
            name: 'Procedimentos Odontológicos Preventivos',
            folder: 'SAÚDE BUCAL NA APS/PROCEDIMENTOS ODONTOLÓGICOS PREVENTIVOS',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'sb-exodontias': {
            name: 'Taxa de Exodontias',
            folder: 'SAÚDE BUCAL NA APS/TAXA DE EXODONTIAS',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'sb-tratamento-concluido': {
            name: 'Tratamento Odontológico Concluído',
            folder: 'SAÚDE BUCAL NA APS/TRATAMENTO ODONTOLÓGICO CONCLUIDO',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        },
        'sb-tratamento-atraumatico': {
            name: 'Tratamento Restaurador Atraumático',
            folder: 'SAÚDE BUCAL NA APS/TRATAMENTO RESTAURADOR ATRAUMATICO',
            files: ALL_MUNICIPALITIES_MS.map(mun => `${mun}.csv`)
        }
    };

    const REGION_DISPLAY_NAMES = {
        'baixopantanal': 'Baixo Pantanal',
        'centro': 'Centro',
        'centrosul': 'Centro-Sul',
        'leste': 'Leste',
        'nordeste': 'Nordeste',
        'norte': 'Norte',
        'pantanal': 'Pantanal',
        'sudeste': 'Sudeste',
        'sulfronteira': 'Sul Fronteira'
    };

    function showInfo(message, type = 'info', duration = 5000) {
        const existingMessages = document.querySelectorAll('.info-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageElement = document.createElement('div');
        messageElement.className = `info-message info-${type}`;
        messageElement.innerHTML = `
            <div class="info-content">
                <span class="info-text">${message}</span>
                <button class="info-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        messageElement.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 400px;
            background: ${type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : type === 'success' ? '#d4edda' : '#d1ecf1'};
            border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
            color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : type === 'success' ? '#155724' : '#0c5460'};
            padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(messageElement);
        
        if (duration > 0) {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => messageElement.remove(), 300);
                }
            }, duration);
        }
    }

    if (!document.querySelector('#info-message-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'info-message-styles';
        styleSheet.textContent = `
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
            .info-message .info-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
            .info-message .info-close { background: none; border: none; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px; opacity: 0.7; }
            .info-message .info-close:hover { opacity: 1; }
        `;
        document.head.appendChild(styleSheet);
    }

    async function loadFiltersFromStorage() {
        try {
            const savedFilters = localStorage.getItem('selectedFilters');
            return savedFilters ? JSON.parse(savedFilters) : null;
        } catch (error) {
            console.error('Erro ao carregar filtros:', error);
            return null;
        }
    }

    async function carregarDadosRegioes() {
        const regioes = ['baixopantanal', 'centro', 'centrosul', 'leste', 'nordeste', 'norte', 'pantanal', 'sudeste', 'sulfronteira'];
        const promises = regioes.map(async regiao => {
            try {
                const response = await fetch(`/REGIAO/${regiao}.json`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                return { regiao, data };
            } catch (error) {
                console.error(`Erro ao carregar ${regiao}:`, error);
                return { regiao, data: null };
            }
        });

        const resultados = await Promise.all(promises);
        const regioesDados = {};
        
        resultados.forEach(({ regiao, data }) => {
            if (data) regioesDados[regiao] = data;
        });

        return regioesDados;
    }

    async function loadIndicatorData(indicatorId) {
        if (!INDICATOR_PATHS[indicatorId]) {
            throw new Error(`Indicador não encontrado: ${indicatorId}`);
        }

        const indicatorConfig = INDICATOR_PATHS[indicatorId];
        const promises = indicatorConfig.files.map(async fileName => {
            try {
                const filePath = `/${indicatorConfig.folder}/${fileName}`;
                const response = await fetch(filePath);
                if (!response.ok) return null;
                return await response.text();
            } catch (error) {
                return null;
            }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(result => result !== null);
        
        if (validResults.length === 0) {
            throw new Error(`Nenhum arquivo CSV encontrado para ${indicatorId}`);
        }

        const municipalData = {};
        
        validResults.forEach(csvText => {
            const lines = csvText.split('\n');
            lines.slice(15).forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return;
                
                const columns = trimmedLine.split('|').map(col => col.trim());
                if (columns.length < 2) return;
                
                const municipalInfo = columns[0];
                const scoreStr = columns[columns.length - 1];
                
                if (municipalInfo && municipalInfo.includes('/')) {
                    const municipalName = municipalInfo.split('/')[1].trim().toUpperCase();
                    const score = parseFloat(scoreStr);
                    
                    if (!isNaN(score) && municipalName) {
                        if (!municipalData[municipalName] || municipalData[municipalName] < score) {
                            municipalData[municipalName] = score;
                        }
                    }
                }
            });
        });

        return {
            indicador: indicatorId,
            nome: indicatorConfig.name,
            municipios: municipalData
        };
    }

    function gerarLegenda(dadosIndicador) {
        if (!legendaItems || !dadosIndicador.municipios) return;

        const scores = Object.values(dadosIndicador.municipios);
        if (scores.length === 0) return;

        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        const legendaConfig = [
            { range: '80-100', color: '#2E7D32', label: 'Excelente' },
            { range: '70-79', color: '#66BB6A', label: 'Bom' },
            { range: '50-69', color: '#FFA726', label: 'Regular' },
            { range: '30-49', color: '#FF7043', label: 'Ruim' },
            { range: '0-29', color: '#D32F2F', label: 'Crítico' }
        ];

        legendaItems.innerHTML = `
            <div class="indicator-info">
                <h3>${dadosIndicador.nome}</h3>
                <div class="stats">
                    <span>Mín: ${minScore.toFixed(1)}</span>
                    <span>Máx: ${maxScore.toFixed(1)}</span>
                    <span>Média: ${avgScore.toFixed(1)}</span>
                </div>
            </div>
            ${legendaConfig.map(item => `
                <div class="legenda-item">
                    <div class="cor-amostra" style="background-color: ${item.color}"></div>
                    <span class="range">${item.range}</span>
                    <span class="label">${item.label}</span>
                </div>
            `).join('')}
        `;
    }

    async function carregarSVGMapa(indicatorId) {
        try {
            const svgPath = `/src/svg/${indicatorId}_mapa.svg`;
            const response = await fetch(svgPath);
            
            if (!response.ok) {
                throw new Error(`SVG não encontrado: ${response.status}`);
            }
            
            const svgContent = await response.text();
            return svgContent;
        } catch (error) {
            console.error('Erro ao carregar SVG:', error);
            throw error;
        }
    }

    async function gerarSVGViaPython(indicatorId) {
        showInfo(`
            <strong>Gerando mapa SVG...</strong><br>
            Indicador: ${INDICATOR_PATHS[indicatorId]?.name || indicatorId}<br>
            <em>O mapa está sendo processado em background.</em><br>
            <small>Isso pode levar alguns segundos...</small>
        `, 'info', 0);
    }

    function configurarInteratividadeSVG(svgElement, dadosIndicador) {
        const paths = svgElement.querySelectorAll('path[data-municipio]');
        
        paths.forEach(path => {
            const municipio = path.getAttribute('data-municipio');
            const score = dadosIndicador.municipios[municipio];
            
            if (score !== undefined) {
                path.addEventListener('mouseenter', (e) => {
                    const tooltip = document.getElementById('mapa-tooltip') || createTooltip();
                    tooltip.innerHTML = `
                        <strong>${municipio}</strong><br>
                        ${dadosIndicador.nome}: ${score.toFixed(1)}
                    `;
                    tooltip.style.display = 'block';
                    updateTooltipPosition(e, tooltip);
                });

                path.addEventListener('mousemove', (e) => {
                    const tooltip = document.getElementById('mapa-tooltip');
                    if (tooltip) updateTooltipPosition(e, tooltip);
                });

                path.addEventListener('mouseleave', () => {
                    const tooltip = document.getElementById('mapa-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                });

                path.addEventListener('click', () => {
                    showInfo(`
                        <strong>${municipio}</strong><br>
                        ${dadosIndicador.nome}: <strong>${score.toFixed(1)}/100</strong><br>
                        <small>Clique fora para fechar</small>
                    `, 'info', 8000);
                });
            }
        });
    }

    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.id = 'mapa-tooltip';
        tooltip.style.cssText = `
            position: absolute; background: rgba(0,0,0,0.8); color: white; padding: 8px 12px;
            border-radius: 4px; font-size: 12px; pointer-events: none; z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: none;
        `;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    function updateTooltipPosition(e, tooltip) {
        tooltip.style.left = (e.pageX + 10) + 'px';
        tooltip.style.top = (e.pageY - 10) + 'px';
    }

    async function renderizarMapaSVG(indicatorId) {
        try {
            mapaContainer.innerHTML = '<div class="loading">Carregando mapa...</div>';
            
            const [svgContent, dadosIndicador] = await Promise.all([
                carregarSVGMapa(indicatorId),
                loadIndicatorData(indicatorId)
            ]);

            mapaContainer.innerHTML = svgContent;
            const svgElement = mapaContainer.querySelector('svg');
            
            if (svgElement) {
                svgElement.style.width = '100%';
                svgElement.style.height = 'auto';
                svgElement.style.maxHeight = '80vh';
                
                configurarInteratividadeSVG(svgElement, dadosIndicador);
                gerarLegenda(dadosIndicador);
                
                svgMapaCarregado = true;
                showInfo('Mapa carregado com sucesso!', 'success', 3000);
            }
            
        } catch (error) {
            console.error('Erro ao renderizar mapa:', error);
            mapaContainer.innerHTML = '<div class="error">Erro ao carregar o mapa</div>';
            
            if (error.message.includes('SVG não encontrado')) {
                await gerarSVGViaPython(indicatorId);
            } else {
                showInfo(`Erro: ${error.message}`, 'error', 5000);
            }
        }
    }

    async function inicializarMapa() {
        try {
            currentFilters = await loadFiltersFromStorage();
            
            if (!currentFilters || !currentFilters.indicador) {
                showInfo('Nenhum filtro selecionado. Retornando aos filtros.', 'warning', 3000);
                setTimeout(() => {
                    window.location.href = '/src/html/filtros.html';
                }, 3000);
                return;
            }

            document.querySelector('.header h1').textContent = 
                INDICATOR_PATHS[currentFilters.indicador]?.name || 'Mapa de Indicadores';

            await renderizarMapaSVG(currentFilters.indicador);

        } catch (error) {
            console.error('Erro na inicialização:', error);
            showInfo('Erro ao inicializar a aplicação', 'error');
        }
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/src/html/filtros.html';
        });
    }

    inicializarMapa();
});