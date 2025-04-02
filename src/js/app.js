// Armazenamento de propriedades
window.propriedades = [];
window.mapaAtual = null;
window.camadaAtiva = null;

// Definir nomes de função críticos globalmente para evitar duplicações
// Verificar se já estão definidos para evitar redeclarações
if (typeof window.verificarBibliotecas !== 'function') {
    window.verificarBibliotecas = function() {
        let todasCarregadas = true;
        
        // Lista de bibliotecas necessárias
        const bibliotecas = [
            { nome: "Leaflet", obj: "L" },
            { nome: "Leaflet-Omnivore", obj: "omnivore" },
            { nome: "JSZip", obj: "JSZip" },
            { nome: "ShpJS", obj: "shp" }
        ];
        
        // Verificar pako separadamente para evitar referência duplicada
        if (typeof window.pako === 'undefined') {
            console.error('ERRO: Pako não foi carregado! A compressão de dados para compartilhamento não funcionará.');
            // Não bloqueia o funcionamento da aplicação se pako falhar
        } else {
            console.log('Pako carregado com sucesso');
        }
        
        bibliotecas.forEach(lib => {
            if (typeof window[lib.obj] !== 'undefined') {
                console.log(`${lib.nome} carregado com sucesso`);
            } else {
                console.error(`ERRO: ${lib.nome} não foi carregado!`);
                todasCarregadas = false;
            }
        });
        
        // Tentar carregar localmente os arquivos se não estiverem disponíveis
        if (!todasCarregadas) {
            console.warn("Algumas bibliotecas não foram carregadas. Tentando carregar de fontes alternativas...");
        }
        
        return todasCarregadas;
    };
}

// Versão simplificada da inicialização do mapa
document.addEventListener('DOMContentLoaded', function() {
    console.log("Aplicação carregada. Aguardando inicialização manual ou automática.");
    
    // Monitorar erros globais para diagnóstico
    window.addEventListener('error', function(e) {
        console.error('Erro global capturado:', e.message);
        var errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.innerHTML = '<strong>Erro:</strong> ' + e.message;
        }
    });
    
    // A inicialização será feita pelo script em index.html após verificar bibliotecas
});

// Verificar o suporte do navegador
window.verificarNavegador = function() {
    var problemas = [];
    
    if (!window.localStorage) {
        problemas.push("localStorage não suportado");
    }
    
    if (!window.fetch && !window.XMLHttpRequest) {
        problemas.push("fetch/XMLHttpRequest não suportado");
    }
    
    if (problemas.length > 0) {
        console.warn("Navegador com recursos limitados: " + problemas.join(", "));
        return false;
    }
    
    return true;
};

// Verificar conexão com a internet
window.verificarConexao = function() {
    if (navigator.onLine) {
        console.log("Dispositivo conectado à internet");
        return true;
    } else {
        console.warn("Dispositivo offline! Alguns recursos podem não funcionar");
        return false;
    }
};

// Mostrar erro de inicialização
window.mostrarErroInicializacao = function(erro) {
    document.body.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; text-align: center; font-family: sans-serif;">
            <h1 style="color: #2a7e19;">Portal do Produtor</h1>
            <div style="padding: 20px; background-color: #f8f8f8; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #e63946;">Não foi possível carregar o aplicativo</h2>
                <p>Ocorreu um erro ao inicializar o aplicativo. Por favor, tente as seguintes soluções:</p>
                <ul style="text-align: left; padding-left: 30px;">
                    <li>Atualize a página (pressione F5 ou clique em recarregar)</li>
                    <li>Verifique sua conexão com a internet</li>
                    <li>Limpe o cache do seu navegador</li>
                    <li>Tente usar outro navegador (Chrome, Firefox, Edge)</li>
                </ul>
                <p style="margin-top: 20px;">
                    <button onclick="location.reload()" style="padding: 10px 20px; background-color: #2a7e19; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Recarregar Página
                    </button>
                </p>
                <p style="font-size: 0.8rem; color: #666; margin-top: 20px;">
                    Detalhes técnicos: ${erro}
                </p>
            </div>
        </div>
    `;
};

// Função para inicializar o mapa (chamada pela inicialização manual)
window.inicializarMapa = function() {
    try {
        // Verificar se o Leaflet está disponível
        if (typeof L === 'undefined') {
            throw new Error("A biblioteca Leaflet não está disponível");
        }
        
        // Criar o mapa com visão inicial do Brasil
        window.mapaAtual = L.map('map', {
            center: [-15.7801, -47.9292], // Centro aproximado do Brasil
            zoom: 5,
            minZoom: 3,
            maxZoom: 19
        });

        // Adicionar camada base do OpenStreetMap (mais compatível)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(window.mapaAtual);

        // Adicionar escala se disponível
        if (L.control && L.control.scale) {
            L.control.scale({
                imperial: false,
                maxWidth: 200
            }).addTo(window.mapaAtual);
        }
        
        return true;
    } catch (error) {
        console.error("Erro ao inicializar o mapa:", error);
        window.mostrarErroInicializacao("Não foi possível inicializar o mapa: " + error.message);
        return false;
    }
};

// Configurar eventos da interface
function configurarEventos() {
    // Botão de importar arquivos
    const btnImportar = document.getElementById('btn-importar');
    const fileInput = document.getElementById('file-input');
    
    btnImportar.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        processarArquivosImportados(e.target.files);
    });
    
    // Botão de fechar painel de informações
    const btnFechar = document.getElementById('close-info');
    btnFechar.addEventListener('click', () => {
        document.getElementById('propriedade-info').style.display = 'none';
    });
    
    // Botão de compartilhar mapa
    const btnCompartilhar = document.createElement('button');
    btnCompartilhar.id = 'btn-compartilhar';
    btnCompartilhar.innerHTML = '<i class="fas fa-share-alt"></i> Compartilhar';
    btnCompartilhar.className = 'btn-action';
    btnCompartilhar.title = 'Compartilhar este mapa';
    
    // Inserir o botão no controle do mapa
    const controlesContainer = document.querySelector('.controls-container');
    if (controlesContainer) {
        controlesContainer.appendChild(btnCompartilhar);
    }
    
    // Evento do botão compartilhar
    btnCompartilhar.addEventListener('click', () => {
        gerarLinkCompartilhavel();
    });
    
    // Habilitar importação por drag-and-drop
    const mapContainer = document.getElementById('map-container');
    
    // Eventos de arrastar e soltar para o mapa
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        mapContainer.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Destacar área quando arquivos são arrastados sobre o mapa
    ['dragenter', 'dragover'].forEach(eventName => {
        mapContainer.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        mapContainer.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        mapContainer.classList.add('highlight-drop');
    }
    
    function unhighlight() {
        mapContainer.classList.remove('highlight-drop');
    }
    
    // Processar arquivos quando forem soltos no mapa
    mapContainer.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        processarArquivosImportados(files);
    }
}

// Processar arquivos importados
function processarArquivosImportados(files) {
    if (!files || files.length === 0) return;
    
    // Converter FileList para Array
    const filesArray = Array.from(files);
    
    // Processar cada arquivo
    filesArray.forEach(file => {
        const fileName = file.name.toLowerCase();
        
        // Verificar tipo de arquivo
        if (fileName.endsWith('.kml')) {
            processarArquivoKML(file);
        } else if (fileName.endsWith('.kmz')) {
            processarArquivoKMZ(file);
        } else if (fileName.endsWith('.zip') || fileName.endsWith('.shp')) {
            processarArquivoShapefile(file);
        } else {
            alert(`Tipo de arquivo não suportado: ${file.name}`);
        }
    });
}

// Processar arquivos KML
function processarArquivoKML(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // Usar Leaflet-Omnivore para processar o KML
            const kmlLayer = omnivore.kml.parse(e.target.result);
            
            // Adicionar camada ao mapa
            adicionarCamadaAoMapa(kmlLayer, file.name, 'kml');
        } catch (error) {
            console.error('Erro ao processar arquivo KML:', error);
            alert(`Erro ao processar arquivo KML: ${file.name}`);
        }
    };
    
    reader.readAsText(file);
}

// Processar arquivos KMZ (ZIP com KML dentro)
function processarArquivoKMZ(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // Usar JSZip para descompactar o KMZ
            const zip = new JSZip();
            
            zip.loadAsync(e.target.result)
                .then(function(conteudo) {
                    // Procurar pelo arquivo .kml dentro do KMZ
                    let kmlEncontrado = false;
                    
                    // Iterar sobre os arquivos no ZIP
                    Object.keys(conteudo.files).forEach(function(filename) {
                        if (filename.toLowerCase().endsWith('.kml')) {
                            kmlEncontrado = true;
                            
                            // Extrair o conteúdo do KML
                            zip.file(filename).async("string").then(function(kmlString) {
                                // Processar o KML
                                const kmlLayer = omnivore.kml.parse(kmlString);
                                adicionarCamadaAoMapa(kmlLayer, file.name, 'kmz');
                            });
                        }
                    });
                    
                    if (!kmlEncontrado) {
                        throw new Error('Nenhum arquivo KML encontrado dentro do KMZ');
                    }
                })
                .catch(function(error) {
                    console.error('Erro ao processar arquivo KMZ:', error);
                    alert(`Erro ao processar arquivo KMZ: ${file.name}`);
                });
        } catch (error) {
            console.error('Erro ao processar arquivo KMZ:', error);
            alert(`Erro ao processar arquivo KMZ: ${file.name}`);
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Processar arquivos Shapefile
function processarArquivoShapefile(file) {
    // Shapefile geralmente vem em um ZIP ou conjunto de arquivos
    if (file.name.endsWith('.zip')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // Usar shp.js para processar o shapefile
                shp(e.target.result)
                    .then(function(geojson) {
                        // Converter GeoJSON para camada Leaflet
                        const shpLayer = L.geoJSON(geojson, {
                            style: {
                                color: '#2a7e19',
                                weight: 2,
                                opacity: 0.7,
                                fillColor: '#2a7e19',
                                fillOpacity: 0.2
                            },
                            onEachFeature: function(feature, layer) {
                                // Adicionar informações e eventos para cada feature
                                const props = feature.properties || {};
                                
                                // Criar objeto da propriedade
                                const propriedade = {
                                    id: gerarId(),
                                    nome: props.name || props.Nome || file.name.replace(/\.[^/.]+$/, ""),
                                    camada: layer,
                                    tipo: 'shp',
                                    area: calcularAreaGeoJSON(feature),
                                    propriedades: props,
                                    // Campos para documentos
                                    matricula: props.MATRICULA || props.Matricula || '',
                                    car: props.CAR || '',
                                    itr: props.ITR || '',
                                    ccir: props.CCIR || props.Ccir || '',
                                    documentos: []
                                };
                                
                                // Adicionar ao armazenamento
                                window.propriedades.push(propriedade);
                                
                                // Configurar eventos
                                layer.on({
                                    click: (e) => window.mostrarInformacoes(propriedade),
                                    mouseover: (e) => {
                                        layer.setStyle({
                                            weight: 3,
                                            fillOpacity: 0.4
                                        });
                                    },
                                    mouseout: (e) => {
                                        if (window.camadaAtiva !== layer) {
                                            shpLayer.resetStyle(layer);
                                        }
                                    }
                                });
                            }
                        });
                        
                        // Adicionar camada ao mapa
                        shpLayer.addTo(window.mapaAtual);
                        
                        // Ajustar o zoom para mostrar a nova camada
                        window.mapaAtual.fitBounds(shpLayer.getBounds());
                        
                        // Atualizar a lista de propriedades
                        window.atualizarListaPropriedades();
                    })
                    .catch(function(error) {
                        console.error('Erro ao processar Shapefile:', error);
                        alert(`Erro ao processar Shapefile: ${file.name}`);
                    });
            } catch (error) {
                console.error('Erro ao processar Shapefile:', error);
                alert(`Erro ao processar Shapefile: ${file.name}`);
            }
        };
        
        reader.readAsArrayBuffer(file);
    } else {
        alert('Para processar arquivos Shapefile, importe o arquivo .zip contendo todos os componentes do shapefile.');
    }
}

// Calcular área aproximada do polígono GeoJSON em hectares
function calcularAreaGeoJSON(feature) {
    try {
        if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
            // Converter o GeoJSON para objeto Leaflet para usar GeometryUtil
            const tempLayer = L.geoJSON(feature);
            const layers = [];
            tempLayer.eachLayer(l => layers.push(l));
            
            if (layers.length > 0) {
                const areaEmM2 = L.GeometryUtil.geodesicArea(layers[0].getLatLngs()[0]);
                return (areaEmM2 / 10000).toFixed(2);
            }
        }
    } catch (e) {
        console.warn("Não foi possível calcular área do GeoJSON:", e);
    }
    return "N/A";
}

// Adicionar camada ao mapa
window.adicionarCamadaAoMapa = function(layer, nome, tipo) {
    try {
        console.log(`Adicionando camada ao mapa: ${nome} (tipo: ${tipo})`);
        
        if (!layer) {
            console.error("Camada nula ou indefinida");
            return false;
        }
        
        // Verificar se o mapa existe
        if (!window.mapaAtual) {
            console.error("Mapa não inicializado");
            return false;
        }
        
        // Configurar estilo para a camada
        try {
            layer.setStyle({
                color: '#2a7e19',
                weight: 2,
                opacity: 0.7,
                fillColor: '#2a7e19',
                fillOpacity: 0.2
            });
        } catch (e) {
            console.warn("Não foi possível definir estilo para a camada:", e);
        }
        
        // Adicionar interatividade
        try {
            layer.eachLayer(function(l) {
                if (l.feature) {
                    // Obter propriedades do feature
                    const props = l.feature.properties || {};
                    
                    // Criar objeto da propriedade
                    const propriedade = {
                        id: window.gerarId ? window.gerarId() : Math.random().toString(36).substring(2, 15),
                        nome: props.name || props.Nome || nome.replace(/\.[^/.]+$/, ""),
                        camada: l,
                        tipo: tipo,
                        area: "Calculando...",
                        propriedades: props,
                        matricula: props.MATRICULA || props.Matricula || '',
                        car: props.CAR || props.Car || '',
                        itr: props.ITR || props.Itr || '',
                        ccir: props.CCIR || props.Ccir || '',
                        documentos: []
                    };
                    
                    // Adicionar ao armazenamento
                    if (!window.propriedades) {
                        window.propriedades = [];
                    }
                    window.propriedades.push(propriedade);
                    
                    // Calcular área após um pequeno atraso
                    setTimeout(() => {
                        try {
                            if (typeof window.calcularArea === 'function') {
                                propriedade.area = window.calcularArea(l);
                                console.log(`Área calculada para ${propriedade.nome}: ${propriedade.area} ha`);
                            }
                        } catch (e) {
                            console.warn("Erro ao calcular área:", e);
                        }
                    }, 500);
                    
                    // Configurar eventos
                    l.on({
                        click: (e) => {
                            console.log("Clique detectado na propriedade:", propriedade.nome);
                            if (typeof window.mostrarInformacoes === 'function') {
                                window.mostrarInformacoes(propriedade);
                            } else {
                                console.error("Função mostrarInformacoes não encontrada");
                            }
                        },
                        mouseover: (e) => {
                            l.setStyle({
                                weight: 3,
                                fillOpacity: 0.4
                            });
                        },
                        mouseout: (e) => {
                            if (window.camadaAtiva !== l) {
                                l.setStyle({
                                    color: '#2a7e19',
                                    weight: 2,
                                    opacity: 0.7,
                                    fillColor: '#2a7e19',
                                    fillOpacity: 0.2
                                });
                            }
                        }
                    });
                }
            });
        } catch (e) {
            console.warn("Erro ao configurar interatividade:", e);
        }
        
        // Adicionar camada ao mapa
        layer.addTo(window.mapaAtual);
        
        // Ajustar o zoom para mostrar a nova camada
        window.mapaAtual.fitBounds(layer.getBounds());
        
        // Atualizar a lista de propriedades
        window.atualizarListaPropriedades();
        
        return true;
    } catch (e) {
        console.error("Erro ao adicionar camada ao mapa:", e);
        return false;
    }
};

// Calcular área aproximada do polígono em hectares
window.calcularArea = function(layer) {
    try {
        // Verificar se o objeto Leaflet tem a função getLatLngs
        if (layer && typeof layer.getLatLngs === 'function') {
            let latlngs = layer.getLatLngs();
            
            // Se for um polígono simples
            if (Array.isArray(latlngs) && latlngs.length > 0) {
                // Verificar se é um polígono aninhado (como em MultiPolygons)
                if (Array.isArray(latlngs[0]) && latlngs[0].length > 0) {
                    // Usar o primeiro anel do polígono para cálculo
                    if (L.GeometryUtil && typeof L.GeometryUtil.geodesicArea === 'function') {
                        const areaEmM2 = L.GeometryUtil.geodesicArea(latlngs[0]);
                        // Converter para hectares (1 hectare = 10000 m²)
                        return (areaEmM2 / 10000).toFixed(2);
                    }
                } 
                // Tentar com o formato de polígono atual
                else if (L.GeometryUtil && typeof L.GeometryUtil.geodesicArea === 'function') {
                    const areaEmM2 = L.GeometryUtil.geodesicArea(latlngs);
                    return (areaEmM2 / 10000).toFixed(2);
                }
            } 
            
            // Tentar outra abordagem para polígonos complexos
            if (layer.feature && layer.feature.geometry) {
                // Se tivermos um GeoJSON, tentar extrair coordenadas para cálculo
                const geom = layer.feature.geometry;
                if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
                    // Criar uma cópia temporária para calcular a área
                    const tempLayer = L.geoJSON(geom);
                    let totalArea = 0;
                    
                    tempLayer.eachLayer(function(l) {
                        if (l.getLatLngs && L.GeometryUtil && typeof L.GeometryUtil.geodesicArea === 'function') {
                            const coords = l.getLatLngs();
                            const ringArea = L.GeometryUtil.geodesicArea(Array.isArray(coords[0]) ? coords[0] : coords);
                            totalArea += ringArea;
                        }
                    });
                    
                    if (totalArea > 0) {
                        return (totalArea / 10000).toFixed(2);
                    }
                }
            }
        }
        
        // Método alternativo para casos onde GeometryUtil não está disponível
        if (typeof turf !== 'undefined' && layer.toGeoJSON) {
            try {
                const geojson = layer.toGeoJSON();
                const area = turf.area(geojson);
                return (area / 10000).toFixed(2);
            } catch (e) {
                console.warn("Erro ao calcular área com Turf.js:", e);
            }
        }
        
        // Adicionar mais métodos de cálculo se necessário
        
        console.warn("Não foi possível calcular área usando os métodos disponíveis");
    } catch (e) {
        console.warn("Erro ao calcular área:", e);
    }
    return "N/A";
};

// Gerar ID único para propriedades
window.gerarId = function() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
};

// Mostrar informações da propriedade
window.mostrarInformacoes = function(propriedade) {
    console.log("Mostrando informações para:", propriedade.nome);
    
    // Destacar a camada selecionada
    if (window.camadaAtiva) {
        // Resetar estilo da camada anteriormente ativa
        window.propriedades.forEach(p => {
            if (p.camada === window.camadaAtiva) {
                p.camada.setStyle({
                    color: '#2a7e19',
                    weight: 2,
                    opacity: 0.7,
                    fillColor: '#2a7e19',
                    fillOpacity: 0.2
                });
            }
        });
    }
    
    // Definir nova camada ativa
    window.camadaAtiva = propriedade.camada;
    
    // Destacar camada ativa
    propriedade.camada.setStyle({
        color: '#e63946',
        weight: 3,
        opacity: 0.9,
        fillColor: '#e63946',
        fillOpacity: 0.3
    });
    
    // Atualizar painel de informações
    const infoPanel = document.getElementById('propriedade-info');
    if (!infoPanel) {
        console.error("Painel de informações não encontrado");
        return;
    }
    
    // Atualizar campos de informação
    const infoNome = document.getElementById('info-nome');
    const infoArea = document.getElementById('info-area');
    const infoMatricula = document.getElementById('info-matricula');
    const infoCar = document.getElementById('info-car');
    const infoItr = document.getElementById('info-itr');
    const infoCcir = document.getElementById('info-ccir');
    
    if (infoNome) infoNome.textContent = propriedade.nome || 'Sem nome';
    if (infoArea) infoArea.textContent = propriedade.area ? `${propriedade.area} ha` : 'N/A';
    if (infoMatricula) infoMatricula.textContent = propriedade.matricula || 'Não informado';
    if (infoCar) infoCar.textContent = propriedade.car || 'Não informado';
    if (infoItr) infoItr.textContent = propriedade.itr || 'Não informado';
    if (infoCcir) infoCcir.textContent = propriedade.ccir || 'Não informado';
    
    // Posicionar campos de edição
    const editArea = document.getElementById('edit-area');
    const editMatricula = document.getElementById('edit-matricula');
    const editCar = document.getElementById('edit-car');
    const editItr = document.getElementById('edit-itr');
    const editCcir = document.getElementById('edit-ccir');
    
    if (editArea) editArea.value = propriedade.area || '';
    if (editMatricula) editMatricula.value = propriedade.matricula || '';
    if (editCar) editCar.value = propriedade.car || '';
    if (editItr) editItr.value = propriedade.itr || '';
    if (editCcir) editCcir.value = propriedade.ccir || '';
    
    // Garantir que os campos de edição estão ocultos
    const camposEdicao = document.querySelectorAll('.edit-field');
    camposEdicao.forEach(campo => {
        if (campo) campo.style.display = 'none';
    });
    
    // Restaurar botões ao estado inicial
    const btnEditar = document.getElementById('btn-editar');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    
    if (btnEditar) btnEditar.style.display = 'inline-block';
    if (btnSalvar) btnSalvar.style.display = 'none';
    if (btnCancelar) btnCancelar.style.display = 'none';
    
    // Mostrar painel
    infoPanel.style.display = 'block';
    
    // Destacar na lista
    window.atualizarListaPropriedades(propriedade.id);
    
    console.log("Painel de informações atualizado com sucesso");
};

// Atualizar lista de propriedades
window.atualizarListaPropriedades = function(propriedadeAtiva = null) {
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
        
        // Adicionar ID como atributo de dados para referência
        itemEl.dataset.id = prop.id;
        
        if (propriedadeAtiva && prop.id === propriedadeAtiva) {
            itemEl.classList.add('active');
        }
        
        itemEl.innerHTML = `
            <h3>${prop.nome}</h3>
            <p>${prop.area ? prop.area + ' ha' : 'Área não disponível'}</p>
        `;
        
        itemEl.addEventListener('click', () => {
            // Centralizar no mapa
            window.mapaAtual.fitBounds(prop.camada.getBounds());
            // Mostrar informações
            window.mostrarInformacoes(prop);
        });
        
        listaEl.appendChild(itemEl);
    });
};

// Função para gerar um link compartilhável com os perímetros
window.atualizarURLComPerimetros = function() {
    try {
        // Verificar se há propriedades para compartilhar
        if (!window.propriedades || window.propriedades.length === 0) {
            console.warn("Nenhuma propriedade para compartilhar");
            return;
        }
        
        console.log(`Preparando ${window.propriedades.length} propriedades para compartilhamento`);
        
        // Criar versão compartilhável dos dados
        const dadosCompartilhaveis = window.propriedades.map(prop => {
            console.log(`Processando propriedade: ${prop.nome}`);
            
            // Extrair geometria da propriedade
            let geometria = null;
            try {
                if (prop.camada && prop.camada.toGeoJSON) {
                    const geoJSON = prop.camada.toGeoJSON();
                    if (geoJSON && geoJSON.geometry) {
                        geometria = geoJSON.geometry;
                        // Validar coordenadas
                        if (!geometria.coordinates || geometria.coordinates.length === 0) {
                            console.error(`Geometria sem coordenadas válidas para ${prop.nome}`);
                            return null;
                        }
                        console.log(`Geometria válida extraída para ${prop.nome}`);
                    }
                }
            } catch (e) {
                console.error(`Erro ao extrair geometria de ${prop.nome}:`, e);
                return null;
            }
            
            if (!geometria) {
                console.error(`Não foi possível extrair geometria para ${prop.nome}`);
                return null;
            }
            
            // Criar objeto com dados mínimos necessários
            return {
                id: prop.id,
                nome: prop.nome,
                tipo: prop.tipo,
                area: prop.area,
                matricula: prop.matricula || '',
                car: prop.car || '',
                itr: prop.itr || '',
                ccir: prop.ccir || '',
                geometria: geometria
            };
        }).filter(prop => prop !== null);
        
        if (dadosCompartilhaveis.length === 0) {
            console.error("Nenhuma propriedade válida para compartilhar");
            return;
        }
        
        // Compactar os dados
        const dadosJSON = JSON.stringify(dadosCompartilhaveis);
        console.log("Tamanho dos dados JSON:", dadosJSON.length);
        
        let dadosCompactados;
        try {
            if (typeof window.pako !== 'undefined') {
                // Compactar usando pako
                const compressedArray = window.pako.deflate(dadosJSON);
                const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(compressedArray)));
                dadosCompactados = encodeURIComponent(base64String);
                console.log("Dados compactados com pako, tamanho:", dadosCompactados.length);
            } else {
                // Fallback para base64
                dadosCompactados = encodeURIComponent(btoa(dadosJSON));
                console.log("Dados compactados com base64, tamanho:", dadosCompactados.length);
            }
            
            // Verificar tamanho da URL resultante
            const urlBase = window.location.origin + window.location.pathname;
            const urlCompleta = urlBase + '?data=' + dadosCompactados;
            
            if (urlCompleta.length > 2000) {
                console.warn("AVISO: URL muito longa (>2000 caracteres). Alguns navegadores podem truncá-la.");
            }
            
            // Atualizar URL
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('data', dadosCompactados);
            const novaURL = window.location.pathname + '?' + urlParams.toString();
            window.history.replaceState({}, '', novaURL);
            console.log("URL atualizada com sucesso");
            
            return true;
        } catch (e) {
            console.error("Erro ao compactar dados:", e);
            return false;
        }
    } catch (error) {
        console.error("Erro geral ao atualizar URL:", error);
        return false;
    }
};

// Função para gerar link compartilhável e mostrar modal
function gerarLinkCompartilhavel() {
    // Verificar se há propriedades para compartilhar
    if (!window.propriedades || window.propriedades.length === 0) {
        alert('Não há propriedades para compartilhar. Importe pelo menos uma propriedade primeiro.');
        return;
    }
    
    // Forçar atualização da URL com os perímetros
    atualizarURLComPerimetros();
    
    // Obter a URL atual
    const urlAtual = window.location.href;
    
    // Criar modal para compartilhamento
    const modal = document.createElement('div');
    modal.className = 'modal-compartilhar';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Compartilhar Mapa</h2>
            <p>Copie o link abaixo para compartilhar este mapa com todas as propriedades:</p>
            <div class="url-container">
                <input type="text" id="url-compartilhavel" value="${urlAtual}" readonly>
                <button id="copiar-url">Copiar</button>
            </div>
            <p class="copy-message" id="copy-success" style="display:none;">Link copiado com sucesso!</p>
            <div class="share-options">
                <p>Ou compartilhe diretamente:</p>
                <button id="share-whatsapp" class="share-button whatsapp">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                <button id="share-email" class="share-button email">
                    <i class="fas fa-envelope"></i> Email
                </button>
            </div>
        </div>
    `;
    
    // Adicionar o modal ao corpo do documento
    document.body.appendChild(modal);
    
    // Mostrar o modal
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 100);
    
    // Botão de fechar
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Botão de copiar URL
    const copyBtn = modal.querySelector('#copiar-url');
    copyBtn.addEventListener('click', () => {
        const urlInput = modal.querySelector('#url-compartilhavel');
        urlInput.select();
        document.execCommand('copy');
        
        // Mostrar mensagem de sucesso
        const copyMsg = modal.querySelector('#copy-success');
        copyMsg.style.display = 'block';
        setTimeout(() => {
            copyMsg.style.display = 'none';
        }, 2000);
    });
    
    // Botão de compartilhar via WhatsApp
    const whatsappBtn = modal.querySelector('#share-whatsapp');
    whatsappBtn.addEventListener('click', () => {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Confira este mapa de propriedades: ' + urlAtual)}`;
        window.open(whatsappUrl, '_blank');
    });
    
    // Botão de compartilhar via Email
    const emailBtn = modal.querySelector('#share-email');
    emailBtn.addEventListener('click', () => {
        const emailUrl = `mailto:?subject=${encodeURIComponent('Mapa de Propriedades')}&body=${encodeURIComponent('Confira este mapa de propriedades: ' + urlAtual)}`;
        window.location.href = emailUrl;
    });
}

// Função para carregar perímetros a partir de dados compartilhados
window.carregarPerimetrosDeDados = function(dados) {
    try {
        console.log('Iniciando carregamento de perímetros...');
        
        // Verificar se o mapa está inicializado
        if (!window.mapaAtual) {
            console.error('Mapa não inicializado');
            return;
        }
        
        // Verificar se os dados são válidos
        if (!dados || !Array.isArray(dados)) {
            console.error('Dados inválidos para carregar');
            return;
        }
        
        // Converter string para objeto se necessário
        if (typeof dados === 'string') {
            try {
                dados = JSON.parse(dados);
            } catch (e) {
                console.error('Erro ao converter string para objeto:', e);
                return;
            }
        }
        
        // Garantir que dados é um array
        if (!Array.isArray(dados)) {
            dados = [dados];
        }
        
        console.log(`${dados.length} propriedades encontradas para carregar`);
        
        // Limpar propriedades existentes
        if (window.propriedades) {
            window.propriedades.forEach(prop => {
                if (prop.camada) {
                    window.mapaAtual.removeLayer(prop.camada);
                }
            });
        }
        
        // Inicializar array de propriedades
        window.propriedades = [];
        
        // Processar cada propriedade
        dados.forEach((prop, index) => {
            try {
                // Validar geometria
                if (!prop.geometria) {
                    console.warn(`Propriedade ${index} sem geometria válida`);
                    return;
                }
                
                // Criar camada Leaflet
                const layer = L.geoJSON(prop.geometria, {
                    style: {
                        color: '#2a7e19',
                        weight: 2,
                        opacity: 0.7,
                        fillColor: '#2a7e19',
                        fillOpacity: 0.2
                    },
                    onEachFeature: function(feature, layer) {
                        layer.on({
                            click: function(e) {
                                if (typeof window.mostrarInformacoes === 'function') {
                                    window.mostrarInformacoes(propriedade);
                                }
                            },
                            mouseover: function(e) {
                                layer.setStyle({
                                    weight: 3,
                                    fillOpacity: 0.4
                                });
                            },
                            mouseout: function(e) {
                                if (window.camadaAtiva !== layer) {
                                    layer.setStyle({
                                        color: '#2a7e19',
                                        weight: 2,
                                        opacity: 0.7,
                                        fillColor: '#2a7e19',
                                        fillOpacity: 0.2
                                    });
                                }
                            }
                        });
                    }
                });
                
                // Criar objeto da propriedade
                const propriedade = {
                    id: prop.id || `prop-${index}`,
                    nome: prop.nome || "Propriedade Sem Nome",
                    tipo: prop.tipo || "Polígono",
                    area: prop.area || 0,
                    matricula: prop.matricula || "",
                    car: prop.car || "",
                    itr: prop.itr || "",
                    ccir: prop.ccir || "",
                    camada: layer,
                    geometria: prop.geometria
                };
                
                // Adicionar ao mapa e ao array de propriedades
                layer.addTo(window.mapaAtual);
                window.propriedades.push(propriedade);
                
                console.log(`Propriedade ${index} carregada com sucesso`);
                
            } catch (error) {
                console.error(`Erro ao carregar propriedade ${index}:`, error);
            }
        });
        
        // Ajustar zoom para mostrar todas as propriedades
        if (window.propriedades.length > 0) {
            const bounds = L.featureGroup(window.propriedades.map(p => p.camada)).getBounds();
            window.mapaAtual.fitBounds(bounds);
        }
        
        // Atualizar lista de propriedades
        if (typeof window.atualizarListaPropriedades === 'function') {
            window.atualizarListaPropriedades();
        }
        
        console.log('Carregamento de perímetros concluído');
        
    } catch (error) {
        console.error('Erro ao carregar perímetros:', error);
        alert('Erro ao carregar as propriedades. Por favor, tente novamente.');
    }
};

window.descompactarDaURL = function(compactedString) {
    try {
        console.log("Iniciando descompactação dos dados da URL...");
        console.log("String compactada recebida (tamanho):", compactedString.length);
        
        // Primeiro decodificar a URL
        const decodedString = decodeURIComponent(compactedString);
        console.log("String decodificada da URL (tamanho):", decodedString.length);
        
        // Tentar processar como JSON direto primeiro
        try {
            const jsonData = JSON.parse(decodedString);
            console.log("Dados já estão em formato JSON válido");
            return jsonData;
        } catch (jsonError) {
            console.log("Não é um JSON direto, tentando decodificar...");
        }
        
        // Tentar decodificar base64
        try {
            const base64Decoded = atob(decodedString);
            console.log("Base64 decodificado (tamanho):", base64Decoded.length);
            
            // Se pako estiver disponível, tentar descomprimir
            if (typeof window.pako !== 'undefined') {
                try {
                    const byteArray = new Uint8Array(base64Decoded.split('').map(c => c.charCodeAt(0)));
                    const inflated = window.pako.inflate(byteArray, { to: 'string' });
                    console.log("Dados descomprimidos com pako (tamanho):", inflated.length);
                    
                    const jsonData = JSON.parse(inflated);
                    console.log("Dados descomprimidos convertidos para JSON com sucesso");
                    return jsonData;
                } catch (pakoError) {
                    console.warn("Erro na descompressão pako, tentando base64 direto:", pakoError);
                }
            }
            
            // Se pako falhou ou não está disponível, tentar base64 como JSON
            try {
                const jsonData = JSON.parse(base64Decoded);
                console.log("Base64 decodificado convertido para JSON com sucesso");
                return jsonData;
            } catch (jsonError) {
                console.error("Erro ao converter base64 para JSON:", jsonError);
            }
        } catch (base64Error) {
            console.error("Erro na decodificação base64:", base64Error);
        }
        
        throw new Error("Não foi possível descompactar os dados em nenhum formato");
    } catch (error) {
        console.error("Erro fatal na descompactação:", error);
        return null;
    }
}; 