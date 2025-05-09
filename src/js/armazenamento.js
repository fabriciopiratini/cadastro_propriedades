/**
 * Módulo de armazenamento para gerenciar persistência e compartilhamento de dados
 * de propriedades rurais no Portal do Produtor
 */

// Chave utilizada para armazenamento no localStorage
const STORAGE_KEY = 'portal_produtor_propriedades';

/**
 * Verifica se o localStorage está disponível
 * @returns {boolean} true se o localStorage estiver disponível
 */
window.verificarLocalStorage = function() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.error('localStorage não está disponível:', e);
        return false;
    }
};

/**
 * Salva dados das propriedades no localStorage
 */
window.salvarDadosLocalmente = function() {
    // Verificar se localStorage está disponível
    if (!window.verificarLocalStorage()) {
        console.error('Não foi possível salvar dados localmente - localStorage não disponível');
        return false;
    }
    
    // Verificar se há propriedades para salvar
    if (!window.propriedades || window.propriedades.length === 0) {
        console.log('Nenhuma propriedade para salvar');
        return false;
    }
    
    try {
        // Criar uma versão serializada de cada propriedade
        const dadosParaSalvar = window.propriedades.map(prop => {
            // Extrair coordenadas da geometria
            let geometria = null;
            try {
                if (prop.camada && prop.camada.toGeoJSON) {
                    geometria = JSON.stringify(prop.camada.toGeoJSON().geometry);
                } else if (prop.camada && prop.camada.getLatLngs) {
                    geometria = JSON.stringify(prop.camada.getLatLngs());
                }
            } catch (e) {
                console.error('Erro ao serializar geometria:', e);
            }
            
            // Retornar objeto serializado
            return {
                id: prop.id,
                nome: prop.nome,
                area: prop.area,
                tipo: prop.tipo,
                matricula: prop.matricula,
                car: prop.car,
                itr: prop.itr,
                ccir: prop.ccir,
                geometria: geometria
            };
        });
        
        // Salvar no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosParaSalvar));
        console.log(`${dadosParaSalvar.length} propriedades salvas localmente`);
        
        // Também atualizar o URL para compartilhamento se a função existir
        if (typeof window.atualizarURLComPerimetros === 'function') {
            try {
                window.atualizarURLComPerimetros();
            } catch (e) {
                console.error('Erro ao atualizar URL com perímetros:', e);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar propriedades localmente:', error);
        return false;
    }
};

/**
 * Carrega dados das propriedades do localStorage
 * @returns {Array} Array de propriedades ou array vazio se nada for encontrado
 */
window.carregarDadosLocais = function() {
    // Verificar se localStorage está disponível
    if (!window.verificarLocalStorage()) {
        console.error('Não foi possível carregar dados locais - localStorage não disponível');
        return [];
    }
    
    try {
        // Recuperar dados do localStorage
        const dadosSalvos = localStorage.getItem(STORAGE_KEY);
        
        if (!dadosSalvos) {
            console.log('Nenhum dado salvo localmente');
            return [];
        }
        
        // Converter string JSON para objeto
        const dados = JSON.parse(dadosSalvos);
        console.log(`${dados.length} propriedades encontradas no armazenamento local`);
        
        return dados;
    } catch (error) {
        console.error('Erro ao carregar propriedades do localStorage:', error);
        return [];
    }
};

/**
 * Limpa todos os dados armazenados localmente
 */
window.limparDadosLocais = function() {
    // Verificar se localStorage está disponível
    if (!window.verificarLocalStorage()) {
        console.error('Não foi possível limpar dados locais - localStorage não disponível');
        return false;
    }
    
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Dados locais removidos com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao limpar dados locais:', error);
        return false;
    }
};

/**
 * Exporta os dados das propriedades como arquivo JSON
 */
window.exportarDados = function() {
    try {
        // Verificar se há propriedades para exportar
        if (!window.propriedades || window.propriedades.length === 0) {
            alert('Não há propriedades para exportar.');
            return false;
        }
        
        // Criar dados para exportar (similar ao salvarDadosLocalmente)
        const dadosParaExportar = window.propriedades.map(prop => {
            let geometria = null;
            try {
                if (prop.camada && prop.camada.toGeoJSON) {
                    geometria = prop.camada.toGeoJSON().geometry;
                }
            } catch (e) {
                console.error('Erro ao serializar geometria para exportação:', e);
            }
            
            return {
                id: prop.id,
                nome: prop.nome,
                area: prop.area,
                tipo: prop.tipo,
                matricula: prop.matricula,
                car: prop.car,
                itr: prop.itr,
                ccir: prop.ccir,
                geometria: geometria
            };
        });
        
        // Converter para JSON
        const jsonString = JSON.stringify(dadosParaExportar, null, 2);
        
        // Criar blob e link para download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Criar elemento de download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'propriedades_exportadas.json';
        
        // Adicionar ao corpo e clicar
        document.body.appendChild(a);
        a.click();
        
        // Limpeza
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('Dados exportados com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert('Erro ao exportar dados: ' + error.message);
        return false;
    }
};

/**
 * Gera uma URL compartilhável com todas as propriedades
 * @returns {string} URL para compartilhamento ou null em caso de erro
 */
window.gerarURLCompartilhavel = function() {
    try {
        // Verificar se há propriedades para compartilhar
        if (!window.propriedades || window.propriedades.length === 0) {
            return null;
        }
        
        // Criar dados compartilháveis (similar ao salvarDadosLocalmente)
        const dadosCompartilhaveis = window.propriedades.map(prop => {
            let geometria = null;
            try {
                if (prop.camada && prop.camada.toGeoJSON) {
                    geometria = prop.camada.toGeoJSON().geometry;
                }
            } catch (e) {
                console.error('Erro ao serializar geometria para compartilhamento:', e);
            }
            
            return {
                id: prop.id,
                nome: prop.nome,
                area: prop.area,
                tipo: prop.tipo,
                matricula: prop.matricula,
                car: prop.car,
                itr: prop.itr,
                ccir: prop.ccir,
                geometria: geometria
            };
        });
        
        // Converter para JSON e compactar para URL
        const jsonString = JSON.stringify(dadosCompartilhaveis);
        
        // Verificar se função de compactação existe
        if (typeof window.compactarParaURL === 'function') {
            try {
                const dadosCompactados = window.compactarParaURL(jsonString);
                
                // Criar URL com parâmetros
                const urlBase = window.location.href.split('?')[0];
                const urlCompartilhavel = `${urlBase}?data=${dadosCompactados}`;
                
                console.log('URL compartilhável gerada com sucesso');
                return urlCompartilhavel;
            } catch (e) {
                console.error('Erro ao compactar dados para URL:', e);
                return null;
            }
        } else {
            console.error('Função compactarParaURL não disponível');
            return null;
        }
    } catch (error) {
        console.error('Erro ao gerar URL compartilhável:', error);
        return null;
    }
};

/**
 * Descompacta os dados de um URL compartilhável
 * @param {string} dadosCompactados Dados compactados para descompactar
 * @returns {Array} Array de propriedades descompactadas
 */
window.descompactarDaURL = function(dadosCompactados) {
    try {
        console.log('Iniciando descompressão dos dados...');
        
        // Decodificar a URL
        const dadosDecodificados = decodeURIComponent(dadosCompactados);
        
        // Tentar diferentes métodos de descompressão
        try {
            // Método 1: Tentar descompressão com Pako
            if (typeof pako !== 'undefined') {
                console.log('Tentando descompressão com Pako...');
                const dadosBinarios = atob(dadosDecodificados);
                const dadosDescompactados = pako.inflate(dadosBinarios);
                const jsonString = new TextDecoder().decode(dadosDescompactados);
                return JSON.parse(jsonString);
            }
        } catch (pakoError) {
            console.warn('Falha na descompressão com Pako:', pakoError);
        }
        
        try {
            // Método 2: Tentar decodificar base64 diretamente
            console.log('Tentando decodificação base64...');
            const jsonString = atob(dadosDecodificados);
            return JSON.parse(jsonString);
        } catch (base64Error) {
            console.warn('Falha na decodificação base64:', base64Error);
        }
        
        // Método 3: Tentar usar os dados diretamente como JSON
        console.log('Tentando usar dados como JSON direto...');
        return JSON.parse(dadosDecodificados);
        
    } catch (error) {
        console.error('Erro ao descompactar dados:', error);
        throw new Error('Não foi possível descompactar os dados. Por favor, tente gerar um novo link de compartilhamento.');
    }
};

// Auto-salvar quando propriedades são modificadas
document.addEventListener('DOMContentLoaded', () => {
    console.log('Módulo de armazenamento inicializado');
    
    // Auto-salvar periodicamente (a cada 30 segundos)
    setInterval(() => {
        if (window.propriedades && window.propriedades.length > 0) {
            window.salvarDadosLocalmente();
        }
    }, 30000);
});

window.atualizarURLComPerimetros = function() {
    try {
        console.log('Iniciando atualização da URL com perímetros...');
        
        // Verificar se há propriedades para compartilhar
        if (!window.propriedades || window.propriedades.length === 0) {
            console.log('Nenhuma propriedade para compartilhar');
            return;
        }

        // Preparar dados para compartilhamento
        const dadosCompartilhaveis = window.propriedades.map(prop => {
            let geometria = null;
            try {
                if (prop.camada && prop.camada.toGeoJSON) {
                    geometria = prop.camada.toGeoJSON().geometry;
                }
            } catch (e) {
                console.error('Erro ao serializar geometria:', e);
            }
            
            return {
                id: prop.id,
                nome: prop.nome,
                area: prop.area,
                tipo: prop.tipo,
                matricula: prop.matricula || '',
                car: prop.car || '',
                itr: prop.itr || '',
                ccir: prop.ccir || '',
                geometria: geometria
            };
        });

        console.log(`${dadosCompartilhaveis.length} propriedades preparadas para compartilhamento`);

        // Converter para JSON
        const jsonString = JSON.stringify(dadosCompartilhaveis);
        
        // Verificar tamanho dos dados antes da compactação
        if (jsonString.length > 50000) {
            console.warn('Dados muito grandes para compartilhamento via URL');
            alert('Os dados são muito grandes para compartilhar via URL. Considere reduzir o número de propriedades ou simplificar as geometrias.');
            return;
        }

        // Compactar dados
        let dadosCompactados;
        try {
            if (typeof pako !== 'undefined') {
                console.log('Compactando dados com Pako...');
                const compressedArray = pako.deflate(jsonString);
                dadosCompactados = btoa(String.fromCharCode.apply(null, new Uint8Array(compressedArray)));
            } else {
                console.log('Pako não disponível, usando codificação base64 simples...');
                dadosCompactados = btoa(jsonString);
            }
            
            // Codificar para URL
            dadosCompactados = encodeURIComponent(dadosCompactados);
            
            // Verificar tamanho final da URL
            const urlBase = window.location.origin + window.location.pathname;
            const urlCompleta = `${urlBase}?data=${dadosCompactados}`;
            
            if (urlCompleta.length > 2000) {
                console.warn('URL muito longa para compartilhamento');
                alert('A URL gerada é muito longa para compartilhar. Considere reduzir o número de propriedades ou simplificar as geometrias.');
                return;
            }
            
            // Atualizar URL
            window.history.replaceState({}, '', urlCompleta);
            console.log('URL atualizada com sucesso');
            
            // Mostrar mensagem de sucesso
            const mensagemEl = document.getElementById('mensagem-url');
            if (mensagemEl) {
                mensagemEl.textContent = 'Link atualizado! Copie a URL atual para compartilhar.';
                mensagemEl.style.color = '#2a7e19';
            }
            
        } catch (e) {
            console.error('Erro ao compactar dados:', e);
            alert('Erro ao gerar o link de compartilhamento. Por favor, tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao atualizar URL:', error);
        alert('Erro ao gerar o link de compartilhamento. Por favor, tente novamente.');
    }
}; 