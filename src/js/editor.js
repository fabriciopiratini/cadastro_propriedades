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
    // Cria uma versão simplificada das propriedades para armazenamento
    const dadosSalvos = window.propriedades.map(p => ({
        id: p.id,
        nome: p.nome,
        matricula: p.matricula,
        car: p.car,
        itr: p.itr,
        ccir: p.ccir,
        area: p.area
        // Não podemos armazenar objetos completos como camada
    }));
    
    try {
        localStorage.setItem('propriedadesSalvas', JSON.stringify(dadosSalvos));
    } catch (error) {
        console.error('Erro ao salvar dados localmente:', error);
    }
}

// Carregar dados do localStorage
function carregarDadosLocais() {
    try {
        const dadosSalvos = localStorage.getItem('propriedadesSalvas');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            
            // Atualizar as propriedades carregadas com dados salvos
            dados.forEach(dadoSalvo => {
                const propriedade = window.propriedades.find(p => p.id === dadoSalvo.id);
                if (propriedade) {
                    propriedade.matricula = dadoSalvo.matricula;
                    propriedade.car = dadoSalvo.car;
                    propriedade.itr = dadoSalvo.itr;
                    propriedade.ccir = dadoSalvo.ccir;
                }
            });
        }
    } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
    }
} 