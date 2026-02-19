/* ====================================
   SELEÇÃO DOS ELEMENTOS DA PÁGINA
   Aqui encontramos todos os elementos HTML
   que vamos usar no JavaScript
==================================== */
const inputTexto = document.querySelector(".input-texto");          // Campo onde usuário digita
const idioma = document.querySelector(".idioma");                   // Menu de seleção de idiomas
const resultado = document.querySelector(".traducao");              // Campo onde mostra a tradução
const botaoTraduzir = document.getElementById("btnTraduzir");       // Botão de traduzir (tem ID)
const botaoMicrofone = document.getElementById("btnMicrofone");     // Botão do microfone (tem ID)
const iconeMicrofone = document.getElementById("iconeMicrofone");   // Imagem dentro do botão microfone

/* ====================================
   VARIÁVEIS PARA O MICROFONE
   Variáveis que controlam o estado do microfone
==================================== */
let reconhecimentoVoz = null;  // Objeto que gerencia o reconhecimento de voz
let estaOuvindo = false;       // Flag: true = microfone ligado, false = desligado

/* ====================================
   CONFIGURAR OS BOTÕES
   Adiciona os "ouvintes de evento" aos botões
   para saber quando o usuário clica neles
==================================== */
if (botaoTraduzir) {
    // Quando clicar no botão traduzir, executa a função "traduzir"
    botaoTraduzir.addEventListener("click", traduzir);
}

if (botaoMicrofone) {
    // Quando clicar no botão microfone, executa a função "alternarMicrofone"
    botaoMicrofone.addEventListener("click", alternarMicrofone);
} else {
    console.log("Atencao: Botao de microfone nao encontrado");
}

/* ====================================
   FUNÇÃO PARA O MICROFONE
   Controla o microfone: liga e desliga
==================================== */
function alternarMicrofone() {
    // Se NÃO está ouvindo, começa a ouvir
    if (!estaOuvindo) {
        iniciarReconhecimentoVoz();
    } 
    // Se JÁ está ouvindo, para de ouvir
    else {
        pararReconhecimentoVoz();
    }
}

/* ====================================
   FUNÇÃO: INICIAR RECONHECIMENTO DE VOZ
   Configura e inicia o sistema de voz
==================================== */
function iniciarReconhecimentoVoz() {
    // Verifica se o navegador tem suporte a reconhecimento de voz
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        alert("Seu navegador nao suporta reconhecimento de voz. Use Chrome ou Edge.");
        return; // Para a função se não tiver suporte
    }
    
    // Cria o objeto de reconhecimento (funciona em Chrome e Edge)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    reconhecimentoVoz = new SpeechRecognition();
    
    // CONFIGURAÇÕES do reconhecimento:
    reconhecimentoVoz.lang = determinarIdiomaMicrofone();  // Idioma do microfone
    reconhecimentoVoz.continuous = false;                  // Para automaticamente após falar
    reconhecimentoVoz.interimResults = false;              // Só resultados finais (não palavras parciais)
    reconhecimentoVoz.maxAlternatives = 1;                 // Só uma alternativa de transcrição
    
    /* ====================================
       EVENTO: QUANDO COMEÇAR A OUVIR
       Executa quando o microfone começa a funcionar
    ==================================== */
    reconhecimentoVoz.onstart = function() {
        estaOuvindo = true;                       // Marca que está ouvindo
        atualizarInterfaceMicrofone(true);        // Deixa o botão vermelho
        
        // Atualiza a interface para o usuário
        inputTexto.placeholder = "Fale agora..."; // Muda o texto do campo
        inputTexto.value = "";                    // Limpa o campo de texto
        resultado.value = "🎤 Escutando... Fale agora!"; // Mensagem na área de resultado
    };
    
    /* ====================================
       EVENTO: QUANDO CAPTURAR A VOZ
       Executa quando o usuário para de falar
    ==================================== */
    reconhecimentoVoz.onresult = function(evento) {
        // Pega o texto que foi falado (está dentro do evento)
        const transcricao = evento.results[0][0].transcript;
        
        // Coloca o texto falado no campo de digitação
        inputTexto.value = transcricao;
        
        // Espera meio segundo e traduz automaticamente
        setTimeout(function() {
            traduzir();  // Chama a função de tradução
        }, 500);
    };
    
    /* ====================================
       EVENTO: QUANDO PARAR DE OUVIR
       Executa quando o microfone para automaticamente
    ==================================== */
    reconhecimentoVoz.onend = function() {
        estaOuvindo = false;                         // Marca que parou de ouvir
        atualizarInterfaceMicrofone(false);          // Volta o botão ao normal
        inputTexto.placeholder = "Escreva o que quer traduzir"; // Texto normal
    };
    
    /* ====================================
       EVENTO: QUANDO DER ERRO
       Executa se houver problema no microfone
    ==================================== */
    reconhecimentoVoz.onerror = function(evento) {
        console.log("Erro no microfone:", evento.error);
        estaOuvindo = false;                         // Marca que parou
        atualizarInterfaceMicrofone(false);          // Volta ao normal
        
        // Se for erro de permissão, avisa o usuário
        if (evento.error === "not-allowed") {
            alert("Permissao para microfone negada. Permita o acesso ao microfone.");
        }
    };
    
    // FINALMENTE: Inicia o reconhecimento de voz
    reconhecimentoVoz.start();
}

/* ====================================
   FUNÇÃO: PARAR RECONHECIMENTO DE VOZ
   Para o microfone manualmente
==================================== */
function pararReconhecimentoVoz() {
    // Só para se existir o objeto E estiver ouvindo
    if (reconhecimentoVoz && estaOuvindo) {
        reconhecimentoVoz.stop();      // Para o reconhecimento
        estaOuvindo = false;           // Marca como parado
        atualizarInterfaceMicrofone(false); // Volta botão ao normal
    }
}

/* ====================================
   FUNÇÃO: DETERMINAR IDIOMA DO MICROFONE
   Define qual idioma o microfone deve entender
   baseado no que foi selecionado no menu
==================================== */
function determinarIdiomaMicrofone() {
    // Pega o valor do menu (ex: "pt|en", "en|es")
    const valorIdioma = idioma.value;
    
    // Verifica o primeiro idioma (origem) e retorna código correto
    if (valorIdioma.startsWith("pt|")) {
        return "pt-BR";  // Português do Brasil
    } else if (valorIdioma.startsWith("en|")) {
        return "en-US";  // Inglês Americano
    } else if (valorIdioma.startsWith("es|")) {
        return "es-ES";  // Espanhol da Espanha
    } else if (valorIdioma.startsWith("de|")) {
        return "de-DE";  // Alemão da Alemanha
    } else if (valorIdioma.startsWith("fr|")) {
        return "fr-FR";  // Francês da França
    }
    
    return "pt-BR";  // Idioma padrão se não encontrar
}

/* ====================================
   FUNÇÃO: ATUALIZAR INTERFACE DO MICROFONE
   Faz o botão ficar VERMELHO quando está gravando
   e volta ao normal quando para
==================================== */
function atualizarInterfaceMicrofone(gravando) {
    // Se está gravando (gravando = true)
    if (gravando) {
        // BOTÃO FICA VERMELHO E BRILHA
        botaoMicrofone.style.backgroundColor = "#ff4444";     // Cor de fundo vermelha
        botaoMicrofone.style.boxShadow = "0 0 15px #ff4444";  // Brilho vermelho ao redor
        botaoMicrofone.style.transform = "scale(1.1)";        // Aumenta um pouco o botão
        
        // ÍCONE FICA VERMELHO (usando filtro CSS)
        if (iconeMicrofone) {
            // Filtro CSS que transforma qualquer imagem em vermelho
            iconeMicrofone.style.filter = "invert(16%) sepia(99%) saturate(4214%) hue-rotate(358deg) brightness(101%) contrast(106%)";
        }
        
    } 
    // Se NÃO está gravando (gravando = false)
    else {
        // VOLTA AO NORMAL
        botaoMicrofone.style.backgroundColor = "";     // Remove cor de fundo
        botaoMicrofone.style.boxShadow = "";           // Remove brilho
        botaoMicrofone.style.transform = "";           // Volta ao tamanho normal
        
        // ÍCONE VOLTA À COR ORIGINAL
        if (iconeMicrofone) {
            iconeMicrofone.style.filter = "";          // Remove filtro vermelho
        }
    }
}

/* ====================================
   FUNÇÃO PRINCIPAL DE TRADUÇÃO
   Traduz o texto usando Google Tradutor ou MyMemory
==================================== */
async function traduzir() {
    try {
        // 1. PEGA O TEXTO E REMOVE ESPAÇOS EXTRA
        const texto = inputTexto.value.trim();
        const langpair = idioma.value;  // Ex: "pt|en"
        
        // 2. VERIFICA SE O USUÁRIO DIGITOU ALGO
        if (texto === "") {
            alert("Por favor, digite ou fale um texto para traduzir");
            return;  // Para a função se não tiver texto
        }
        
        // 3. MOSTRA MENSAGEM DE "TRADUZINDO"
        resultado.value = "Traduzindo, aguarde...";
        
        // 4. SEPARA OS IDIOMAS (origem|destino)
        const partes = langpair.split("|");
        if (partes.length !== 2) {
            resultado.value = "Erro: Formato de idioma invalido";
            return;  // Para se o formato estiver errado
        }
        
        const idiomaOrigem = partes[0];  // Primeira parte (ex: "pt")
        const idiomaDestino = partes[1]; // Segunda parte (ex: "en")
        
        // 5. VARIÁVEL PARA ARMAZENAR A TRADUÇÃO
        let traducao = "";
        
        // 6. TENTA USAR GOOGLE TRADUTOR (MAIS PRECISO)
        try {
            traducao = await usarGoogleTradutor(texto, idiomaOrigem, idiomaDestino);
        } 
        // 7. SE GOOGLE FALHAR, TENTA MYMEMORY
        catch (erroGoogle) {
            try {
                traducao = await usarMyMemory(texto, langpair);
            } 
            // 8. SE AMBOS FALHAREM, MOSTRA ERRO
            catch (erroMyMemory) {
                throw new Error("Nao foi possivel traduzir");
            }
        }
        
        // 9. MOSTRA A TRADUÇÃO NA TELA
        resultado.value = traducao;
        
    } 
    // 10. SE HOUVER ERRO EM QUALQUER PARTE
    catch (erroGeral) {
        resultado.value = "Erro: " + erroGeral.message;
    }
}

/* ====================================
   FUNÇÃO: USAR GOOGLE TRADUTOR
   Faz requisição à API do Google Tradutor
==================================== */
async function usarGoogleTradutor(texto, origem, destino) {
    return new Promise(function(resolve, reject) {
        // 1. CODIFICA O TEXTO PARA URL (espaços viram %20, etc.)
        const textoCodificado = encodeURIComponent(texto);
        
        // 2. MONTA A URL DA API DO GOOGLE
        const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + origem + "&tl=" + destino + "&dt=t&q=" + textoCodificado;
        
        // 3. FAZ A REQUISIÇÃO HTTP
        fetch(url)
            .then(function(response) {
                // 4. VERIFICA SE A RESPOSTA É BEM-SUCEDIDA
                if (response.ok === false) {
                    reject(new Error("Erro HTTP: " + response.status));
                    return;
                }
                return response.json();  // Converte resposta para JSON
            })
            .then(function(dados) {
                // 5. PROCESSAMENTO DA RESPOSTA DO GOOGLE
                if (dados && Array.isArray(dados[0])) {
                    let traducaoMontada = "";
                    
                    // 6. PERCORRE TODOS OS ITENS DA TRADUÇÃO
                    for (let i = 0; i < dados[0].length; i++) {
                        const item = dados[0][i];
                        if (item && item[0]) {
                            traducaoMontada += item[0];  // Junta as partes
                        }
                    }
                    
                    // 7. VERIFICA SE RECEBEU ALGO
                    if (traducaoMontada !== "") {
                        resolve(traducaoMontada);  // Retorna a tradução
                    } else {
                        reject(new Error("Traducao vazia recebida"));
                    }
                } else {
                    reject(new Error("Formato de resposta invalido"));
                }
            })
            .catch(function(erro) {
                // 8. SE HOUVER ERRO NA REQUISIÇÃO
                reject(erro);
            });
    });
}

/* ====================================
   FUNÇÃO: USAR MYMEMORY (BACKUP)
   Faz requisição à API MyMemory se o Google falhar
==================================== */
async function usarMyMemory(texto, langpair) {
    return new Promise(function(resolve, reject) {
        // 1. CODIFICA O TEXTO
        const textoCodificado = encodeURIComponent(texto);
        
        // 2. MONTA A URL DA API MYMEMORY
        const url = "https://api.mymemory.translated.net/get?q=" + textoCodificado + "&langpair=" + langpair;
        
        // 3. FAZ A REQUISIÇÃO HTTP
        fetch(url)
            .then(function(response) {
                // 4. VERIFICA SE A RESPOSTA É BEM-SUCEDIDA
                if (response.ok === false) {
                    reject(new Error("Erro HTTP: " + response.status));
                    return;
                }
                return response.json();  // Converte para JSON
            })
            .then(function(dados) {
                // 5. VERIFICA SE VEIO TRADUÇÃO VÁLIDA
                if (dados.responseData && dados.responseData.translatedText) {
                    resolve(dados.responseData.translatedText);  // Retorna tradução
                } else {
                    reject(new Error("Resposta invalida da API"));
                }
            })
            .catch(function(erro) {
                // 6. SE HOUVER ERRO NA REQUISIÇÃO
                reject(erro);
            });
    });
}

/* ====================================
   FUNÇÕES EXTRAS - ATALHOS DE TECLADO
   Melhoram a experiência do usuário
==================================== */

// ATALHO: CTRL+ENTER PARA TRADUZIR
if (inputTexto) {
    inputTexto.addEventListener("keydown", function(evento) {
        // Se pressionou Ctrl+Enter ou Cmd+Enter (Mac)
        if ((evento.ctrlKey || evento.metaKey) && evento.key === "Enter") {
            evento.preventDefault();  // Evita quebra de linha no textarea
            traduzir();               // Chama função de tradução
        }
    });
}

// ATALHO: ESC PARA LIMPAR TUDO
document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") {
        // Limpa os campos de texto
        if (inputTexto) inputTexto.value = "";
        if (resultado) resultado.value = "";
        
        // Coloca o cursor no campo de digitação
        if (inputTexto) inputTexto.focus();
        
        // Para o microfone se estiver ativo
        pararReconhecimentoVoz();
    }
});

// ATALHO: ALT+M PARA MICROFONE
document.addEventListener("keydown", function(evento) {
    if (evento.altKey && evento.key === "m") {
        evento.preventDefault();      // Evita comportamento padrão
        alternarMicrofone();          // Liga/desliga microfone
    }
});

/* ====================================
   MENSAGENS INICIAIS NO CONSOLE
   Apenas para depuração e informação
==================================== */
console.log("🎤 Tradutor com microfone carregado com sucesso!");
console.log("👉 Atalhos disponiveis:");
console.log("   • Alt+M = Microfone liga/desliga");
console.log("   • Ctrl+Enter = Traduz texto");
console.log("   • ESC = Limpa campos e para microfone")