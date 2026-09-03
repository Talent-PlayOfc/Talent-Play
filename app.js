// ----------------------------------------------------
// UI CORE: TOASTS & MODALS
// ----------------------------------------------------
window.mostrarToast = function(mensagem, tipo = 'info') {
  const container = document.getElementById('toast-container');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  let icone = tipo === 'success' ? 'check-circle' : (tipo === 'error' ? 'warning-circle' : 'info');
  toast.innerHTML = `<i class="ph ph-${icone} text-2xl"></i> <span>${mensagem}</span>`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 4000);
}

window.abrirModal = function(idModal) {
  const modal = document.getElementById(idModal);
  if(!modal) return;
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    const card = document.getElementById('card-' + idModal);
    if(card) card.classList.remove('scale-95');
  }, 10);
  modal.classList.add('flex');
}

window.fecharModal = function(idModal) {
  const modal = document.getElementById(idModal);
  if(!modal) return;
  modal.classList.add('opacity-0');
  const card = document.getElementById('card-' + idModal);
  if(card) card.classList.add('scale-95');
  setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
}

// ----------------------------------------------------
// SPA ROUTER (Navegação Instantânea)
// ----------------------------------------------------
window.navegarPara = function(idTela) {
  document.querySelectorAll('.app-screen').forEach(tela => {
    tela.classList.add('hidden'); // Linha restaurada
    tela.classList.remove('active');
  });
  
  const telaAlvo = document.getElementById(idTela);
  if (telaAlvo) {
    telaAlvo.classList.remove('hidden'); // Linha restaurada
    void telaAlvo.offsetWidth; 
    telaAlvo.classList.add('active');
  }
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-indigo-500/10', 'text-indigo-400', 'border-indigo-500/20', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
    btn.classList.add('text-slate-400');
    
    if (btn.dataset.target === idTela) {
      btn.classList.add('active');
      btn.classList.remove('text-slate-400');
      if(idTela.includes('empresa')) btn.classList.add('bg-emerald-500/10', 'text-emerald-400');
      else btn.classList.add('bg-indigo-500/10', 'text-indigo-400');
    }
  });
  const container = document.getElementById('app-content-area');
  if(container) container.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------
// SUPABASE DATABASE & AUTH MOCK FALLBACK
// ----------------------------------------------------
const SUPABASE_URL = 'https://puymwjoolxlaqvwregad.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hQ0sLZG9tHSdMOFEBlurEg_FrmnlT45'; // <--- INSIRA SUA CHAVE AQUI

let supabaseClient = null;
let modoOffline = false;
let usuarioLogado = null;
let perfilAtual = null;

if (SUPABASE_KEY.includes('SUA_CHAVE_AQUI')) {
  console.warn("⚠️ MODO SIMULAÇÃO: Conecte sua chave Supabase para salvar no banco real.");
  modoOffline = true;
} else {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// LÓGICA DE LOGIN
let modoAutenticacao = 'login';
window.alternarModoAuth = function(modo) {
  modoAutenticacao = modo;
  const btn = document.getElementById('auth-submit-btn');
  if (!btn) return;
  if (modo === 'signup') {
    document.getElementById('tab-signup').className = 'flex-1 py-3 bg-slate-800 text-white text-sm font-black rounded-lg shadow-sm transition-all uppercase tracking-wider';
    document.getElementById('tab-login').className = 'flex-1 py-3 text-slate-500 hover:text-slate-300 text-sm font-black rounded-lg transition-all uppercase tracking-wider';
    btn.innerText = 'CRIAR CONTA';
  } else {
    document.getElementById('tab-login').className = 'flex-1 py-3 bg-slate-800 text-white text-sm font-black rounded-lg shadow-sm transition-all uppercase tracking-wider';
    document.getElementById('tab-signup').className = 'flex-1 py-3 text-slate-500 hover:text-slate-300 text-sm font-black rounded-lg transition-all uppercase tracking-wider';
    btn.innerText = 'INICIAR SESSÃO';
  }
}

window.executarAutenticacao = async function(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;
  const btn = document.getElementById('auth-submit-btn');
  
  if(modoOffline) {
    fecharModal('login-modal');
    usuarioLogado = { id: 'usr_fake_123', email: email };
    abrirModal('onboarding-modal');
    return;
  }

  btn.disabled = true; btn.innerText = 'CARREGANDO...';
  try {
    if (modoAutenticacao === 'signup') {
      const { error } = await supabaseClient.auth.signUp({ email, password: pass });
      if (error) throw error;
      mostrarToast('Conta criada com sucesso! Entre agora.', 'success');
      setTimeout(() => alternarModoAuth('login'), 1500);
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      fecharModal('login-modal');
    }
  } catch (err) { mostrarToast('Erro: ' + err.message, 'error'); } 
  finally { btn.disabled = false; btn.innerText = modoAutenticacao === 'signup' ? 'CRIAR CONTA' : 'INICIAR SESSÃO'; }
}

window.salvarPerfil = async function(e) {
  e.preventDefault();
  const nome = document.getElementById('onboarding-nome').value;
  const tipo = document.querySelector('input[name="tipo_conta"]:checked').value;
  
  let dadosPerfil = { id: usuarioLogado ? usuarioLogado.id : 'fake_id', nome, tipo_conta: tipo, xp: 0, nivel: 1 };
  
  if(modoOffline) {
    perfilAtual = dadosPerfil;
    fecharModal('onboarding-modal');
    atualizarInfoTela(perfilAtual);
    mostrarToast('Personagem forjado com sucesso!', 'success');
    return;
  }

  const btn = document.getElementById('onboarding-submit-btn');
  btn.disabled = true; btn.innerText = 'FORJANDO...';
  const { error } = await supabaseClient.from('perfis').insert([dadosPerfil]);
  if (!error) {
    fecharModal('onboarding-modal');
    verificarPerfil(usuarioLogado);
    mostrarToast('Bem-vindo(a) ao TalentPlay!', 'success');
  } else { 
    mostrarToast('Erro ao criar: ' + error.message, 'error'); 
    btn.disabled = false; btn.innerText = 'COMEÇAR AVENTURA';
  }
}

window.fazerLogout = async function() {
  if(!modoOffline) await supabaseClient.auth.signOut();
  window.location.reload();
}

function atualizarInterfaceAuth(logado) {
  const btnEntrar = document.getElementById('btn-entrar-header');
  const userMenu = document.getElementById('user-menu-header');
  if (logado) {
    if(btnEntrar) btnEntrar.classList.add('hidden');
    if(userMenu) { userMenu.classList.remove('hidden'); userMenu.classList.add('flex'); }
  } else {
    if(btnEntrar) btnEntrar.classList.remove('hidden');
    if(userMenu) { userMenu.classList.add('hidden'); userMenu.classList.remove('flex'); }
    document.getElementById('sidebar-name').innerText = "Visitante";
    document.getElementById('sidebar-role').innerText = "Faça Login";
    document.getElementById('sidebar-role').className = "text-[11px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5";
    document.getElementById('sidebar-level-badge').classList.add('hidden');
    document.getElementById('sidebar-xp-container').classList.add('hidden');
    document.getElementById('menu-candidato').classList.remove('hidden');
    document.getElementById('menu-empresa').classList.add('hidden');
  }
}

function atualizarInfoTela(data) {
  document.getElementById('sidebar-name').innerText = data.nome;
  
  if (data.tipo_conta === 'candidato') {
    document.getElementById('sidebar-role').innerText = "Candidato";
    document.getElementById('sidebar-role').className = "text-[11px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5";
    document.getElementById('sidebar-level-badge').classList.remove('hidden');
    document.getElementById('sidebar-level-badge').innerText = `Lvl.${data.nivel}`;
    document.getElementById('sidebar-avatar-icon').className = "ph ph-user text-2xl text-indigo-400";
    document.getElementById('sidebar-xp-container').classList.remove('hidden');
    
    let progressoBarra = data.xp % 100;
    document.getElementById('sidebar-xp-text').innerText = `${data.xp} XP`;
    document.getElementById('sidebar-xp-bar').style.width = `${progressoBarra}%`;
    
    document.getElementById('menu-candidato').classList.remove('hidden');
    document.getElementById('menu-empresa').classList.add('hidden');
    
    document.getElementById('ficha-nome').innerText = data.nome;
    document.getElementById('ficha-nivel').innerText = `Lvl. ${data.nivel}`;
    document.getElementById('ficha-xp-bar').style.width = `${progressoBarra}%`;
    document.getElementById('ficha-xp-texto').innerText = `${data.xp} XP totais acumulados`;
    
    carregarMinhasCandidaturas(); // <--- LINHA ADICIONADA AQUI
    navegarPara('tela-home-candidato');
  } else {
    document.getElementById('sidebar-role').innerText = "Recrutador";
    document.getElementById('sidebar-role').className = "text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5";
    document.getElementById('sidebar-level-badge').classList.add('hidden');
    document.getElementById('sidebar-xp-container').classList.add('hidden');
    document.getElementById('sidebar-avatar-icon').className = "ph ph-buildings text-2xl text-emerald-400";
    document.getElementById('sidebar-avatar-icon').parentElement.className = "w-14 h-14 rounded-2xl bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/20";
    
    document.getElementById('menu-candidato').classList.add('hidden');
    document.getElementById('menu-empresa').classList.remove('hidden');
    
    carregarRadarTalentos(); // <--- LINHA ADICIONADA AQUI
    navegarPara('tela-home-empresa');
  }
  atualizarInterfaceAuth(true);
}

async function verificarPerfil(user) {
  usuarioLogado = user;
  const { data, error } = await supabaseClient.from('perfis').select('*').eq('id', user.id).single();
  if (!data) { abrirModal('onboarding-modal'); } 
  else { perfilAtual = data; atualizarInfoTela(data); }
}

window.filtrarVagas = function() {
  const input = document.getElementById('busca-vagas-input').value.toLowerCase();
  const vagas = document.querySelectorAll('.vaga-card');
  const containerVazio = document.getElementById('vagas-vazio');
  let encontrou = false;

  vagas.forEach(vaga => {
    const titulo = vaga.getAttribute('data-titulo').toLowerCase();
    const empresa = vaga.getAttribute('data-empresa').toLowerCase();
    if (titulo.includes(input) || empresa.includes(input)) {
      vaga.style.display = 'flex'; encontrou = true;
    } else { vaga.style.display = 'none'; }
  });
  if (!encontrou) { containerVazio.classList.remove('hidden'); containerVazio.classList.add('block'); } 
  else { containerVazio.classList.add('hidden'); containerVazio.classList.remove('block'); }
}

window.adicionarHabilidade = function(e) {
  e.preventDefault();
  const nome = document.getElementById('ah-nome').value;
  const nivel = document.getElementById('ah-nivel').value;
  const c = document.getElementById('container-habilidades');
  
  const el = document.createElement('div');
  el.className = "bg-slate-950 border border-purple-500/30 p-5 rounded-2xl text-center shadow-lg relative overflow-hidden group hover:border-purple-500 transition-colors";
  el.innerHTML = `<div class="absolute top-0 left-0 w-full h-1 bg-purple-500"></div><i class="ph ph-lightning text-3xl text-purple-500/50 mb-2 group-hover:scale-110 transition-transform"></i><p class="text-sm font-black text-white mb-1">${nome}</p><p class="text-[10px] text-purple-400 font-black uppercase tracking-widest bg-purple-500/10 inline-block px-2 py-0.5 rounded border border-purple-500/20">${nivel}</p>`;
  
  c.insertBefore(el, c.lastElementChild);
  fecharModal('modal-add-habilidade');
  mostrarToast('Nova habilidade ativada na sua árvore!', 'success');
  document.getElementById('ah-nome').value = '';
}

window.adicionarExperiencia = function(e) {
  e.preventDefault();
  const cargo = document.getElementById('ae-cargo').value;
  const empresa = document.getElementById('ae-empresa').value;
  const c = document.getElementById('container-experiencias');
  
  const el = document.createElement('div');
  el.className = "relative group mb-10";
  el.innerHTML = `<div class="absolute -left-[46px] w-8 h-8 rounded-full bg-slate-900 border-4 border-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]"><div class="w-2 h-2 bg-indigo-400 rounded-full group-hover:scale-150 transition-transform"></div></div><div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 group-hover:border-indigo-500/50 transition-colors shadow-lg"><h4 class="font-black text-white text-xl mb-2">${cargo}</h4><p class="text-sm font-black text-indigo-400 uppercase tracking-wider bg-indigo-500/10 inline-block px-3 py-1 rounded-lg border border-indigo-500/20">${empresa} • Missão Concluída</p></div>`;
  
  c.insertBefore(el, c.lastElementChild);
  fecharModal('modal-add-experiencia');
  mostrarToast('O Tomo da Experiência foi atualizado!', 'success');
  document.getElementById('ae-cargo').value = ''; document.getElementById('ae-empresa').value = '';
}

window.criarNovaVaga = async function(e) {
  e.preventDefault();
  const titulo = document.getElementById('nv-titulo').value;
  const local = document.getElementById('nv-local').value;
  const xp = document.getElementById('nv-xp').value;
  const nomeEmpresa = perfilAtual ? perfilAtual.nome : 'Empresa Parceira';
  
  if(!modoOffline) {
    const { error } = await supabaseClient.from('vagas').insert([{ titulo, local, xp, empresa: nomeEmpresa }]);
    if(error) {
      mostrarToast('Erro ao salvar vaga no banco: ' + error.message, 'error');
      return;
    }
  }

  // Adiciona visualmente na hora
  adicionarVagaNaTela(titulo, local, xp, nomeEmpresa);

  fecharModal('modal-nova-vaga');
  mostrarToast('Oportunidade lançada no radar de talentos!', 'success');
  document.getElementById('nv-titulo').value = ''; 
  document.getElementById('nv-local').value = '';
}

// Essa função só desenha a vaga na tela (separada para ser usada tanto ao criar quanto ao carregar do banco)
window.adicionarVagaNaTela = function(titulo, local, xp, empresaNome) {
  const cGeral = document.getElementById('container-todas-vagas');
  const cEmpresa = document.getElementById('container-vagas-empresa');
  
  if(cGeral) {
    const el = document.createElement('div');
    el.className = "vaga-card bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 relative shadow-[0_0_20px_rgba(16,185,129,0.1)] flex flex-col h-full hover:border-emerald-400 transition-colors group";
    el.setAttribute('data-titulo', titulo); el.setAttribute('data-empresa', empresaNome);
    el.innerHTML = `<div class="flex justify-between items-start mb-6"><div><span class="text-[9px] font-black text-white bg-emerald-500 px-2 py-1 rounded-md tracking-widest uppercase shadow-md animate-pulse">NOVA</span><h3 class="text-xl font-bold text-white mt-3 vaga-titulo group-hover:text-emerald-400 transition-colors leading-tight">${titulo}</h3><p class="text-sm text-slate-400 mt-1 vaga-empresa">${empresaNome} • ${local}</p></div><div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-2xl text-emerald-500 shadow-inner shrink-0">🏢</div></div><div class="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between"><span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">+${xp} XP</span><button onclick="iniciarRPG('${titulo}', '${empresaNome}')" class="text-sm font-bold text-slate-900 bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 rounded-xl transition-colors shadow-lg">Iniciar</button></div>`;
    cGeral.prepend(el);
  }

  if(cEmpresa) {
    const el = document.createElement('div');
    el.className = "bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden shadow-xl group";
    el.innerHTML = `<div class="flex justify-between items-start mb-6"><div><span class="inline-block py-1 px-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-3">Missão Ativa</span><h3 class="text-2xl font-black text-white leading-tight">${titulo}</h3><p class="text-sm text-slate-400 mt-1 font-medium"><i class="ph ph-map-pin text-emerald-500"></i> ${local} • Banco de Dados</p></div><button class="bg-slate-950 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white p-3 rounded-xl transition-colors shadow-sm"><i class="ph ph-pencil-simple text-xl font-bold"></i></button></div><div class="grid grid-cols-3 gap-4 mb-6"><div class="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center"><p class="text-3xl font-black text-white mb-1">0</p><p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Jogadores</p></div><div class="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center"><p class="text-3xl font-black text-emerald-400 mb-1">0</p><p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Matches >90%</p></div><div class="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center flex flex-col justify-center items-center gap-1"><p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Recompensa</p><span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg font-black text-sm">+${xp} XP</span></div></div><div class="border-t border-slate-800 pt-6"><button class="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-md">Analisar Candidatos</button></div>`;
    cEmpresa.prepend(el);
  }
}

// Busca as vagas no Supabase quando a página carrega
window.carregarVagasDoBanco = async function() {
  if(modoOffline) return;
  const { data: vagas, error } = await supabaseClient.from('vagas').select('*').order('created_at', { ascending: true });
  if(!error && vagas) {
    vagas.forEach(v => adicionarVagaNaTela(v.titulo, v.local, v.xp, v.empresa));
  }
}

window.iniciarRPG = function(vagaTitulo = 'Missão Padrão', empresa = 'Nossa Empresa') {
  if(!perfilAtual) return abrirModal('login-modal');
  if(perfilAtual.tipo_conta === 'empresa') return mostrarToast("Você está como RH. Crie vagas ao invés de jogá-las.", "error");
  
  document.getElementById('rpg-titulo-header').innerText = `${vagaTitulo}`;
  document.getElementById('rpg-text').innerHTML = `Você está no meio do expediente na <strong>${empresa}</strong>. O telefone toca sem parar. O gerente de operações passa correndo, bate na sua mesa e grita: <br><br><span class='text-white font-bold italic text-2xl border-l-4 border-indigo-500 pl-4 block bg-slate-800/50 p-4 rounded-r-xl'>"Preciso daquele relatório de estoque de ontem impresso na minha mesa AGORA!"</span><br>Ao mesmo tempo, um fornecedor Premium liga no seu ramal exigindo falar com alguém da equipe financeira urgentemente. <br><br><span class='text-indigo-400 font-black'>Qual é a sua ação imediata?</span>`;
  
  document.getElementById('rpg-choices').classList.remove('hidden');
  abrirModal('rpg-modal');
}

window.fecharRPG = function() { 
  fecharModal('rpg-modal'); 
  carregarMinhasCandidaturas();
}

window.escolherOpcao = async function(opcao) {
  const rpgText = document.getElementById('rpg-text');
  document.getElementById('rpg-choices').classList.add('hidden');
  let xpGanho = (opcao === 'C') ? 100 : 25;
  let matchCalc = (opcao === 'C') ? 95 : 60;
  
  if(opcao === 'C') {
    rpgText.innerHTML = `<div class='bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]'><span class='text-emerald-400 font-black text-3xl mb-2 flex items-center gap-3'><i class="ph ph-check-circle"></i> SUCESSO CRÍTICO!</span> <p class='text-slate-300 font-medium'>Você demonstrou controle emocional impecável e comunicação assertiva de sênior. O gerente ficou satisfeito e o fornecedor se sentiu respeitado.</p></div><span class='inline-block bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transform hover:scale-105 transition-transform'>+${xpGanho} XP GANHOS</span>`;
  } else {
    rpgText.innerHTML = `<div class='bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl mb-6 shadow-[0_0_30px_rgba(234,179,8,0.1)]'><span class='text-yellow-400 font-black text-3xl mb-2 flex items-center gap-3'><i class="ph ph-warning-circle"></i> QUASE LÁ!</span> <p class='text-slate-300 font-medium'>A intenção de resolver rápido foi boa, mas priorizar uma tarefa e abandonar o relacionamento com o fornecedor quebra a dinâmica da equipe.</p></div><span class='inline-block bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)]'>+${xpGanho} XP GANHOS</span>`;
  }

  let tituloVagaAtual = document.getElementById('rpg-titulo-header').innerText;
  let btnConcluir = `<button onclick="fecharRPG()" class='mt-8 w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'>COLETAR RECOMPENSA E ENVIAR AO RH</button>`;

  // Salva a candidatura e o laudo no Supabase para o RH visualizar
  if(!modoOffline && perfilAtual) {
    await supabaseClient.from('candidaturas').insert([{
      vaga_titulo: tituloVagaAtual,
      candidato_nome: perfilAtual.nome,
      candidato_id: usuarioLogado.id,
      empresa: 'Empresa Parceira',
      status: 'Avaliação Concluída',
      xp_obtido: xpGanho,
      match_percentual: matchCalc
    }]);
  }
  
  if(modoOffline) {
    perfilAtual.xp += xpGanho;
    let novoNivel = Math.floor(perfilAtual.xp / 100) + 1;
    if(novoNivel > perfilAtual.nivel) rpgText.innerHTML += `<div class='mt-6 bg-purple-500/20 border border-purple-500/50 p-4 rounded-xl text-center animate-bounce'><span class='text-purple-400 font-black text-2xl'>🎉 LEVEL UP! VOCÊ ATINGIU O NÍVEL ${novoNivel}!</span></div>`;
    perfilAtual.nivel = novoNivel;
    atualizarInfoTela(perfilAtual);
    rpgText.innerHTML += btnConcluir;
    return;
  }

  try {
    let novoXp = perfilAtual.xp + xpGanho;
    let novoNivel = Math.floor(novoXp / 100) + 1;
    let nivelSubiu = novoNivel > perfilAtual.nivel;

    const { error } = await supabaseClient.from('perfis').update({ xp: novoXp, nivel: novoNivel }).eq('id', usuarioLogado.id);
    if (!error) {
      perfilAtual.xp = novoXp; perfilAtual.nivel = novoNivel;
      atualizarInfoTela(perfilAtual);
      if(nivelSubiu) rpgText.innerHTML += `<div class='mt-6 bg-purple-500/20 border border-purple-500/50 p-4 rounded-xl text-center animate-bounce'><span class='text-purple-400 font-black text-2xl'>🎉 LEVEL UP! VOCÊ ATINGIU O NÍVEL ${novoNivel}!</span></div>`;
      rpgText.innerHTML += btnConcluir;
    }
  } catch (err) { console.error(err); }
}

// ----------------------------------------------------
// BUSCAR CANDIDATURAS DO CANDIDATO NO BANCO
// ----------------------------------------------------
// ----------------------------------------------------
// BUSCAR CANDIDATOS NO RADAR DO RH
// ----------------------------------------------------
window.carregarRadarTalentos = async function() {
  if (modoOffline) return;

  const tbody = document.getElementById('tabela-radar-talentos');
  const contadorTotal = document.getElementById('contador-radar-total');
  if (!tbody) return;

  const { data: candidaturas, error } = await supabaseClient
    .from('candidaturas')
    .select('*')
    .order('match_percentual', { ascending: false });

  if (error || !candidaturas || candidaturas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="p-8 text-center text-slate-500 text-sm">
          Nenhum candidato realizou avaliações práticas ainda.
        </td>
      </tr>
    `;
    if (contadorTotal) contadorTotal.innerText = '0';
    return;
  }

  if (contadorTotal) contadorTotal.innerText = candidaturas.length;
  tbody.innerHTML = '';

  candidaturas.forEach((c, index) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/30 transition-colors group";

    const medalhaCor = index === 0 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-900/50' : (index === 1 ? 'text-indigo-400 border-indigo-500/30 bg-slate-800' : 'text-slate-400 border-slate-700 bg-slate-800');

    tr.innerHTML = `
      <td class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl border flex items-center justify-center font-black ${medalhaCor}">
            ${index + 1}º
          </div>
          <div>
            <p class="font-bold text-white text-sm">${c.candidato_nome}</p>
            <p class="text-xs text-indigo-400 font-bold flex items-center gap-1 mt-0.5">
              <i class="ph ph-lightning text-yellow-400"></i> +${c.xp_obtido || 0} XP
            </p>
          </div>
        </div>
      </td>
      <td class="p-4 text-center">
        <span class="inline-block bg-slate-950 border border-slate-700 text-slate-300 text-xs font-bold px-3 py-1 rounded-lg">
          ${c.vaga_titulo}
        </span>
      </td>
      <td class="p-4 text-center">
        <div class="flex flex-col items-center gap-1">
          <span class="text-emerald-400 font-black text-sm">${c.match_percentual}%</span>
          <div class="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500" style="width: ${c.match_percentual}%"></div>
          </div>
        </div>
      </td>
      <td class="p-4 text-right">
        <button onclick="abrirModal('modal-ver-candidato')" class="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
          Ver Ficha
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

    container.appendChild(card);
  });
}

window.onload = function() {
  carregarVagasDoBanco();
  if(!modoOffline) { 
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) verificarPerfil(session.user);
      if (event === 'SIGNED_OUT') atualizarInterfaceAuth(false);
    });
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) verificarPerfil(session.user);
      else atualizarInterfaceAuth(false);
    });
  } else {
    atualizarInterfaceAuth(false);
  }
};
