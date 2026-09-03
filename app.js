/* ========================================================
   TALENTPLAY | CÉREBRO LÓGICO & INTEGRAÇÃO SUPABASE
   ======================================================== */

// ----------------------------------------------------
// 1. UI CORE: NOTIFICAÇÕES & MODAIS
// ----------------------------------------------------
window.mostrarToast = function(mensagem, tipo = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  
  let icone = 'info';
  if (tipo === 'success') icone = 'check-circle';
  else if (tipo === 'error') icone = 'warning-circle';
  
  toast.innerHTML = `<i class="ph ph-${icone} text-2xl"></i> <span>${mensagem}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 4000);
};

window.abrirModal = function(idModal) {
  const modal = document.getElementById(idModal);
  if (!modal) return;
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    const card = modal.querySelector('.transform');
    if (card) card.classList.remove('scale-95');
  }, 10);
  modal.classList.add('flex');
};

window.fecharModal = function(idModal) {
  const modal = document.getElementById(idModal);
  if (!modal) return;
  modal.classList.add('opacity-0');
  const card = modal.querySelector('.transform');
  if (card) card.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 300);
};

// ----------------------------------------------------
// 2. SUPABASE SETUP (MODO DE SIMULAÇÃO INTELIGENTE)
// ----------------------------------------------------
const SUPABASE_URL = 'https://puymwjoolxlaqvwregad.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_AQUI'; // <--- INSIRA SUA CHAVE AQUI SE DESEJAR USAR O BANCO REAL

let supabaseClient = null;
let modoOffline = false;

if (SUPABASE_KEY === 'SUA_CHAVE_AQUI' || SUPABASE_KEY.trim() === '') {
  console.warn("⚠ MODO SIMULAÇÃO ATIVO: Conecte sua chave Supabase real na linha 53 do 'app.js' para salvar no banco real.");
  modoOffline = true;
} else {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ----------------------------------------------------
// 3. VARIÁVEIS GLOBAIS DE ESTADO
// ----------------------------------------------------
let usuarioLogado = null;
let perfilAtual = null;

// Banco de dados em LocalStorage (Persistência Offline de alto nível)
let localDB = {
  usuario: JSON.parse(localStorage.getItem('tp_usuario')) || null,
  perfil: JSON.parse(localStorage.getItem('tp_perfil')) || null,
  competencias: JSON.parse(localStorage.getItem('tp_competencias')) || [
    { nome: "Pacote Office", nivel: "Avançado" }
  ],
  experiencias: JSON.parse(localStorage.getItem('tp_experiencias')) || [
    {
      cargo: "Jovem Aprendiz Operacional",
      empresa: "Sodexo S.A.",
      periodo: "2023 - 2025",
      descr: "Auxílio no preenchimento de faturamento e planilhas de rotina, conferência física de dados de mercadorias no almoxarifado de insumos e atendimento interno."
    }
  ],
  vagas: JSON.parse(localStorage.getItem('tp_vagas')) || [
    {
      id: "vaga_1",
      titulo: "Auxiliar de Operações",
      empresa: "Mosaic Fertilizantes",
      local: "Candeias, BA",
      xp_recompensa: 50,
      tipo: "Presencial",
      nivel_requerido: 1
    }
  ]
};

// ----------------------------------------------------
// 4. SISTEMA SPA (Navegação Rápida entre Telas)
// ----------------------------------------------------
window.navegarPara = function(idTela) {
  // Ocultar todas as telas do container principal
  document.querySelectorAll('.app-screen').forEach(tela => {
    tela.classList.add('hidden');
    tela.classList.remove('active');
  });
  
  // Mostrar a tela desejada
  const telaAlvo = document.getElementById(idTela);
  if (telaAlvo) {
    telaAlvo.classList.remove('hidden');
    void telaAlvo.offsetWidth; // Força re-render para animações funcionarem
    telaAlvo.classList.add('active');
  }
  
  // Atualizar visual dos botões de navegação da barra lateral
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-indigo-500/10', 'text-indigo-400', 'border-indigo-500/20', 'bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
    btn.classList.add('text-slate-400');
    
    if (btn.dataset.target === idTela) {
      btn.classList.add('active');
      btn.classList.remove('text-slate-400');
      if (idTela.includes('empresa') || idTela.includes('gerenciar')) {
        btn.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
      } else {
        btn.classList.add('bg-indigo-500/10', 'text-indigo-400', 'border-indigo-500/20');
      }
    }
  });

  // Rolar container para o topo suavemente ao trocar de aba
  const container = document.getElementById('app-content-area');
  if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
};

// ----------------------------------------------------
// 5. GESTÃO DE SESSÃO & AUTH (ONLINE / OFFLINE)
// ----------------------------------------------------
window.alternarModoAuth = function(modo) {
  const btn = document.getElementById('auth-submit-btn');
  const title = document.getElementById('auth-title');
  const desc = document.getElementById('auth-desc');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const feedback = document.getElementById('auth-feedback');
  
  feedback.classList.add('hidden');
  
  if (modo === 'signup') {
    tabSignup.className = 'flex-1 py-2.5 bg-slate-800 text-white text-xs font-black rounded-lg shadow-sm transition-all uppercase tracking-wider';
    tabLogin.className = 'flex-1 py-2.5 text-slate-400 hover:text-white text-xs font-black rounded-lg transition-all uppercase tracking-wider';
    btn.innerText = 'COMEÇAR CARREIRA';
    title.innerText = 'Crie sua conta';
    desc.innerText = 'Escolha suas credenciais para entrar no TalentPlay';
  } else {
    tabLogin.className = 'flex-1 py-2.5 bg-slate-800 text-white text-xs font-black rounded-lg shadow-sm transition-all uppercase tracking-wider';
    tabSignup.className = 'flex-1 py-2.5 text-slate-400 hover:text-white text-xs font-black rounded-lg transition-all uppercase tracking-wider';
    btn.innerText = 'INICIAR SESSÃO';
    title.innerText = 'Acesse o TalentPlay';
    desc.innerText = 'Conecte-se para recrutar ou evoluir profissionalmente';
  }
};

window.executarAutenticacao = async function(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const btn = document.getElementById('auth-submit-btn');
  const isSignup = btn.innerText.includes('COMEÇAR') || btn.innerText.includes('CRIAR');
  
  btn.disabled = true;
  btn.innerText = 'SINCALIZANDO...';
  
  if (modoOffline) {
    // Simulação Offline
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = isSignup ? 'COMEÇAR CARREIRA' : 'INICIAR SESSÃO';
      
      const fakeUser = { id: 'fake_user_123', email: email };
      localDB.usuario = fakeUser;
      localStorage.setItem('tp_usuario', JSON.stringify(fakeUser));
      
      fecharModal('login-modal');
      mostrarToast(isSignup ? 'Simulação: Conta criada!' : 'Simulação: Sessão iniciada!', 'success');
      
      usuarioLogado = fakeUser;
      verificarPerfil(fakeUser);
    }, 1200);
    return;
  }
  
  // Conexão Supabase Real
  try {
    if (isSignup) {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      mostrarToast('Cadastro realizado! Confirme seu e-mail se necessário.', 'success');
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      mostrarToast('Sessão iniciada com sucesso!', 'success');
    }
    fecharModal('login-modal');
  } catch (err) {
    mostrarToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = isSignup ? 'COMEÇAR CARREIRA' : 'INICIAR SESSÃO';
  }
};

window.recuperarSenha = async function(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  if (!email) {
    mostrarToast('Preencha seu e-mail no campo antes de recuperar.', 'error');
    return;
  }
  mostrarToast('Enviando link de recuperação para seu e-mail...', 'info');
  if (modoOffline) return;
  try {
    await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    mostrarToast('Link de recuperação enviado com sucesso!', 'success');
  } catch (err) {
    mostrarToast(err.message, 'error');
  }
};

window.fazerLogout = async function() {
  if (!modoOffline) {
    await supabaseClient.auth.signOut();
  }
  localStorage.removeItem('tp_usuario');
  localStorage.removeItem('tp_perfil');
  usuarioLogado = null;
  perfilAtual = null;
  window.location.reload();
};

// ----------------------------------------------------
// 6. GESTÃO DO PERFIL (PERFIS DE USUÁRIOS)
// ----------------------------------------------------
async function verificarPerfil(user) {
  usuarioLogado = user;
  
  if (modoOffline) {
    if (localDB.perfil) {
      perfilAtual = localDB.perfil;
      atualizarInfoTela(perfilAtual);
    } else {
      abrirOnboarding();
    }
    return;
  }
  
  // Real Supabase Fetch
  try {
    const { data, error } = await supabaseClient
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error || !data) {
      abrirOnboarding();
    } else {
      perfilAtual = data;
      localDB.perfil = data;
      localStorage.setItem('tp_perfil', JSON.stringify(data));
      atualizarInfoTela(data);
    }
  } catch (err) {
    console.error(err);
  }
}

function abrirOnboarding() {
  abrirModal('onboarding-modal');
}

window.salvarPerfil = async function(e) {
  e.preventDefault();
  const nome = document.getElementById('onboarding-nome').value;
  const tipo = document.querySelector('input[name="tipo_conta"]:checked').value;
  const btn = document.getElementById('onboarding-submit-btn');
  
  btn.disabled = true;
  btn.innerText = 'SALVANDO...';
  
  const novosDados = {
    id: usuarioLogado ? usuarioLogado.id : 'fake_user_123',
    nome: nome,
    tipo_conta: tipo,
    xp: 0,
    nivel: 1
  };
  
  if (modoOffline) {
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = 'Começar Jornada';
      perfilAtual = novosDados;
      localDB.perfil = novosDados;
      localStorage.setItem('tp_perfil', JSON.stringify(novosDados));
      
      fecharModal('onboarding-modal');
      mostrarToast('Seu perfil foi criado!', 'success');
      atualizarInfoTela(novosDados);
    }, 1000);
    return;
  }
  
  // Salvar no Supabase
  try {
    const { error } = await supabaseClient.from('perfis').insert([novosDados]);
    if (error) throw error;
    
    perfilAtual = novosDados;
    localDB.perfil = novosDados;
    localStorage.setItem('tp_perfil', JSON.stringify(novosDados));
    
    fecharModal('onboarding-modal');
    mostrarToast('Seu perfil foi salvo com sucesso!', 'success');
    atualizarInfoTela(novosDados);
  } catch (err) {
    mostrarToast(err.message, 'error');
    btn.disabled = false;
    btn.innerText = 'Começar Jornada';
  }
};

// ----------------------------------------------------
// 7. SINCRONIZAÇÃO DE TELAS & RENDER DINÂMICO
// ----------------------------------------------------
function atualizarInfoTela(data) {
  // 1. Atualiza Dados do Header Superior
  const headerName = document.getElementById('header-user-name');
  const headerInfo = document.getElementById('header-user-info');
  if (headerName) headerName.innerText = data.nome;
  if (headerInfo) {
    if (data.tipo_conta === 'candidato') {
      headerInfo.innerText = `Nível ${data.nivel} • ${data.xp} XP`;
    } else {
      headerInfo.innerText = `Painel de Recrutador`;
    }
  }

  // 2. Atualiza a Sidebar Lateral
  const sidebarName = document.getElementById('sidebar-name');
  const sidebarRole = document.getElementById('sidebar-role');
  const sidebarLevelBadge = document.getElementById('sidebar-level-badge');
  const sidebarXpContainer = document.getElementById('sidebar-xp-container');
  const sidebarAvatar = document.getElementById('sidebar-avatar-icon');
  
  if (sidebarName) sidebarName.innerText = data.nome;
  
  if (data.tipo_conta === 'candidato') {
    if (sidebarRole) {
      sidebarRole.innerText = 'Candidato';
      sidebarRole.className = 'text-[11px] font-bold text-indigo-400 uppercase tracking-wide truncate mt-0.5';
    }
    if (sidebarLevelBadge) {
      sidebarLevelBadge.innerText = `Lvl.${data.nivel}`;
      sidebarLevelBadge.classList.remove('hidden');
    }
    if (sidebarXpContainer) {
      sidebarXpContainer.classList.remove('hidden');
      const progressPercent = data.xp % 100;
      document.getElementById('sidebar-xp-text').innerText = `${data.xp} XP`;
      document.getElementById('sidebar-xp-bar').style.width = `${progressPercent}%`;
    }
    if (sidebarAvatar) {
      sidebarAvatar.className = 'ph ph-user text-2xl text-indigo-400';
    }
    
    // Atualiza Ficha Completa
    const fNome = document.getElementById('ficha-nome');
    const fNivel = document.getElementById('ficha-nivel');
    const fXpBar = document.getElementById('ficha-xp-bar');
    const fXpTexto = document.getElementById('ficha-xp-texto');
    
    if (fNome) fNome.innerText = data.nome;
    if (fNivel) fNivel.innerText = `Lvl. ${data.nivel}`;
    if (fXpBar) fXpBar.style.width = `${data.xp % 100}%`;
    if (fXpTexto) fXpTexto.innerText = `${100 - (data.xp % 100)} XP faltantes para o Nível ${data.nivel + 1}`;
    
    // Renderiza Habilidades e Histórico
    relerHardSkills();
    relerExperiencias();

    // Mostrar os menus corretos da Sidebar
    document.getElementById('menu-candidato').classList.remove('hidden');
    document.getElementById('menu-empresa').classList.add('hidden');
    
    // Configura estatísticas do painel
    document.getElementById('stat-aproveitamento').innerText = `${Math.min(100, Math.floor(data.xp * 0.8))}%`;
    
    // Atualiza informações no Ranking do RH
    const rankingLvlXp = document.getElementById('ranking-user-lvl-xp');
    const rankingMatchVal = document.getElementById('ranking-user-match-val');
    const rankingMatchBar = document.getElementById('ranking-user-match-bar');
    
    if (rankingLvlXp) rankingLvlXp.innerText = `Lvl ${data.nivel} • ${data.xp} XP`;
    const userMatch = Math.min(100, 50 + (data.nivel * 10));
    if (rankingMatchVal) rankingMatchVal.innerText = `${userMatch}%`;
    if (rankingMatchBar) rankingMatchBar.style.width = `${userMatch}%`;

    navegarPara('tela-home-candidato');
  } else {
    // Modo Recrutador
    if (sidebarRole) {
      sidebarRole.innerText = 'Recrutador';
      sidebarRole.className = 'text-[11px] font-bold text-emerald-400 uppercase tracking-wide truncate mt-0.5';
    }
    if (sidebarLevelBadge) sidebarLevelBadge.classList.add('hidden');
    if (sidebarXpContainer) sidebarXpContainer.classList.add('hidden');
    if (sidebarAvatar) {
      sidebarAvatar.className = 'ph ph-buildings text-2xl text-emerald-400';
      sidebarAvatar.parentElement.className = 'w-14 h-14 rounded-2xl bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/20';
    }
    
    // Mostrar menus corretos
    document.getElementById('menu-candidato').classList.add('hidden');
    document.getElementById('menu-empresa').classList.remove('hidden');
    
    // Sincronizar painéis de vagas da empresa
    relerVagasEmpresa();
    
    navegarPara('tela-home-empresa');
  }
  
  // Atualiza botões do header
  document.getElementById('btn-entrar-header').classList.add('hidden');
  document.getElementById('user-menu-header').classList.remove('hidden');
  document.getElementById('user-menu-header').classList.add('flex');
}

// ----------------------------------------------------
// 8. GERENCIAMENTO DE HARD SKILLS (COMPETÊNCIAS)
// ----------------------------------------------------
function relerHardSkills() {
  const container = document.getElementById('container-habilidades');
  if (!container) return;
  
  container.innerHTML = '';
  localDB.competencias.forEach(skill => {
    const card = document.createElement('div');
    card.className = "bg-slate-950 border border-indigo-500/30 p-5 rounded-2xl text-left relative overflow-hidden group hover:border-indigo-400 transition-colors slide-up";
    card.innerHTML = `
      <div class="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
      <p class="text-sm font-black text-white flex items-center gap-2">
        <i class="ph ph-shield-check text-indigo-400 text-lg"></i> ${skill.nome}
      </p>
      <p class="text-[9px] text-indigo-400 font-extrabold uppercase mt-3 tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block">${skill.nivel}</p>
    `;
    container.appendChild(card);
  });
}

window.salvarNovaHabilidadeLocal = function(e) {
  e.preventDefault();
  const nome = document.getElementById('ah-nome').value;
  const nivel = document.getElementById('ah-nivel').value;
  
  localDB.competencias.push({ nome, nivel });
  localStorage.setItem('tp_competencias', JSON.stringify(localDB.competencias));
  
  fecharModal('modal-add-habilidade');
  relerHardSkills();
  mostrarToast(`Habilidade ${nome} adicionada ao seu perfil.`, 'success');
  
  document.getElementById('ah-nome').value = '';
};

// ----------------------------------------------------
// 9. GERENCIAMENTO DE HISTÓRICO PROFISSIONAL
// ----------------------------------------------------
function relerExperiencias() {
  const container = document.getElementById('container-experiencias');
  if (!container) return;
  
  container.innerHTML = '';
  localDB.experiencias.forEach((exp, idx) => {
    const item = document.createElement('div');
    item.className = "relative group timeline-item slide-up";
    item.innerHTML = `
      <div class="absolute -left-[41px] w-6 h-6 rounded-full bg-slate-950 border-4 border-indigo-500 flex items-center justify-center shadow-md"></div>
      <div class="bg-slate-950 border border-slate-850 rounded-2xl p-6 hover:border-slate-700 transition-colors shadow-lg">
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-black text-white text-lg timeline-cargo">${exp.cargo}</h4>
          <button class="text-slate-600 hover:text-red-400 transition-colors" onclick="removerExperienciaPorIndice(${idx})">
            <i class="ph ph-trash text-lg"></i>
          </button>
        </div>
        <p class="text-xs font-bold text-indigo-400 uppercase tracking-wide bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10 inline-block mb-3 timeline-empresa">${exp.empresa} • ${exp.periodo}</p>
        <p class="text-sm text-slate-400 leading-relaxed font-medium timeline-descr">${exp.descr}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

window.salvarNovaExperienciaLocal = function(e) {
  e.preventDefault();
  const cargo = document.getElementById('ae-cargo').value;
  const empresa = document.getElementById('ae-empresa').value;
  const periodo = document.getElementById('ae-periodo').value;
  const descr = document.getElementById('ae-descr').value;
  
  localDB.experiencias.push({ cargo, empresa, periodo, descr });
  localStorage.setItem('tp_experiencias', JSON.stringify(localDB.experiencias));
  
  fecharModal('modal-add-experiencia');
  relerExperiencias();
  mostrarToast('Sua atuação foi anexada à linha do tempo.', 'success');
  
  document.getElementById('ae-cargo').value = '';
  document.getElementById('ae-empresa').value = '';
  document.getElementById('ae-periodo').value = '';
  document.getElementById('ae-descr').value = '';
};

window.removerExperienciaPorIndice = function(idx) {
  localDB.experiencias.splice(idx, 1);
  localStorage.setItem('tp_experiencias', JSON.stringify(localDB.experiencias));
  relerExperiencias();
  mostrarToast('Atuação removida do histórico.', 'info');
};

// ----------------------------------------------------
// 10. RECRUTADORES: GESTÃO E CRIAÇÃO DE VAGAS
// ----------------------------------------------------
function relerVagasEmpresa() {
  const container = document.getElementById('container-gerenciar-vagas-empresa');
  if (!container) return;
  
  // Limpar mantendo o rascunho de logística
  container.innerHTML = `
    <!-- Vaga Fixa Cadastrada -->
    <div class="bg-slate-900 border border-emerald-500/20 rounded-[2rem] p-8 relative overflow-hidden shadow-xl group">
      <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
      <div class="flex justify-between items-start mb-6">
        <div>
          <span class="inline-block py-1 px-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-3">Ativa no Mercado</span>
          <h3 class="text-2xl font-black text-white leading-tight">Auxiliar de Operações</h3>
          <p class="text-sm text-slate-400 mt-1 font-semibold"><i class="ph ph-map-pin text-emerald-500"></i> Candeias, BA • Presencial</p>
        </div>
        <button class="bg-slate-950 border border-slate-800 text-slate-400 hover:text-white p-3 rounded-xl transition-colors shadow-sm" onclick="mostrarToast('Vaga bloqueada para edição em modo simulação.', 'info')">
          <i class="ph ph-pencil-simple text-xl font-bold"></i>
        </button>
      </div>
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-slate-950 rounded-2xl p-4 border border-slate-850 text-center">
          <p class="text-2xl font-black text-white mb-1" id="count-job-players">3</p>
          <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Triados</p>
        </div>
        <div class="bg-slate-950 rounded-2xl p-4 border border-slate-850 text-center">
          <p class="text-2xl font-black text-emerald-400 mb-1">1</p>
          <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Match >90%</p>
        </div>
        <div class="bg-slate-950 rounded-2xl p-4 border border-slate-850 text-center flex flex-col justify-center items-center">
          <p class="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Recompensa</p>
          <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-black text-xs leading-none">+50 XP</span>
        </div>
      </div>
      <div class="border-t border-slate-800 pt-6">
        <button onclick="navegarPara('tela-home-empresa')" class="w-full py-4 bg-slate-850 hover:bg-slate-800 text-white border border-slate-800 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md">Analisar Candidatos</button>
      </div>
    </div>
  `;
  
  // Vagas adicionadas dinamicamente
  const adicionais = localDB.vagas.filter(v => v.id !== 'vaga_1');
  adicionais.forEach(vaga => {
    const card = document.createElement('div');
    card.className = "bg-slate-900 border border-emerald-500/10 hover:border-emerald-500/20 rounded-[2rem] p-8 relative overflow-hidden shadow-xl slide-up";
    card.innerHTML = `
      <div class="flex justify-between items-start mb-6">
        <div>
          <span class="inline-block py-1 px-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-3">Publicada</span>
          <h3 class="text-2xl font-black text-white leading-tight">${vaga.titulo}</h3>
          <p class="text-sm text-slate-400 mt-1 font-semibold"><i class="ph ph-map-pin text-emerald-500"></i> ${vaga.local} • ${vaga.tipo}</p>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-slate-950 rounded-2xl p-4 border border-slate-850 text-center">
          <p class="text-2xl font-black text-white mb-1">0</p>
          <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Triados</p>
        </div>
        <div class="bg-slate-950 rounded-2xl p-4 border border-slate-850 text-center">
          <p class="text-2xl font-black text-emerald-400 mb-1">0</p>
          <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Matches</p>
        </div>
        <div class="bg-slate-950 rounded-2xl p-4 border border-slate-850 text-center flex flex-col justify-center items-center">
          <p class="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Recompensa</p>
          <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-black text-xs leading-none">+${vaga.xp_recompensa} XP</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Rascunho padrão final
  const rascunho = document.createElement('div');
  rascunho.className = "bg-slate-900 border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden shadow-xl opacity-75";
  rascunho.innerHTML = `
    <div class="flex justify-between items-start mb-6">
      <div>
        <span class="inline-block py-1 px-3 rounded-md bg-slate-850 border border-slate-750 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Rascunho</span>
        <h3 class="text-2xl font-black text-white leading-tight">Analista de Logística Pleno</h3>
        <p class="text-sm text-slate-400 mt-1 font-semibold"><i class="ph ph-map-pin text-slate-500"></i> Simões Filho, BA • Híbrido</p>
      </div>
    </div>
    <div class="bg-slate-950 border border-slate-850 border-dashed rounded-2xl p-8 text-center mb-6">
      <i class="ph ph-gear text-4xl text-slate-600 mb-2 block animate-spin" style="animation-duration: 4s;"></i>
      <p class="text-sm font-bold text-slate-400">Estudo de Caso pendente de revisão.</p>
    </div>
    <div class="border-t border-slate-800 pt-6">
      <button onclick="mostrarToast('Triagem por simulação de rotina habilitada.', 'success')" class="w-full py-4 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 border border-emerald-500/20 rounded-xl font-black text-xs uppercase tracking-wider transition-all">Publicar Vaga no Radar</button>
    </div>
  `;
  container.appendChild(rascunho);
}

window.criarNovaVagaLocal = function(e) {
  e.preventDefault();
  const titulo = document.getElementById('nv-titulo').value;
  const local = document.getElementById('nv-local').value;
  const xp = parseInt(document.getElementById('nv-xp').value);
  
  const novaVaga = {
    id: `vaga_${Date.now()}`,
    titulo: titulo,
    empresa: perfilAtual ? perfilAtual.nome : "Empresa Parceira",
    local: local,
    xp_recompensa: xp,
    tipo: local.toLowerCase().includes('remoto') ? "Remoto" : "Presencial",
    nivel_requerido: 1
  };
  
  localDB.vagas.push(novaVaga);
  localStorage.setItem('tp_vagas', JSON.stringify(localDB.vagas));
  
  fecharModal('modal-nova-vaga');
  
  // Atualiza listagem de vagas de candidatos e RH
  relerVagasEmpresa();
  relerMuralVagasCandidatos();
  
  // Atualiza contadores sidebar
  document.getElementById('sidebar-empresa-vagas-count').innerText = localDB.vagas.length;
  
  mostrarToast('Oportunidade profissional publicada com sucesso no mural de vagas!', 'success');
  
  document.getElementById('nv-titulo').value = '';
  document.getElementById('nv-local').value = '';
};

// ----------------------------------------------------
// 11. FILTRO DE VAGAS (BUSCA COMPLETA)
// ----------------------------------------------------
function relerMuralVagasCandidatos() {
  const container = document.getElementById('container-todas-vagas');
  if (!container) return;
  
  container.innerHTML = '';
  localDB.vagas.forEach(vaga => {
    const card = document.createElement('div');
    card.className = "vaga-card bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 relative shadow-lg flex flex-col h-full transition-colors group slide-up";
    card.setAttribute('data-titulo', vaga.titulo);
    card.setAttribute('data-local', vaga.local);
    
    card.innerHTML = `
      <div class="flex justify-between items-start mb-6">
        <div>
          <span class="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20 tracking-wider uppercase">${vaga.tipo}</span>
          <h3 class="text-xl font-bold text-white mt-3 vaga-titulo group-hover:text-indigo-300 transition-colors leading-tight">${vaga.titulo}</h3>
          <p class="text-sm text-slate-400 mt-1.5 vaga-empresa">${vaga.empresa} • ${vaga.local}</p>
        </div>
        <div class="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-2xl shadow-inner shrink-0">${vaga.tipo === 'Remoto' ? '💻' : '🏢'}</div>
      </div>
      <div class="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
        <span class="text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">+${vaga.xp_recompensa} XP</span>
        <button onclick="iniciarRPG('${vaga.titulo}', '${vaga.empresa}')" class="text-xs font-black text-white bg-slate-800 hover:bg-indigo-600 px-5 py-3 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5">Iniciar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.filtrarVagasHome = function() {
  const query = document.getElementById('busca-vagas-input').value.toLowerCase();
  const local = document.getElementById('busca-vagas-local').value.toLowerCase();
  
  // Redireciona filtros para o mural geral e navega para lá
  document.getElementById('mural-busca').value = query;
  document.getElementById('mural-local').value = local;
  
  filtrarVagasMural();
  navegarPara('tela-vagas');
};

window.filtrarVagasMural = function() {
  const query = document.getElementById('mural-busca').value.toLowerCase();
  const local = document.getElementById('mural-local').value.toLowerCase();
  
  const cards = document.querySelectorAll('.vaga-card');
  let encontrou = false;
  
  cards.forEach(card => {
    const titulo = card.getAttribute('data-titulo').toLowerCase();
    const loc = card.getAttribute('data-local').toLowerCase();
    
    const matchesQuery = titulo.includes(query);
    const matchesLocal = local === '' || loc.includes(local);
    
    if (matchesQuery && matchesLocal) {
      card.style.display = 'flex';
      encontrou = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  const emptyState = document.getElementById('vagas-vazio');
  if (encontrou) {
    emptyState.classList.add('hidden');
  } else {
    emptyState.classList.remove('hidden');
  }
};

// ----------------------------------------------------
// 12. MOTOR DO SIMULADOR DE TOMADA DE DECISÃO (RPG)
// ----------------------------------------------------
let desafioAtivo = null;

window.iniciarRPG = function(vagaTitulo = 'Auxiliar de Operações', empresa = 'Mosaic') {
  if (!perfilAtual) {
    abrirModal('login-modal');
    return;
  }
  
  if (perfilAtual.tipo_conta === 'empresa') {
    mostrarToast('Recrutadores não realizam desafios práticos de candidatos.', 'error');
    return;
  }
  
  desafioAtivo = { titulo: vagaTitulo, empresa: empresa };
  
  const header = document.getElementById('rpg-titulo-header');
  const text = document.getElementById('rpg-text');
  const choices = document.getElementById('rpg-choices');
  const sub = document.getElementById('rpg-fase-subtitle');
  
  header.innerText = `Simulação: ${vagaTitulo}`;
  sub.innerText = `Análise Comportamental Real na ${empresa}`;
  
  // Caso de Teste customizado dependendo do cargo
  if (vagaTitulo.toLowerCase().includes('estoque')) {
    text.innerHTML = `O terminal de recebimento está operando sob forte neblina e um carregamento importante de insumos químicos acaba de chegar. O motorista avisa que tem pressa por conta do horário regulamentar e o sistema informatizado apresentou instabilidade. Qual sua tomada de decisão?`;
    choices.innerHTML = `
      <button onclick="escolherOpcao('A')" class="group w-full text-left p-5 bg-slate-950 hover:bg-indigo-950/40 border-2 border-slate-800 hover:border-indigo-500 rounded-2xl text-slate-300 text-sm transition-all shadow-md flex gap-4 items-start">
        <span class="text-indigo-500 font-black text-xl group-hover:text-indigo-400">A)</span> 
        <span class="mt-0.5">Recusa o recebimento e manda o caminhão aguardar até o sistema voltar à estabilidade plena.</span>
      </button>
      <button onclick="escolherOpcao('B')" class="group w-full text-left p-5 bg-slate-950 hover:bg-indigo-950/40 border-2 border-slate-800 hover:border-indigo-500 rounded-2xl text-slate-300 text-sm transition-all shadow-md flex gap-4 items-start">
        <span class="text-indigo-500 font-black text-xl group-hover:text-indigo-400">B)</span> 
        <span class="mt-0.5">Autoriza a descarga sem nenhum tipo de controle manual, deixando para conferir no sistema depois.</span>
      </button>
      <button onclick="escolherOpcao('C')" class="group w-full text-left p-5 bg-slate-950 hover:bg-indigo-950/40 border-2 border-slate-800 hover:border-emerald-500 hover:text-white rounded-2xl text-slate-300 text-sm transition-all shadow-md flex gap-4 items-start">
        <span class="text-indigo-500 font-black text-xl group-hover:text-emerald-400">C)</span> 
        <span class="mt-0.5 font-semibold">Realiza a recepção manual conferindo as notas fiscais fisicamente, registra em planilha e orienta o motorista a aguardar com segurança na vaga de contingência.</span>
      </button>
    `;
  } else {
    // Padrão de Auxiliar de Operações
    text.innerHTML = `Você está no terminal operacional da <strong>${empresa}</strong>. Duas carretas de escoamento estão prontas, mas a TI comunicou uma queda na rede de pesagem eletrônica e há fila se formando. O gerente de logística te liga pedindo agilidade máxima. O que fazer?`;
    choices.innerHTML = `
      <button onclick="escolherOpcao('A')" class="group w-full text-left p-5 bg-slate-950 hover:bg-indigo-950/40 border-2 border-slate-800 hover:border-indigo-500 rounded-2xl text-slate-300 text-sm transition-all shadow-md flex gap-4 items-start">
        <span class="text-indigo-500 font-black text-xl group-hover:text-indigo-400">A)</span> 
        <span class="mt-0.5">Paralisa as operações e aguarda o suporte técnico da TI sem tomar nenhuma iniciativa interna.</span>
      </button>
      <button onclick="escolherOpcao('B')" class="group w-full text-left p-5 bg-slate-950 hover:bg-indigo-950/40 border-2 border-slate-800 hover:border-indigo-500 rounded-2xl text-slate-300 text-sm transition-all shadow-md flex gap-4 items-start">
        <span class="text-indigo-500 font-black text-xl group-hover:text-indigo-400">B)</span> 
        <span class="mt-0.5">Pesas carretas ignorando as normas de tolerância de segurança e despacha de qualquer forma.</span>
      </button>
      <button onclick="escolherOpcao('C')" class="group w-full text-left p-5 bg-slate-950 hover:bg-indigo-950/40 border-2 border-slate-800 hover:border-emerald-500 hover:text-white rounded-2xl text-slate-300 text-sm transition-all shadow-md flex gap-4 items-start">
        <span class="text-indigo-500 font-black text-xl group-hover:text-emerald-400">C)</span> 
        <span class="mt-0.5 font-semibold">Informa o gerente rapidamente da falha, aciona o protocolo físico de contingência manual registrando as placas das carretas e organiza o pátio portuário por planilhas.</span>
      </button>
    `;
  }
  
  choices.classList.remove('hidden');
  abrirModal('rpg-modal');
};

window.fecharRPG = function() {
  fecharModal('rpg-modal');
};

window.escolherOpcao = async function(opcao) {
  const text = document.getElementById('rpg-text');
  const choices = document.getElementById('rpg-choices');
  
  choices.classList.add('hidden');
  
  let xpGanho = (opcao === 'C') ? 50 : 10;
  
  if (opcao === 'C') {
    text.innerHTML = `
      <span class="text-emerald-400 font-black text-2xl mb-2 block animate-bounce">✓ SUCESSO ABSOLUTO!</span>
      <p class="text-slate-300 leading-relaxed font-semibold">Excelente liderança e proatividade comercial. Sua escolha seguiu à risca as diretrizes operacionais de contingência física, organizando a logística interna de faturamento.</p>
      <p class="text-indigo-400 font-bold mt-4">+${xpGanho} XP Ganhos para sua Carreira!</p>
    `;
  } else {
    text.innerHTML = `
      <span class="text-yellow-400 font-black text-2xl mb-2 block">✓ DESAFIO CONCLUÍDO!</span>
      <p class="text-slate-300 leading-relaxed">Você completou a simulação, mas sua escolha causou gargalos na fila física ou descumpriu normas rígidas de conformidade. Priorize o controle físico em momentos de instabilidade digital.</p>
      <p class="text-indigo-400 font-bold mt-4">+${xpGanho} XP Ganhos para aprendizado.</p>
    `;
  }
  
  const novoXp = perfilAtual.xp + xpGanho;
  const novoNivel = Math.floor(novoXp / 100) + 1;
  const subiuNivel = novoNivel > perfilAtual.nivel;
  
  perfilAtual.xp = novoXp;
  perfilAtual.nivel = novoNivel;
  
  if (subiuNivel) {
    text.innerHTML += `
      <div class="mt-6 bg-indigo-500/10 border-2 border-indigo-500/40 p-5 rounded-2xl text-center slide-up">
        <p class="text-xl font-black text-white flex items-center justify-center gap-2">
          <i class="ph ph-sparkle text-yellow-400 animate-spin"></i> PARABÉNS! LEVEL UP!
        </p>
        <p class="text-xs text-indigo-400 font-bold mt-1 uppercase tracking-widest">Sua Carreira evoluiu para o Nível ${novoNivel}</p>
      </div>
    `;
  }
  
  text.innerHTML += `
    <button onclick="fecharRPG()" class="w-full py-4 mt-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Concluir Processo</button>
  `;
  
  if (modoOffline) {
    localDB.perfil = perfilAtual;
    localStorage.setItem('tp_perfil', JSON.stringify(perfilAtual));
    atualizarInfoTela(perfilAtual);
    registrarCandidaturaLocal(desafioAtivo.titulo, desafioAtivo.empresa, opcao === 'C' ? '98%' : '70%');
    return;
  }
  
  // Real Supabase Sync
  try {
    const { error } = await supabaseClient
      .from('perfis')
      .update({ xp: novoXp, nivel: novoNivel })
      .eq('id', usuarioLogado.id);
      
    if (!error) {
      localDB.perfil = perfilAtual;
      localStorage.setItem('tp_perfil', JSON.stringify(perfilAtual));
      atualizarInfoTela(perfilAtual);
      registrarCandidaturaLocal(desafioAtivo.titulo, desafioAtivo.empresa, opcao === 'C' ? '98%' : '70%');
    }
  } catch (err) {
    console.error(err);
  }
};

function registrarCandidaturaLocal(vaga, empresa, match) {
  // Simular adição à tela de candidaturas
  const container = document.getElementById('lista-candidaturas-timeline');
  if (container) {
    // Se o texto padrão "Você ainda não aplicou" estiver visível, limpar
    if (container.innerText.includes('ainda não aplicou')) {
      container.innerHTML = '';
    }
    
    const card = document.createElement('div');
    card.className = "bg-slate-900 border border-indigo-500/20 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-center shadow-xl relative overflow-hidden group slide-up";
    card.innerHTML = `
      <div class="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
      <div class="w-20 h-20 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-4xl shadow-inner shrink-0 pr-1">🏢</div>
      <div class="flex-1 text-center lg:text-left">
        <h3 class="text-2xl font-black text-white">${vaga}</h3>
        <p class="text-slate-400 mt-1 font-medium">${empresa} • Presencial</p>
        <div class="flex items-center justify-center lg:justify-start gap-4 mt-4">
          <span class="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800"><i class="ph ph-calendar-blank"></i> Aplicado Agora</span>
          <span class="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"><i class="ph ph-check-circle"></i> Teste Realizado</span>
        </div>
      </div>
      <div class="w-full lg:w-64 bg-slate-950 rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
        <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 text-center">Status Atual</p>
        <p class="text-lg font-black text-white text-center mb-1">Simulado com Sucesso</p>
        <p class="text-[11px] text-slate-400 text-center font-bold">Match de ${match} de acerto.</p>
      </div>
    `;
    container.prepend(card);
    
    // Atualiza contador da barra lateral
    const candCount = document.getElementById('sidebar-candidaturas-count');
    if (candCount) {
      const current = parseInt(candCount.innerText) || 0;
      candCount.innerText = current + 1;
    }
  }
}

// ----------------------------------------------------
// 13. MODAL: DETALHES DE CANDIDATURAS PARA RECRUTADORES
// ----------------------------------------------------
window.abrirModalCandidato = function(nome, nivelInfo, match, laudoText) {
  const modal = document.getElementById('modal-ver-candidato');
  if (!modal) return;
  
  document.getElementById('vc-nome').innerText = nome;
  document.getElementById('vc-nivel-xp').innerText = `${nivelInfo} • Triagem Prática`;
  document.getElementById('vc-laudo').innerText = laudoText;
  
  const matchElement = document.getElementById('vc-match');
  matchElement.innerText = `${match} MATCH COMPETENCIAL`;
  
  abrirModal('modal-ver-candidato');
};

window.visualizarMinhaFichaRecrutador = function() {
  if (perfilAtual) {
    const userMatch = Math.min(100, 50 + (perfilAtual.nivel * 10));
    window.abrirModalCandidato(
      perfilAtual.nome, 
      `Lvl ${perfilAtual.nivel}`, 
      `${userMatch}%`, 
      'Ricardo Lima realizou a avaliação prática e demonstrou excelente assertividade nas tomadas de decisão sob pressão operacional.'
    );
  }
};

window.atualizarConfiguracoesPerfil = function(e) {
  e.preventDefault();
  const loc = document.getElementById('config-location').value;
  if (!perfilAtual) return;
  
  perfilAtual.localizacao = loc;
  
  const fLoc = document.getElementById('ficha-location');
  if (fLoc) fLoc.innerText = loc;
  
  if (modoOffline) {
    localDB.perfil = perfilAtual;
    localStorage.setItem('tp_perfil', JSON.stringify(perfilAtual));
    fecharModal('modal-configuracoes');
    mostrarToast('Localidade atualizada com sucesso!', 'success');
    return;
  }
  
  // Real Supabase Sync
  fecharModal('modal-configuracoes');
  mostrarToast('Configurações atualizadas.', 'success');
};

// ----------------------------------------------------
// 14. INICIALIZAÇÃO AUTOMÁTICA DO SISTEMA
// ----------------------------------------------------
window.onload = function() {
  // Sincronizar banco de dados offline
  relerHardSkills();
  relerExperiencias();
  relerMuralVagasCandidatos();
  relerVagasEmpresa();
  
  if (!modoOffline) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        verificarPerfil(session.user);
      }
      if (event === 'SIGNED_OUT') {
        fazerLogout();
      }
    });
    
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) verificarPerfil(session.user);
    });
  } else {
    // Execução Offline
    if (localDB.usuario) {
      usuarioLogado = localDB.usuario;
      verificarPerfil(localDB.usuario);
    } else {
      // Inicia como visitante
      document.getElementById('btn-entrar-header').classList.remove('hidden');
      document.getElementById('user-menu-header').classList.add('hidden');
    }
  }
};
