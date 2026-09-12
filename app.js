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

  if (idTela === 'tela-home-empresa' && typeof carregarRadarTalentos === 'function') {
    carregarRadarTalentos();
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
    titulo.innerText = "Criar Conta";
    campoNome.classList.remove('hidden');
    seletorConta.classList.remove('hidden');
    btnSubmit.innerText = "Cadastrar Perfil";
    document.getElementById('auth-nome').required = true;
    textoToggle.innerHTML = `Já possui cadastro? <button type="button" onclick="alternarModoAuth()" class="text-indigo-400 font-bold hover:text-indigo-300 ml-1 underline decoration-indigo-500/30 outline-none">Fazer Login</button>`;
  } else {
    titulo.innerText = "Acessar Conta";
    campoNome.classList.add('hidden');
    seletorConta.classList.add('hidden');
    btnSubmit.innerText = "Entrar no Sistema";
    document.getElementById('auth-nome').required = false;
    textoToggle.innerHTML = `Ainda não tem conta? <button type="button" onclick="alternarModoAuth()" class="text-indigo-400 font-bold hover:text-indigo-300 ml-1 underline decoration-indigo-500/30 outline-none">Criar Conta</button>`;
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
    btnSubmit.innerText = appState.modoCadastro ? "Cadastrar Perfil" : "Entrar no Sistema";
  }
};

window.fazerLogout = async function() {
  await supabaseClient.auth.signOut();
  window.location.reload();
};

// ----------------------------------------------------
// ATUALIZAÇÃO DA INTERFACE & SESSÃO
// ----------------------------------------------------
async function atualizarInfoTela(perfil) {
  appState.perfilAtual = perfil;
  appState.usuarioLogado = true;

  document.getElementById('btn-entrar-header').classList.add('hidden');
  const userMenu = document.getElementById('user-menu-header');
  userMenu.classList.remove('hidden');
  userMenu.classList.add('flex');

  document.getElementById('sidebar-name').innerText = perfil.nome;
  atualizarExibicaoAvatar(perfil.avatar_url);

  // Descobre qual tela está ativa no HTML neste exato momento
  const idTelaAtiva = document.querySelector('.app-screen.active')?.id || '';

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

    let matchReal = Math.min(98, 65 + (perfil.nivel * 5) + Math.floor(xpAtual / 10));
    const metricMatch = document.getElementById('metric-match');
    if (metricMatch) metricMatch.innerText = matchReal;

    const { count: totalRhs } = await supabaseClient.from('perfis').select('*', { count: 'exact', head: true }).eq('tipo_conta', 'empresa');
    const metricRadar = document.getElementById('metric-radar');
    if (metricRadar) metricRadar.innerText = totalRhs || 1;

    document.getElementById('menu-candidato').classList.remove('hidden');
    document.getElementById('menu-empresa').classList.add('hidden');
    
    // Se o HTML travou o candidato na tela da empresa, nós corrigimos:
    if (idTelaAtiva.includes('empresa') || idTelaAtiva === '') {
      navegarPara('tela-home-candidato');
    }

  } else {
    // Se for Recrutador / Empresa
    document.getElementById('sidebar-role').innerText = "Recrutador";
    document.getElementById('sidebar-role').className = "text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5";
    document.getElementById('sidebar-level-badge').classList.add('hidden');
    document.getElementById('sidebar-xp-container').classList.add('hidden');
    
    document.getElementById('menu-candidato').classList.add('hidden');
    document.getElementById('menu-empresa').classList.remove('hidden');
    
    // Se o HTML travou o recrutador na tela de candidato (padrão), nós corrigimos para a tela dele:
    if (idTelaAtiva.includes('candidato') || idTelaAtiva === '') {
      if (typeof carregarRadarTalentos === 'function') carregarRadarTalentos();
      navegarPara('tela-home-empresa');
    }
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
// GESTÃO DE VAGAS (RH E SUPABASE)
// ----------------------------------------------------
let logoVagaTemporaria = null;

window.previewLogoEmpresa = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    logoVagaTemporaria = e.target.result;
    document.getElementById('nv-logo-preview').src = logoVagaTemporaria;
    document.getElementById('nv-logo-preview').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
};

function obterIconePorArea(area) {
  if (!area) return 'ph-star text-slate-400';
  const a = area.toLowerCase();
  
  if(a.includes('admin') || a.includes('gestão')) return 'ph-briefcase text-blue-400';
  if(a.includes('agri')) return 'ph-plant text-emerald-500';
  if(a.includes('veterin')) return 'ph-paw-print text-orange-400';
  if(a.includes('alimentação') || a.includes('gastro')) return 'ph-fork-knife text-orange-500';
  if(a.includes('arquit') || a.includes('design') || a.includes('arte')) return 'ph-pen-nib text-pink-400';
  if(a.includes('customer success')) return 'ph-handshake text-indigo-400';
  if(a.includes('atendimento')) return 'ph-headset text-yellow-400';
  if(a.includes('telemarketing') || a.includes('call center')) return 'ph-phone-call text-yellow-500';
  if(a.includes('audi')) return 'ph-magnifying-glass text-slate-400';
  if(a.includes('qualidade')) return 'ph-check-circle text-emerald-500';
  if(a.includes('ciência') || a.includes('pesquisa')) return 'ph-flask text-purple-500';
  if(a.includes('comercial') || a.includes('venda')) return 'ph-storefront text-emerald-400';
  if(a.includes('exterior')) return 'ph-globe-hemisphere-west text-blue-500';
  if(a.includes('compras') || a.includes('suprimentos')) return 'ph-shopping-cart text-orange-400';
  if(a.includes('comunica') || a.includes('mídia') || a.includes('tv')) return 'ph-megaphone text-rose-400';
  if(a.includes('constru') || a.includes('manuten')) return 'ph-wrench text-yellow-600';
  if(a.includes('contábil') || a.includes('finança') || a.includes('econo')) return 'ph-coin text-yellow-500';
  if(a.includes('educa') || a.includes('ensino') || a.includes('idioma')) return 'ph-graduation-cap text-blue-400';
  if(a.includes('engenh')) return 'ph-ruler text-indigo-500';
  if(a.includes('estética') || a.includes('moda') || a.includes('beleza')) return 'ph-scissors text-pink-500';
  if(a.includes('hotel') || a.includes('turismo')) return 'ph-airplane-in-flight text-cyan-400';
  if(a.includes('indust') || a.includes('produção') || a.includes('fábrica')) return 'ph-factory text-slate-400';
  if(a.includes('informática') || a.includes('ti') || a.includes('tecno')) return 'ph-desktop text-indigo-400';
  if(a.includes('jurídi')) return 'ph-scales text-purple-400';
  if(a.includes('logísti') || a.includes('transp')) return 'ph-package text-orange-400';
  if(a.includes('marketing') || a.includes('growth')) return 'ph-rocket-launch text-rose-500';
  if(a.includes('química') || a.includes('petro')) return 'ph-test-tube text-teal-500';
  if(a.includes('rh') || a.includes('recursos')) return 'ph-users text-orange-500';
  if(a.includes('saúde')) return 'ph-heartbeat text-rose-500';
  if(a.includes('segurança')) return 'ph-shield-check text-slate-500';
  if(a.includes('sociais') || a.includes('comunitário')) return 'ph-hands-clapping text-blue-400';
  if(a.includes('gerais') || a.includes('operacionais')) return 'ph-broom text-slate-400';
  if(a.includes('outros')) return 'ph-dots-three-circle text-slate-400';
  
  return 'ph-star text-slate-400';
}

// Variável global para rastrear se estamos criando ou editando
let vagaEmEdicaoId = null;

// Prepara o modal para criar uma vaga do zero
window.prepararNovaVaga = function() {
  vagaEmEdicaoId = null;
  if(document.getElementById('nv-empresa')) document.getElementById('nv-empresa').value = '';
  if(document.getElementById('nv-titulo')) document.getElementById('nv-titulo').value = '';
  if(document.getElementById('nv-descricao')) document.getElementById('nv-descricao').value = '';
  if(document.getElementById('nv-local')) document.getElementById('nv-local').value = '';
  if(document.getElementById('nv-sal-min')) document.getElementById('nv-sal-min').value = '';
  if(document.getElementById('nv-area-input')) document.getElementById('nv-area-input').value = '';
  if(document.getElementById('nv-sal-max')) document.getElementById('nv-sal-max').value = '';
  if(document.getElementById('nv-pcd')) document.getElementById('nv-pcd').checked = false;
  if(document.getElementById('nv-cnh')) document.getElementById('nv-cnh').value = 'Não Exigida';
  if(document.getElementById('nv-veiculo')) document.getElementById('nv-veiculo').checked = false;
  if(document.getElementById('nv-viagens')) document.getElementById('nv-viagens').checked = false;
  if(document.getElementById('nv-mudanca')) document.getElementById('nv-mudanca').checked = false;
  if(document.getElementById('nv-idiomas')) document.getElementById('nv-idiomas').value = '';
  if(document.getElementById('nv-hard-skills')) document.getElementById('nv-hard-skills').value = '';
  if(document.getElementById('nv-soft-skills')) document.getElementById('nv-soft-skills').value = '';
  
  // Limpando os novos campos
  if(document.getElementById('nv-jornada')) document.getElementById('nv-jornada').value = '';
  if(document.getElementById('nv-escolaridade')) document.getElementById('nv-escolaridade').value = '';
  
  // Reset do Salário A Combinar
  if(document.getElementById('nv-a-combinar')) {
      const cbCombinar = document.getElementById('nv-a-combinar');
      cbCombinar.checked = false;
      alternarSalarioCombinar(cbCombinar);
  }
  
  if(document.getElementById('nv-logo-preview')) document.getElementById('nv-logo-preview').classList.add('hidden');
  logoVagaTemporaria = null;
  
  document.querySelectorAll('.nv-testes').forEach(cb => cb.checked = false);
  
  if(document.querySelector('#modal-nova-vaga h3')) document.querySelector('#modal-nova-vaga h3').innerHTML = '<i class="ph ph-plus-circle text-emerald-500"></i> Publicar Oportunidade';
  if(document.querySelector('#modal-nova-vaga button[type="submit"]')) document.querySelector('#modal-nova-vaga button[type="submit"]').innerHTML = '<i class="ph ph-paper-plane-tilt text-xl"></i> Publicar Oportunidade';
  
  abrirModal('modal-nova-vaga');
};


// Prepara o modal para criar uma vaga do zero (Tudo limpo)
window.prepararNovaVaga = function() {
  vagaEmEdicaoId = null;
  if(document.getElementById('nv-empresa')) document.getElementById('nv-empresa').value = '';
  if(document.getElementById('nv-titulo')) document.getElementById('nv-titulo').value = '';
  if(document.getElementById('nv-descricao')) document.getElementById('nv-descricao').value = '';
  if(document.getElementById('nv-area-input')) document.getElementById('nv-area-input').value = '';
  if(document.getElementById('nv-sal-min')) document.getElementById('nv-sal-min').value = '';
  if(document.getElementById('nv-sal-max')) document.getElementById('nv-sal-max').value = '';
  if(document.getElementById('nv-pcd')) document.getElementById('nv-pcd').checked = false;
  
  // Limpando Cidades Múltiplas
  cidadesSelecionadas = [];
  if (typeof renderizarCidades === 'function') renderizarCidades();
  if(document.getElementById('nv-local-input')) document.getElementById('nv-local-input').value = '';

  // Reset dos selects
  if(document.getElementById('nv-modelo')) document.getElementById('nv-modelo').value = '';
  if(document.getElementById('nv-escala')) document.getElementById('nv-escala').value = '';
  if(document.getElementById('nv-nivel')) document.getElementById('nv-nivel').value = '';
  if(document.getElementById('nv-contrato')) document.getElementById('nv-contrato').value = '';
  if(document.getElementById('nv-jornada')) document.getElementById('nv-jornada').value = '';
  if(document.getElementById('nv-escolaridade')) document.getElementById('nv-escolaridade').value = '';
  if(document.getElementById('nv-experiencia')) document.getElementById('nv-experiencia').value = 'Sem experiência prévia';
  if(document.getElementById('nv-vagas')) document.getElementById('nv-vagas').value = '1';
  if(document.getElementById('nv-cnh')) document.getElementById('nv-cnh').value = 'Não Exigida';
  
  // Reset Operacionais, Idiomas, Skills e VIP
  if(document.getElementById('nv-veiculo')) document.getElementById('nv-veiculo').checked = false;
  if(document.getElementById('nv-viagens')) document.getElementById('nv-viagens').checked = false;
  if(document.getElementById('nv-mudanca')) document.getElementById('nv-mudanca').checked = false;
  if(document.getElementById('nv-idiomas')) document.getElementById('nv-idiomas').value = '';
  if(document.getElementById('nv-hard-skills')) document.getElementById('nv-hard-skills').value = '';
  if(document.getElementById('nv-soft-skills')) document.getElementById('nv-soft-skills').value = '';
  if(document.getElementById('nv-notificacoes')) document.getElementById('nv-notificacoes').checked = true;
  if(document.getElementById('nv-urgente')) document.getElementById('nv-urgente').checked = false;

  document.querySelectorAll('.nv-bene-check').forEach(cb => cb.checked = false);
  document.querySelectorAll('.nv-testes').forEach(cb => cb.checked = false);
  
  // Reset Salário A Combinar
  if(document.getElementById('nv-a-combinar')) {
      const cbCombinar = document.getElementById('nv-a-combinar');
      cbCombinar.checked = false;
      alternarSalarioCombinar(cbCombinar);
  }
  
  if(document.getElementById('nv-logo-preview')) document.getElementById('nv-logo-preview').classList.add('hidden');
  logoVagaTemporaria = null;
  
  if(document.querySelector('#modal-nova-vaga h3')) document.querySelector('#modal-nova-vaga h3').innerHTML = '<i class="ph ph-plus-circle text-emerald-500"></i> Publicar Oportunidade';
  if(document.querySelector('#modal-nova-vaga button[type="submit"]')) document.querySelector('#modal-nova-vaga button[type="submit"]').innerHTML = '<i class="ph ph-paper-plane-tilt text-xl"></i> Publicar Oportunidade';

  // Dispara um aviso para os selects de luxo atualizarem o visual
  setTimeout(() => {
    document.querySelectorAll('.select-customizado').forEach(select => {
      select.dispatchEvent(new Event('change'));
    });
  }, 10);
  
  abrirModal('modal-nova-vaga');
  transformarSelectsEmCustom();
};

// Preenche o modal com os dados da vaga existente para Editar
window.editarVaga = function(vagaJsonStr) {
  const vaga = JSON.parse(decodeURIComponent(vagaJsonStr));
  vagaEmEdicaoId = vaga.id;
  
  // Campos Básicos
  if(document.getElementById('nv-empresa')) document.getElementById('nv-empresa').value = vaga.empresa || '';
  if(document.getElementById('nv-titulo')) document.getElementById('nv-titulo').value = vaga.titulo || '';
  if(document.getElementById('nv-descricao')) document.getElementById('nv-descricao').value = vaga.descricao || '';
  if(document.getElementById('nv-area-input')) document.getElementById('nv-area-input').value = vaga.area || '';
  
  // Selects (Modelo, Escala, Nível, etc)
  if(document.getElementById('nv-modelo')) document.getElementById('nv-modelo').value = vaga.modelo || '';
  if(document.getElementById('nv-escala')) document.getElementById('nv-escala').value = vaga.escala || '';
  if(document.getElementById('nv-nivel')) document.getElementById('nv-nivel').value = vaga.nivel || '';
  if(document.getElementById('nv-contrato')) document.getElementById('nv-contrato').value = vaga.contrato || '';
  if(document.getElementById('nv-jornada')) document.getElementById('nv-jornada').value = vaga.jornada || '';
  if(document.getElementById('nv-escolaridade')) document.getElementById('nv-escolaridade').value = vaga.escolaridade || '';
  if(document.getElementById('nv-experiencia')) document.getElementById('nv-experiencia').value = vaga.tempo_experiencia || 'Sem experiência prévia';
  if(document.getElementById('nv-vagas')) document.getElementById('nv-vagas').value = vaga.numero_vagas || 1;
  if(document.getElementById('nv-cnh')) document.getElementById('nv-cnh').value = vaga.cnh || 'Não Exigida';

  // Cidades Múltiplas (Lê as tags salvadas e joga na tela)
  cidadesSelecionadas = [];
  if (vaga.local && vaga.local.includes(';')) {
    cidadesSelecionadas = vaga.local.split(';');
  } else if (vaga.local) {
    cidadesSelecionadas = [vaga.local];
  }
  if (typeof renderizarCidades === 'function') renderizarCidades();

  // Operacionais e Competências
  if(document.getElementById('nv-pcd')) document.getElementById('nv-pcd').checked = vaga.pcd || false;
  if(document.getElementById('nv-veiculo')) document.getElementById('nv-veiculo').checked = vaga.veiculo || false;
  if(document.getElementById('nv-viagens')) document.getElementById('nv-viagens').checked = vaga.viagens || false;
  if(document.getElementById('nv-mudanca')) document.getElementById('nv-mudanca').checked = vaga.mudanca || false;
  if(document.getElementById('nv-idiomas')) document.getElementById('nv-idiomas').value = vaga.idiomas || '';
  if(document.getElementById('nv-hard-skills')) document.getElementById('nv-hard-skills').value = vaga.hard_skills || '';
  if(document.getElementById('nv-soft-skills')) document.getElementById('nv-soft-skills').value = vaga.soft_skills || '';
  
  // VIP
  if(document.getElementById('nv-notificacoes')) document.getElementById('nv-notificacoes').checked = vaga.receber_notificacoes !== false;
  if(document.getElementById('nv-urgente')) document.getElementById('nv-urgente').checked = vaga.vaga_urgente || false;
  
  // Benefícios (Marca o checkbox correspondente)
  document.querySelectorAll('.nv-bene-check').forEach(cb => {
    if (vaga.lista_beneficios && vaga.lista_beneficios.includes(cb.value)) {
      cb.checked = true;
    } else {
      cb.checked = false;
    }
  });
  
  // Salário A Combinar
  if (document.getElementById('nv-a-combinar')) {
      const cbCombinar = document.getElementById('nv-a-combinar');
      if (vaga.salario_min === 'A Combinar') {
        cbCombinar.checked = true;
        document.getElementById('nv-sal-min').value = '';
        document.getElementById('nv-sal-max').value = '';
      } else {
        cbCombinar.checked = false;
        document.getElementById('nv-sal-min').value = vaga.salario_min || '';
        document.getElementById('nv-sal-max').value = vaga.salario_max || '';
      }
      alternarSalarioCombinar(cbCombinar);
  }
  
  // Logo
  logoVagaTemporaria = vaga.empresa_logo || null;
  if (logoVagaTemporaria) {
    if(document.getElementById('nv-logo-preview')) {
        document.getElementById('nv-logo-preview').src = logoVagaTemporaria;
        document.getElementById('nv-logo-preview').classList.remove('hidden');
    }
  } else {
    if(document.getElementById('nv-logo-preview')) document.getElementById('nv-logo-preview').classList.add('hidden');
  }
  
  // Testes Exigidos
  const testes = vaga.testes ? vaga.testes.split(' + ') : [];
  document.querySelectorAll('.nv-testes').forEach(cb => {
    cb.checked = testes.includes(cb.value);
  });
  
  // Visual do Modal
  if(document.querySelector('#modal-nova-vaga h3')) document.querySelector('#modal-nova-vaga h3').innerHTML = '<i class="ph ph-pencil-simple text-indigo-400"></i> Editar Oportunidade';
  if(document.querySelector('#modal-nova-vaga button[type="submit"]')) document.querySelector('#modal-nova-vaga button[type="submit"]').innerHTML = '<i class="ph ph-floppy-disk text-xl"></i> Salvar Alterações';
  
  abrirModal('modal-nova-vaga');
  
  // Ativa os selects chiques
  transformarSelectsEmCustom();
};

// Salva no Supabase (Serve tanto para UPDATE quanto INSERT)
window.criarNovaVaga = async function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const textoOriginal = btn.innerHTML;
  btn.disabled = true; 
  btn.innerHTML = '<i class="ph ph-spinner-gap animate-spin text-xl"></i> Processando...';

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      mostrarToast('Sessão expirada. Faça login novamente.', 'error');
      return;
    }

    const empresa = document.getElementById('nv-empresa').value;
    const titulo = document.getElementById('nv-titulo').value;
    const area = document.getElementById('nv-area-input').value;
    const descricao = document.getElementById('nv-descricao').value;
    const nivel = document.getElementById('nv-nivel').value;
    const contrato = document.getElementById('nv-contrato').value;
    const modelo = document.getElementById('nv-modelo').value;
    const escala = document.getElementById('nv-escala').value;
    const pcd = document.getElementById('nv-pcd').checked;
    const cnh = document.getElementById('nv-cnh')?.value || 'Não Exigida';
    const veiculo = document.getElementById('nv-veiculo')?.checked || false;
    const viagens = document.getElementById('nv-viagens')?.checked || false;
    const mudanca = document.getElementById('nv-mudanca')?.checked || false;
    const idiomas = document.getElementById('nv-idiomas')?.value || '';
    const hard_skills = document.getElementById('nv-hard-skills')?.value || '';
    const soft_skills = document.getElementById('nv-soft-skills')?.value || '';
    const numero_vagas = parseInt(document.getElementById('nv-vagas')?.value) || 1;
    const tempo_experiencia = document.getElementById('nv-experiencia')?.value || '';
    const receber_notificacoes = document.getElementById('nv-notificacoes')?.checked || false;
    const vaga_urgente = document.getElementById('nv-urgente')?.checked || false;
    
    
    const lista_beneficios = Array.from(document.querySelectorAll('.nv-bene-check:checked')).map(cb => cb.value).join(' • ');
    const tem_beneficios = lista_beneficios.length > 0;
    
    const local = cidadesSelecionadas.join(';'); // Salva as cidades separadas por ponto e vírgula
    if (!local) { mostrarToast("Adicione pelo menos uma cidade!", "error"); return; }
    
    // Capturando os campos novos
    const jornada = document.getElementById('nv-jornada')?.value || '';
    const escolaridade = document.getElementById('nv-escolaridade')?.value || '';

    // Lógica para salvar "A Combinar"
    let salario_min = document.getElementById('nv-sal-min').value;
    let salario_max = document.getElementById('nv-sal-max').value;
    if (document.getElementById('nv-a-combinar').checked) {
        salario_min = 'A Combinar';
        salario_max = '';
    }

    const testesMarcados = Array.from(document.querySelectorAll('.nv-testes:checked')).map(cb => cb.value).join(' + ');
    const testesFinal = testesMarcados || 'Análise Curricular';

    const dadosVaga = {
      empresa, titulo, area, descricao, nivel, contrato, modelo, local, escala,
      salario_min, salario_max, pcd, testes: testesFinal, empresa_logo: logoVagaTemporaria,
      criador_id: user.id, jornada, escolaridade, cnh, veiculo, viagens, mudanca,
      idiomas, hard_skills, soft_skills, 
      numero_vagas, tempo_experiencia, lista_beneficios, receber_notificacoes, vaga_urgente
    };

    if (vagaEmEdicaoId) {
      // É UMA EDIÇÃO (UPDATE)
      const { error } = await supabaseClient.from('vagas').update(dadosVaga).eq('id', vagaEmEdicaoId);
      if (error) throw error;
      mostrarToast('Oportunidade atualizada com sucesso!', 'success');
    } else {
      // É UMA VAGA NOVA (INSERT)
      dadosVaga.status_vaga = 'Ativa';
      const { error } = await supabaseClient.from('vagas').insert([dadosVaga]);
      if (error) throw error;
      mostrarToast('Oportunidade publicada com sucesso!', 'success');
    }

    fecharModal('modal-nova-vaga');
    document.getElementById('container-todas-vagas').innerHTML = '';
    carregarVagasDoBanco();
    if(typeof carregarRadarTalentos === 'function') carregarRadarTalentos();

  } catch (err) {
    mostrarToast('Erro ao processar: ' + err.message, 'error');
  } finally {
    btn.disabled = false; 
    btn.innerHTML = textoOriginal;
  }
};

window.carregarVagasDoBanco = async function() {
  const cGeral = document.getElementById('container-todas-vagas');
  
  // 1. Injeta o Loading bonitão antes de chamar o banco
  if (cGeral) {
    cGeral.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
        <i class="ph ph-spinner-gap animate-spin text-5xl text-indigo-500"></i>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sincronizando Oportunidades...</p>
      </div>
    `;
  }

  // 2. Faz a busca no banco
  const { data: vagas, error } = await supabaseClient
    .from('vagas')
    .select('*')
    .eq('status_vaga', 'Ativa')
    .order('created_at', { ascending: false });

  // 3. Limpa o Loading
  if (cGeral) cGeral.innerHTML = '';

  // 4. Mostra as vagas ou mensagem de vazio
  if (!error && vagas && vagas.length > 0) {
    vagas.forEach(v => adicionarVagaNaTela(v));
  } else if (cGeral) {
    cGeral.innerHTML = `
      <div class="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
        <i class="ph ph-magnifying-glass text-5xl text-slate-600 mb-4 block"></i>
        <h3 class="text-xl font-black text-white mb-2">Nenhuma vaga encontrada</h3>
        <p class="text-slate-400 font-medium text-sm">Não há oportunidades ativas no momento. Volte mais tarde!</p>
      </div>
    `;
  }
};

window.adicionarVagaNaTela = function(vaga) {
  const cGeral = document.getElementById('container-todas-vagas');
  if(!cGeral) return;

  const dataObj = new Date(vaga.created_at);
  const dataPostagem = `${String(dataObj.getDate()).padStart(2, '0')}/${String(dataObj.getMonth() + 1).padStart(2, '0')}`;
  
  const iconArea = obterIconePorArea(vaga.area);
  const logoHtml = vaga.empresa_logo 
    ? `<img src="${vaga.empresa_logo}" class="w-full h-full object-cover">` 
    : `<i class="ph ph-buildings text-slate-500"></i>`;

  // 🔥 LÓGICA DO BADGE URGENTE (NOVO)
  let badgeUrgenteHtml = '<div class="absolute -right-12 top-6 w-40 bg-emerald-500 text-white text-[10px] font-black py-1.5 text-center uppercase tracking-widest rotate-45 shadow-lg z-10 pointer-events-none">Nova</div>';
  if (vaga.vaga_urgente) {
      badgeUrgenteHtml = `<div class="absolute -left-12 top-6 w-40 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-black py-1.5 text-center uppercase tracking-widest -rotate-45 shadow-[0_0_20px_rgba(249,115,22,0.5)] z-10 pointer-events-none flex items-center justify-center gap-1"><i class="ph ph-rocket-launch"></i> Urgente</div>`;
  }
  
  // Tratamento Inteligente do Salário para o Card
  let badgeSalarioHtml = '';
  if (vaga.salario_min === 'A Combinar') {
     badgeSalarioHtml = `<i class="ph ph-handshake text-xs"></i> Salário A Combinar`;
  } else {
     badgeSalarioHtml = `R$ ${vaga.salario_min} a ${vaga.salario_max}`;
  }

  // Tags Básicas
  let tagsHtml = `
    <span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase">${vaga.nivel}</span>
    <span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase">${vaga.contrato}</span>
    <span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase">${vaga.modelo}</span>
  `;
  
  // Novas Tags Dinâmicas (Só aparecem se tiverem sido marcadas)
  if (vaga.jornada && vaga.jornada !== 'Selecione...') {
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1"><i class="ph ph-clock text-xs"></i> ${vaga.jornada}</span>`;
  }
  
  if (vaga.escolaridade && vaga.escolaridade !== 'Selecione...') {
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1"><i class="ph ph-graduation-cap text-xs"></i> ${vaga.escolaridade}</span>`;
  }
  // Lógica Inteligente para os Ícones de CNH e Operacionais
  if (vaga.cnh && vaga.cnh !== 'Não Exigida') {
    let iconeCnh = 'ph-identification-card';
    if (vaga.cnh.includes('A')) iconeCnh = 'ph-motorcycle';
    if (vaga.cnh.includes('B') && !vaga.cnh.includes('AB')) iconeCnh = 'ph-car';
    if (vaga.cnh.includes('AB')) iconeCnh = 'ph-steering-wheel';
    if (vaga.cnh.includes('C') || vaga.cnh.includes('D') || vaga.cnh.includes('E')) iconeCnh = 'ph-truck';
    
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1" title="Habilitação Exigida"><i class="ph ${iconeCnh} text-xs text-indigo-400"></i> CNH ${vaga.cnh.replace('Categoria ', '')}</span>`;
  }
  
  if (vaga.veiculo) {
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1" title="Exige Veículo Próprio"><i class="ph ph-car-profile text-xs text-emerald-400"></i> Veículo Próprio</span>`;
  }
  
  if (vaga.viagens) {
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1" title="Disponibilidade para Viagens"><i class="ph ph-airplane-tilt text-xs text-blue-400"></i> Viagens</span>`;
  }
  
  if (vaga.mudanca) {
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1" title="Disponibilidade para Mudar de Residência"><i class="ph ph-house-line text-xs text-orange-400"></i> Mudança</span>`;
  }
  // Tags de Idiomas e Skills
  if (vaga.idiomas) {
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1" title="Idiomas Exigidos"><i class="ph ph-translate text-xs text-indigo-400"></i> ${vaga.idiomas}</span>`;
  }
  if (vaga.hard_skills) {
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1" title="Hard Skills Exigidas"><i class="ph ph-wrench text-xs text-emerald-400"></i> ${vaga.hard_skills}</span>`;
  }
  if (vaga.soft_skills) {
    tagsHtml += `<span class="text-[9px] font-black text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 tracking-widest uppercase flex items-center gap-1" title="Soft Skills Exigidas"><i class="ph ph-brain text-xs text-purple-400"></i> ${vaga.soft_skills}</span>`;
  }
  
  // Tag do Salário
  tagsHtml += `<span class="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 tracking-widest uppercase flex items-center gap-1">
    ${badgeSalarioHtml}
  </span>`;

  if (vaga.pcd) {
    tagsHtml += `<span class="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 tracking-widest uppercase flex items-center gap-1"><i class="ph ph-wheelchair text-xs"></i> PCD</span>`;
  }
 

  // 🔥 Tratamento para Múltiplas Localidades (NOVO)
  let localTexto = vaga.local || '';
  if (localTexto.includes(';')) {
    const arrayCidades = localTexto.split(';');
    if (arrayCidades.length > 2) {
       localTexto = `Várias Localidades <span class="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ml-1">+${arrayCidades.length} Cidades</span>`;
    } else {
       localTexto = arrayCidades.join(' • '); // Se forem só duas, mostra as duas separadas por um pontinho
    }
  }

  // Guardando objeto vaga como string segura para o modal
  const vagaJsonStr = encodeURIComponent(JSON.stringify(vaga));

  const el = document.createElement('div');
  el.className = "vaga-card bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 group relative shadow-lg flex flex-col h-full overflow-hidden";
  el.innerHTML = `
    <div class="absolute -right-12 top-6 w-40 bg-emerald-500 text-white text-[10px] font-black py-1.5 text-center uppercase tracking-widest rotate-45 shadow-lg z-10 pointer-events-none">Nova</div>
    
    <div class="flex items-center gap-3 mb-4 pr-10">
      <div class="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner overflow-hidden">
        ${logoHtml}
      </div>
      <div>
        <p class="text-sm font-bold text-slate-300">${vaga.empresa}</p>
        <div class="flex items-center gap-1 text-[10px] font-black text-yellow-500 tracking-wider mt-0.5">
          <i class="ph ph-star-fill"></i> 5.0 <span class="text-slate-600 font-medium ml-1">(Empresa Verificada)</span>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <h3 class="text-xl font-black text-white group-hover:text-indigo-300 transition-colors leading-tight flex items-center gap-2">
        ${vaga.titulo} <i class="ph ${iconArea} text-xl" title="${vaga.area}"></i>
      </h3>
      <p class="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-2 flex-wrap">
        <i class="ph ph-map-pin text-indigo-400 text-sm"></i> ${localTexto} <span class="text-slate-600 hidden sm:inline">•</span> <span class="text-indigo-400 font-bold hidden sm:inline">A 2,5km de você</span>
      </p>
    </div>

    <div class="flex flex-wrap gap-2 mb-5">${tagsHtml}</div>

    <div class="mt-auto">
      <div class="bg-slate-950 rounded-xl p-3 mb-5 border border-slate-800/50 flex justify-between items-center relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <div class="pl-2">
          <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Avaliações Exigidas</p>
          <p class="text-xs font-bold text-indigo-300">${vaga.testes}</p>
        </div>
        <div class="text-right">
          <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Match</p>
          <p class="text-xs font-black text-emerald-400 flex items-center gap-1"><i class="ph ph-fire"></i> 85%</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 pt-4">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><i class="ph ph-clock text-sm"></i> Postado em ${dataPostagem}</span>
        <button onclick="abrirModalVagaDinamicamente('${vagaJsonStr}')" class="w-full sm:w-auto bg-slate-800 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md">Ver Detalhes</button>
      </div>
    </div>`;
  cGeral.append(el);
};

window.abrirModalVagaDinamicamente = function(vagaJsonStr) {
  const vaga = JSON.parse(decodeURIComponent(vagaJsonStr));
  
  document.getElementById('detalhes-titulo').innerText = vaga.titulo;
  document.getElementById('detalhes-empresa').innerText = vaga.empresa;
  
  const urlVaga = `?vaga=${vaga.id}`;
  window.history.pushState({vagaId: vaga.id}, "", urlVaga);
  
  // Montando as tags do modal (Salário, Modelo, Contrato, Nível, Experiência)
  let tags = `
    <span class="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">${vaga.nivel}</span>
    <span class="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">${vaga.modelo}</span>
    <span class="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">${vaga.contrato}</span>
    <span class="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"><i class="ph ph-briefcase"></i> ${vaga.tempo_experiencia || 'Sem XP Exigida'}</span>
  `;

  if (vaga.salario_min === 'A Combinar') {
    tags += `<span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg"><i class="ph ph-handshake"></i> Salário A Combinar</span>`;
  } else {
    tags += `<span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">R$ ${vaga.salario_min} - R$ ${vaga.salario_max}</span>`;
  }

  // Lista de Benefícios, se houver
  let beneficiosHtml = '';
  if (vaga.lista_beneficios) {
    const benList = vaga.lista_beneficios.split(' • ').map(b => `<span class="text-xs font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-1 rounded-md"><i class="ph ph-check text-[10px]"></i> ${b}</span>`).join('');
    beneficiosHtml = `
      <div class="mt-6 pt-5 border-t border-slate-800">
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Benefícios Oferecidos</p>
        <div class="flex flex-wrap gap-2">${benList}</div>
      </div>
    `;
  }

  // Competências Exigidas (Hard, Soft, Idiomas, CNH)
  let extrasHtml = '';
  if (vaga.hard_skills) extrasHtml += `<div class="bg-slate-950 p-3 rounded-xl border border-slate-800"><p class="text-[9px] font-black text-slate-500 uppercase mb-1">Hard Skills</p><p class="text-xs text-white font-medium">${vaga.hard_skills}</p></div>`;
  if (vaga.soft_skills) extrasHtml += `<div class="bg-slate-950 p-3 rounded-xl border border-slate-800"><p class="text-[9px] font-black text-slate-500 uppercase mb-1">Soft Skills</p><p class="text-xs text-white font-medium">${vaga.soft_skills}</p></div>`;
  if (vaga.idiomas) extrasHtml += `<div class="bg-slate-950 p-3 rounded-xl border border-slate-800"><p class="text-[9px] font-black text-slate-500 uppercase mb-1">Idiomas</p><p class="text-xs text-white font-medium">${vaga.idiomas}</p></div>`;
  if (vaga.cnh && vaga.cnh !== 'Não Exigida') extrasHtml += `<div class="bg-slate-950 p-3 rounded-xl border border-slate-800"><p class="text-[9px] font-black text-slate-500 uppercase mb-1">CNH</p><p class="text-xs text-white font-medium">${vaga.cnh}</p></div>`;

  let gridExtras = extrasHtml ? `
    <div class="mt-6 pt-5 border-t border-slate-800">
      <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Requisitos & Competências</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">${extrasHtml}</div>
    </div>
  ` : '';

  // Substituindo o HTML interno
  document.getElementById('detalhes-tags').innerHTML = `
    <div class="flex flex-wrap gap-2 mb-6">${tags}</div>
    <div class="w-full text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap px-4 py-3 bg-slate-950/50 rounded-xl border border-slate-800/50">${vaga.descricao}</div>
    ${gridExtras}
    ${beneficiosHtml}
  `;

  const btnIniciar = document.getElementById('btn-iniciar-missao-detalhe');
  btnIniciar.innerHTML = `<i class="ph ph-check-square-offset text-xl"></i> Realizar Avaliações e Candidatar-se`;
  btnIniciar.onclick = function() {
    fecharModal('modal-detalhes-vaga');
    iniciarProcessoSeletivo(vaga.titulo, vaga.empresa, vaga.testes);
  };

  abrirModal('modal-detalhes-vaga');
};

// ----------------------------------------------------
// SISTEMA DE AVALIAÇÃO E CANDIDATURA (NOVO)
// ----------------------------------------------------
let empresaAtualAvaliacao = '';

window.iniciarProcessoSeletivo = function(vagaTitulo, empresa, testesMarcados) {
  if(!appState.perfilAtual) return abrirModal('login-modal');
  if(appState.perfilAtual.tipo_conta === 'empresa') return mostrarToast("Recrutadores não podem se candidatar às vagas.", "error");
  
  empresaAtualAvaliacao = empresa;
  document.getElementById('aval-titulo-header').innerText = `Candidatura: ${vagaTitulo}`;
  
  document.getElementById('aval-text').innerHTML = `
    <div class="bg-slate-900 border border-slate-700 p-6 rounded-2xl mb-6">
      <p class="text-slate-400 text-sm mb-4">Para prosseguir com sua candidatura na empresa <strong class="text-white">${empresa}</strong>, responda a situação abaixo baseada nas exigências da vaga.</p>
      <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Avaliações Contempladas:</p>
      <div class="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider">
        ${testesMarcados}
      </div>
    </div>
    <h4 class="text-white font-black text-lg mb-2">Situação Profissional:</h4>
    <p class="text-slate-300 mb-6 text-sm">Durante a execução de um projeto crítico, a diretoria decide alterar o escopo repentinamente e antecipar o prazo de entrega. Como você conduz a situação com a sua equipe?</p>
  `;
  
  document.getElementById('aval-choices').classList.remove('hidden');
  abrirModal('aval-modal');
};

window.fecharAvaliacao = function() { 
  fecharModal('aval-modal'); 
  if(appState.usuarioLogado && appState.perfilAtual) {
    carregarMinhasCandidaturas(appState.perfilAtual.id);
  }
};

window.escolherOpcaoAvaliacao = async function(opcao) {
  const avalText = document.getElementById('aval-text');
  document.getElementById('aval-choices').classList.add('hidden');
  
  let xpGanho = (opcao === 'C') ? 100 : 50;
  let matchCalc = (opcao === 'C') ? 95 : 65;
  
  if(opcao === 'C') {
    avalText.innerHTML = `
      <div class='bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-3xl mb-6 text-center'>
        <div class="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 text-4xl"><i class="ph ph-check-circle"></i></div>
        <h3 class='text-emerald-400 font-black text-2xl mb-2'>Avaliação Concluída!</h3>
        <p class='text-emerald-500/80 font-medium text-sm'>Seu perfil demonstrou alta aderência aos requisitos.</p>
      </div>`;
  } else {
    avalText.innerHTML = `
      <div class='bg-yellow-500/10 border border-yellow-500/30 p-8 rounded-3xl mb-6 text-center'>
        <div class="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-400 text-4xl"><i class="ph ph-warning-circle"></i></div>
        <h3 class='text-yellow-400 font-black text-2xl mb-2'>Avaliação Registrada</h3>
        <p class='text-yellow-500/80 font-medium text-sm'>Seu teste foi enviado para análise do RH.</p>
      </div>`;
  }

  let tituloVagaAtual = document.getElementById('aval-titulo-header').innerText.replace('Candidatura: ', '');
  
  let btnConcluir = `
    <div class="flex justify-between items-center bg-slate-900 border border-slate-700 p-5 rounded-2xl mb-6 mt-4">
      <div>
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match Gerado</p>
        <p class="text-xl font-black text-white">${matchCalc}% Compatível</p>
      </div>
      <div class="text-right">
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recompensa</p>
        <p class="text-xl font-black text-indigo-400">+${xpGanho} XP</p>
      </div>
    </div>
    <button onclick="fecharAvaliacao()" class='w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg flex justify-center items-center gap-2'><i class="ph ph-paper-plane-right text-xl"></i> ENVIAR CANDIDATURA AO RH</button>`;

  if(!appState.perfilAtual) return;

  // Atualiza banco de dados real
  await supabaseClient.from('candidaturas').insert([{
    vaga_titulo: tituloVagaAtual,
    candidato_nome: appState.perfilAtual.nome,
    candidato_id: appState.perfilAtual.id,
    empresa: empresaAtualAvaliacao,
    status: 'Aguardando Retorno do RH',
    xp_obtido: xpGanho,
    match_percentual: matchCalc
  }]);

  let novoXp = (appState.perfilAtual.xp || 0) + xpGanho;
  let novoNivel = Math.floor(novoXp / 100) + 1;

  await supabaseClient.from('perfis').update({ xp: novoXp, nivel: novoNivel }).eq('id', appState.perfilAtual.id);
  
  appState.perfilAtual.xp = novoXp;
  appState.perfilAtual.nivel = novoNivel;
  atualizarInfoTela(appState.perfilAtual);

  avalText.innerHTML += btnConcluir;
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
  const badge = document.getElementById('badge-candidaturas'); // <-- Busca o selo do menu
  
  if (!container) return;

  const { data: candidaturas, error } = await supabaseClient
    .from('candidaturas')
    .select('*')
    .eq('candidato_id', userId)
    .order('created_at', { ascending: false });

  // Limpa os cards velhos, mas protege a mensagem de "vazio"
  Array.from(container.children).forEach(child => {
    if (child.id !== 'candidaturas-vazio') child.remove();
  });

  if (error || !candidaturas || candidaturas.length === 0) {
    if (vazioMsg) vazioMsg.classList.remove('hidden');
    if (badge) badge.classList.add('hidden'); // Esconde o selo se tiver 0
    return;
  }

  if (vazioMsg) vazioMsg.classList.add('hidden');
  
  // Atualiza o contador com o número REAL do Banco de Dados!
  if (badge) {
    badge.innerText = candidaturas.length;
    badge.classList.remove('hidden');
  }

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
// EDITOR MODO FOCO & CIDADES DO IBGE (CUSTOMIZADO)
// ----------------------------------------------------
window.abrirEditorDescricao = function() {
  const textoAtual = document.getElementById('nv-descricao').value;
  document.getElementById('nv-descricao-expandida').value = textoAtual;
  
  const modalEd = document.getElementById('modal-editor-descricao');
  modalEd.classList.remove('hidden');
  modalEd.classList.add('flex');
  setTimeout(() => modalEd.classList.remove('opacity-0'), 10);
};

window.salvarEFecharEditor = function() {
  const textoExpandido = document.getElementById('nv-descricao-expandida').value;
  document.getElementById('nv-descricao').value = textoExpandido;
  
  const modalEd = document.getElementById('modal-editor-descricao');
  modalEd.classList.add('opacity-0');
  setTimeout(() => {
    modalEd.classList.add('hidden');
    modalEd.classList.remove('flex');
  }, 300);
};

let listaCidadesGlobal = [];

function removerAcentos(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

window.carregarCidadesIBGE = async function() {
  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
    const cidades = await response.json();
    
    listaCidadesGlobal = []; 
    
    cidades.forEach(c => {
      const uf = c.microrregiao?.mesorregiao?.UF?.sigla || c.UF?.sigla || "";
      if (uf) {
        listaCidadesGlobal.push(`${c.nome}, ${uf}`);
      }
    });
    
    listaCidadesGlobal.sort((a, b) => a.localeCompare(b));
    console.log(`✅ IBGE: ${listaCidadesGlobal.length} cidades prontas na memória!`);
  } catch(erro) {
    console.error("Erro ao conectar com IBGE:", erro);
  }
};

// Lista de áreas para o dropdown customizado
const listaAreasGlobal = [
  "Administração / Gestão", "Agricultura", "Veterinária", "Alimentação / Gastronomia", 
  "Arquitetura / Design / Arte", "Atendimento", "Customer Success", "Auditoria", 
  "Qualidade", "Ciências / Pesquisa", "Comercial / Vendas", "Comércio Exterior",  
  "Compras / Suprimentos", "Comunicação / Mídia / TV", "Construção / Manutenção", 
  "Contábil / Finanças / Economia", "Educação / Ensino / Idiomas", "Engenharia",  
  "Estética / Beleza / Moda", "Hotelaria / Turismo", "Industrial / Produção / Fábrica",  
  "Informática / TI / Tecnologia", "Jurídico", "Logística / Transportes",
  "Marketing / Growth", "Química / Petroquímica", "Recursos Humanos (RH)",  
  "Saúde", "Segurança", "Serviços Sociais / Comunitários", "Serviços Gerais / Operacionais",  
  "Telemarketing / Call Center", "Outros"
];

window.filtrarAreasCustom = function() {
  const input = document.getElementById('nv-area-input');
  const wrapper = document.getElementById('dropdown-area-wrapper');
  const dropdown = document.getElementById('dropdown-areas');
  
  if (!dropdown || !wrapper || !input) return;
  
  const valorDigitado = removerAcentos(input.value);
  dropdown.innerHTML = '';
  
  const filtradas = listaAreasGlobal.filter(a => removerAcentos(a).includes(valorDigitado));
  
  if (filtradas.length === 0) {
    dropdown.innerHTML = `<li class="px-4 py-3 text-sm text-slate-500 italic text-center">Nenhuma área encontrada</li>`;
  } else {
    filtradas.forEach(area => {
      const li = document.createElement('li');
      li.className = "px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer transition-colors";
      li.innerText = area;
      
      li.onclick = function() {
        input.value = area;
        wrapper.classList.add('hidden');
      };
      dropdown.appendChild(li);
    });
  }
  
  wrapper.classList.remove('hidden');
};

window.filtrarCidadesCustom = async function() {
  // AQUI FOI CORRIGIDO PARA O NOME NOVO: nv-local-input
  const input = document.getElementById('nv-local-input');
  const wrapper = document.getElementById('dropdown-wrapper');
  const dropdown = document.getElementById('dropdown-cidades');
  
  if (!dropdown || !wrapper || !input) return;

  if (listaCidadesGlobal.length === 0) {
    dropdown.innerHTML = `<li class="px-4 py-3 text-sm text-emerald-400 font-bold text-center flex flex-col items-center justify-center gap-2"><i class="ph ph-spinner-gap animate-spin text-2xl"></i> Conectando...</li>`;
    wrapper.classList.remove('hidden');
    await carregarCidadesIBGE();
  }
  
  const valorDigitado = removerAcentos(input.value);
  dropdown.innerHTML = '';
  
  const filtradas = listaCidadesGlobal.filter(c => removerAcentos(c).includes(valorDigitado)).slice(0, 50);
  
  if (filtradas.length === 0) {
    dropdown.innerHTML = `<li class="px-4 py-3 text-sm text-slate-500 italic text-center">Nenhuma cidade encontrada</li>`;
  } else {
    filtradas.forEach(cidade => {
      const li = document.createElement('li');
      li.className = "px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer transition-colors";
      li.innerText = cidade;
      
      li.onclick = function() {
        adicionarCidade(cidade); // Chama a função que cria o "chip" verde
      };
      dropdown.appendChild(li);
    });
  }
  
  wrapper.classList.remove('hidden');
};

// 1. Fecha a lista se clicar fora
document.addEventListener('click', function(e) {
  // Fecha dropdown de cidade (Atualizado para nv-local-input)
  const inputLocal = document.getElementById('nv-local-input');
  const wrapperLocal = document.getElementById('dropdown-wrapper');
  if (inputLocal && wrapperLocal && e.target !== inputLocal && !wrapperLocal.contains(e.target)) {
    wrapperLocal.classList.add('hidden');
  }
  
  // Fecha dropdown de área
  const inputArea = document.getElementById('nv-area-input');
  const wrapperArea = document.getElementById('dropdown-area-wrapper');
  if (inputArea && wrapperArea && e.target !== inputArea && !wrapperArea.contains(e.target)) {
    wrapperArea.classList.add('hidden');
  }
});

// 2. Trava de Segurança: Apaga se digitar cidade que não existe
document.getElementById('nv-local-input')?.addEventListener('blur', function() {
  setTimeout(() => {
    const val = this.value;
    if (val && !listaCidadesGlobal.includes(val)) {
      this.value = '';
      mostrarToast('Por favor, selecione uma cidade válida da lista.', 'error');
    }
  }, 250);
});

// ----------------------------------------------------
// GESTÃO DO PAINEL DO RECRUTADOR (RH)
// ----------------------------------------------------
window.carregarRadarTalentos = async function() {
  if (!appState.perfilAtual || appState.perfilAtual.tipo_conta !== 'empresa') return;
  
  const container = document.getElementById('container-vagas-empresa');
  if (!container) return;

  // 1. Injeta o Loading do RH antes de chamar o banco
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-16 space-y-4 w-full">
      <i class="ph ph-spinner-gap animate-spin text-5xl text-emerald-500"></i>
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando Radar de Talentos...</p>
    </div>
  `;

  // 2. Busca os dados
  const { data: vagas, error } = await supabaseClient
    .from('vagas')
    .select('*')
    .eq('criador_id', appState.perfilAtual.id)
    .order('created_at', { ascending: false });

  if (error) {
    mostrarToast("Erro ao carregar suas vagas.", "error");
    container.innerHTML = '';
    return;
  }

  // 3. Limpa o Loading para exibir o conteúdo real
  container.innerHTML = '';
  let ativas = 0;
  let arquivadas = 0;

  if (vagas.length === 0) {
    container.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
        <i class="ph ph-folder-dashed text-4xl text-slate-600 mb-3 block"></i>
        <p class="text-slate-400 font-medium">Você ainda não publicou nenhuma oportunidade.</p>
      </div>`;
  } else {
    vagas.forEach(vaga => {
      if (vaga.status_vaga === 'Arquivada') arquivadas++;
      else ativas++;

      const card = document.createElement('div');
      const isArquivada = vaga.status_vaga === 'Arquivada';
      const opacidade = isArquivada ? 'opacity-60 grayscale-[0.5]' : '';
      const corStatus = isArquivada ? 'text-slate-500 bg-slate-800' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      
      card.className = `bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-slate-600 shadow-md ${opacidade}`;
      
      card.innerHTML = `
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${corStatus}">${vaga.status_vaga || 'Ativa'}</span>
          </div>
          <h3 class="text-lg font-black text-white">${vaga.titulo}</h3>
          <p class="text-sm text-slate-400 font-medium">${vaga.modelo} • ${vaga.contrato}</p>
        </div>

        <div class="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
          <button onclick="editarVaga('${encodeURIComponent(JSON.stringify(vaga))}')" class="flex-1 md:flex-none bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
            <i class="ph ph-pencil-simple text-lg"></i> Editar
          </button>
          <button onclick="alternarStatusVaga(${vaga.id}, '${vaga.status_vaga || 'Ativa'}')" class="flex-1 md:flex-none bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
            <i class="ph ${isArquivada ? 'ph-upload-simple' : 'ph-archive'} text-lg"></i> ${isArquivada ? 'Reativar' : 'Arquivar'}
          </button>
          <button onclick="excluirVaga(${vaga.id})" class="flex-1 md:flex-none bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
            <i class="ph ph-trash text-lg"></i> Excluir
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  const metricAtivas = document.getElementById('metric-vagas-ativas');
  const metricArq = document.getElementById('metric-vagas-arquivadas');
  if (metricAtivas) metricAtivas.innerText = ativas;
  if (metricArq) metricArq.innerText = arquivadas;

  const badgeRH = document.getElementById('contador-vagas-sidebar');
  if (badgeRH) {
    if (vagas.length > 0) {
      badgeRH.innerText = vagas.length;
      badgeRH.classList.remove('hidden');
    } else {
      badgeRH.classList.add('hidden');
    }
  }
};

window.excluirVaga = async function(id) {
  if(!confirm("Tem certeza que deseja apagar esta oportunidade permanentemente?")) return;
  const { error } = await supabaseClient.from('vagas').delete().eq('id', id);
  if (!error) {
    mostrarToast("Oportunidade excluída.", "success");
    carregarRadarTalentos();
    document.getElementById('container-todas-vagas').innerHTML = '';
    carregarVagasDoBanco();
  }
};

// ==========================================
// MOTOR: MÚLTIPLAS CIDADES & DROPDOWNS LUXO
// ==========================================
let cidadesSelecionadas = [];

window.adicionarCidade = function(cidade) {
  if (!cidadesSelecionadas.includes(cidade)) {
    cidadesSelecionadas.push(cidade);
    renderizarCidades();
  }
  document.getElementById('nv-local-input').value = '';
  document.getElementById('dropdown-wrapper').classList.add('hidden');
};

window.removerCidade = function(cidade) {
  cidadesSelecionadas = cidadesSelecionadas.filter(c => c !== cidade);
  renderizarCidades();
};

window.renderizarCidades = function() {
  const container = document.getElementById('cidades-selecionadas-container');
  if (!container) return;
  container.innerHTML = '';
  cidadesSelecionadas.forEach(cidade => {
    container.innerHTML += `
      <span class="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
        ${cidade}
        <button type="button" onclick="removerCidade('${cidade}')" class="hover:text-rose-400 transition-colors ml-1"><i class="ph ph-x text-sm"></i></button>
      </span>`;
  });
};

// Motor automático que transforma os <select> normais no visual de luxo
window.transformarSelectsEmCustom = function() {
  document.querySelectorAll('.select-customizado').forEach(select => {
    if (select.dataset.customizado === 'true') return;
    select.dataset.customizado = 'true';
    
    // Esconde o feio, mas mantém para o banco validar
    select.classList.add('opacity-0', 'absolute', 'w-0', 'h-0', '-z-10');
    
    const wrapper = document.createElement('div');
    wrapper.className = 'relative w-full';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    
    const trigger = document.createElement('div');
    trigger.className = 'w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-4 pr-10 py-3 text-sm focus-within:border-emerald-500 transition-all cursor-pointer flex items-center justify-between shadow-inner hover:border-emerald-500/50';
    
    const valorAtual = select.options[select.selectedIndex]?.text || 'Selecione...';
    const corTexto = select.value ? 'text-white font-bold' : 'text-slate-500';
    trigger.innerHTML = `<span class="select-value truncate ${corTexto}">${valorAtual}</span> <i class="ph ph-caret-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg pointer-events-none"></i>`;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'absolute left-0 top-[calc(100%+8px)] w-full bg-slate-900 border border-emerald-500/50 rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.15)] hidden z-[60] overflow-hidden custom-dropdown-box';
    
    const ul = document.createElement('ul');
    ul.className = 'max-h-48 overflow-y-auto menu-scroll divide-y divide-slate-800';
    
    Array.from(select.options).forEach(opt => {
      if (opt.disabled) return;
      const li = document.createElement('li');
      li.className = 'px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer transition-colors';
      li.innerText = opt.text;
      li.onclick = (e) => {
        e.stopPropagation();
        select.value = opt.value;
        trigger.querySelector('.select-value').innerText = opt.text;
        trigger.querySelector('.select-value').classList.remove('text-slate-500');
        trigger.querySelector('.select-value').classList.add('text-white', 'font-bold');
        dropdown.classList.add('hidden');
        select.dispatchEvent(new Event('change'));
      };
      ul.appendChild(li);
    });
    
    dropdown.appendChild(ul);
    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);
    
    trigger.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-dropdown-box').forEach(d => {
         if(d !== dropdown) d.classList.add('hidden');
      });
      dropdown.classList.toggle('hidden');
    };
    
    // Sincroniza via código (se editar a vaga)
    select.addEventListener('change', () => {
      const opt = select.options[select.selectedIndex];
      if(opt && opt.value) {
        trigger.querySelector('.select-value').innerText = opt.text;
        trigger.querySelector('.select-value').classList.remove('text-slate-500');
        trigger.querySelector('.select-value').classList.add('text-white', 'font-bold');
      } else {
        trigger.querySelector('.select-value').innerText = 'Selecione...';
        trigger.querySelector('.select-value').classList.remove('text-white', 'font-bold');
        trigger.querySelector('.select-value').classList.add('text-slate-500');
      }
    });
  });
  
  // Fecha ao clicar fora
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown-box').forEach(d => d.classList.add('hidden'));
  });
};

// ----------------------------------------------------
// INICIALIZAÇÃO DE SESSÃO AUTOMÁTICA
// ----------------------------------------------------
window.onload = async function() {
  carregarVagasDoBanco();
  carregarCidadesIBGE();
  
  // ATIVA O MOTOR DOS DROPDOWNS DE LUXO LOGO AO CARREGAR A TELA
  transformarSelectsEmCustom();

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    const { data } = await supabaseClient.from('perfis').select('*').eq('id', session.user.id).single();
    if (data) {
      atualizarInfoTela(data);
      if (data.tipo_conta === 'candidato') {
        carregarPerfilDetalhes(session.user.id);
        carregarMinhasCandidaturas(session.user.id);
      }
    }
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    // 🔥 A MÁGICA: Só recarrega se for um LOGIN NOVO ou um LOGOUT. 
    // Ignora as atualizações de segurança em segundo plano do navegador!
    if (event === 'SIGNED_OUT') {
      appState.usuarioLogado = false;
      appState.perfilAtual = null;
      window.location.reload();
    } else if (event === 'SIGNED_IN' && !appState.usuarioLogado) {
      const { data } = await supabaseClient.from('perfis').select('*').eq('id', session.user.id).single();
      if (data) {
        atualizarInfoTela(data);
        if (data.tipo_conta === 'candidato') {
          carregarPerfilDetalhes(session.user.id);
          carregarMinhasCandidaturas(session.user.id);
        }
      }
    }
  });
};

// ----------------------------------------------------
// FERRAMENTAS DO EDITOR INTELIGENTE (AURORA BOREAL)
// ----------------------------------------------------
window.formatarEditor = function(comando) {
  if (comando === 'bullet') {
    // Se precisar de uma lógica específica para a lista, ela entra aqui
    document.execCommand('insertUnorderedList', false, null);
  } else {
    document.execCommand(comando, false, null);
  }
  document.getElementById('nv-descricao').focus();
};

window.inserirTemplateEditor = function(tipo) {
  const textarea = document.getElementById('nv-descricao');
  let template = '';

  const templates = {
    'quem_somos': `\n\n🏢 Quem Somos:\nNossa cultura, nossa missão e por que você vai amar trabalhar aqui.\n`,
    'responsalidades': `\n\n📌 Principais Responsabilidades:\n• \n• `,
    'desafios': `\n\n🚀 Desafios da Posição:\n• O que você vai resolver nos primeiros 90 dias...\n• `,
    'requisitos': `\n\n🎯 Requisitos (O que você precisa saber):\n• \n• `,
    'experiencias': `\n\n💡 Experiências que Valorizamos (Não é regra, mas ajuda):\n• \n• `,
    'diversidade': `\n\n🌈 Diversidade & Inclusão:\nAcreditamos que times plurais também constroem os melhores produtos. Todas as pessoas são bem-vindas.\n`
  };

  if (templates[tipo]) {
    textarea.value += templates[tipo];
    textarea.focus();
  }
};

// ----------------------------------------------------
// LÓGICA DO SALÁRIO A COMBINAR
// ----------------------------------------------------
window.alternarSalarioCombinar = function(checkbox) {
  const inputMin = document.getElementById('nv-sal-min');
  const inputMax = document.getElementById('nv-sal-max');
  
  if (checkbox.checked) {
    inputMin.value = '';
    inputMax.value = '';
    inputMin.disabled = true;
    inputMax.disabled = true;
    inputMin.required = false;
    inputMax.required = false;
    inputMin.classList.add('opacity-40', 'cursor-not-allowed');
    inputMax.classList.add('opacity-40', 'cursor-not-allowed');
  } else {
    inputMin.disabled = false;
    inputMax.disabled = false;
    inputMin.required = true;
    inputMax.required = true;
    inputMin.classList.remove('opacity-40', 'cursor-not-allowed');
    inputMax.classList.remove('opacity-40', 'cursor-not-allowed');

  }
};

// ==============================================================
// FORMATADOR INTELIGENTE DE TÍTULO (Title Case)
// ==============================================================
window.formatarTituloVaga = function(campo) {
  // Transforma tudo em minúsculo primeiro e separa as palavras
  let palavras = campo.value.toLowerCase().split(' ');
  
  // Lista de palavras que devem continuar minúsculas (se não forem a primeira palavra)
  const conectivos = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'com', 'para', 'ou'];
  
  for (let i = 0; i < palavras.length; i++) {
      if (palavras[i].length > 0) {
          if (conectivos.includes(palavras[i]) && i !== 0) {
              continue; // Pula a formatação e deixa minúsculo
          }
          // Pega a primeira letra, converte para maiúscula e junta com o resto da palavra
          palavras[i] = palavras[i][0].toUpperCase() + palavras[i].substr(1);
      }
  }
  
  campo.value = palavras.join(' ');
};
