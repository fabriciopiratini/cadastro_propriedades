/**
 * Módulo de armazenamento para gerenciar persistência e compartilhamento de dados
 * de propriedades rurais no Portal do Produtor
 */

// Chave utilizada para armazenamento no localStorage
const STORAGE_KEY = 'portal_produtor_propriedades';

/**
 * Salva dados das propriedades no localStorage
 */
function salvarDadosLocalmente() {
    // Verificar se há propriedades para salvar
    if (!window.propriedades || window.propriedades.length === 0) {
        console.log('Nenhuma propriedade para salvar');
        return;
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
        if (typeof atualizarURLComPerimetros === 'function') {
            atualizarURLComPerimetros();
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar propriedades localmente:', error);
        return false;
    }
}

/**
 * Carrega dados das propriedades do localStorage
 * @returns {Array} Array de propriedades ou array vazio se nada for encontrado
 */
function carregarDadosLocais() {
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
}

/**
 * Limpa todos os dados armazenados localmente
 */
function limparDadosLocais() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Dados locais removidos com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao limpar dados locais:', error);
        return false;
    }
}

/**
 * Exporta os dados das propriedades como arquivo JSON
 */
function exportarDados() {
    try {
        // Verificar se há propriedades para exportar
        if (!window.propriedades || window.propriedades.length === 0) {
            alert('Não há propriedades para exportar.');
            return;
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
}

/**
 * Gera uma URL compartilhável com todas as propriedades
 * @returns {string} URL para compartilhamento ou null em caso de erro
 */
function gerarURLCompartilhavel() {
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
        if (typeof compactarParaURL === 'function') {
            const dadosCompactados = compactarParaURL(jsonString);
            
            // Criar URL com parâmetros
            const url = new URL(window.location.href);
            url.searchParams.set('data', dadosCompactados);
            
            return url.toString();
        } else {
            // Fallback simples de codificação para URL
            const encoded = encodeURIComponent(btoa(jsonString));
            
            const url = new URL(window.location.href);
            url.searchParams.set('data', encoded);
            
            return url.toString();
        }
    } catch (error) {
        console.error('Erro ao gerar URL compartilhável:', error);
        return null;
    }
}

// Auto-salvar quando propriedades são modificadas
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se tem dados compartilhados na URL e tentar carregá-los primeiro
    const urlParams = new URLSearchParams(window.location.search);
    const dadosURL = urlParams.get('data');
    
    // Se não tem dados na URL, verificar localStorage
    if (!dadosURL) {
        console.log('Verificando armazenamento local ao inicializar...');
        
        // Auto-salvar periodicamente (a cada 30 segundos)
        setInterval(() => {
            if (window.propriedades && window.propriedades.length > 0) {
                salvarDadosLocalmente();
            }
        }, 30000);
    }
}); 