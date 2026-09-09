# FancyDashboard Community

Repositório oficial de módulos e plugins mantidos pela comunidade para o **FancyDashboard**.

Este repositório não duplica o SDK nem o runtime do projeto principal. Os pacotes são desenvolvidos e validados contra uma versão explícita do core e são distribuídos em um formato compatível com a infraestrutura do Marketplace: `catalog.json` + `artifacts/*.zip` + hashes SHA-256.

## Compatibilidade atual

| Componente | Versão |
| --- | --- |
| FancyDashboard Community | `1.0.0` |
| FancyDashboard Core | `1.0.0` (`v1.0.0`) |
| Node.js | `24` |
| pnpm | `9.12.3` |

A fonte canônica dessas informações é [`compatibility.json`](./compatibility.json). Uma release do Community só é publicada depois de comprovar que todos os módulos e plugins compilam contra o core indicado nesse arquivo.

## Instalação rápida

Para usuários finais, instale primeiro a versão compatível do **FancyDashboard** pela aba Releases do repositório principal. Depois utilize o Marketplace do FancyDashboard para obter os módulos e plugins community publicados no catálogo confiável.

Para operadores do Marketplace, CI ou instalação controlada, cada release deste repositório publica:

- `FancyDashboard-Community-X.Y.Z.zip` — bundle completo pronto para distribuição;
- `catalog.json` — catálogo machine-readable;
- `artifacts/*.zip` — um pacote instalável por módulo/plugin;
- `SHA256SUMS.txt` — hashes SHA-256 copiáveis;
- `compatibility.json` — versão exata do core usada na validação;
- `INSTALLATION.md` — tutorial incluído na própria release.

O tutorial completo está em [`docs/INSTALLATION.md`](./docs/INSTALLATION.md).

## Desenvolvimento recomendado

O fluxo suportado usa o repositório composto [`FancyDashboardProject`](https://github.com/klabacher/FancyDashboardProject), que reúne core + community em um único workspace pnpm. Isso é necessário porque os pacotes community consomem `@fancydashboard/sdk` e `@fancydashboard/runtime` via workspace durante desenvolvimento.

```bash
git clone --recurse-submodules https://github.com/klabacher/FancyDashboardProject.git
cd FancyDashboardProject
pnpm install
pnpm --filter @fancydashboard/sdk build
pnpm --filter @fancydashboard/runtime build
pnpm --filter './fancy-dashboard-community/packages/packs/**' -r run build
```

Não copie SDK/runtime para este repositório e não versione `node_modules` ou `dist`.

## Arquitetura de CI e releases

A infraestrutura foi dividida por responsabilidade:

1. **Community CI** valida metadados, higiene do repositório, scaffolder e invariantes de release sem depender de artefatos gerados.
2. **Core CI** é o gate canônico de compatibilidade cruzada: faz checkout da branch/release community compatível e compila todos os pacotes contra o SDK/runtime reais.
3. **Community Release** roda somente no `master`, detecta uma nova versão ainda não publicada, faz checkout do **tag exato do core**, recompila SDK/runtime e todos os packs, gera o catálogo determinístico, hashes e assets da release.
4. **FancyDashboardProject** é o workspace composto de desenvolvimento/integração e fixa SHAs compatíveis dos dois repositórios.

Esse desenho evita três problemas: duplicação de código do SDK, releases community construídas contra um core diferente do declarado e pacotes gerados manualmente sem rastreabilidade.

## Regra de versão

O Community usa SemVer próprio. Para cada release:

- altere `package.json#version`;
- altere `compatibility.json#communityVersion` para a mesma versão;
- ajuste `compatibility.json#core.version` e `core.tag` se a compatibilidade mínima mudar;
- faça merge em `master` apenas depois dos gates do core/community estarem verdes.

O workflow recusa downgrade, tag reutilizada, divergência de metadados, core incompatível, pacote sem manifesto, hash inválido ou build incompleto.

## Configuração única do GitHub Actions

Como o repositório principal pode ser privado, o workflow de release do Community precisa de um secret chamado **`FANCYDASHBOARD_CORE_READ_TOKEN`** com acesso somente de leitura ao repositório `klabacher/FancyDashboard` (`Contents: Read`). Prefira um fine-grained PAT limitado exclusivamente ao core. Se o core se tornar público, esse secret deixa de ser necessário.

Nenhum token de escrita do core é necessário para publicar o Community. A própria `GITHUB_TOKEN` deste repositório publica somente a release community.

## Segurança e integridade

Os bundles são produzidos de forma determinística e todos os assets recebem SHA-256. O catálogo nunca deve usar integridade `000...000`; releases com placeholder são bloqueadas. O instalador do core deve sempre comparar o SHA-256 baixado com a integridade declarada pelo catálogo antes de ativar um pack.

## Pacotes

Módulos community ficam em `packages/packs/modules/*` e plugins em `packages/packs/plugins/*`. O gerador `create-fancy-community` é testado no CI para garantir IDs seguros e compatibilidade com o SDK atual.

## Pull requests

Mudanças em widgets, plugins, manifestos, permissões ou compatibilidade devem permanecer em PR até os gates de Community e do PR correspondente do core passarem. Releases não são criadas a partir de branches de feature.
