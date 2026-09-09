# Instalação — FancyDashboard Community

Este arquivo também é anexado a cada GitHub Release para que o procedimento de instalação continue disponível mesmo fora do repositório.

## 1. Usuário final

1. Instale o **FancyDashboard Core** na versão indicada em `compatibility.json`.
2. Abra o Marketplace do FancyDashboard.
3. Instale os módulos/plugins Community pelo catálogo confiável configurado no host.
4. Não copie manualmente arquivos JavaScript para a pasta de plugins do AppData. O fluxo suportado passa pelo instalador do core, que valida ID, limites do arquivo, estrutura do ZIP e integridade SHA-256 antes da ativação.

A release Community não é um segundo instalador do aplicativo desktop: ela contém os módulos e plugins que o Marketplace distribui.

## 2. Conferindo a integridade de um download

Baixe também `SHA256SUMS.txt` da mesma release.

### Windows PowerShell

```powershell
Get-FileHash .\FancyDashboard-Community-1.0.0.zip -Algorithm SHA256
```

Compare o valor retornado com a linha correspondente em `SHA256SUMS.txt`.

### Linux

```bash
sha256sum FancyDashboard-Community-1.0.0.zip
```

### macOS

```bash
shasum -a 256 FancyDashboard-Community-1.0.0.zip
```

Se a hash divergir, não use o arquivo.

## 3. Conteúdo do bundle

Ao extrair `FancyDashboard-Community-X.Y.Z.zip`, você encontrará:

```text
catalog.json
compatibility.json
INSTALLATION.md
PAYLOAD-SHA256SUMS.txt
artifacts/
  <pack-id>-<version>.zip
  ...
```

`catalog.json` relaciona cada pack ao arquivo e à integridade SHA-256 esperada. `PAYLOAD-SHA256SUMS.txt` permite verificar o conteúdo interno do bundle.

## 4. Operador do Marketplace

O bundle foi desenhado para ter o mesmo contrato de distribuição usado pela infraestrutura do core: catálogo JSON e ZIPs determinísticos por pack. Use o `catalog.json` como fonte de metadados e sirva os arquivos de `artifacts/` somente por HTTPS.

Não altere um ZIP depois da publicação sem gerar um novo hash e uma nova versão. O catálogo e o artefato devem ser tratados como uma unidade imutável.

## 5. Ambiente de desenvolvimento

Use o workspace composto:

```bash
git clone --recurse-submodules https://github.com/klabacher/FancyDashboardProject.git
cd FancyDashboardProject
pnpm install
pnpm --filter @fancydashboard/sdk build
pnpm --filter @fancydashboard/runtime build
pnpm --filter './fancy-dashboard-community/packages/packs/**' -r run build
```

Se estiver trabalhando nas branches de release antes de `v1.0.0`, use os refs de release correspondentes do core/community em vez de misturar `master` com uma branch incompatível.

## 6. Criando um novo pack

A partir do workspace composto:

```bash
node fancy-dashboard-community/create-fancy-community/bin.js meu-widget
```

O ID deve conter somente letras minúsculas, números, hífen e underscore, seguindo as restrições do SDK/core. Depois implemente o pack e valide pelo CI; não versione `dist` nem `node_modules`.

## 7. Como uma release é criada

O workflow `.github/workflows/publish-community-release.yml` executa automaticamente em pushes para `master` e também permite retry manual por `workflow_dispatch`.

Ele:

1. valida SemVer e metadados;
2. verifica se a versão ainda não foi publicada;
3. exige o tag exato do FancyDashboard Core informado em `compatibility.json`;
4. compõe temporariamente core + community num workspace pnpm;
5. recompila SDK e runtime;
6. compila todos os módulos/plugins Community;
7. roda testes dos packs que possuem testes;
8. gera ZIPs determinísticos e `catalog.json` usando a mesma ferramenta do core;
9. gera bundle, tutorial e SHA-256;
10. cria a GitHub Release com os commits incluídos e seus títulos/descrições.

## 8. Secret necessário para core privado

Configure no repositório Community:

`Settings → Secrets and variables → Actions → New repository secret`

Nome:

```text
FANCYDASHBOARD_CORE_READ_TOKEN
```

O token deve ser fine-grained, limitado a `klabacher/FancyDashboard` e possuir apenas `Contents: Read`. Não conceda permissão de escrita.

## 9. Recuperação de falha

Uma falha de build, audit, checkout do core ou validação de integridade impede a criação da release. O tag Community só é criado na etapa final. Depois de corrigir o problema, execute novamente o workflow ou faça um novo commit em `master`; se a versão ainda não tiver tag, a publicação será tentada novamente.
