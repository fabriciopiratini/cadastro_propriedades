// Armazenamento de propriedades
window.propriedades = [];
window.mapaAtual = null;
window.camadaAtiva = null;

// Inicialização do mapa
document.addEventListener('DOMContentLoaded', () => {
    console.log("Aplicação iniciada. Verificando ambiente...");
    
    // Log do URL atual
    console.log("URL atual:", window.location.href);
    console.log("Hostname:", window.location.hostname);
    console.log("Protocol:", window.location.protocol);
    console.log("UserAgent:", navigator.userAgent);
    
    // Verificar o suporte do navegador
    verificarNavegador();
    
    // Verificar conexão com a internet
    verificarConexao();
    
    // Verificar se as bibliotecas estão carregadas
    const bibliotecasOk = verificarBibliotecas();
    
    // Só inicializa se as bibliotecas estiverem disponíveis
    if (bibliotecasOk) {
        try {
            // Inicializar componentes
            inicializarMapa();
            configurarEventos();
            carregarDadosIniciais();
            
            // Carregar dados salvos localmente (se houver)
            if (typeof carregarDadosLocais === 'function') {
                carregarDadosLocais();
            } else {
                console.warn("A função carregarDadosLocais não está disponível!");
            }
        } catch (error) {
            console.error("Erro na inicialização da aplicação:", error);
            mostrarErroInicializacao(error);
        }
    } else {
        mostrarErroInicializacao("Bibliotecas necessárias não encontradas");
    }
});

// Verificar o suporte do navegador
function verificarNavegador() {
    // Verificar se o navegador é muito antigo
    if (!window.localStorage || !window.fetch) {
        alert("Seu navegador parece ser muito antigo. Algumas funcionalidades podem não funcionar corretamente. Recomendamos usar Chrome, Firefox, Edge ou Safari em suas versões mais recentes.");
        console.warn("Navegador antigo detectado: sem suporte a localStorage ou fetch");
    }
}

// Verificar conexão com a internet
function verificarConexao() {
    if (navigator.onLine) {
        console.log("Dispositivo conectado à internet");
    } else {
        console.warn("Dispositivo offline! Alguns recursos podem não funcionar");
        alert("Você está offline. Os mapas e imagens de satélite podem não carregar corretamente.");
    }
    
    // Monitorar mudanças na conectividade
    window.addEventListener('online', () => {
        console.log("Dispositivo conectado à internet");
        // Recarregar os tiles do mapa se o mapa já estiver inicializado
        if (window.mapaAtual) {
            window.mapaAtual.invalidateSize();
        }
    });
    
    window.addEventListener('offline', () => {
        console.warn("Dispositivo offline!");
        alert("Você está offline. Os mapas e imagens de satélite podem não carregar corretamente.");
    });
}

// Verificar se as bibliotecas necessárias estão carregadas
function verificarBibliotecas() {
    let todasCarregadas = true;
    
    // Lista de bibliotecas necessárias
    const bibliotecas = [
        { nome: "Leaflet", obj: "L" },
        { nome: "Leaflet-Omnivore", obj: "omnivore" },
        { nome: "JSZip", obj: "JSZip" },
        { nome: "ShpJS", obj: "shp" }
    ];
    
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
}

// Mostrar erro de inicialização
function mostrarErroInicializacao(erro) {
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
}

// Função para inicializar o mapa Leaflet
function inicializarMapa() {
    try {
        // Criar o mapa com visão inicial do Brasil
        window.mapaAtual = L.map('map', {
            center: [-15.7801, -47.9292], // Centro aproximado do Brasil
            zoom: 5,
            minZoom: 3,
            maxZoom: 19
        });

        // Tentar adicionar camada base do Google Maps
        try {
            L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                attribution: '&copy; Google',
                maxZoom: 19
            }).addTo(window.mapaAtual);
        } catch (e) {
            console.error("Erro ao carregar mapa do Google, tentando OpenStreetMap:", e);
            
            // Fallback para OpenStreetMap se o Google Maps falhar
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(window.mapaAtual);
        }

        // Adicionar escala
        L.control.scale({
            imperial: false,
            maxWidth: 200
        }).addTo(window.mapaAtual);
        
    } catch (error) {
        console.error("Erro ao inicializar o mapa:", error);
        throw new Error("Não foi possível inicializar o mapa. Erro: " + error.message);
    }
}

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
                                    ccir: props.CCIR || '',
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
function adicionarCamadaAoMapa(layer, nome, tipo) {
    // Configurar estilo para a camada
    layer.setStyle({
        color: '#2a7e19',
        weight: 2,
        opacity: 0.7,
        fillColor: '#2a7e19',
        fillOpacity: 0.2
    });
    
    // Adicionar interatividade
    layer.eachLayer(function(l) {
        if (l.feature) {
            // Obter propriedades do feature
            const props = l.feature.properties || {};
            
            // Criar objeto da propriedade
            const propriedade = {
                id: gerarId(),
                nome: props.name || props.Nome || nome.replace(/\.[^/.]+$/, ""),
                camada: l,
                tipo: tipo,
                area: calcularArea(l),
                propriedades: props,
                // Campos para documentos
                matricula: props.MATRICULA || props.Matricula || '',
                car: props.CAR || '',
                itr: props.ITR || '',
                ccir: props.CCIR || '',
                documentos: []
            };
            
            // Adicionar ao armazenamento
            window.propriedades.push(propriedade);
            
            // Configurar eventos
            l.on({
                click: (e) => window.mostrarInformacoes(propriedade),
                mouseover: (e) => {
                    l.setStyle({
                        weight: 3,
                        fillOpacity: 0.4
                    });
                },
                mouseout: (e) => {
                    if (window.camadaAtiva !== l) {
                        layer.resetStyle(l);
                    }
                }
            });
        }
    });
    
    // Adicionar camada ao mapa
    layer.addTo(window.mapaAtual);
    
    // Ajustar o zoom para mostrar a nova camada
    window.mapaAtual.fitBounds(layer.getBounds());
    
    // Atualizar a lista de propriedades
    window.atualizarListaPropriedades();
    
    // Auto-salvar os dados
    if (typeof salvarDadosLocalmente === 'function') {
        setTimeout(salvarDadosLocalmente, 1000);
    }
}

// Calcular área aproximada do polígono em hectares
function calcularArea(layer) {
    try {
        if (layer.feature.geometry.type === 'Polygon' || layer.feature.geometry.type === 'MultiPolygon') {
            // Usar Leaflet para calcular área em metros quadrados
            const areaEmM2 = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            // Converter para hectares (1 hectare = 10000 m²)
            return (areaEmM2 / 10000).toFixed(2);
        }
    } catch (e) {
        console.warn("Não foi possível calcular área:", e);
    }
    return "N/A";
}

// Gerar ID único para propriedades
function gerarId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Mostrar informações da propriedade
window.mostrarInformacoes = function(propriedade) {
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
    document.getElementById('info-titulo').textContent = propriedade.nome;
    document.getElementById('info-nome').textContent = propriedade.nome;
    document.getElementById('info-area').textContent = propriedade.area ? `${propriedade.area} ha` : 'N/A';
    document.getElementById('info-matricula').textContent = propriedade.matricula || 'Não informado';
    
    // Formatação especial para o CAR (código longo)
    const carEl = document.getElementById('info-car');
    if (propriedade.car) {
        carEl.innerHTML = `<span class="code-value">${propriedade.car}</span>`;
    } else {
        carEl.textContent = 'Não informado';
    }
    
    document.getElementById('info-itr').textContent = propriedade.itr || 'Não informado';
    document.getElementById('info-ccir').textContent = propriedade.ccir || 'Não informado';
    
    // Mostrar painel
    document.getElementById('propriedade-info').style.display = 'block';
    
    // Destacar na lista
    window.atualizarListaPropriedades(propriedade.id);
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

// Carregar dados iniciais
function carregarDadosIniciais() {
    // Verificar se há um parâmetro de produtor na URL
    const urlParams = new URLSearchParams(window.location.search);
    const idProdutor = urlParams.get('produtor');
    
    if (idProdutor) {
        // Tentar carregar arquivo KML específico para este produtor
        const arquivoKML = `./src/data/produtor_${idProdutor}.kml`;
        console.log(`Tentando carregar arquivo KML: ${arquivoKML}`);
        
        fetch(arquivoKML)
            .then(response => {
                console.log(`Resposta do servidor para ${arquivoKML}:`, response.status, response.statusText);
                if (!response.ok) {
                    throw new Error(`Arquivo não encontrado (${response.status})`);
                }
                return response.text();
            })
            .then(kmlString => {
                try {
                    console.log(`KML carregado, tamanho: ${kmlString.length} caracteres`);
                    // Processar o KML
                    const kmlLayer = omnivore.kml.parse(kmlString);
                    adicionarCamadaAoMapa(kmlLayer, `Propriedades do Produtor ${idProdutor}`, 'kml');
                    console.log(`Dados do produtor ${idProdutor} carregados com sucesso.`);
                } catch (error) {
                    console.error('Erro ao processar KML:', error);
                    // Tentar carregar do localStorage
                    carregarDoLocalStorage();
                }
            })
            .catch(error => {
                console.error('Erro ao carregar arquivo KML:', error);
                // Tentar carregar do localStorage
                carregarDoLocalStorage();
            });
    } else {
        console.log("Nenhum ID de produtor especificado na URL");
        // Verificar se há dados salvos localmente
        carregarDoLocalStorage();
    }
}

// Tentar carregar do localStorage
function carregarDoLocalStorage() {
    // Verifica se a função de carregamento local existe
    if (typeof carregarDadosLocais === 'function') {
        const dadosSalvos = carregarDadosLocais();
        
        if (dadosSalvos && dadosSalvos.length > 0) {
            console.log('Carregando propriedades do localStorage');
            
            // Tentar recriar as propriedades a partir dos dados salvos
            dadosSalvos.forEach(prop => {
                try {
                    if (prop.geometria) {
                        // Tentar recriar a geometria
                        const geometria = JSON.parse(prop.geometria);
                        
                        // Criar um objeto GeoJSON para o polígono
                        let coords;
                        
                        // Verificar a estrutura dos dados
                        if (Array.isArray(geometria) && geometria.length > 0) {
                            if (Array.isArray(geometria[0]) && geometria[0].length > 0) {
                                if (typeof geometria[0][0] === 'object' && 'lat' in geometria[0][0]) {
                                    // Converter formato LatLng para coordenadas [lng, lat]
                                    coords = geometria[0].map(pt => [pt.lng, pt.lat]);
                                } else {
                                    coords = geometria[0];
                                }
                            } else {
                                coords = geometria;
                            }
                        } else {
                            console.error('Formato de geometria não reconhecido:', geometria);
                            return;
                        }
                        
                        // Criar um objeto "feature" GeoJSON
                        const feature = {
                            type: 'Feature',
                            properties: {
                                name: prop.nome,
                                MATRICULA: prop.matricula,
                                CAR: prop.car,
                                ITR: prop.itr,
                                CCIR: prop.ccir
                            },
                            geometry: {
                                type: 'Polygon',
                                coordinates: [coords]
                            }
                        };
                        
                        // Adicionar a camada ao mapa
                        const layer = L.geoJSON(feature);
                        adicionarCamadaAoMapa(layer, prop.nome, prop.tipo || 'local');
                        
                        // Tentar associar o ID original
                        const propriedadeRecriada = window.propriedades.find(p => p.nome === prop.nome);
                        if (propriedadeRecriada) {
                            propriedadeRecriada.id = prop.id;
                        }
                    }
                } catch (e) {
                    console.error('Erro ao recriar propriedade:', e);
                }
            });
            
            if (window.propriedades.length > 0) {
                return;
            }
        }
    }
    
    // Se nenhum dado for encontrado ou a recriação falhar, mostrar mensagem
    mostrarMensagemImportacao();
}

// Mostrar mensagem de importação
function mostrarMensagemImportacao() {
    const listaEl = document.getElementById('lista-propriedades');
    listaEl.innerHTML = `
        <div class="info-message">
            <p>Nenhuma propriedade encontrada.</p>
            <p>Clique no botão "Importar Arquivos" para adicionar suas propriedades.</p>
            <p>Você pode importar arquivos KML, KMZ ou Shapefile.</p>
        </div>
    `;
    
    console.log('Sistema pronto para importar arquivos KML, KMZ ou Shapefile.');
} 