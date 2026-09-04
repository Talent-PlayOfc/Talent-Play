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
};

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
};

window.fecharModal = function(idModal) {
  const modal = document.getElementById(idModal);
  if(!modal) return;
  modal.classList.add('opacity-0');
  const card = document.getElementById('card-' + idModal);
  if(card) card.classList.add('scale-95');
  setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
};

// ----------------------------------------------------
// SPA ROUTER (Navegação Instantânea)
// ----------------------------------------------------
window.navegarPara = function(idTela) {
  document.querySelectorAll('.app-screen').forEach(tela => {
    tela.classList.add('hidden');
    tela.classList.remove('active');
  });
  
  const telaAlvo = document.getElementById(idTela);
  if (telaAlvo) {
    telaAlvo.classList.remove('hidden');
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
};

// ----------------------------------------------------
// SUPABASE DATABASE & CONFIGURAÇÃO
// ----------------------------------------------------
const SUPABASE_URL = 'https://puymwjoolxlaqvwregad.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hQ0sLZG9tHSdMOFEBlurEg_FrmnlT45'; // <-- COLOQUE SUA CHAVE REAL AQUI

let supabaseClient = null;
let modoOffline = false;
let usuarioLogado = null;
let perfilAtual = null;

if (SUPABASE_KEY.includes('chave') || SUPABASE_KEY.includes('SUA_CHAVE')) {
  console.warn("⚠️ MODO SIMULAÇÃO: Conecte sua chave Supabase para salvar no banco real.");
  modoOffline = true;
} else {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ----------------------------------------------------
// LÓGICA DE LOGIN & ONBOARDING
// ----------------------------------------------------
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
};

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
};

window.salvarPerfil = async function(e) {
  e.preventDefault();
  const nome = document.getElementById('onboarding-nome').value;
  const tipo = document.querySelector('input[name="tipo_conta"]:checked').value;
  
  let dadosPerfil = { id: usuarioLogado ? usuarioLogado.id : 'fake_id', nome, tipo_conta: tipo, xp: 0, nivel: 1 };
  
  if(modoOffline) {
    perfilAtual = dadosPerfil;
    fecharModal('onboarding-modal');
    atualizarInfoTela(perfilAtual);
    mostrarToast('Perfil configurado com sucesso!', 'success');
    return;
  }

  const btn = document.getElementById('onboarding-submit-btn');
  btn.disabled = true; btn.innerText = 'CRIANDO...';
  const { error } = await supabaseClient.from('perfis').insert([dadosPerfil]);
  if (!error) {
    fecharModal('onboarding-modal');
    verificarPerfil(usuarioLogado);
    mostrarToast('Bem-vindo(a) ao TalentPlay!', 'success');
  } else { 
    mostrarToast('Erro ao criar: ' + error.message, 'error'); 
    btn.disabled = false; btn.innerText = 'COMEÇAR JORNADA';
  }
};

window.fazerLogout = async function() {
  if(!modoOffline) await supabaseClient.auth.signOut();
  window.location.reload();
};

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
  atualizarExibicaoAvatar(data.avatar_url);
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
    
    const fnome = document.getElementById('ficha-nome');
    if(fnome) fnome.innerText = data.nome;
    const fnivel = document.getElementById('ficha-nivel');
    if(fnivel) fnivel.innerText = `Lvl. ${data.nivel}`;
    const fbar = document.getElementById('ficha-xp-bar');
    if(fbar) fbar.style.width = `${progressoBarra}%`;
    const ftxt = document.getElementById('ficha-xp-texto');
    if(ftxt) ftxt.innerText = `${data.xp} XP totais acumulados`;

    carregarPerfilDetalhes();
    carregarMinhasCandidaturas();
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
    
    carregarRadarTalentos();
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

// ----------------------------------------------------
// GESTÃO DE VAGAS (OPORTUNIDADES)
// ----------------------------------------------------
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
};

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

  adicionarVagaNaTela(titulo, local, xp, nomeEmpresa);
  fecharModal('modal-nova-vaga');
  mostrarToast('Oportunidade lançada no radar de talentos!', 'success');
  document.getElementById('nv-titulo').value = ''; 
  document.getElementById('nv-local').value = '';
};

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
};

window.carregarVagasDoBanco = async function() {
  if(modoOffline) return;
  const { data: vagas, error } = await supabaseClient.from('vagas').select('*').order('created_at', { ascending: true });
  if(!error && vagas) {
    vagas.forEach(v => adicionarVagaNaTela(v.titulo, v.local, v.xp, v.empresa));
  }
};

// ----------------------------------------------------
// BUSCA DINÂMICA: CANDIDATURAS & RADAR
// ----------------------------------------------------
window.carregarMinhasCandidaturas = async function() {
  if (modoOffline || !usuarioLogado) return;

  const container = document.getElementById('container-minhas-candidaturas');
  const vazioMsg = document.getElementById('candidaturas-vazio');
  if (!container) return;

  const { data: candidaturas, error } = await supabaseClient
    .from('candidaturas')
    .select('*')
    .eq('candidato_id', usuarioLogado.id)
    .order('created_at', { ascending: false });

  if (error || !candidaturas || candidaturas.length === 0) {
    if (vazioMsg) vazioMsg.classList.remove('hidden');
    return;
  }

  container.innerHTML = '';
  
  const badges = document.querySelectorAll('#menu-candidato button[data-target="tela-candidaturas"] span');
  badges.forEach(badge => badge.innerText = candidaturas.length);

  candidaturas.forEach(c => {
    const card = document.createElement('div');
    card.className = "bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-center shadow-xl hover:border-indigo-500/30 transition-all";
    
    card.innerHTML = `
      <div class="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-3xl shadow-inner shrink-0 text-indigo-400">
        <i class="ph ph-briefcase"></i>
      </div>
      <div class="flex-1 text-center lg:text-left">
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
          <span class="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20 uppercase tracking-widest">+${c.xp_obtido || 0} XP Adquiridos</span>
          <span class="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-widest">${c.match_percentual || 70}% Match</span>
        </div>
        <h3 class="text-2xl font-black text-white">${c.vaga_titulo}</h3>
        <p class="text-slate-400 text-sm font-medium mt-1">${c.empresa}</p>
        <div class="flex items-center justify-center lg:justify-start gap-4 mt-3">
          <span class="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <i class="ph ph-check-circle text-emerald-400"></i> Avaliação Prática Enviada
          </span>
        </div>
      </div>
      <div class="w-full lg:w-64 bg-slate-950 rounded-2xl p-5 border border-slate-800 relative overflow-hidden text-center">
        <div class="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status do Processo</p>
        <p class="text-base font-black text-white mb-1">${c.status}</p>
        <p class="text-xs text-slate-400">Aguardando análise da equipe</p>
      </div>
    `;

    container.appendChild(card);
  });
};

let listaCandidaturasCache = [];

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

  listaCandidaturasCache = candidaturas;
  if (contadorTotal) contadorTotal.innerText = candidaturas.length;
  tbody.innerHTML = '';

  candidaturas.forEach((c, index) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/30 transition-colors group";

    const medalhaCor = index === 0 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-900/50' : (index === 1 ? 'text-indigo-400 border-indigo-500/30 bg-slate-800' : 'text-slate-400 border-slate-700 bg-slate-800');

    const statusBadge = c.status === 'Entrevista Agendada' 
      ? `<span class="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/30 ml-2">CONVIDADO</span>`
      : '';

    tr.innerHTML = `
      <td class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl border flex items-center justify-center font-black ${medalhaCor}">
            ${index + 1}º
          </div>
          <div>
            <p class="font-bold text-white text-sm flex items-center">${c.candidato_nome} ${statusBadge}</p>
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
        <button onclick="abrirModalDetalhesCandidato('${c.id}')" class="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
          Ver Ficha
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

window.abrirModalDetalhesCandidato = function(idCandidatura) {
  const c = listaCandidaturasCache.find(item => item.id === idCandidatura);
  if (!c) return;

  document.getElementById('modal-cand-id').value = c.id;
  document.getElementById('modal-cand-nome').innerText = c.candidato_nome;
  document.getElementById('modal-cand-xp').innerText = `+${c.xp_obtido || 0} XP Conquistados`;
  document.getElementById('modal-cand-vaga').innerText = c.vaga_titulo;
  document.getElementById('modal-cand-match').innerText = `${c.match_percentual}% MATCH TÉCNICO`;

  const laudo = c.match_percentual >= 90 
    ? 'Demonstrou alta maturidade operacional, comunicação clara e foco na solução de problemas sob pressão.'
    : 'Apresentou boa intenção na condução das tarefas, com oportunidades de aprimoramento em priorização.';
  document.getElementById('modal-cand-laudo').innerText = laudo;

  const btnAcao = document.getElementById('modal-cand-btn-acao');
  if (c.status === 'Entrevista Agendada') {
    btnAcao.innerText = 'Entrevista Já Agendada';
    btnAcao.className = 'w-full py-4 bg-slate-800 text-slate-400 rounded-xl font-black uppercase tracking-wider cursor-not-allowed';
    btnAcao.disabled = true;
  } else {
    btnAcao.innerText = 'Convidar para Entrevista';
    btnAcao.className = 'w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    btnAcao.disabled = false;
  }

  abrirModal('modal-ver-candidato');
};

window.convidarParaEntrevista = async function() {
  const idCandidatura = document.getElementById('modal-cand-id').value;
  if (!idCandidatura || modoOffline) return;

  const btnAcao = document.getElementById('modal-cand-btn-acao');
  btnAcao.innerText = 'ENVIANDO CONVITE...';
  btnAcao.disabled = true;

  const { error } = await supabaseClient
    .from('candidaturas')
    .update({ status: 'Entrevista Agendada' })
    .eq('id', idCandidatura);

  if (error) {
    mostrarToast('Erro ao atualizar status: ' + error.message, 'error');
    btnAcao.innerText = 'Convidar para Entrevista';
    btnAcao.disabled = false;
    return;
  }

  mostrarToast('Convite oficial para entrevista enviado!', 'success');
  fecharModal('modal-ver-candidato');
  carregarRadarTalentos();
};

// ----------------------------------------------------
// HABILIDADES & EXPERIÊNCIAS (PERFIL DINÂMICO)
// ----------------------------------------------------
window.renderizarCardHabilidade = function(nome, nivel) {
  const c = document.getElementById('container-habilidades');
  if (!c) return;
  const el = document.createElement('div');
  el.className = "item-habilidade bg-slate-950 border border-purple-500/30 p-5 rounded-2xl text-center shadow-lg relative overflow-hidden group hover:border-purple-500 transition-colors";
  el.innerHTML = `
    <div class="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
    <i class="ph ph-lightning text-3xl text-purple-500/50 mb-2 group-hover:scale-110 transition-transform"></i>
    <p class="text-sm font-black text-white mb-1">${nome}</p>
    <p class="text-[10px] text-purple-400 font-black uppercase tracking-widest bg-purple-500/10 inline-block px-2 py-0.5 rounded border border-purple-500/20">${nivel}</p>
  `;
  c.insertBefore(el, c.lastElementChild);
};

window.renderizarCardExperiencia = function(cargo, empresa) {
  const c = document.getElementById('container-experiencias');
  if (!c) return;
  const el = document.createElement('div');
  el.className = "item-experiencia relative group mb-10";
  el.innerHTML = `
    <div class="absolute -left-[46px] w-8 h-8 rounded-full bg-slate-900 border-4 border-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
      <div class="w-2 h-2 bg-indigo-400 rounded-full group-hover:scale-150 transition-transform"></div>
    </div>
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 group-hover:border-indigo-500/50 transition-colors shadow-lg">
      <h4 class="font-black text-white text-xl mb-2">${cargo}</h4>
      <p class="text-sm font-black text-indigo-400 uppercase tracking-wider bg-indigo-500/10 inline-block px-3 py-1 rounded-lg border border-indigo-500/20">${empresa}</p>
    </div>
  `;
  c.insertBefore(el, c.lastElementChild);
};

window.carregarPerfilDetalhes = async function() {
  if (modoOffline || !usuarioLogado) return;

  const contHab = document.getElementById('container-habilidades');
  if (contHab) {
    contHab.querySelectorAll('.item-habilidade').forEach(el => el.remove());
    const { data: habs } = await supabaseClient
      .from('habilidades')
      .select('*')
      .eq('candidato_id', usuarioLogado.id)
      .order('created_at', { ascending: true });

    if (habs) habs.forEach(h => renderizarCardHabilidade(h.nome, h.nivel));
  }

  const contExp = document.getElementById('container-experiencias');
  if (contExp) {
    contExp.querySelectorAll('.item-experiencia').forEach(el => el.remove());
    const { data: exps } = await supabaseClient
      .from('experiencias')
      .select('*')
      .eq('candidato_id', usuarioLogado.id)
      .order('created_at', { ascending: true });

    if (exps) exps.forEach(e => renderizarCardExperiencia(e.cargo, e.empresa));
  }
};

window.adicionarHabilidade = async function(e) {
  e.preventDefault();
  const nome = document.getElementById('ah-nome').value;
  const nivel = document.getElementById('ah-nivel').value;
  
  if (!modoOffline && usuarioLogado) {
    const { error } = await supabaseClient
      .from('habilidades')
      .insert([{ candidato_id: usuarioLogado.id, nome, nivel }]);
    if (error) {
      mostrarToast('Erro ao salvar habilidade: ' + error.message, 'error');
      return;
    }
  }

  renderizarCardHabilidade(nome, nivel);
  fecharModal('modal-add-habilidade');
  mostrarToast('Competência adicionada com sucesso!', 'success');
  document.getElementById('ah-nome').value = '';
};

window.adicionarExperiencia = async function(e) {
  e.preventDefault();
  const cargo = document.getElementById('ae-cargo').value;
  const empresa = document.getElementById('ae-empresa').value;
  
  if (!modoOffline && usuarioLogado) {
    const { error } = await supabaseClient
      .from('experiencias')
      .insert([{ candidato_id: usuarioLogado.id, cargo, empresa }]);
    if (error) {
      mostrarToast('Erro ao salvar experiência: ' + error.message, 'error');
      return;
    }
  }

  renderizarCardExperiencia(cargo, empresa);
  fecharModal('modal-add-experiencia');
  mostrarToast('Experiência profissional salva com sucesso!', 'success');
  document.getElementById('ae-cargo').value = ''; 
  document.getElementById('ae-empresa').value = '';
};

// ----------------------------------------------------
// GESTÃO DE FOTO DE PERFIL (COM PRÉVIA & SEGURANÇA)
// ----------------------------------------------------
let imagemOtimizadaCache = null;

// Função para abrir o modal apenas se o usuário estiver logado
window.tentarAbrirModalFoto = function() {
  if (!usuarioLogado && !perfilAtual) {
    mostrarToast('Faça login para alterar sua foto de perfil.', 'info');
    abrirModal('login-modal');
    return;
  }
  abrirModal('modal-editar-perfil');
};

window.gerarPreviaFoto = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(img, 0, 0, 256, 256);
      
      imagemOtimizadaCache = canvas.toDataURL('image/jpeg', 0.85);

      const previewImg = document.getElementById('avatar-preview-img');
      const placeholder = document.getElementById('avatar-preview-placeholder');
      if (previewImg && placeholder) {
        previewImg.src = imagemOtimizadaCache;
        previewImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
      }
    };
  };
  reader.readAsDataURL(file);
};

window.salvarFotoPerfil = async function() {
  if (!usuarioLogado && !perfilAtual) {
    mostrarToast('Apenas usuários conectados podem salvar uma foto.', 'error');
    fecharModal('modal-editar-perfil');
    return;
  }

  if (!imagemOtimizadaCache) {
    mostrarToast('Escolha uma imagem antes de salvar.', 'error');
    return;
  }

  const btn = document.getElementById('btn-confirmar-foto');
  btn.disabled = true;
  btn.innerText = 'SALVANDO...';

  if (!modoOffline && usuarioLogado) {
    const { error } = await supabaseClient
      .from('perfis')
      .update({ avatar_url: imagemOtimizadaCache })
      .eq('id', usuarioLogado.id);

    if (error) {
      mostrarToast('Erro ao gravar foto: ' + error.message, 'error');
      btn.disabled = false;
      btn.innerText = 'SALVAR FOTO';
      return;
    }
  }

  if (perfilAtual) perfilAtual.avatar_url = imagemOtimizadaCache;
  atualizarExibicaoAvatar(imagemOtimizadaCache);
  
  btn.disabled = false;
  btn.innerText = 'SALVAR FOTO';
  fecharModal('modal-editar-perfil');
  mostrarToast('Foto de perfil atualizada!', 'success');
};

window.atualizarExibicaoAvatar = function(url) {
  // Atualiza avatar da barra lateral
  const imgEl = document.getElementById('sidebar-avatar-img');
  const fallbackEl = document.getElementById('sidebar-avatar-fallback');
  if (imgEl && fallbackEl) {
    if (url) {
      imgEl.src = url;
      imgEl.classList.remove('hidden');
      fallbackEl.classList.add('hidden');
    } else {
      imgEl.classList.add('hidden');
      fallbackEl.classList.remove('hidden');
    }
  }

  // Atualiza foto grande na tela de perfil profissional (se existir)
  const perfilImg = document.getElementById('perfil-foto-grande');
  const perfilIcon = document.getElementById('perfil-icone-grande');
  if (perfilImg && perfilIcon) {
    if (url) {
      perfilImg.src = url;
      perfilImg.classList.remove('hidden');
      perfilIcon.classList.add('hidden');
    } else {
      perfilImg.classList.add('hidden');
      perfilIcon.classList.remove('hidden');
    }
  }
};

// ----------------------------------------------------
// SIMULADOR PRÁTICO (AVALIAÇÃO)
// ----------------------------------------------------
window.iniciarRPG = function(vagaTitulo = 'Missão Padrão', empresa = 'Nossa Empresa') {
  if(!perfilAtual) return abrirModal('login-modal');
  if(perfilAtual.tipo_conta === 'empresa') return mostrarToast("Você está como RH. Crie vagas ao invés de avaliá-las.", "error");
  
  document.getElementById('rpg-titulo-header').innerText = `${vagaTitulo}`;
  document.getElementById('rpg-text').innerHTML = `Você está no meio do expediente na <strong>${empresa}</strong>. O telefone toca sem parar. O gerente de operações passa correndo, bate na sua mesa e fala: <br><br><span class='text-white font-bold italic text-2xl border-l-4 border-indigo-500 pl-4 block bg-slate-800/50 p-4 rounded-r-xl'>"Preciso daquele relatório de estoque de ontem impresso na minha mesa AGORA!"</span><br>Ao mesmo tempo, um fornecedor estratégico liga no seu ramal exigindo falar com alguém da equipe financeira urgentemente. <br><br><span class='text-indigo-400 font-black'>Qual é a sua ação imediata?</span>`;
  
  document.getElementById('rpg-choices').classList.remove('hidden');
  abrirModal('rpg-modal');
};

window.fecharRPG = function() { 
  fecharModal('rpg-modal'); 
  carregarMinhasCandidaturas();
};

window.escolherOpcao = async function(opcao) {
  const rpgText = document.getElementById('rpg-text');
  document.getElementById('rpg-choices').classList.add('hidden');
  let xpGanho = (opcao === 'C') ? 100 : 25;
  let matchCalc = (opcao === 'C') ? 95 : 60;
  
  if(opcao === 'C') {
    rpgText.innerHTML = `<div class='bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]'><span class='text-emerald-400 font-black text-3xl mb-2 flex items-center gap-3'><i class="ph ph-check-circle"></i> DESEMPENHO EXCELENTE!</span> <p class='text-slate-300 font-medium'>Você demonstrou equilíbrio sob pressão e comunicação assertiva. O gestor recebeu o suporte e o fornecedor foi devidamente encaminhado.</p></div><span class='inline-block bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)]'>+${xpGanho} XP GANHOS</span>`;
  } else {
    rpgText.innerHTML = `<div class='bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl mb-6 shadow-[0_0_30px_rgba(234,179,8,0.1)]'><span class='text-yellow-400 font-black text-3xl mb-2 flex items-center gap-3'><i class="ph ph-warning-circle"></i> PONTO DE ATENÇÃO</span> <p class='text-slate-300 font-medium'>Priorizar apenas uma das frentes e ignorar o parceiro externo prejudica a dinâmica operacional da empresa.</p></div><span class='inline-block bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)]'>+${xpGanho} XP GANHOS</span>`;
  }

  let tituloVagaAtual = document.getElementById('rpg-titulo-header').innerText;
  let btnConcluir = `<button onclick="fecharRPG()" class='mt-8 w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]'>CONCLUIR AVALIAÇÃO E ENVIAR AO RH</button>`;

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
    if(novoNivel > perfilAtual.nivel) rpgText.innerHTML += `<div class='mt-6 bg-purple-500/20 border border-purple-500/50 p-4 rounded-xl text-center animate-bounce'><span class='text-purple-400 font-black text-2xl'>🎉 EVOLUÇÃO! VOCÊ ATINGIU O NÍVEL ${novoNivel}!</span></div>`;
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
      if(nivelSubiu) rpgText.innerHTML += `<div class='mt-6 bg-purple-500/20 border border-purple-500/50 p-4 rounded-xl text-center animate-bounce'><span class='text-purple-400 font-black text-2xl'>🎉 EVOLUÇÃO! VOCÊ ATINGIU O NÍVEL ${novoNivel}!</span></div>`;
      rpgText.innerHTML += btnConcluir;
    }
  } catch (err) { console.error(err); }
};

// ----------------------------------------------------
// INICIALIZAÇÃO DO APP
// ----------------------------------------------------
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
