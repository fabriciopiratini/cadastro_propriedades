// Manipulação de edição de propriedades
document.addEventListener('DOMContentLoaded', () => {
    configurarEdicao();
});

// Configurar eventos de edição
function configurarEdicao() {
    // Botões de ação
    const btnEditar = document.getElementById('btn-editar');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    
    // Campos de texto e visualização
    const camposTexto = {
        matricula: {
            texto: document.getElementById('info-matricula'),
            input: document.getElementById('edit-matricula')
        },
        car: {
            texto: document.getElementById('info-car'),
            input: document.getElementById('edit-car')
        },
        itr: {
            texto: document.getElementById('info-itr'),
            input: document.getElementById('edit-itr')
        },
        ccir: {
            texto: document.getElementById('info-ccir'),
            input: document.getElementById('edit-ccir')
        }
    };
    
    // Eventos dos botões
    btnEditar.addEventListener('click', () => {
        ativarModoEdicao(camposTexto);
    });
    
    btnSalvar.addEventListener('click', () => {
        salvarEdicao(camposTexto);
    });
    
    btnCancelar.addEventListener('click', () => {
        cancelarEdicao(camposTexto);
    });
}

// Ativar modo de edição
function ativarModoEdicao(campos) {
    // Esconder os textos e mostrar inputs
    for (const campo in campos) {
        const valor = campos[campo].texto.textContent === 'Não informado' ? '' : campos[campo].texto.textContent;
        campos[campo].input.value = valor;
        campos[campo].texto.style.display = 'none';
        campos[campo].input.style.display = 'block';
    }
    
    // Alternar botões
    document.getElementById('btn-editar').style.display = 'none';
    document.getElementById('btn-salvar').style.display = 'inline-block';
    document.getElementById('btn-cancelar').style.display = 'inline-block';
}

// Salvar edições feitas
function salvarEdicao(campos) {
    // Obter a propriedade ativa atual
    const propriedadeAtiva = obterPropriedadeAtiva();
    
    if (!propriedadeAtiva) {
        alert('Erro: Não foi possível encontrar a propriedade ativa.');
        return;
    }
    
    // Atualizar os dados da propriedade
    propriedadeAtiva.matricula = campos.matricula.input.value.trim();
    propriedadeAtiva.car = campos.car.input.value.trim();
    propriedadeAtiva.itr = campos.itr.input.value.trim();
    propriedadeAtiva.ccir = campos.ccir.input.value.trim();
    
    // Atualizar a visualização
    for (const campo in campos) {
        const valor = campos[campo].input.value.trim() || 'Não informado';
        campos[campo].texto.textContent = valor;
        campos[campo].texto.style.display = 'block';
        campos[campo].input.style.display = 'none';
    }
    
    // Alternar botões
    document.getElementById('btn-editar').style.display = 'inline-block';
    document.getElementById('btn-salvar').style.display = 'none';
    document.getElementById('btn-cancelar').style.display = 'none';
    
    // Salvar dados no localStorage (opcional)
    salvarDadosLocalmente();
    
    alert('Dados atualizados com sucesso!');
}

// Cancelar edição
function cancelarEdicao(campos) {
    // Reverter para modo de visualização sem salvar alterações
    for (const campo in campos) {
        campos[campo].texto.style.display = 'block';
        campos[campo].input.style.display = 'none';
    }
    
    // Alternar botões
    document.getElementById('btn-editar').style.display = 'inline-block';
    document.getElementById('btn-salvar').style.display = 'none';
    document.getElementById('btn-cancelar').style.display = 'none';
}

// Obter a propriedade ativa
function obterPropriedadeAtiva() {
    // Usar variável global declarada em app.js
    if (window.propriedades && window.camadaAtiva) {
        return window.propriedades.find(p => p.camada === window.camadaAtiva);
    }
    return null;
}

// Salvar dados no localStorage
function salvarDadosLocalmente() {
    // Obter o ID do produtor da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idProdutor = urlParams.get('produtor') || 'default';
    
    // Cria uma versão simplificada das propriedades para armazenamento
    const dadosSalvos = window.propriedades.map(p => ({
        id: p.id,
        nome: p.nome,
        matricula: p.matricula,
        car: p.car,
        itr: p.itr,
        ccir: p.ccir,
        area: p.area,
        // Dados geométricos básicos para tentar reconstruir a camada
        tipo: p.tipo,
        geometria: salvarGeometria(p.camada)
    }));
    
    try {
        // Salvar vinculado ao ID do produtor
        localStorage.setItem(`propriedades_${idProdutor}`, JSON.stringify(dadosSalvos));
        console.log(`Dados do produtor ${idProdutor} salvos localmente`);
    } catch (error) {
        console.error('Erro ao salvar dados localmente:', error);
    }
}

// Salvar informações básicas de geometria
function salvarGeometria(camada) {
    try {
        if (camada && camada.getLatLngs) {
            // Tentar salvar os pontos do polígono
            const latlngs = camada.getLatLngs();
            if (latlngs && latlngs.length > 0) {
                // Converter LatLng para arrays simples [lng, lat]
                const coordSimples = converterParaCoordenadas(latlngs);
                return JSON.stringify(coordSimples);
            }
        } else if (camada && camada.toGeoJSON) {
            // Alternativa: salvar como GeoJSON
            const geoJson = camada.toGeoJSON();
            if (geoJson && geoJson.geometry && geoJson.geometry.coordinates) {
                return JSON.stringify(geoJson.geometry.coordinates);
            }
        }
        return null;
    } catch (e) {
        console.warn('Não foi possível salvar a geometria:', e);
        return null;
    }
}

// Converter estrutura LatLng do Leaflet para arrays [lng, lat]
function converterParaCoordenadas(latlngs) {
    // Verificar se é um array aninhado
    if (Array.isArray(latlngs) && latlngs.length > 0) {
        if (latlngs[0] instanceof L.LatLng) {
            // Array de LatLng
            return latlngs.map(ponto => [ponto.lng, ponto.lat]);
        } else if (Array.isArray(latlngs[0])) {
            // Array aninhado, processar recursivamente
            return latlngs.map(subArray => converterParaCoordenadas(subArray));
        }
    }
    return latlngs;
}

// Carregar dados do localStorage
function carregarDadosLocais() {
    try {
        // Obter o ID do produtor da URL
        const urlParams = new URLSearchParams(window.location.search);
        const idProdutor = urlParams.get('produtor') || 'default';
        
        const chaveDados = `propriedades_${idProdutor}`;
        const dadosSalvos = localStorage.getItem(chaveDados);
        
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            console.log(`Dados salvos encontrados para o produtor ${idProdutor}:`, dados);
            
            // Se já existem propriedades carregadas, atualizar os dados
            if (window.propriedades && window.propriedades.length > 0) {
                dados.forEach(dadoSalvo => {
                    const propriedade = window.propriedades.find(p => p.id === dadoSalvo.id);
                    if (propriedade) {
                        propriedade.matricula = dadoSalvo.matricula || '';
                        propriedade.car = dadoSalvo.car || '';
                        propriedade.itr = dadoSalvo.itr || '';
                        propriedade.ccir = dadoSalvo.ccir || '';
                    }
                });
                
                // Atualizar visualização se uma propriedade estiver sendo mostrada
                if (window.camadaAtiva) {
                    const propAtiva = window.propriedades.find(p => p.camada === window.camadaAtiva);
                    if (propAtiva) {
                        atualizarVisualizacaoPropriedade(propAtiva);
                    }
                }
            } else {
                // Se não há propriedades carregadas, tenta recriá-las a partir dos dados salvos
                console.log('Tentando recriar propriedades a partir dos dados salvos');
                return dados; // Retorna os dados para serem usados em app.js
            }
        } else {
            console.log(`Nenhum dado salvo encontrado para o produtor ${idProdutor}`);
        }
    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
    }
    return null;
}

// Atualizar visualização de uma propriedade
function atualizarVisualizacaoPropriedade(propriedade) {
    document.getElementById('info-matricula').textContent = propriedade.matricula || 'Não informado';
    document.getElementById('info-car').textContent = propriedade.car || 'Não informado';
    document.getElementById('info-itr').textContent = propriedade.itr || 'Não informado';
    document.getElementById('info-ccir').textContent = propriedade.ccir || 'Não informado';
} 