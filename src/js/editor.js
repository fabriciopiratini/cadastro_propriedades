// Manipulação de edição de propriedades
document.addEventListener('DOMContentLoaded', () => {
    configurarEdicao();
    configurarExclusao();
});

// Configurar eventos de edição
function configurarEdicao() {
    // Botões de ação
    const btnEditar = document.getElementById('btn-editar');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    
    // Campos de texto e visualização
    const camposTexto = {
        area: {
            texto: document.getElementById('info-area'),
            input: document.getElementById('edit-area')
        },
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

// Configurar eventos para exclusão de propriedade
function configurarExclusao() {
    const btnExcluir = document.getElementById('btn-excluir');
    const modal = document.getElementById('modal-confirmacao');
    const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
    const btnCancelar = document.getElementById('btn-cancelar-exclusao');
    
    // Abrir modal de confirmação
    btnExcluir.addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    // Fechar modal ao cancelar
    btnCancelar.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Confirmar exclusão
    btnConfirmar.addEventListener('click', () => {
        excluirPropriedadeAtiva();
        modal.classList.remove('active');
    });
    
    // Fechar modal ao clicar fora dele
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Excluir propriedade ativa
function excluirPropriedadeAtiva() {
    const propriedadeAtiva = obterPropriedadeAtiva();
    
    if (!propriedadeAtiva) {
        alert('Erro: Não foi possível encontrar a propriedade a ser excluída.');
        return;
    }
    
    // Remover a camada do mapa
    if (propriedadeAtiva.camada && propriedadeAtiva.camada.remove) {
        propriedadeAtiva.camada.remove();
    }
    
    // Remover a propriedade do array
    const index = window.propriedades.findIndex(p => p.id === propriedadeAtiva.id);
    if (index !== -1) {
        window.propriedades.splice(index, 1);
    }
    
    // Salvar alterações no localStorage
    salvarDadosLocalmente();
    
    // Fechar painel de informações
    document.getElementById('propriedade-info').style.display = 'none';
    
    // Atualizar lista de propriedades
    if (typeof window.atualizarListaPropriedades === 'function') {
        window.atualizarListaPropriedades();
    } else {
        atualizarListaPropriedades();
    }
    
    alert('Propriedade excluída com sucesso!');
}

// Atualizar lista de propriedades (utilizada apenas se não existir no escopo global)
function atualizarListaPropriedades() {
    const listaEl = document.getElementById('lista-propriedades');
    listaEl.innerHTML = '';
    
    if (window.propriedades.length === 0) {
        listaEl.innerHTML = '<p class="empty-message">Nenhuma propriedade importada.</p>';
        return;
    }
    
    // Criar item na lista para cada propriedade
    window.propriedades.forEach(prop => {
        const itemEl = document.createElement('div');
        itemEl.className = 'propriedade-item';
        itemEl.dataset.id = prop.id;
        
        itemEl.innerHTML = `
            <h3>${prop.nome}</h3>
            <p>${prop.area ? prop.area + ' ha' : 'Área não disponível'}</p>
        `;
        
        itemEl.addEventListener('click', () => {
            // Centralizar no mapa
            window.mapaAtual.fitBounds(prop.camada.getBounds());
            // Mostrar informações
            if (typeof window.mostrarInformacoes === 'function') {
                window.mostrarInformacoes(prop);
            }
        });
        
        listaEl.appendChild(itemEl);
    });
}

// Ativar modo de edição
function ativarModoEdicao(campos) {
    // Esconder os textos e mostrar inputs
    for (const campo in campos) {
        let valor = campos[campo].texto.textContent;
        
        // Remover o "ha" do campo área para a edição
        if (campo === 'area' && valor.includes('ha')) {
            valor = valor.replace(' ha', '');
        }
        
        // Se o valor for "Não informado", usar string vazia
        if (valor === 'Não informado') {
            valor = '';
        }
        
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
    
    // Validar o campo da área para garantir que é um número válido
    const areaTexto = campos.area.input.value.trim();
    let areaValor = parseFloat(areaTexto);
    
    if (areaTexto && isNaN(areaValor)) {
        alert('Por favor, insira um valor numérico válido para a área.');
        return;
    }
    
    // Atualizar os dados da propriedade
    propriedadeAtiva.area = areaTexto ? areaValor.toFixed(2) : "N/A";
    propriedadeAtiva.matricula = campos.matricula.input.value.trim();
    propriedadeAtiva.car = campos.car.input.value.trim();
    propriedadeAtiva.itr = campos.itr.input.value.trim();
    propriedadeAtiva.ccir = campos.ccir.input.value.trim();
    
    // Atualizar a visualização
    campos.area.texto.textContent = propriedadeAtiva.area !== "N/A" ? `${propriedadeAtiva.area} ha` : 'N/A';
    campos.matricula.texto.textContent = propriedadeAtiva.matricula || 'Não informado';
    campos.car.texto.textContent = propriedadeAtiva.car || 'Não informado';
    campos.itr.texto.textContent = propriedadeAtiva.itr || 'Não informado';
    campos.ccir.texto.textContent = propriedadeAtiva.ccir || 'Não informado';
    
    // Restaurar modo de visualização
    for (const campo in campos) {
        campos[campo].texto.style.display = 'block';
        campos[campo].input.style.display = 'none';
    }
    
    // Alternar botões
    document.getElementById('btn-editar').style.display = 'inline-block';
    document.getElementById('btn-salvar').style.display = 'none';
    document.getElementById('btn-cancelar').style.display = 'none';
    
    // Atualizar item na lista
    atualizarItemNaLista(propriedadeAtiva);
    
    // Salvar dados no localStorage
    salvarDadosLocalmente();
    
    alert('Dados atualizados com sucesso!');
}

// Atualizar um item específico na lista de propriedades
function atualizarItemNaLista(propriedade) {
    const items = document.querySelectorAll('.propriedade-item');
    for (let i = 0; i < items.length; i++) {
        if (items[i].dataset.id === propriedade.id) {
            const areaInfo = items[i].querySelector('p');
            if (areaInfo) {
                areaInfo.textContent = propriedade.area !== "N/A" ? 
                    `${propriedade.area} ha` : 'Área não disponível';
            }
            break;
        }
    }
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