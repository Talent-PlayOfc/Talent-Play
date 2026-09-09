// =======================================================================
// TALENTPLAY CORE MOTOR - Integração UI & Supabase
// =======================================================================

// ----------------------------------------------------
// 1. SUPABASE DATABASE & CONFIGURAÇÃO
// ----------------------------------------------------
const SUPABASE_URL = 'https://puymwjoolxlaqvwregad.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hQ0sLZG9tHSdMOFEBlurEg_FrmnlT45'; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Estado Global da Aplicação
const appState = {
  usuarioLogado: false,
  perfilAtual: null,
  avatarTemporario: null,
  modoCadastro: false
};

// ----------------------------------------------------
// 2. UI CORE: TOASTS & MODALS
// ----------------------------------------------------
window.mostrarToast = function(mensagem, tipo = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let corBorda = tipo === 'success' ? 'border-emerald-500/50' : (tipo === 'error' ? 'border-rose-500/50' : 'border-indigo-500/50');
  let corIcone = tipo === 'success' ? 'text-emerald-400' : (tipo === 'error' ? 'text-rose-400' : 'text-indigo-400');
  let icone = tipo === 'success' ? 'ph-check-circle' : (tipo === 'error' ? 'ph-warning-circle' : 'ph-info');

  toast.className = `bg-slate-900 border ${corBorda} p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 transform translate-y-10 opacity-0 transition-all duration-300 z-[200] max-w-sm mx-auto fixed bottom-5 left-0 right-0 md:left-auto md:right-5 md:mx-0 w-[90%] md:w-auto`;
  toast.innerHTML = `<i class="ph ${icone} text-2xl ${corIcone}"></i> <p class="text-sm font-bold text-white">${mensagem}</p>`;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-10', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

window.abrirModal = function(idModal) {
  const modal = document.getElementById(idModal);
  const card = document.getElementById(`card-${idModal}`);
  if (modal && card) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }, 10);
  }
};

window.fecharModal = function(idModal) {
  const modal = document.getElementById(idModal);
  const card = document.getElementById(`card-${idModal}`);
  if (modal && card) {
    modal.classList.add('opacity-0');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }, 300);
  }
};

// ----------------------------------------------------
// 3. SPA ROUTER (Navegação Instantânea & URLs)
// ----------------------------------------------------
window.navegarPara = function(idTela) {
  document.querySelectorAll('.app-screen').forEach(tela => {
    tela.classList.remove('active');
    tela.classList.add('hidden');
  });

  const telaDestino = document.getElementById(idTela);
  if (telaDestino) {
    telaDestino.classList.remove('hidden');
    setTimeout(() => telaDestino.classList.add('active'), 10);
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-slate-800/50', 'border-indigo-500/30', 'bg-indigo-600/10');
    if (btn.getAttribute('data-target') === idTela) {
      btn.classList.add('active', 'bg-indigo-600/10', 'border', 'border-indigo-500/30');
    }
  });

  window.history.pushState({}, document.title, window.location.pathname);
  document.getElementById('app-content-area').scrollTo({ top: 0, behavior: 'smooth' });
};

// ----------------------------------------------------
// 4. LÓGICA DE LOGIN, GOOGLE & CADASTRO
// ----------------------------------------------------
window.alternarModoAuth = function() {
  appState.modoCadastro = !appState.modoCadastro;
  
  const titulo = document.getElementById('modal-titulo');
  const campoNome = document.getElementById('campo-nome');
  const seletorConta = document.getElementById('seletor-tipo-conta');
  const btnSubmit = document.getElementById('btn-submit-auth');
  const textoToggle = document.getElementById('auth-toggle-text');

  if (appState.modoCadastro) {
    titulo.innerText = "Criar Ficha";
    campoNome.classList.remove('hidden');
    seletorConta.classList.remove('hidden');
    btnSubmit.innerText = "Forjar meu Perfil";
    document.getElementById('auth-nome').required = true;
    textoToggle.innerHTML = `Já faz parte da guilda? <button type="button" onclick="alternarModoAuth()" class="text-indigo-400 font-bold hover:text-indigo-300 ml-1 underline decoration-indigo-500/30 underline-offset-4">Fazer Login</button>`;
  } else {
    titulo.innerText = "Acessar Conta";
    campoNome.classList.add('hidden');
    seletorConta.classList.add('hidden');
    btnSubmit.innerText = "Entrar no Sistema";
    document.getElementById('auth-nome').required = false;
    textoToggle.innerHTML = `Ainda não tem ficha cadastrada? <button type="button" onclick="alternarModoAuth()" class="text-indigo-400 font-bold hover:text-indigo-300 ml-1 underline decoration-indigo-500/30 underline-offset-4">Criar Conta</button>`;
  }
};

window.loginComGoogle = async function() {
  mostrarToast("Redirecionando para o Google...", "info");
  const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
  if (error) mostrarToast("Erro no Google: " + error.message, "error");
};

window.processarAutenticacao = async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-senha').value;
  const btnSubmit = document.getElementById('btn-submit-auth');
  
  btnSubmit.disabled = true;
  btnSubmit.innerText = "Processando...";

  try {
    if (appState.modoCadastro) {
      // Rotina de Cadastro
      const nome = document.getElementById('auth-nome').value;
      const tipoConta = document.querySelector('input[name="tipo-conta"]:checked').value;

      const { data: authData, error: authError } = await supabaseClient.auth.signUp({ email, password: pass });
      if (authError) throw authError;

      // Cria o perfil na tabela
      if (authData.user) {
        await supabaseClient.from('perfis').insert([{ 
          id: authData.user.id, 
          nome: nome, 
          tipo_conta: tipoConta, 
          xp: 0, 
          nivel: 1 
        }]);
      }
      mostrarToast('Conta criada! Entrando no sistema...', 'success');
      
    } else {
      // Rotina de Login
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    }
    
    fecharModal('login-modal');
  } catch (err) {
    mostrarToast('Erro: ' + err.message, 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = appState.modoCadastro ? "Forjar meu Perfil" : "Entrar no Sistema";
  }
};

window.fazerLogout = async function() {
  await supabaseClient.auth.signOut();
  window.location.reload();
};

// ----------------------------------------------------
// 5. ATUALIZAÇÃO DA INTERFACE & SESSÃO
// ----------------------------------------------------
function atualizarInfoTela(perfil) {
  appState.perfilAtual = perfil;
  appState.usuarioLogado = true;

  // Header Updates
  document.getElementById('btn-entrar-header').classList.add('hidden');
  const userMenu = document.getElementById('user-menu-header');
  userMenu.classList.remove('hidden');
  userMenu.classList.add('flex');

  // Sidebar Updates
  document.getElementById('sidebar-name').innerText = perfil.nome;
  atualizarExibicaoAvatar(perfil.avatar_url);

  if (perfil.tipo_conta === 'candidato') {
    document.getElementById('sidebar-role').innerText = "Candidato";
    document.getElementById('sidebar-role').className = "text-[11px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5";
    document.getElementById('sidebar-level-badge').classList.remove('hidden');
    document.getElementById('sidebar-level-badge').innerText = `Lvl.${perfil.nivel || 1}`;
    document.getElementById('sidebar-xp-container').classList.remove('hidden');
    
    let xpAtual = perfil.xp || 0;
    let progressoBarra = xpAtual % 100;
    document.getElementById('sidebar-xp-text').innerText = `${xpAtual} XP`;
    document.getElementById('sidebar-xp-bar').style.width = `${progressoBarra}%`;

    // Atualiza Tela de Perfil
    const fnome = document.getElementById('ficha-nome');
    if(fnome) fnome.innerText = perfil.nome;
    const fnivel = document.getElementById('ficha-nivel');
    if(fnivel) fnivel.innerText = `Lvl. ${perfil.nivel || 1}`;

    document.getElementById('menu-candidato').classList.remove('hidden');
    document.getElementById('menu-empresa').classList.add('hidden');
    navegarPara('tela-home-candidato');
  } else {
    // Empresa
    document.getElementById('sidebar-role').innerText = "Recrutador";
    document.getElementById('sidebar-role').className = "text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5";
    document.getElementById('sidebar-level-badge').classList.add('hidden');
    document.getElementById('sidebar-xp-container').classList.add('hidden');
    
    document.getElementById('menu-candidato').classList.add('hidden');
    document.getElementById('menu-empresa').classList.remove('hidden');
    navegarPara('tela-home-empresa');
  }
}

// ----------------------------------------------------
// 6. GESTÃO DE EMBLEMAS E FOTOS
// ----------------------------------------------------
window.tentarAbrirModalFoto = function() {
  if (!appState.usuarioLogado) {
    mostrarToast('Faça login para escolher seu emblema.', 'info');
    abrirModal('login-modal');
    return;
  }
  abrirModal('modal-editar-perfil');
};

window.selecionarAvatarPredefinido = function(url) {
  appState.avatarTemporario = url;
  
  const previewImg = document.getElementById('avatar-preview-img');
  const placeholder = document.getElementById('avatar-preview-placeholder');
  const container = document.getElementById('avatar-preview-container');
  
  if (previewImg && placeholder) {
    previewImg.src = url;
    previewImg.classList.remove('hidden');
    placeholder.classList.add('hidden');
    
    // Efeito de seleção
    container.classList.add('border-indigo-500', 'shadow-[0_0_30px_rgba(99,102,241,0.5)]');
    setTimeout(() => {
      container.classList.remove('border-indigo-500', 'shadow-[0_0_30px_rgba(99,102,241,0.5)]');
    }, 400);
  }
};

window.salvarFotoPerfil = async function() {
  if (!appState.avatarTemporario) {
    mostrarToast('Selecione um emblema primeiro.', 'error');
    return;
  }

  const btn = document.getElementById('btn-confirmar-foto');
  btn.disabled = true;
  btn.innerText = 'SALVANDO...';

  // Salva no Supabase
  const { error } = await supabaseClient
    .from('perfis')
    .update({ avatar_url: appState.avatarTemporario })
    .eq('id', appState.perfilAtual.id);

  if (error) {
    mostrarToast('Erro ao salvar: ' + error.message, 'error');
    btn.disabled = false;
    btn.innerText = 'Salvar Alteração';
    return;
  }

  appState.perfilAtual.avatar_url = appState.avatarTemporario;
  atualizarExibicaoAvatar(appState.avatarTemporario);
  
  fecharModal('modal-editar-perfil');
  mostrarToast('Emblema atualizado com sucesso!', 'success');
  btn.disabled = false;
  btn.innerText = 'Salvar Alteração';
};

window.atualizarExibicaoAvatar = function(url) {
  const imgEl = document.getElementById('sidebar-avatar-img');
  const fallbackEl = document.getElementById('sidebar-avatar-fallback');
  const perfilImg = document.getElementById('perfil-foto-grande');
  const perfilIcon = document.getElementById('perfil-icone-grande');

  if (url) {
    if (imgEl) { imgEl.src = url; imgEl.classList.remove('hidden'); fallbackEl.classList.add('hidden'); }
    if (perfilImg) { perfilImg.src = url; perfilImg.classList.remove('hidden'); perfilIcon.classList.add('hidden'); }
  }
};

// ----------------------------------------------------
// 7. INICIALIZAÇÃO DE SESSÃO AUTOMÁTICA
// ----------------------------------------------------
window.onload = function() {
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      // Busca os dados do perfil logado
      const { data } = await supabaseClient.from('perfis').select('*').eq('id', session.user.id).single();
      if (data) atualizarInfoTela(data);
    } else {
      appState.usuarioLogado = false;
      appState.perfilAtual = null;
    }
  });
};
