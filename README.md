# LogiTrack Pro

Sistema web para controle de processos logísticos de importação e exportação, desenvolvido sob medida para a **Transportes Imigrantes**.

Substitui o controle manual (planilhas/e-mail) por um painel único, em tempo real, compartilhado por toda a equipe.

🔗 **Em produção:** https://logisitica-imigrantes-track.vercel.app/

---

## Sobre o projeto

O LogiTrack Pro organiza cada processo de importação ou exportação em um card, com um checklist específico para cada tipo de operação, prazos visuais e cadastros compartilhados (terminais, armadores, tipos de contêiner) usados por toda a equipe.

É um projeto **frontend puro** (sem servidor próprio): todo o backend é o Firebase (autenticação e banco de dados em tempo real), e o site é publicado como arquivos estáticos na Vercel.

## Funcionalidades

**Processos**
- Cadastro de processos de Importação (checklist: Agendamento de Carregamento → Gerar CTe → Gerar CIOT → Gerar MDFE → Encerrar MDFE → Agendamento de Vazio) e de Exportação (Tara/Lacre, Deadline Draft, Deadline de Carga, agendamentos de vazio e cheio).
- Barra de progresso automática por processo, calculada a partir do checklist.
- Múltiplos contêineres por processo, adicionados na criação ou depois, a qualquer momento.
- Verificação de duplicidade: avisa quando um número de contêiner, documento (DI/DTA/DUIMP) ou booking já existe em outro processo ativo.
- Validação do dígito verificador da numeração do contêiner (norma ISO 6346), com aviso em tempo real.
- Observações livres por processo, arquivamento/restauração e exclusão (com confirmação).

**Cadastros compartilhados**
- Terminal de Carregamento, Terminal de Vazio, Armador e Tipo de Contêiner: listas únicas usadas por toda a equipe, com adicionar, editar (renomear) e excluir.

**Produtividade**
- Busca rápida por armador, motorista, placa, documento/booking ou número de contêiner.
- Resumo com contadores (em andamento, prazo próximo, atrasados) por aba.
- Alerta visual de Deadline Draft (3, 2, 1 dia ou atrasado) para exportação.
- Reordenação dos cards por arrastar (preferência pessoal, salva no navegador de cada usuário).
- Modo escuro opcional (preferência salva por navegador).

**Exportação de dados**
- Exportação de um processo individual em PDF (via impressão do navegador).
- Exportação em lote (CSV) da lista atualmente filtrada — respeita a aba (Importações/Exportações/Arquivados) e a busca ativa — pronta para abrir no Excel ou Planilhas Google.

**Outros**
- Progressive Web App (PWA): instalável no computador ou celular, com ícone e tela cheia própria.
- Totalmente responsivo (desktop e celular).
- Login restrito: sem autocadastro, só entra quem já tem conta criada manualmente no Firebase.

## Tecnologias

- **HTML, CSS e JavaScript puro** — sem framework de frontend nem etapa de build.
- **Tailwind CSS** (via CDN) para estilização.
- **Firebase Authentication** — login por e-mail/senha.
- **Firebase Firestore** — banco de dados em tempo real (dados sincronizados instantaneamente entre todos os usuários logados).
- **Font Awesome 6** — ícones.
- **SortableJS** — arrastar e reordenar os cards.
- **Vercel** — hospedagem e deploy contínuo a partir deste repositório.

## Estrutura do projeto

```
├── index.html          # Aplicação inteira (HTML + CSS + JS)
├── manifest.json        # Configuração do PWA (nome, ícones, cores)
├── sw.js                 # Service Worker do PWA
├── icons/                # Ícones do app em vários tamanhos
├── firestore_1.rules      # Regras de segurança do Firestore (aplicar no Firebase Console)
└── README.md
```

## Configuração e execução local

O projeto não precisa de build nem de instalação de dependências — é só abrir o `index.html`. Como ele se conecta ao Firebase, para funcionar de verdade é necessário:

1. Ter um projeto no [Firebase Console](https://console.firebase.google.com/) com **Authentication** (e-mail/senha) e **Firestore Database** ativados.
2. Substituir o objeto `firebaseConfig` dentro do `index.html` pelas credenciais do seu próprio projeto Firebase (ou usar as já configuradas, se for continuar no mesmo projeto).
3. Publicar as regras do arquivo `firestore_1.rules` em **Firestore Database → Regras** no Firebase Console (elas restringem cada processo ao usuário que o criou, e liberam leitura/escrita das listas de cadastro compartilhadas para qualquer usuário autenticado).
4. Criar manualmente, no Firebase Console (**Authentication → Users**), as contas de quem vai usar o sistema — não existe tela de autocadastro por design.

Depois disso, abrir o `index.html` num navegador já é suficiente para testar localmente.

## Deploy

O deploy é feito pela [Vercel](https://vercel.com), conectado a este repositório: qualquer `push` para a branch principal publica automaticamente a nova versão em produção.

## Segurança

- A chave de API do Firebase presente no código é, por natureza, pública (é assim que o SDK do Firebase funciona no navegador) — a proteção real está nas **regras do Firestore** (`firestore_1.rules`) e na **restrição da chave por domínio**, configurada no Google Cloud Console. Ainda assim, recomenda-se manter este repositório **privado**, já que ele reflete a operação real da empresa.
- Todo conteúdo digitado pelo usuário é escapado antes de ser exibido na tela, para evitar XSS.
- O login não tem autocadastro: contas só existem se forem criadas manualmente no Firebase Console.

---

Projeto de uso interno da Transportes Imigrantes, desenvolvido por Matheus Fagundes.

