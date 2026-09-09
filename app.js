// =======================================================================
// TALENTPLAY CORE MOTOR - v1.4.2 Final Integrado
// =======================================================================

const SUPABASE_URL = 'https://puymwjoolxlaqvwregad.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hQ0sLZG9tHSdMOFEBlurEg_FrmnlT45'; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const appState = {
  usuarioLogado: false,
  perfilAtual: null,
  avatarTemporario: null, 
  tipoSelecaoAtual: 'emblema', 
  modoCadastro: false
};

// ----------------------------------------------------
// UI CORE: TOASTS & MODALS
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
// 3. SPA ROUTER (Navegação Instantânea Limpa)
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
    btn.classList.remove(
      'active', 
      'border', 
      'border-transparent', 
      'border-indigo-500/30', 
      'border-emerald-500/30', 
      'bg-indigo-600/10', 
      'bg-emerald-500/10', 
      'text-indigo-400', 
      'text-emerald-400'
    );
    
    btn.classList.add('outline-none', 'text-slate-400');

    if (btn.getAttribute('data-target') === idTela) {
      btn.classList.remove('text-slate-400');
      btn.classList.add('active');
      
      if(idTela.includes('empresa')) {
        btn.classList.add('bg-emerald-500/10', 'text-emerald-400');
      } else {
        btn.classList.add('bg-indigo-600/10', 'text-indigo-400');
      }
    }
  });

  window.history.pushState({}, document.title, window.location.pathname);
  const contentArea = document.getElementById('app-content-area');
  if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
};

// ----------------------------------------------------
// LÓGICA DE LOGIN & GOOGLE
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
    textoToggle.innerHTML = `Já faz parte da guilda? <button type="button" onclick="alternarModoAuth()" class="text-indigo-400 font-bold hover:text-indigo-300 ml-1 underline decoration-indigo-500/30 outline-none">Fazer Login</button>`;
  } else {
    titulo.innerText = "Acessar Conta";
    campoNome.classList.add('hidden');
    seletorConta.classList.add('hidden');
    btnSubmit.innerText = "Entrar no Sistema";
    document.getElementById('auth-nome').required = false;
    textoToggle.innerHTML = `Ainda não tem ficha cadastrada? <button type="button" onclick="alternarModoAuth()" class="text-indigo-400 font-bold hover:text-indigo-300 ml-1 underline decoration-indigo-500/30 outline-none">Criar Conta</button>`;
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
      const nome = document.getElementById('auth-nome').value;
      const tipoConta = document.querySelector('input[name="tipo-conta"]:checked').value;

      const { data: authData, error: authError } = await supabaseClient.auth.signUp({ email, password: pass });
      if (authError) throw authError;

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
// ATUALIZAÇÃO DA INTERFACE & SESSÃO
// ----------------------------------------------------
function atualizarInfoTela(perfil) {
  appState.perfilAtual = perfil;
  appState.usuarioLogado = true;

  document.getElementById('btn-entrar-header').classList.add('hidden');
  const userMenu = document.getElementById('user-menu-header');
  userMenu.classList.remove('hidden');
  userMenu.classList.add('flex');

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

    const fnome = document.getElementById('ficha-nome');
    if(fnome) fnome.innerText = perfil.nome;
    const fnivel = document.getElementById('ficha-nivel');
    if(fnivel) fnivel.innerText = `Lvl. ${perfil.nivel || 1}`;

    document.getElementById('menu-candidato').classList.remove('hidden');
    document.getElementById('menu-empresa').classList.add('hidden');
    navegarPara('tela-home-candidato');
  } else {
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
// GESTÃO DE EMBLEMAS E FOTO PRÓPRIA
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
  appState.tipoSelecaoAtual = 'emblema';
  
  const previewImg = document.getElementById('avatar-preview-img');
  const placeholder = document.getElementById('avatar-preview-placeholder');
  const container = document.getElementById('avatar-preview-container');
  
  if (previewImg && placeholder) {
    previewImg.src = url;
    previewImg.classList.remove('hidden');
    placeholder.classList.add('hidden');
    
    container.classList.add('border-indigo-500', 'shadow-[0_0_30px_rgba(99,102,241,0.5)]');
    setTimeout(() => {
      container.classList.remove('border-indigo-500', 'shadow-[0_0_30px_rgba(99,102,241,0.5)]');
    }, 400);
  }
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
      
      appState.avatarTemporario = canvas.toDataURL('image/jpeg', 0.85);
      appState.tipoSelecaoAtual = 'upload';

      const previewImg = document.getElementById('avatar-preview-img');
      const placeholder = document.getElementById('avatar-preview-placeholder');
      if (previewImg && placeholder) {
        previewImg.src = appState.avatarTemporario;
        previewImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
      }
    };
  };
  reader.readAsDataURL(file);
};

window.salvarFotoPerfil = async function() {
  if (!appState.avatarTemporario) {
    mostrarToast('Selecione um emblema ou envie uma foto primeiro.', 'error');
    return;
  }

  const btn = document.getElementById('btn-confirmar-foto');
  btn.disabled = true;
  btn.innerText = 'SALVANDO...';

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
  mostrarToast('Perfil atualizado com sucesso!', 'success');
  btn.disabled = false;
  btn.innerText = 'Salvar Alteração';
};

window.atualizarExibicaoAvatar = function(url) {
  const imgEl = document.getElementById('sidebar-avatar-img');
  const fallbackEl = document.getElementById('sidebar-avatar-fallback');
  const perfilImg = document.getElementById('perfil-foto-grande');
  const perfilIcon = document.getElementById('perfil-icone-grande');
  const previewImg = document.getElementById('avatar-preview-img');
  const placeholder = document.getElementById('avatar-preview-placeholder');

  if (url) {
    if (imgEl) { imgEl.src = url; imgEl.classList.remove('hidden'); fallbackEl.classList.add('hidden'); }
    if (perfilImg) { perfilImg.src = url; perfilImg.classList.remove('hidden'); perfilIcon.classList.add('hidden'); }
    if (previewImg) { previewImg.src = url; previewImg.classList.remove('hidden'); if(placeholder) placeholder.classList.add('hidden'); }
    appState.avatarTemporario = url;
  }
};

// ----------------------------------------------------
// GESTÃO DE VAGAS & PERFIL DETALHADO (SUPABASE)
// ----------------------------------------------------
window.carregarVagasDoBanco = async function() {
  const { data: vagas, error } = await supabaseClient.from('vagas').select('*').order('created_at', { ascending: false });
  if (!error && vagas) {
    vagas.forEach(v => adicionarVagaNaTela(v.titulo, v.local, v.xp, v.empresa));
  }
};

window.adicionarVagaNaTela = function(titulo, local, xp, empresaNome) {
  const cGeral = document.getElementById('container-todas-vagas');
  if(cGeral) {
    const el = document.createElement('div');
    el.className = "vaga-card bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 relative shadow-[0_0_20px_rgba(16,185,129,0.1)] flex flex-col h-full hover:border-emerald-400 transition-colors group";
    el.setAttribute('data-titulo', titulo); 
    el.setAttribute('data-empresa', empresaNome);
    el.innerHTML = `
      <div class="flex justify-between items-start mb-6">
        <div>
          <span class="text-[9px] font-black text-white bg-emerald-500 px-2.5 py-1 rounded-md tracking-widest uppercase shadow-md">NOVA</span>
          <h3 class="text-xl font-bold text-white mt-3 vaga-titulo group-hover:text-emerald-400 transition-colors leading-tight">${titulo}</h3>
          <p class="text-sm text-slate-400 mt-1 vaga-empresa">${empresaNome} • ${local}</p>
        </div>
        <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-2xl text-emerald-500 shadow-inner shrink-0">🏢</div>
      </div>
      <div class="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
        <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">+${xp} XP</span>
        <button onclick="iniciarRPG('${titulo}', '${empresaNome}')" class="text-sm font-bold text-slate-900 bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 rounded-xl transition-colors shadow-lg">Iniciar</button>
      </div>`;
    cGeral.prepend(el);
  }
};

window.carregarPerfilDetalhes = async function(userId) {
  const contHab = document.getElementById('container-habilidades');
  if (contHab) {
    contHab.querySelectorAll('.item-habilidade').forEach(el => el.remove());
    const { data: habs } = await supabaseClient.from('habilidades').select('*').eq('candidato_id', userId);
    if (habs) habs.forEach(h => renderizarCardHabilidade(h.nome, h.nivel));
  }

  const contExp = document.getElementById('container-experiencias');
  if (contExp) {
    contExp.querySelectorAll('.item-experiencia').forEach(el => el.remove());
    const { data: exps } = await supabaseClient.from('experiencias').select('*').eq('candidato_id', userId);
    if (exps) exps.forEach(e => renderizarCardExperiencia(e.cargo, e.empresa));
  }
};

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

window.carregarMinhasCandidaturas = async function(userId) {
  const container = document.getElementById('container-minhas-candidaturas');
  const vazioMsg = document.getElementById('candidaturas-vazio');
  if (!container) return;

  const { data: candidaturas, error } = await supabaseClient
    .from('candidaturas')
    .select('*')
    .eq('candidato_id', userId)
    .order('created_at', { ascending: false });

  if (error || !candidaturas || candidaturas.length === 0) {
    if (vazioMsg) vazioMsg.classList.remove('hidden');
    return;
  }

  if (vazioMsg) vazioMsg.classList.add('hidden');
  container.innerHTML = '';

  candidaturas.forEach(c => {
    const card = document.createElement('div');
    card.className = "bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col lg:flex-row gap-6 items-center shadow-xl";
    card.innerHTML = `
      <div class="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-3xl text-indigo-400 shrink-0"><i class="ph ph-briefcase"></i></div>
      <div class="flex-1 text-center lg:text-left">
        <span class="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20 uppercase tracking-widest">+${c.xp_obtido || 0} XP</span>
        <h3 class="text-xl font-black text-white mt-1">${c.vaga_titulo}</h3>
        <p class="text-slate-400 text-sm font-medium">${c.empresa}</p>
      </div>
      <div class="w-full lg:w-48 bg-slate-950 rounded-xl p-4 border border-slate-800 text-center">
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</p>
        <p class="text-sm font-black text-white">${c.status}</p>
      </div>`;
    container.appendChild(card);
  });
};

// ----------------------------------------------------
// SIMULADOR PRÁTICO (AVALIAÇÃO)
// ----------------------------------------------------
window.iniciarRPG = function(vagaTitulo = 'Missão Padrão', empresa = 'Nossa Empresa') {
  if(!appState.perfilAtual) return abrirModal('login-modal');
  if(appState.perfilAtual.tipo_conta === 'empresa') return mostrarToast("Você está como RH. Crie vagas ao invés de avaliá-las.", "error");
  
  document.getElementById('rpg-titulo-header').innerText = `${vagaTitulo}`;
  document.getElementById('rpg-text').innerHTML = `Você está no meio do expediente na <strong>${empresa}</strong>. O telefone toca sem parar. O gerente de operações passa correndo, bate na sua mesa e fala: <br><br><span class='text-white font-bold italic text-xl border-l-4 border-indigo-500 pl-4 block bg-slate-800/50 p-4 rounded-r-xl'>"Preciso daquele relatório de estoque de ontem impresso na minha mesa AGORA!"</span><br>Ao mesmo tempo, um fornecedor estratégico liga no seu ramal exigindo falar com alguém da equipe financeira urgentemente. <br><br><span class='text-indigo-400 font-black'>Qual é a sua ação imediata?</span>`;
  
  document.getElementById('rpg-choices').classList.remove('hidden');
  abrirModal('rpg-modal');
};

window.fecharRPG = function() { 
  fecharModal('rpg-modal'); 
  if(appState.usuarioLogado && appState.perfilAtual) {
    carregarMinhasCandidaturas(appState.perfilAtual.id);
  }
};

window.escolherOpcao = async function(opcao) {
  const rpgText = document.getElementById('rpg-text');
  document.getElementById('rpg-choices').classList.add('hidden');
  let xpGanho = (opcao === 'C') ? 100 : 25;
  let matchCalc = (opcao === 'C') ? 95 : 60;
  
  if(opcao === 'C') {
    rpgText.innerHTML = `<div class='bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl mb-6'><span class='text-emerald-400 font-black text-2xl mb-2 flex items-center gap-3'><i class="ph ph-check-circle"></i> DESEMPENHO EXCELENTE!</span> <p class='text-slate-300 font-medium'>Você demonstrou equilíbrio sob pressão e comunicação assertiva.</p></div><span class='inline-block bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-xl'>+${xpGanho} XP GANHOS</span>`;
  } else {
    rpgText.innerHTML = `<div class='bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl mb-6'><span class='text-yellow-400 font-black text-2xl mb-2 flex items-center gap-3'><i class="ph ph-warning-circle"></i> PONTO DE ATENÇÃO</span> <p class='text-slate-300 font-medium'>Priorizar apenas uma das frentes prejudica a dinâmica operacional.</p></div><span class='inline-block bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-xl'>+${xpGanho} XP GANHOS</span>`;
  }

  let tituloVagaAtual = document.getElementById('rpg-titulo-header').innerText;
  let btnConcluir = `<button onclick="fecharRPG()" class='mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg'>CONCLUIR E ENVIAR AO RH</button>`;

  if(!appState.perfilAtual) return;

  await supabaseClient.from('candidaturas').insert([{
    vaga_titulo: tituloVagaAtual,
    candidato_nome: appState.perfilAtual.nome,
    candidato_id: appState.perfilAtual.id,
    empresa: 'Empresa Parceira',
    status: 'Avaliação Concluída',
    xp_obtido: xpGanho,
    match_percentual: matchCalc
  }]);

  let novoXp = (appState.perfilAtual.xp || 0) + xpGanho;
  let novoNivel = Math.floor(novoXp / 100) + 1;

  await supabaseClient.from('perfis').update({ xp: novoXp, nivel: novoNivel }).eq('id', appState.perfilAtual.id);
  
  appState.perfilAtual.xp = novoXp;
  appState.perfilAtual.nivel = novoNivel;
  atualizarInfoTela(appState.perfilAtual);

  rpgText.innerHTML += btnConcluir;
};

// ----------------------------------------------------
// INICIALIZAÇÃO DE SESSÃO AUTOMÁTICA
// ----------------------------------------------------
window.onload = function() {
  carregarVagasDoBanco();

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      const { data } = await supabaseClient.from('perfis').select('*').eq('id', session.user.id).single();
      if (data) {
        atualizarInfoTela(data);
        if (data.tipo_conta === 'candidato') {
          carregarPerfilDetalhes(session.user.id);
          carregarMinhasCandidaturas(session.user.id);
        }
      }
    } else {
      appState.usuarioLogado = false;
      appState.perfilAtual = null;
    }
  });
};
