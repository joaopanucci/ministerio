document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const indicatorSelect = document.getElementById("indicator-select");
    const subindicatorContainer = document.getElementById("subindicator-container");
    const subindicatorSelect = document.getElementById("subindicator-select");
    const yearSelect = document.getElementById("year-select");
    const applyFiltersButton = document.getElementById("apply-filters");
    const goToMapButton = document.getElementById('go-to-map');

    // Dados dos subindicadores com seus códigos correspondentes
    const subindicators = {
        "indicador-equipes": [
            { value: "emulti-acoes", text: "AÇÕES INTERPROFISSIONAIS DA EMULTI" },
            { value: "emulti-media", text: "MÉDIA DE ATENDIMENTO DA EMULTI POR PESSOA" }
        ],
        "indicador-estrategias": [
            { value: "esf-desenvolvimento", text: "DESENVOLVIMENTO INFANTIL" },
            { value: "esf-diabetes", text: "DIABETES" },
            { value: "esf-hipertensao", text: "HIPERTENSÃO ARTERIAL" },
            { value: "esf-mais-acesso", text: "MAIS ACESSO" },
            { value: "esf-idosa", text: "PESSOA IDOSA" },
            { value: "esf-cancer-mulher", text: "PREVENÇÃO DO CÂNCER NA MULHER" },
            { value: "esf-gestante", text: "GESTANTE E PUÉRPERA" }
        ],
        "indicador-saude-bucal": [
            { value: "sb-primeira-consulta", text: "1ª CONSULTA ODONTOLÓGICA" },
            { value: "sb-escovacao", text: "ESCOVAÇÃO SUPERVISIONADA" },
            { value: "sb-preventivos", text: "PROCEDIMENTOS ODONTOLÓGICOS PREVENTIVOS" },
            { value: "sb-exodontias", text: "TAXA DE EXODONTIAS" },
            { value: "sb-tratamento-concluido", text: "TRATAMENTO ODONTOLÓGICO CONCLUÍDO" },
            { value: "sb-tratamento-atraumatico", text: "TRATAMENTO RESTAURADOR ATRAUMÁTICO" }
        ]
    };

    // Event listener para mudança no indicador principal
    if (indicatorSelect) {
        indicatorSelect.addEventListener("change", function() {
            const selected = indicatorSelect.value;
            subindicatorSelect.innerHTML = ""; // limpa subindicadores

            if (selected && subindicators[selected]) {
                subindicatorContainer.style.display = "block";

                // Adiciona opção padrão
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Selecione um subindicador";
                subindicatorSelect.appendChild(defaultOption);

                // Adiciona as opções dos subindicadores
                subindicators[selected].forEach(sub => {
                    const option = document.createElement("option");
                    option.value = sub.value;
                    option.textContent = sub.text;
                    subindicatorSelect.appendChild(option);
                });
            } else {
                subindicatorContainer.style.display = "none";
            }
        });
    }

    // Event listener para aplicar filtros
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', function() {
            const indicator = indicatorSelect.value;
            const subindicator = subindicatorSelect.value;
            const year = yearSelect.value;

            // Validação dos filtros
            if (!indicator) {
                alert('Por favor, selecione um indicador.');
                return;
            }

            if (indicator && subindicators[indicator] && !subindicator) {
                alert('Por favor, selecione um subindicador.');
                return;
            }

            // Salva os filtros no localStorage para usar na página do mapa
            const filters = {
                indicator: indicator,
                subindicator: subindicator,
                year: year,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('selectedFilters', JSON.stringify(filters));
            
            console.log('Filtros aplicados:', filters);
            alert('Filtros aplicados com sucesso! Agora você pode ir para o mapa.');
        });
    }

    // Event listener para botão ir para o mapa
    if (goToMapButton) {
        goToMapButton.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Verifica se há filtros aplicados
            const savedFilters = localStorage.getItem('selectedFilters');
            if (!savedFilters) {
                const confirmation = confirm('Nenhum filtro foi aplicado. Deseja continuar mesmo assim?');
                if (!confirmation) {
                    return;
                }
            }

            console.log('Navegando para o mapa...');
            window.location.href = 'mapa.html';
        });
    }

    // Carrega filtros salvos ao carregar a página
    function loadSavedFilters() {
        const savedFilters = localStorage.getItem('selectedFilters');
        if (savedFilters) {
            try {
                const filters = JSON.parse(savedFilters);
                
                if (filters.indicator) {
                    indicatorSelect.value = filters.indicator;
                    // Dispara o evento change para atualizar os subindicadores
                    indicatorSelect.dispatchEvent(new Event('change'));
                    
                    // Aguarda um pouco para os subindicadores serem preenchidos
                    setTimeout(() => {
                        if (filters.subindicator) {
                            subindicatorSelect.value = filters.subindicator;
                        }
                    }, 100);
                }
                
                if (filters.year) {
                    yearSelect.value = filters.year;
                }
            } catch (error) {
                console.error('Erro ao carregar filtros salvos:', error);
            }
        }
    }

    // Carrega filtros salvos
    loadSavedFilters();
});